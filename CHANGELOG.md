# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

*Nothing at this moment*

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
