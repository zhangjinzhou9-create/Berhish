# Release history

## 2026-07-27 - Final course release

- Completed Google and GitHub OAuth return flow with explicit account choice.
- Added persistent image, audio, and text uploads for user-owned portfolio work.
- Added portfolio card size and image fit controls.
- Kept new user portfolios empty instead of inserting placeholder images.
- Restricted profile identity titles to the published preset list.
- Synchronized the configured administrator account without exposing credentials.
- Preserved the three-language desktop interface and guest preset content.
- Published the immutable Docker image
  `berhish/campus-flow:release-20260727-oauth`.
- Deployed the final image to the single Azure Web App
  `campusflow-final-0724`.

## 2026-07-24 - Submission structure

- Consolidated source, deployment instructions, compiled output, and report.
- Documented the local Docker and Azure App Service environments.
- Added automated regression coverage for authorization, ownership, date and
  timezone behavior, multilingual UI content, and OAuth callback generation.

This file records completed project changes only. Credentials, private paths,
raw logs, and internal troubleshooting notes are intentionally excluded.
