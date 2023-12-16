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
import * as path from "path";
import * as vscode from "vscode";
import { processRadon } from "./radon";

// Function to process a workspace folder
export async function processWorkspace(
  workspaceFolder: vscode.WorkspaceFolder, // The workspace folder to process
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
) {
  // Resolve the path of the workspace folder
  const workspacePath = path.resolve(workspaceFolder.uri.fsPath);
  // Process the workspace folder with Radon
  processRadon(workspacePath, diagnosticCollection, false);
}

// Function to process a file
export async function processFile(
  file: vscode.Uri, // The file to process
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
) {
  // Resolve the path of the file
  const filePath = path.resolve(file.fsPath);
  // Process the file with Radon
  processRadon(filePath, diagnosticCollection, true);
}

// Function to process Python files
export function processPythonFiles(
  files: vscode.TextDocument[], // The files to process
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
) {
  // For each file
  for (const file of files) {
    // If the file is a Python file
    if (file.languageId === "python") {
      // Process the file
      processFile(file.uri, diagnosticCollection);
    }
  }
}

// Function to process all workspace folders
export function processAllWorkspaceFolders(
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
) {
  // Get the workspace folders
  const workspaceFolders = vscode.workspace.workspaceFolders;

  // If there are no workspace folders
  if (!workspaceFolders) {
    // Show an error message
    vscode.window.showErrorMessage("No workspace is opened");
  } else {
    // For each workspace folder
    for (const workspaceFolder of workspaceFolders) {
      // Process the workspace folder
      processWorkspace(workspaceFolder, diagnosticCollection);
    }
  }

  // Process all opened Python files
  processPythonFiles(Array.from(vscode.workspace.textDocuments), diagnosticCollection);
}
