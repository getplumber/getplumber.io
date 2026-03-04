/**
 * Plumber error codes registry for documentation pages.
 * Each code maps to full documentation content with examples.
 */

export interface ErrorCodeDoc {
  code: string;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  controlName: string;
  controlConfigKey: string;
  description: string;
  impact: string;
  remediation: string;
  /** YAML example showing the problematic configuration */
  badExample: string;
  badExampleCaption: string;
  /** YAML example showing the fixed configuration */
  goodExample: string;
  goodExampleCaption: string;
  /** Additional tips or notes */
  tips: string[];
  /** Related error codes */
  relatedCodes: string[];
}

export const errorCodes: Record<string, ErrorCodeDoc> = {
  "PLB-0101": {
    code: "PLB-0101",
    title: "Container image uses a forbidden tag",
    category: "Container Images",
    severity: "high",
    controlName: "Container images must not use forbidden tags",
    controlConfigKey: "containerImageMustNotUseForbiddenTags",
    description:
      "A container image used in a CI/CD job references a tag that is forbidden by your organization's policy (e.g., `latest`, `dev`, `main`). Mutable tags can point to different image contents over time, making your builds non-reproducible.",
    impact:
      "Using mutable tags means your pipeline can silently break or introduce vulnerabilities when the underlying image is updated. An attacker could also push a malicious image to the same tag. This undermines build reproducibility and supply chain security.",
    remediation:
      "Replace the forbidden tag with a specific, immutable version tag. For maximum security, consider pinning by digest (see PLB-0102).",
    badExample: `# .gitlab-ci.yml — ❌ Uses "latest" tag (forbidden)
build:
  image: python:latest
  script:
    - pip install -r requirements.txt
    - python setup.py build

lint:
  image: golangci/golangci-lint:latest
  script:
    - golangci-lint run`,
    badExampleCaption: "These jobs use the `latest` tag, which is mutable and may change unexpectedly.",
    goodExample: `# .gitlab-ci.yml — ✅ Uses specific version tags
build:
  image: python:3.12.1
  script:
    - pip install -r requirements.txt
    - python setup.py build

lint:
  image: golangci/golangci-lint:v1.62.2
  script:
    - golangci-lint run`,
    goodExampleCaption: "Specific version tags ensure reproducible builds.",
    tips: [
      "Configure forbidden tags in `.plumber.yaml` under `containerImageMustNotUseForbiddenTags.tags`.",
      "Common forbidden tags include: `latest`, `dev`, `staging`, `main`, `master`.",
      "You can also enforce digest pinning with `containerImagesMustBePinnedByDigest: true` (see PLB-0102).",
    ],
    relatedCodes: ["PLB-0102", "PLB-0103"],
  },

  "PLB-0102": {
    code: "PLB-0102",
    title: "Container image is not pinned by digest",
    category: "Container Images",
    severity: "critical",
    controlName: "Container images must not use forbidden tags (pinned by digest mode)",
    controlConfigKey: "containerImageMustNotUseForbiddenTags",
    description:
      "When digest pinning is enabled in your configuration, every container image must be referenced by its SHA256 digest (`image@sha256:...`). This image is using a tag reference instead.",
    impact:
      "Even specific version tags (e.g., `python:3.12.1`) can be reassigned to a different image. Digest pinning is the only way to guarantee the exact image content used in your pipeline, providing the strongest supply chain security.",
    remediation:
      "Replace the tag reference with a digest reference. You can find the digest using `docker inspect` or `crane digest`.",
    badExample: `# .gitlab-ci.yml — ❌ Uses tag reference (not pinned by digest)
build:
  image: python:3.12.1
  script:
    - python setup.py build`,
    badExampleCaption: "Even specific version tags can be reassigned.",
    goodExample: `# .gitlab-ci.yml — ✅ Pinned by SHA256 digest
build:
  image: python@sha256:1c5313e4a18...f4b8e
  script:
    - python setup.py build

# Find the digest with:
#   docker pull python:3.12.1
#   docker inspect --format='{{index .RepoDigests 0}}' python:3.12.1
# Or:
#   crane digest python:3.12.1`,
    goodExampleCaption: "SHA256 digest ensures the exact image content is always used.",
    tips: [
      "Enable digest pinning in `.plumber.yaml` with `containerImagesMustBePinnedByDigest: true`.",
      "Use `crane digest <image>:<tag>` (from `go-containerregistry`) for a quick digest lookup.",
      "Consider automating digest updates with tools like Renovate or Dependabot.",
    ],
    relatedCodes: ["PLB-0101", "PLB-0103"],
  },

  "PLB-0103": {
    code: "PLB-0103",
    title: "Container image from unauthorized source",
    category: "Container Images",
    severity: "critical",
    controlName: "Container images must come from authorized sources",
    controlConfigKey: "containerImageMustComeFromAuthorizedSources",
    description:
      "A CI/CD job is using a container image from a registry that is not listed in your organization's authorized sources. Only images from explicitly trusted registries should be used.",
    impact:
      "Pulling images from untrusted registries exposes your pipeline to supply chain attacks. A malicious image could exfiltrate secrets, inject backdoors into your builds, or compromise your infrastructure.",
    remediation:
      "Either switch to an image from an authorized registry, or add the registry to the trusted list in your `.plumber.yaml` configuration.",
    badExample: `# .gitlab-ci.yml — ❌ Image from untrusted registry
security-scan:
  image: untrusted-registry.example.com/scanner:2.0
  script:
    - scan --project .

sast:
  image: attacker-registry.example.com/malicious/sast:latest
  script:
    - sast-scan .`,
    badExampleCaption: "Images from unknown registries could be compromised.",
    goodExample: `# .gitlab-ci.yml — ✅ Images from authorized registries
security-scan:
  image: registry.gitlab.com/security-products/secrets:7
  script:
    - scan --project .

sast:
  image: $CI_REGISTRY_IMAGE/custom-sast:1.2.0
  script:
    - sast-scan .

# .plumber.yaml — Authorized sources configuration
# containerImageMustComeFromAuthorizedSources:
#   enabled: true
#   trustDockerHubOfficialImages: true
#   trustedUrls:
#     - registry.gitlab.com/security-products/*
#     - $CI_REGISTRY_IMAGE:*
#     - $CI_REGISTRY_IMAGE/*`,
    goodExampleCaption: "Only images from trusted registries should be used.",
    tips: [
      "Enable `trustDockerHubOfficialImages: true` to allow official Docker Hub images (e.g., `python`, `node`).",
      "Use wildcard patterns in `trustedUrls` (e.g., `gcr.io/your-org/*`).",
      "Consider setting up a private registry mirror for external images.",
    ],
    relatedCodes: ["PLB-0101", "PLB-0102"],
  },

  "PLB-0201": {
    code: "PLB-0201",
    title: "Branch is not protected",
    category: "Access & Authorization",
    severity: "high",
    controlName: "Branch must be protected",
    controlConfigKey: "branchMustBeProtected",
    description:
      "A branch that matches a required protection pattern in your configuration has no protection rules in GitLab. This means anyone with push access can directly commit to it.",
    impact:
      "Without branch protection, developers can push directly to critical branches (like `main`), bypass code reviews, force-push to rewrite history, and potentially introduce vulnerable or non-compliant code.",
    remediation:
      "Enable branch protection in GitLab under **Settings > Repository > Protected Branches**.",
    badExample: `# GitLab project settings — ❌ Branch not protected
# Branch "main" has no protection rules
# Anyone with Developer access can:
#   - Push directly
#   - Force push
#   - Delete the branch

# .plumber.yaml configuration requiring protection:
branchMustBeProtected:
  enabled: true
  defaultMustBeProtected: true
  namePatterns:
    - main
    - release/*`,
    badExampleCaption: "The `main` branch has no protection, violating the policy.",
    goodExample: `# GitLab project settings — ✅ Branch properly protected
# Settings > Repository > Protected Branches:
#
#   Branch: main
#   Allowed to merge: Developers + Maintainers
#   Allowed to push: Maintainers
#   Allow force push: No
#   Code owner approval required: Yes

# .plumber.yaml
branchMustBeProtected:
  enabled: true
  defaultMustBeProtected: true
  namePatterns:
    - main
    - release/*
  allowForcePush: false
  codeOwnerApprovalRequired: true
  minMergeAccessLevel: 30   # Developer
  minPushAccessLevel: 40    # Maintainer`,
    goodExampleCaption: "Proper branch protection with restricted push access and code review requirements.",
    tips: [
      "Use `namePatterns` with wildcards to protect branch families (e.g., `release/*`).",
      "Set `minPushAccessLevel: 40` (Maintainer) to prevent developers from pushing directly.",
      "Enable `codeOwnerApprovalRequired` if you use a CODEOWNERS file.",
    ],
    relatedCodes: ["PLB-0202"],
  },

  "PLB-0202": {
    code: "PLB-0202",
    title: "Branch protection settings are non-compliant",
    category: "Access & Authorization",
    severity: "medium",
    controlName: "Branch must be protected",
    controlConfigKey: "branchMustBeProtected",
    description:
      "A protected branch exists but its settings do not meet the requirements defined in your `.plumber.yaml`. For example, force push may be allowed, access levels may be too permissive, or code owner approval may not be required.",
    impact:
      "Insufficient protection settings weaken your security posture. For instance, allowing force pushes lets someone rewrite branch history, potentially hiding malicious commits.",
    remediation:
      "Update the branch protection settings in GitLab to match your organization's requirements.",
    badExample: `# GitLab settings — ❌ Protection exists but is too permissive
# Branch: main
#   Allowed to push: Developers + Maintainers  (too permissive)
#   Allow force push: Yes                       (dangerous)
#   Code owner approval required: No            (missing review)

# Required by .plumber.yaml:
#   minPushAccessLevel: 40 (Maintainer only)
#   allowForcePush: false
#   codeOwnerApprovalRequired: true`,
    badExampleCaption: "Branch is protected but settings don't meet requirements.",
    goodExample: `# GitLab settings — ✅ Protection meets requirements
# Branch: main
#   Allowed to merge: Developers + Maintainers
#   Allowed to push: Maintainers only
#   Allow force push: No
#   Code owner approval required: Yes

# Matches .plumber.yaml:
branchMustBeProtected:
  enabled: true
  allowForcePush: false
  codeOwnerApprovalRequired: true
  minMergeAccessLevel: 30
  minPushAccessLevel: 40`,
    goodExampleCaption: "Branch protection meets all configured requirements.",
    tips: [
      "Plumber checks each setting independently  — the output shows exactly which settings are non-compliant.",
      "Access levels: 0 = No one, 30 = Developer, 40 = Maintainer.",
      "Force push should almost always be disabled on production branches.",
    ],
    relatedCodes: ["PLB-0201"],
  },

  "PLB-0301": {
    code: "PLB-0301",
    title: "Pipeline contains a hardcoded job",
    category: "Pipeline Composition",
    severity: "medium",
    controlName: "Pipeline must not include hardcoded jobs",
    controlConfigKey: "pipelineMustNotIncludeHardcodedJobs",
    description:
      "A CI/CD job is defined directly in the `.gitlab-ci.yml` file instead of being sourced from a CI/CD component or include. Hardcoded jobs bypass centralized governance.",
    impact:
      "Hardcoded jobs don't benefit from centralized updates when best practices or security requirements change. They make pipelines harder to audit and maintain across multiple projects.",
    remediation:
      "Replace the hardcoded job with a CI/CD component from the GitLab CI Catalog, or use an `include:` directive.",
    badExample: `# .gitlab-ci.yml — ❌ Jobs defined directly (hardcoded)
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: python:3.12
  script:
    - pip install pytest
    - pytest tests/

build:
  stage: build
  image: docker:27
  script:
    - docker build -t $CI_REGISTRY_IMAGE .
    - docker push $CI_REGISTRY_IMAGE`,
    badExampleCaption: "All jobs are hardcoded — no reuse, no governance.",
    goodExample: `# .gitlab-ci.yml — ✅ Jobs from CI/CD components and includes
include:
  # CI/CD Component from the catalog
  - component: gitlab.com/components/sast/sast@1.2.0
  # Shared template from another project
  - project: my-org/ci-templates
    ref: v2.1.0
    file: /templates/docker-build.yml

stages:
  - test
  - build
  - deploy

# Only project-specific configuration remains
variables:
  DOCKER_IMAGE_NAME: my-app`,
    goodExampleCaption: "Jobs come from versioned components and templates.",
    tips: [
      "Browse the [GitLab CI/CD Catalog](https://gitlab.com/explore/catalog) for reusable components.",
      "Create shared templates in a dedicated project for organization-specific jobs.",
      "Some project-specific jobs may be acceptable — discuss with your team what should be centralized.",
    ],
    relatedCodes: ["PLB-0302", "PLB-0303"],
  },

  "PLB-0302": {
    code: "PLB-0302",
    title: "Included component/template is outdated",
    category: "Pipeline Composition",
    severity: "medium",
    controlName: "Includes must be up to date",
    controlConfigKey: "includesMustBeUpToDate",
    description:
      "A CI/CD component or template included in your pipeline is not using the latest available version from the GitLab CI Catalog. A newer version is available.",
    impact:
      "Outdated includes may miss important security patches, bug fixes, or new features. Staying behind on versions increases your exposure to known vulnerabilities.",
    remediation:
      "Update the include to use the latest version. Check the component's page in the CI Catalog for the latest release.",
    badExample: `# .gitlab-ci.yml — ❌ Uses outdated version
include:
  - component: gitlab.com/components/sast/sast@1.0.0
    # Latest available: 1.5.2

  - component: gitlab.com/components/secret-detection/secret-detection@2.1.0
    # Latest available: 2.4.1`,
    badExampleCaption: "Components are several versions behind the latest release.",
    goodExample: `# .gitlab-ci.yml — ✅ Uses latest versions
include:
  - component: gitlab.com/components/sast/sast@1.5.2

  - component: gitlab.com/components/secret-detection/secret-detection@2.4.1`,
    goodExampleCaption: "Components are up to date with the latest releases.",
    tips: [
      "Use Plumber regularly to detect outdated includes before they become a security risk.",
      "Consider using Renovate or Dependabot to automate version updates in your CI configuration.",
      "Check the CI Catalog changelog for breaking changes before updating major versions.",
    ],
    relatedCodes: ["PLB-0301", "PLB-0303"],
  },

  "PLB-0303": {
    code: "PLB-0303",
    title: "Include uses a forbidden version reference",
    category: "Pipeline Composition",
    severity: "high",
    controlName: "Includes must not use forbidden versions",
    controlConfigKey: "includesMustNotUseForbiddenVersions",
    description:
      "A CI/CD include (component, template, or project file) uses a version reference that is explicitly forbidden by your policy. Common forbidden versions include `latest`, `main`, `master`, or `HEAD` — these are mutable and can change without notice.",
    impact:
      "Mutable version references make your pipeline non-reproducible. The included component could change between two pipeline runs, potentially introducing breaking changes or vulnerabilities without any visible change in your `.gitlab-ci.yml`.",
    remediation:
      "Replace the forbidden version with a specific, immutable version tag (e.g., `v1.2.3` or `~1.0`).",
    badExample: `# .gitlab-ci.yml — ❌ Uses forbidden version references
include:
  - component: gitlab.com/components/sast/sast@latest

  - project: my-org/ci-templates
    ref: main
    file: /templates/security.yml

  - component: gitlab.com/my-org/custom-scanner/scan@HEAD`,
    badExampleCaption: "`latest`, `main`, and `HEAD` are mutable and forbidden.",
    goodExample: `# .gitlab-ci.yml — ✅ Uses specific version tags
include:
  - component: gitlab.com/components/sast/sast@1.5.2

  - project: my-org/ci-templates
    ref: v2.1.0
    file: /templates/security.yml

  - component: gitlab.com/my-org/custom-scanner/scan@3.0.1`,
    goodExampleCaption: "Specific version tags ensure reproducible pipelines.",
    tips: [
      "Configure forbidden version patterns in `.plumber.yaml` under `includesMustNotUseForbiddenVersions.forbiddenVersions`.",
      "Default forbidden versions: `latest`, `~latest`, `main`, `master`, `HEAD`.",
      "Set `defaultBranchIsForbiddenVersion: true` to also forbid using the project's default branch name.",
    ],
    relatedCodes: ["PLB-0301", "PLB-0302"],
  },

  "PLB-0401": {
    code: "PLB-0401",
    title: "Required CI/CD component is missing",
    category: "Pipeline Composition",
    severity: "high",
    controlName: "Pipeline must include component",
    controlConfigKey: "pipelineMustIncludeComponent",
    description:
      "Your pipeline does not include a CI/CD component that is required by your organization's policy. This typically means a mandatory security scan or compliance check is missing.",
    impact:
      "Missing required components means your pipeline skips mandatory checks. This could let vulnerabilities, secrets, or non-compliant code reach production without detection.",
    remediation:
      "Add the required component to your `.gitlab-ci.yml` using the `include:` directive with the component path.",
    badExample: `# .gitlab-ci.yml — ❌ Missing required SAST component
include:
  - component: gitlab.com/components/secret-detection/secret-detection@2.4.1
  # Missing: gitlab.com/components/sast/sast (required by policy)

# .plumber.yaml — Requires both SAST and secret detection
# pipelineMustIncludeComponent:
#   enabled: true
#   required: components/sast/sast AND components/secret-detection/secret-detection`,
    badExampleCaption: "The SAST component is required but missing from the pipeline.",
    goodExample: `# .gitlab-ci.yml — ✅ All required components included
include:
  - component: gitlab.com/components/sast/sast@1.5.2
  - component: gitlab.com/components/secret-detection/secret-detection@2.4.1`,
    goodExampleCaption: "Both required components are included.",
    tips: [
      "Use expression syntax (`AND`/`OR`) in `required` for complex rules: `(sast AND secret-detection) OR full-security`.",
      "Alternatively, use `requiredGroups` with arrays for OR-of-ANDs logic.",
      "The `include` must match the component path pattern — check your `.plumber.yaml` for the exact paths.",
    ],
    relatedCodes: ["PLB-0402", "PLB-0403", "PLB-0404"],
  },

  "PLB-0402": {
    code: "PLB-0402",
    title: "Required component jobs are overridden",
    category: "Pipeline Composition",
    severity: "medium",
    controlName: "Pipeline must include component",
    controlConfigKey: "pipelineMustIncludeComponent",
    description:
      "A required CI/CD component is included in your pipeline, but some of its job keys are overridden locally in your `.gitlab-ci.yml`. This may alter the intended behavior of the compliance check.",
    impact:
      "Overriding component jobs can disable security scanners, change their configuration, or skip critical steps. For example, overriding `script:` in a SAST component job could replace the actual scanner with a no-op.",
    remediation:
      "Remove the local overrides on the component's jobs. If customization is needed, use the component's input variables instead of overriding job keys.",
    badExample: `# .gitlab-ci.yml — ❌ Overrides the SAST component's script
include:
  - component: gitlab.com/components/sast/sast@1.5.2

# This overrides the SAST job, potentially disabling the scanner
sast:
  script:
    - echo "SAST scan skipped"
  variables:
    SAST_EXCLUDED_PATHS: "**/*"`,
    badExampleCaption: "The SAST job is overridden, effectively disabling the security scan.",
    goodExample: `# .gitlab-ci.yml — ✅ Uses component inputs, no overrides
include:
  - component: gitlab.com/components/sast/sast@1.5.2
    inputs:
      stage: test

# No local overrides on the sast job
# Customization is done through component inputs only`,
    goodExampleCaption: "The component is included and configured through its official inputs.",
    tips: [
      "Check the component's documentation for available input variables.",
      "Variables can usually be set globally without overriding the job itself.",
      "If you need to customize behavior not covered by inputs, consider forking the component.",
    ],
    relatedCodes: ["PLB-0401", "PLB-0403", "PLB-0404"],
  },

  "PLB-0403": {
    code: "PLB-0403",
    title: "Required template is missing",
    category: "Pipeline Composition",
    severity: "high",
    controlName: "Pipeline must include template",
    controlConfigKey: "pipelineMustIncludeTemplate",
    description:
      "Your pipeline does not include a CI/CD template (project file include) that is required by your organization's policy.",
    impact:
      "Missing required templates means your pipeline skips mandatory workflow steps defined by your organization. This could lead to non-compliant deployments or missed quality gates.",
    remediation:
      "Add the required template to your `.gitlab-ci.yml` using the `include:` directive with the project and file path.",
    badExample: `# .gitlab-ci.yml — ❌ Missing required template
include:
  - project: my-org/ci-templates
    ref: v2.1.0
    file: /templates/build.yml
  # Missing: /templates/security.yml (required by policy)

# .plumber.yaml
# pipelineMustIncludeTemplate:
#   enabled: true
#   required: templates/build AND templates/security`,
    badExampleCaption: "The security template is required but not included.",
    goodExample: `# .gitlab-ci.yml — ✅ All required templates included
include:
  - project: my-org/ci-templates
    ref: v2.1.0
    file: /templates/build.yml
  - project: my-org/ci-templates
    ref: v2.1.0
    file: /templates/security.yml`,
    goodExampleCaption: "Both required templates are included.",
    tips: [
      "Use the same expression syntax as components (`AND`, `OR`, parentheses).",
      "Templates are matched by their file path pattern.",
      "Coordinate with your platform team to know which templates are mandatory.",
    ],
    relatedCodes: ["PLB-0401", "PLB-0402", "PLB-0404"],
  },

  "PLB-0404": {
    code: "PLB-0404",
    title: "Required template jobs are overridden",
    category: "Pipeline Composition",
    severity: "medium",
    controlName: "Pipeline must include template",
    controlConfigKey: "pipelineMustIncludeTemplate",
    description:
      "A required CI/CD template is included, but some of its jobs have keys overridden locally in your `.gitlab-ci.yml`, which may alter the intended behavior.",
    impact:
      "Similar to component overrides, overriding template jobs can disable or alter mandatory pipeline steps, undermining the governance that templates are meant to enforce.",
    remediation:
      "Remove the local overrides on the template's jobs. Use template variables for configuration instead.",
    badExample: `# .gitlab-ci.yml — ❌ Overrides template job
include:
  - project: my-org/ci-templates
    ref: v2.1.0
    file: /templates/security.yml

# Overrides the security-scan job from the template
security-scan:
  script:
    - echo "Security scan disabled for speed"
  when: manual`,
    badExampleCaption: "The template's security-scan job is overridden and made manual.",
    goodExample: `# .gitlab-ci.yml — ✅ Template included without overrides
include:
  - project: my-org/ci-templates
    ref: v2.1.0
    file: /templates/security.yml

# No local overrides — template jobs run as designed
# Use variables for customization:
variables:
  SECURITY_SCAN_LEVEL: "high"`,
    goodExampleCaption: "Template jobs run as designed, configuration via variables.",
    tips: [
      "Design templates with configurable variables so teams don't need to override jobs.",
      "Plumber shows exactly which job keys are overridden in the issue details.",
      "Consider making critical template jobs non-overridable by design.",
    ],
    relatedCodes: ["PLB-0401", "PLB-0402", "PLB-0403"],
  },

  "PLB-0501": {
    code: "PLB-0501",
    title: "Pipeline enables CI debug trace",
    category: "Security",
    severity: "critical",
    controlName: "Pipeline must not enable debug trace",
    controlConfigKey: "pipelineMustNotEnableDebugTrace",
    description:
      "The pipeline enables `CI_DEBUG_TRACE` or `CI_DEBUG_SERVICES`, which causes GitLab CI to print all environment variables — including secrets — in the job logs.",
    impact:
      "**This is a critical security vulnerability.** When debug trace is enabled, every secret variable (API tokens, passwords, deployment keys) is printed in plain text in the job logs. These logs may be accessible to anyone with repository access.",
    remediation:
      "Remove `CI_DEBUG_TRACE` and `CI_DEBUG_SERVICES` from your pipeline configuration. These should only be used temporarily for local debugging and must never be committed.",
    badExample: `# .gitlab-ci.yml — ❌ Debug trace enabled (CRITICAL)
variables:
  CI_DEBUG_TRACE: "true"    # Exposes ALL secrets in logs!

deploy:
  stage: deploy
  variables:
    CI_DEBUG_SERVICES: "true"  # Also exposes secrets
  script:
    - deploy.sh`,
    badExampleCaption: "All secret variables will be printed in plain text in job logs.",
    goodExample: `# .gitlab-ci.yml — ✅ Debug trace removed
variables:
  # CI_DEBUG_TRACE removed

deploy:
  stage: deploy
  script:
    - deploy.sh

# For debugging, use these safer alternatives:
#   - Add specific echo/print statements
#   - Use \`set -x\` for specific script sections only
#   - Run a debug pipeline with limited access`,
    goodExampleCaption: "No debug trace — secrets remain protected.",
    tips: [
      "If you need to debug a CI job, use `set -x` in specific script lines instead of `CI_DEBUG_TRACE`.",
      "If debug trace was ever enabled, **rotate all secrets** that may have been exposed in logs.",
      "Configure `pipelineMustNotEnableDebugTrace.forbiddenVariables` to also flag other sensitive debug variables.",
      "Consider setting up CI job log retention policies to limit exposure window.",
    ],
    relatedCodes: [],
  },
};
