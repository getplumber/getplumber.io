/**
 * Plumber issues registry for documentation pages.
 * Each issue maps to full documentation content with examples.
 */

export interface IssueDoc {
  code: string;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  /** Approximate time required to fix the issue */
  fixDuration: "immediate" | "very quick" | "quick" | "medium" | "long" | "extended";
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
  /** Related issue codes */
  relatedCodes: string[];
  /**
   * Where this control applies: Plumber Platform and CLI (`all`), Plumber Platform only (`platform`),
   * or Open Source CLI analysis only (`cli`). Omit for `all`.
   */
  productScope?: "all" | "cli" | "platform";
}

export const issues: Record<string, IssueDoc> = {
  "ISSUE-101": {
    code: "ISSUE-101",
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

  "ISSUE-102": {
    code: "ISSUE-102",
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

  "ISSUE-201": {
    code: "ISSUE-201",
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

  "ISSUE-202": {
    code: "ISSUE-202",
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

  "ISSUE-301": {
    code: "ISSUE-301",
    title: "Secret leak in pipeline configuration",
    category: "CI/CD Secrets",
    severity: "critical",
    fixDuration: "quick",
    productScope: "platform",
    controlName: "Pipeline configuration must not contain secrets",
    controlConfigKey: "pipelineConfigurationMustNotContainSecrets",
    description:
      "A secret, such as an API key or password, is hardcoded in the `.gitlab-ci.yml` file, making it visible to anyone with repository access.",
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

  "ISSUE-401": {
    code: "ISSUE-401",
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

  "ISSUE-403": {
    code: "ISSUE-403",
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

  "ISSUE-404": {
    code: "ISSUE-404",
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

  "ISSUE-405": {
    code: "ISSUE-405",
    title: "Missing required template",
    category: "Pipeline Composition",
    severity: "medium",
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

  "ISSUE-406": {
    code: "ISSUE-406",
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

  "ISSUE-501": {
    code: "ISSUE-501",
    title: "Branch protection missing",
    category: "Access and Authorization",
    severity: "high",
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

  "ISSUE-601": {
    code: "ISSUE-601",
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

  "ISSUE-502": {
    code: "ISSUE-502",
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

  "ISSUE-503": {
    code: "ISSUE-503",
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

  "ISSUE-504": {
    code: "ISSUE-504",
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

  "ISSUE-407": {
    code: "ISSUE-407",
    title: "Invalid pipeline composition",
    category: "Pipeline Composition",
    severity: "medium",
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

  "ISSUE-505": {
    code: "ISSUE-505",
    title: "Branch protection configuration not compliant",
    category: "Access and Authorization",
    severity: "medium",
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

  "ISSUE-506": {
    code: "ISSUE-506",
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

  "ISSUE-408": {
    code: "ISSUE-408",
    title: "Missing required component",
    category: "Pipeline Composition",
    severity: "medium",
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

  "ISSUE-409": {
    code: "ISSUE-409",
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

  "ISSUE-507": {
    code: "ISSUE-507",
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

  "ISSUE-103": {
    code: "ISSUE-103",
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

  "ISSUE-203": {
    code: "ISSUE-203",
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

  "ISSUE-204": {
    code: "ISSUE-204",
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

  "ISSUE-205": {
    code: "ISSUE-205",
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

  "ISSUE-410": {
    code: "ISSUE-410",
    title: "Security job weakened",
    category: "Pipeline Composition",
    severity: "medium",
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

  "ISSUE-411": {
    code: "ISSUE-411",
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

  "ISSUE-412": {
    code: "ISSUE-412",
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

  "ISSUE-413": {
    code: "ISSUE-413",
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

  "ISSUE-508": {
    code: "ISSUE-508",
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
};
