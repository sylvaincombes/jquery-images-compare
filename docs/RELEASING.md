# Releasing

This document is for maintainers only.

## Baseline

This project targets jQuery 4. If the baseline changes, update `README.md` and `CHANGELOG.md` accordingly.

## Release steps

1. Update `CHANGELOG.md`.
2. Ensure `package.json` has the correct version.
3. Tag and push:

```sh
git tag vX.Y.Z
git push origin vX.Y.Z
```

GitHub Actions will build, publish to npm, and create the GitHub Release with the build zip attached.
