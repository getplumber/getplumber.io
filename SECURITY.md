# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| < latest | :x:               |

This repository powers [getplumber.io](https://getplumber.io). Only the latest release — what is deployed to production from `main` — is supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in the getplumber.io website, its documentation, or its CI/CD workflows, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please use one of the following methods:

- **GitHub Security Advisories**: Use [GitHub's private vulnerability reporting](https://github.com/getplumber/getplumber.io/security/advisories/new) to submit a report directly.

Vulnerabilities in the **Plumber CLI or GitHub Action** should be reported to the [getplumber/plumber](https://github.com/getplumber/plumber/security/advisories/new) repository instead.

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix timeline**: Depends on severity, but we aim for:
  - Critical: 7 days
  - High: 14 days
  - Medium: 30 days
  - Low: Next release

### Disclosure policy

We follow [coordinated vulnerability disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure). We will work with you to understand and address the issue before any public disclosure.

## Security Best Practices for CI/CD

Plumber is a CI/CD compliance scanner, and this website's repository practices what we preach:

- All GitHub Actions are pinned by SHA commit hash
- Workflow permissions follow the principle of least privilege
- The repository is gated by Plumber's own GitHub Action (100% compliance required)
- Dependencies are monitored with Dependabot, audited daily with `npm audit`, and vetted on every PR by Dependency Review
- Code is analyzed with CodeQL (SAST)
- Workflow configuration is scanned for secrets with gitleaks
- Supply-chain posture is continuously measured with OpenSSF Scorecard
