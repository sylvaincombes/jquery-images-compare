# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

_Nothing at this moment_

## [4.0.0] - 2026-04-08

### Added

- Bun-based test serve script and open helper.
- Biome configuration for linting/formatting.
- Shared button-controls helper for examples and tests.
- Browser support notes in the README (Pointer Events + jQuery 4 policy).
- `mise.toml` to pin Bun for contributors.
- Transparent image test coverage (PNG/GIF/WebP/SVG/AVIF) with a checkerboard background.
- QUnit coverage for zero-image init, pointer fallback, and transparent format init.

### Changed

- Build pipeline now uses Bun scripts and esbuild for JS/CSS minification.
- Tests are run in the browser via a local server instead of PhantomJS.
- Pointer Events are used for drag interactions, with mouse/touch fallback.
- Clip updates now use `clip-path` with `clip` as a legacy fallback.
- README updated to reflect new tooling, browser support, and the upcoming vanilla alternative.
- jQuery 4 is now the supported baseline (older versions are not officially supported).

### Removed

- Dropped the IE `naturalWidth/Height` shim in favor of native properties.
- Hammer.js dependency (no longer required).
- Legacy dev tools: `jshint`, `csslint`, `node-qunit-phantomjs`, `copy-cli`, `uglify-js`, and `qunit` (unused in-browser CDN remains for tests).
- Outdated README credits for removed polyfills.
- JSLint loop annotations.

## [0.2.5] - 2018-28-12

Updating dev dependencies (security warnings)

## [0.2.4] - 2018-26-03

### Fixed

- jQuery 3 compatibility on load and error, [see documentation](https://jquery.com/upgrade-guide/3.0/#breaking-change-load-unload-and-error-removed) - thanks to [Iván Pérez](https://github.com/Ivan-Perez) for reporting.

### Changed

- Update all dependencies
- Add a package-lock.json

## [0.2.3] - 2016-10-03

### Fixed

- Nothing is visible after the init : Image calculations are done before images are loaded
- Labels are "floating" all around before the init

### Added

- Waiting for images to be loaded before calling the init function

### Changed

- Labels are hidden via css until the plugin add the wrapper class (initialised)
