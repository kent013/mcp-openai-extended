# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-02-14

### Added
- Expanded supported model list to include broader GPT-5 family and Codex variants.
- Added support for `o1` in the model allowlist.
- Added `CHANGELOG.md` for release tracking.
- Added `tmp/` to `.gitignore`.
- Added `mise.toml` with Node.js 20 tool pinning.

### Changed
- Updated model descriptions in tool schema and README to reflect GPT-5 family support.
- Generalized Responses API routing from a single model (`gpt-5.2-codex`) to all model IDs containing `codex`.
- Aligned runtime default model with schema default (`gpt-5.2-codex`).
- Updated package metadata keywords/description for GPT-5 naming.

### Build
- Rebuilt `dist/index.js` from updated TypeScript source.
