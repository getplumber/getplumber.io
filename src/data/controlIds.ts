/**
 * Control ids for the docs site, mirrored from the Plumber CLI's control registry
 * (`configuration/registry.go` in getplumber/plumber): the stable `CTRL-nnn` the
 * Platform's Policies page shows for each control, keyed by the control's
 * `.plumber.yaml` key (the `controlConfigKey` of `issues.ts`).
 *
 * Why this file exists: customers see controls as `CTRL-nnn` in the Platform, so
 * the issue pages and the controls configuration reference name controls the same
 * way. The id is the join between an issue, the Policies page and the
 * configuration reference; the docs have no Controls page of their own.
 *
 * Build-time guards (they throw while the site builds, which is the CI gate):
 *  - every visible issue's control has an id here;
 *  - no issue text mentions `.plumber.yaml`: configuration is explained once, in the
 *    controls configuration reference, never per issue, because Platform users
 *    configure controls in the Policies page and never see that file.
 */
import configurationPage from "@/docs/data/docs/en/cli/controls-configuration.mdx?raw";

import { issues } from "./issues";

export const controlIds: Record<string, { id: string; name: string }> = {
  containerImageMustComeFromAuthorizedSources: { id: "CTRL-101", name: "Container images must come from authorized sources" },
  containerImageMustNotUseForbiddenTags: { id: "CTRL-102", name: "Container images must not use forbidden reference" },
  cicdVariablesMustBeProtected: { id: "CTRL-201", name: "CI/CD variables must be protected" },
  cicdVariablesMustBeMasked: { id: "CTRL-202", name: "CI/CD variables must be masked" },
  pipelineMustNotEnableDebugTrace: { id: "CTRL-203", name: "Pipeline must not enable debug trace" },
  pipelineMustNotUseUnsafeVariableExpansion: { id: "CTRL-204", name: "Pipeline must not use unsafe variable expansion" },
  pipelineMustNotOverrideJobVariables: { id: "CTRL-205", name: "Pipeline must not override job variables" },
  workflowMustNotInjectUserInputInScripts: { id: "CTRL-207", name: "Workflows must not inject user input in scripts" },
  workflowMustNotReEnableInsecureCommands: { id: "CTRL-208", name: "Workflows must not re-enable insecure commands" },
  workflowMustNotWriteUntrustedContentToGitHubEnv: { id: "CTRL-209", name: "Workflows must not write untrusted content to $GITHUB_ENV" },
  workflowMustNotTrustSpoofableActorChecks: { id: "CTRL-210", name: "Workflows must not trust spoofable actor checks" },
  workflowConditionsMustBeSound: { id: "CTRL-211", name: "Workflow conditions must be sound" },
  workflowContainsCallsMustBeSound: { id: "CTRL-212", name: "Workflow contains() calls must be sound" },
  workflowMustNotExportEntireGitHubContext: { id: "CTRL-213", name: "Workflows must not export the entire GitHub context" },
  workflowMustPinPackageInstalls: { id: "CTRL-214", name: "Workflows must pin package installs" },
  workflowMustNotInjectVarsInScripts: { id: "CTRL-215", name: "Workflows must not inject vars in scripts" },
  reusableWorkflowsMustNotInheritSecrets: { id: "CTRL-302", name: "Reusable workflows must not inherit secrets" },
  workflowMustNotUnredactSecretsViaFromJSON: { id: "CTRL-303", name: "Workflows must not unredact secrets via fromJSON" },
  deployJobsMustUseEnvironmentGate: { id: "CTRL-305", name: "Deploy jobs must use an environment gate" },
  githubAppTokensMustBeRevokedOnExit: { id: "CTRL-306", name: "GitHub App tokens must be revoked on exit" },
  checkoutMustNotPersistCredentials: { id: "CTRL-307", name: "Checkout must not persist credentials" },
  workflowMustNotIndexSecretsDynamically: { id: "CTRL-308", name: "Workflows must not index secrets dynamically" },
  workflowMustNotExportEntireSecretsContext: { id: "CTRL-309", name: "Workflows must not expose all secrets at once" },
  pipelineMustNotIncludeHardcodedJobs: { id: "CTRL-401", name: "Pipeline must not include hardcoded jobs" },
  externalRefsMustNotCollide: { id: "CTRL-402", name: "Includes must not use ambiguous tag/branch refs" },
  includesMustBeUpToDate: { id: "CTRL-403", name: "Includes must be up to date" },
  includesMustNotUseForbiddenVersions: { id: "CTRL-404", name: "Includes must not use forbidden versions" },
  pipelineMustIncludeTemplate: { id: "CTRL-405", name: "Pipeline must include required templates" },
  pipelineMustIncludeComponent: { id: "CTRL-408", name: "Pipeline must include required components" },
  securityJobsMustNotBeWeakened: { id: "CTRL-410", name: "Security jobs must not be weakened" },
  pipelineMustNotExecuteUnverifiedScripts: { id: "CTRL-411", name: "Pipeline must not execute unverified scripts" },
  pipelineMustNotUseDockerInDocker: { id: "CTRL-412", name: "Pipeline must not use Docker-in-Docker" },
  workflowMustIncludeRequiredActions: { id: "CTRL-417", name: "Workflows must include required actions" },
  workflowsMustDeclareConcurrency: { id: "CTRL-418", name: "Workflows must declare concurrency" },
  workflowMustNotUseKnownMisfeatures: { id: "CTRL-419", name: "Workflows must not use known misfeatures" },
  workflowMustNotContainObfuscation: { id: "CTRL-420", name: "Workflows must not contain obfuscation" },
  publishWorkflowsMustUseOidcTrustedPublishing: { id: "CTRL-421", name: "Publish workflows must use OIDC trusted publishing" },
  workflowsMustHaveExplicitName: { id: "CTRL-422", name: "Workflows must have an explicit name" },
  branchMustBeProtected: { id: "CTRL-501", name: "Branch must be protected" },
  mergeRequestApprovalRulesMustRequireMinimumApprovals: { id: "CTRL-502", name: "MR approval rules must require a minimum number of approvals" },
  mergeRequestApprovalSettingsMustBeCompliant: { id: "CTRL-503", name: "MR approval settings must be compliant" },
  mergeRequestApprovalRulesMustCoverAllProtectedBranches: { id: "CTRL-504", name: "MR approval rules must cover all protected branches" },
  mergeRequestSettingsMustBeCompliant: { id: "CTRL-506", name: "MR settings must be compliant" },
  projectMustHaveSecurityPolicySource: { id: "CTRL-601", name: "Project must have a security policy source" },
  actionsMustBePinnedByCommitSha: { id: "CTRL-701", name: "Third-party actions must be pinned by commit SHA" },
  actionsMustNotBeArchived: { id: "CTRL-702", name: "Actions must not reference archived repositories" },
  actionsMustNotCarryKnownCVEs: { id: "CTRL-703", name: "Actions must not carry known CVEs" },
  containerCredentialsMustComeFromSecrets: { id: "CTRL-704", name: "Container credentials must come from secrets" },
  releaseWorkflowsMustNotRestoreUntrustedCache: { id: "CTRL-705", name: "Release workflows must not restore an untrusted cache" },
  dockerfilesMustPinBaseImageByDigest: { id: "CTRL-706", name: "Dockerfiles must pin base images by digest" },
  actionRefsMustExistUpstream: { id: "CTRL-707", name: "Actions must pin commits that exist upstream" },
  actionPinCommentsMustMatchSha: { id: "CTRL-708", name: "Action pin comments must match the pinned SHA" },
  actionPinsMustNotBeStale: { id: "CTRL-709", name: "Action pins must not be stale" },
  actionsMustNotDuplicateRunnerBuiltins: { id: "CTRL-711", name: "Actions must not duplicate runner builtins" },
  releaseWorkflowsMustSignArtefacts: { id: "CTRL-712", name: "Release workflows must sign artefacts" },
  githubActionMustComeFromAuthorizedSources: { id: "CTRL-713", name: "Actions must come from authorized sources" },
  actionsMustNotExecuteMutableRemoteCode: { id: "CTRL-714", name: "Actions must not execute mutable remote code" },
  workflowsMustDeclarePermissions: { id: "CTRL-801", name: "Workflows must declare permissions" },
  workflowMustNotUseDangerousTriggers: { id: "CTRL-802", name: "Workflows must not use dangerous triggers" },
  workflowMustNotGrantPermissionsWriteAll: { id: "CTRL-803", name: "Workflow must not grant write-all permissions" },
  pullRequestTargetMustNotCheckoutHead: { id: "CTRL-804", name: "pull_request_target workflows must not check out the PR head" },
  dependabotMustNotAllowInsecureExternalCodeExecution: { id: "CTRL-901", name: "Dependabot must not allow insecure external code execution" },
  dependabotEcosystemsMustHaveCooldown: { id: "CTRL-902", name: "Dependabot ecosystems must have a cooldown" },
  repositoriesMustConfigureDependencyUpdates: { id: "CTRL-903", name: "Repositories must configure dependency updates" },
  repositoriesMustRunSAST: { id: "CTRL-904", name: "Repositories must run SAST" },
  repositoriesMustPublishSecurityPolicy: { id: "CTRL-905", name: "Repositories must publish a security policy" },
};

/** The `CTRL-nnn` id of a control, by its configuration key. */
export function controlIdFor(controlConfigKey: string): string | undefined {
  return controlIds[controlConfigKey]?.id;
}

/**
 * Controls that have a section on the controls configuration reference: read off
 * the page itself (its `### <key>` headings), so a link is only offered when the
 * anchor exists. Controls on the roadmap have no section yet.
 */
const configuredKeys = new Set(
  Array.from(configurationPage.matchAll(/^### ([A-Za-z]+)$/gm), (m) => m[1]),
);

export const CONTROLS_CONFIGURATION_PATH = "/docs/cli/controls-configuration";

/** Link to the control's section on the configuration reference, when it has one. */
export function controlConfigHref(controlConfigKey: string): string | undefined {
  if (!configuredKeys.has(controlConfigKey)) return undefined;
  return `${CONTROLS_CONFIGURATION_PATH}#${controlConfigKey.toLowerCase()}`;
}

// ---- build-time guards -----------------------------------------------------

function walkStrings(value: unknown, visit: (s: string) => void): void {
  if (typeof value === "string") visit(value);
  else if (Array.isArray(value)) value.forEach((v) => walkStrings(v, visit));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => walkStrings(v, visit));
}

const problems: string[] = [];
for (const [code, doc] of Object.entries(issues)) {
  for (const provider of ["gitlab", "github"] as const) {
    const content = doc[provider];
    if (!content) continue;
    if (content.status !== "removed" && !controlIds[content.controlConfigKey]) {
      problems.push(`${code} (${provider}): no control id for ${content.controlConfigKey}; add it to controlIds.ts from the CLI registry`);
    }
    walkStrings(content, (s) => {
      if (s.includes(".plumber.yaml")) {
        problems.push(`${code} (${provider}): issue text mentions .plumber.yaml; configuration belongs to the controls configuration reference, not to an issue page`);
      }
    });
  }
}
if (configuredKeys.size === 0) {
  problems.push("controls-configuration.mdx has no `### <key>` heading; the configuration anchors cannot be resolved");
}
if (problems.length > 0) {
  throw new Error(`controlIds.ts guards failed:\n${Array.from(new Set(problems)).join("\n")}`);
}
