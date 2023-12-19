# Changelog

## [1.0.2] - 2022-XX-XX

### Changed

- Modified default ignore patterns in `package.json`.

### Updated

- Improved error handling in `src/diagnostics.ts`.
- Updated the `createDiagnostics` function in `src/diagnostics.ts` to handle different types of `radonOutput`.
  - Added a check to ensure `radonOutput` is an array before processing.
  - Added handling for `radonOutput` being an object with an `error` property.
  - In case of an error, a diagnostic with severity `Error` is created, with the line number extracted from the error message.

### Fixed

- Fixed the order of parameters in the Radon executable command in `src/radon.ts`.
- Added logging for debugging in `src/radon.ts`.
- Fixed handling of file paths in `src/radon.ts`.

## [1.0.1] - 2022-12-16

### Added

- New configuration options in `package.json`:
  - `vscodeRadonLinter.minComplexityRank`: The minimum complexity rank for Radon linter.
  - `vscodeRadonLinter.excludeFiles`: Glob patterns for files to exclude.
  - `vscodeRadonLinter.ignoreFolders`: Glob patterns for folders to ignore.
  - `vscodeRadonLinter.showRadonPathWarning`: Show a warning message to recheck the path to the radon executable.
- In `src/extension.ts`, added a check for the `showRadonPathWarning` configuration. If true, it shows an information message asking the user to recheck the path to the radon executable.
- In `src/radon.ts`, added new parameters to the `executeRadon` function: `minComplexityRank`, `excludeFiles`, and `ignoreFolders`. These parameters are used in the Radon command execution.

### Changed

- Updated the `vscodeRadonLinter.radonExecutable` default value in `package.json` from `radon cc -j` to `radon`.
- In `src/radon.ts`, updated the `executeRadon` function to include the new parameters in the Radon command execution.
- Updated the `processRadon` function in `src/radon.ts` to fetch the new configuration options and pass them to the `executeRadon` function.

### Fixed

- Fixed the Radon command execution in `src/radon.ts` to properly handle the exclusion of files and folders, and to consider the minimum complexity rank.
