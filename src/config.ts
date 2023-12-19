/**
 * vscode-radon-linter
 *
 * This is a Visual Studio Code extension for linting Python code using Radon.
 *
 * Author: Vadim Nareyko
 * Year: 2023
 *
 * Licensed under the MIT License. See LICENSE.txt in the project root for license information.
 */
import * as vscode from "vscode";

// Define a function to get the current configuration
export function getConfig() {
  // Use the getConfiguration method from the vscode.workspace module
  // to get the configuration for the extension with the ID "vscodeRadonLinter"
  // The getConfiguration method returns an object with the current configuration settings
  return vscode.workspace.getConfiguration("vscodeRadonLinter");
}
