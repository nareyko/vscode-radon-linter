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
import { getConfig } from "./config";

/**
 * This function handles Python documents.
 *
 * @param {vscode.TextDocument} document - The document to handle.
 * @param {vscode.DiagnosticCollection} diagnosticCollection - The collection of diagnostics.
 * @param {string} action - The action performed on the document.
 *
 * @returns {Promise<void>} - The function returns a Promise that resolves to void.
 */
export async function handlePythonDocument(
  document: vscode.TextDocument, // The document to handle
  diagnosticCollection: vscode.DiagnosticCollection, // The collection of diagnostics
  action: string // The action performed on the document
): Promise<void> {
  // If the document is a Python file
  if (document.languageId === "python") {
    // If debug mode is on, log the linting action
    if (getConfig().get<boolean>("debug")) {
      console.log(`Linting ${action} file: ${document.uri}`);
    }

    // Process the file for linting
    processFile(document.uri, diagnosticCollection);
  }
}

/**
 * This function processes a workspace folder.
 *
 * @param {vscode.WorkspaceFolder} workspaceFolder - The workspace folder to process.
 * @param {vscode.DiagnosticCollection} diagnosticCollection - The collection of diagnostics.
 *
 * @returns {Promise<void>} - The function returns a Promise that resolves to void.
 */
export async function processWorkspace(
  workspaceFolder: vscode.WorkspaceFolder, // The workspace folder to process
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
) {
  // Resolve the path of the workspace folder
  const workspacePath = path.resolve(workspaceFolder.uri.fsPath);
  // Process the workspace folder with Radon
  processRadon(workspacePath, diagnosticCollection, false);
}

/**
 * This function processes a file.
 *
 * @param {vscode.Uri} file - The file to process.
 * @param {vscode.DiagnosticCollection} diagnosticCollection - The collection of diagnostics.
 *
 * @returns {Promise<void>} - The function returns a Promise that resolves to void.
 */
export async function processFile(
  file: vscode.Uri, // The file to process
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
) {
  // Resolve the path of the file
  const filePath = path.resolve(file.fsPath);
  // Process the file with Radon
  processRadon(filePath, diagnosticCollection, true);
}

/// Function to process Python files
/**
 * This function processes Python files.
 *
 * @param {vscode.TextDocument[]} files - The files to process.
 * @param {vscode.DiagnosticCollection} diagnosticCollection - The collection of diagnostics.
 */
export async function processPythonFiles(
  files: vscode.TextDocument[], // The files to process
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
): Promise<void> {
  // Filter out non-Python files and process each Python file
  await Promise.all(
    Array.from(files)
      .filter((file) => file.languageId === "python")
      .map((file) => processFile(file.uri, diagnosticCollection))
  );
}

// Function to process all workspace folders
/**
 * This function processes all workspace folders.
 *
 * @param {vscode.DiagnosticCollection} diagnosticCollection - The collection of diagnostics.
 *
 * @returns {Promise<void>} - The function returns a Promise that resolves to void.
 */
export async function processAllWorkspaceFolders(
  diagnosticCollection: vscode.DiagnosticCollection // The collection of diagnostics
): Promise<void> {
  // Get the workspace folders
  const workspaceFolders = vscode.workspace.workspaceFolders;

  // If there are no workspace folders
  if (!workspaceFolders) {
    // Show an error message
    vscode.window.showErrorMessage("No workspace is opened");
  } else {
    // Process each workspace folder
    await Promise.all(
      workspaceFolders.map((workspaceFolder) => processWorkspace(workspaceFolder, diagnosticCollection))
    );
  }

  // Process all opened Python files
  processPythonFiles(Array.from(vscode.workspace.textDocuments), diagnosticCollection);
  return Promise.resolve();
}
