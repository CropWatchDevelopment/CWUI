# Publishing Troubleshooting

## Overview
This document helps troubleshoot issues with the GitHub Actions publish workflow for this package.

## Common Issues

### 403 Forbidden - Permission Denied

**Symptom**: Workflow fails with error:
```
npm error 403 403 Forbidden - PUT https://npm.pkg.github.com/@cropwatchdevelopment%2fcwui - Permission permission_denied: write_package
```

**Potential Causes**:

1. **Organization Package Permissions** (Most Common)
   - GitHub Actions may not have permission to create packages in the organization
   - **Fix**: Organization owner needs to:
     1. Go to Organization Settings → Actions → General
     2. Under "Workflow permissions", ensure "Read and write permissions" is selected
     3. Check "Allow GitHub Actions to create and approve pull requests" if needed
     
2. **Package Already Exists with Restricted Access**
   - The package exists but the workflow token doesn't have write access
   - **Fix**: Go to the package settings and ensure the repository has write access

3. **First Time Publishing**
   - For the first publish to GitHub Packages, you may need to manually publish once or configure package permissions
   - **Alternative**: Use a Personal Access Token instead of GITHUB_TOKEN (see below)

## Using a Personal Access Token (Alternative Solution)

If organization settings cannot be changed, use a PAT:

1. **Create a Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with scope: `write:packages`
   - Copy the token

2. **Add as Repository Secret**:
   - Go to repository Settings → Secrets and variables → Actions
   - Create a new secret named `CWUI_PUBLISH_TOKEN`
   - Paste the PAT

3. **Update Workflow** (if needed):
   The workflow already checks for `CWUI_PUBLISH_TOKEN` secret, so it will automatically use it if present.

## Verifying the Fix

After making changes, trigger the workflow by pushing a new tag:

```bash
# Update version in package.json first, then:
git tag v0.1.1
git push origin v0.1.1
```

Check the Actions tab to see if the workflow succeeds.

## Additional Resources

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [Publishing Node.js packages](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [About permissions for GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages)
