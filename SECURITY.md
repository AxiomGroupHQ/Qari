# Security Policy

## Supported versions

We accept security reports for the latest released version of Istima.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you find a security issue, report it privately:

Email app@istima.app, or use the **Security** tab of this repository to open a private advisory.

We will acknowledge your report within **72 hours** and aim to release a fix within **14 days** for confirmed critical issues.

## What to include in your report

- A clear description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix if you have one

## What qualifies as a security issue

Report through the private channel if the issue involves:

- Exposure of user data (loved tracks, notes, bookmarks, playlists)
- Authentication or authorization bypass
- Malicious audio file handling leading to code execution
- API key exposure or leakage
- Deep link hijacking
- Storage or file path traversal vulnerabilities

## What does not need a private report

Open a regular GitHub issue for:

- App crashes or unexpected behaviour
- Playback bugs
- UI/UX issues
- Performance problems

## Scope

This policy covers the Istima mobile and web app (`com.istima.app`).

## Out of scope

- Rate limiting on the community API key (this is by design)
- The community API key itself being revoked or changed
- Third-party dependencies with known vulnerabilities that are not exploitable in this app's context

## Acknowledgements

We genuinely appreciate responsible disclosure. If your report leads to a fix, we will credit you in the release notes (unless you prefer to remain anonymous).