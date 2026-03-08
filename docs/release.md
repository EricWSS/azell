# AZELL Release Guide

This document explains the CI/CD release workflow for the AZELL application.

## Release Workflow

Releases are fully automated via GitHub Actions. When a new version tag is pushed to the repository, the GitHub Action automatically provisions build environments for Windows and Linux, compiles the frontend and the Tauri application, and publishes the resulting installers to the GitHub Releases page.

## Versioning

We expect standard semantic versioning (SemVer) format. Keep versions synchronized across the frontend and Tauri configurations. 

Before tagging a release, ensure the versions have been updated in:
- `package.json`
- `src-tauri/tauri.conf.json`

## Tagging a Release

To trigger a new automated release, create and push a git tag starting with `v` (e.g., `v0.1.0` or `v1.0.0`).

### Step-by-Step

1. Update version numbers as mentioned above.
2. Commit your changes:
   ```bash
   git commit -am "chore: prepare release v0.1.0"
   ```
3. Create the git tag:
   ```bash
   git tag v0.1.0
   ```
4. Push the tag to GitHub:
   ```bash
   git push origin v0.1.0
   ```

Pushing the tag will immediately trigger the CI pipeline, which builds the application for Windows and Linux and publishes the artifacts to GitHub Releases.

## Troubleshooting Failed Builds

If a release workflow fails, you can investigate using these strategies:

1. **Check Action Logs**: Navigate to the "Actions" tab on GitHub, click on the failed workflow run, and inspect the real-time or historical logs.
2. **Local Frontend Build**: Verify the frontend builds locally without errors:
   ```bash
   npm run build
   ```
3. **Local Tauri Build**: Verify the Tauri component builds locally without errors:
   ```bash
   npm run tauri build
   ```
4. **Linux Dependences**: If the build fails on `ubuntu-latest` during Rust compilation, verify that any new native dependencies you may have added to `Cargo.toml` have their corresponding Debian/Ubuntu libraries appended to the `apt-get install` step in the workflow file.
