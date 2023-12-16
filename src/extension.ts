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
import { getConfig, reloadConfig } from "./config";
import { processFile, processAllWorkspaceFolders } from "./workspace";

// Function to handle Python documents
function handlePythonDocument(
  document: vscode.TextDocument, // The document to handle
  diagnosticCollection: vscode.DiagnosticCollection, // The collection of diagnostics
  action: string // The action performed on the document
) {
  // If the document is not a Python file, return
  if (document.languageId !== "python") {
    return;
  }

  // If debug mode is on, log the linting action
  if (getConfig().get<boolean>("debug")) {
    console.log(`Linting ${action} file: ${document.uri}`);
  }

  // Process the file for linting
  processFile(document.uri, diagnosticCollection);
}

// Function to activate the extension
export function activate(context: vscode.ExtensionContext) {
  // Create a diagnostic collection for Python
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("python");
  // Add the diagnostic collection to the context's subscriptions
  context.subscriptions.push(diagnosticCollection);

  // Register a command for linting
  const disposable = vscode.commands.registerCommand("extension.vscodeRadonLinter.lint", () => {
    // Process all workspace folders for linting
    processAllWorkspaceFolders(diagnosticCollection);
  });

  // Add the command to the context's subscriptions
  context.subscriptions.push(disposable);

  // Handle document change events
  vscode.workspace.onDidChangeTextDocument((event) => {
    // Handle the changed document
    handlePythonDocument(event.document, diagnosticCollection, "changed");
  });

  // Handle document open events
  vscode.workspace.onDidOpenTextDocument((document) => {
    // Handle the opened document
    handlePythonDocument(document, diagnosticCollection, "opened");
  });

  // Handle configuration change events
  vscode.workspace.onDidChangeConfiguration((event) => {
    // If the configuration change affects the linter
    if (event.affectsConfiguration("vscodeRadonLinter")) {
      // Reload the configuration
      reloadConfig();
      // If debug mode is on, log the configuration change
      if (getConfig().get<boolean>("debug")) {
        console.log("Configuration changed, reloading...");
      }
      // Re-process all workspace folders with the new configuration
      processAllWorkspaceFolders(diagnosticCollection);
    }
  });
  // Process all workspace folders for linting
  processAllWorkspaceFolders(diagnosticCollection);

  // Check if the warning message should be shown
  if (getConfig().get("showRadonPathWarning")) {
    // Show an information message asking the user to recheck the path to radon
    vscode.window
      .showInformationMessage(
        "Please recheck the path to the radon executable. It should not contain command line arguments.",
        "Check Now",
        "Don't Show Again"
      )
      .then((selection) => {
        if (selection === "Check Now") {
          // Open the settings when the user clicks on "Check Now"
          vscode.commands.executeCommand("workbench.action.openSettings", "radonExecutable");
        } else if (selection === "Don't Show Again") {
          // Set 'showRadonPathWarning' to false when the user clicks on "Don't Show Again"
          const config = vscode.workspace.getConfiguration("vscodeRadonLinter");
          config.update("showRadonPathWarning", false, vscode.ConfigurationTarget.Global);
        }
      });
  }
}

// Function to deactivate the extension
export function deactivate() {}
