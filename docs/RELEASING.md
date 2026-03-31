# Releasing

This document is for maintainers only.

## Baseline

This project targets jQuery 4. If the baseline changes, update `README.md` and `CHANGELOG.md` accordingly.

## One-time setup

1. Create an npm automation token:
   - npmjs.com → avatar → Access Tokens → Generate New Token → Automation
2. Add the token to GitHub:
   - Repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: the token from npm

## Release steps

1. Update `CHANGELOG.md`.
2. Ensure `package.json` has the correct version.
3. Tag and push:

```sh
git tag vX.Y.Z
git push origin vX.Y.Z
```

GitHub Actions will build, publish to npm, and create the GitHub Release with the build zip attached.
