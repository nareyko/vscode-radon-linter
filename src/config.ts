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

// Get the initial configuration for the vscodeRadonLinter extension
let config = vscode.workspace.getConfiguration("vscodeRadonLinter");

// Function to get the current configuration
export function getConfig() {
  // Return the current configuration
  return config;
}

// Function to reload the configuration
export function reloadConfig() {
  // Update the configuration by getting the latest from the workspace
  config = vscode.workspace.getConfiguration("vscodeRadonLinter");
}
