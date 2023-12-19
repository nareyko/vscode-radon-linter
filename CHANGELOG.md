# Changelog

## [1.0.3] - 2022-12-19

### Changed

- Simplified the configuration retrieval in `src/config.ts` and refactored the `createDiagnostics` function in `src/diagnostics.ts` to improve readability and maintainability. The `createDiagnostics` function now also takes into account the `showErrors` configuration setting when creating diagnostic messages from errors.
- Simplified `extension.ts` by moving the `handlePythonDocument` function to `workspace.ts` and using the `processWorkspaces` function for linting and handling of configuration change events. The handling of document change and open events now uses the `handleDocumentEvent` function.
- Improved documentation and refactored `executeRadon` function in `src/radon.ts` to construct command arguments in a more structured way. Improved error handling in `executeRadon` and `processRadonOutput` functions. The `processRadonOutput` function now handles file paths in a more robust way.
- In `src/radonTypes.ts`, the `RadonBlock` and `RadonOutput` definitions have been changed from interfaces to types, allowing them to be used in more flexible ways, such as in union types or mapped types. Added semicolons at the end of these type definitions.
- Refactored the `processPythonFiles` and `processAllWorkspaceFolders` functions to use the `Array.filter` and `Array.forEach` methods instead of a for loop. The `processAllWorkspaceFolders` function now also returns a Promise that resolves to void.

### Removed

- From `extension.ts`:

  - Removed the inline definition of `handlePythonDocument` function.
  - Removed `reloadConfig` import as it's no longer used.

- Replaced direct calls to `processAllWorkspaceFolders` and `handlePythonDocument` with a new queue-based approach.

- In `processRadonOutput` function:

  - Removed unnecessary array check. The function now assumes that the `filePaths` variable is always an array.

- Cleaned up `processWorkspace`, `processFile`, `processPythonFiles`, and `processAllWorkspaceFolders` functions:

### Added

- Introduced a new configuration option "vscodeRadonLinter.showErrors" in `package.json`. This option, when set to true, will display errors identified by the Radon tool.
- Added "\*.pyx" and "cpython" to the default glob patterns for files and folders to exclude in `package.json`.

- Added new imports to `extension.ts`:

  - `handlePythonDocument` from `workspace.ts`
  - `PromiseQueue`

- Introduced a new PromiseQueue to handle tasks in a queue.

- Added new functions:

  - `processWorkspaces` to process all workspace folders and add them to the queue.
  - `handleDocumentEvent` to handle document events and add them to the queue.
  - `handlePythonDocument` to handle Python documents. This function takes a document, a diagnostic collection, and an action performed on the document as parameters. It checks if the document is a Python file and if so, it processes the file for linting.

- Added detailed comments to the following functions explaining their purpose, parameters, and return value:

  - `processRadonOutput`
  - `processWorkspace`
  - `processFile`
  - `processPythonFiles`
  - `processAllWorkspaceFolders`

- Enhanced logging in `processRadon` function. The function now logs the target path if the "debug" configuration option is set to true.

## [1.0.2] - 2022-12-19

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
