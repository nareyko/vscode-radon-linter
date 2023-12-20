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
import { getConfig } from "./config";
import { processAllWorkspaceFolders, handlePythonDocument } from "./workspace";
import { PromiseQueue } from "./promisequeue";

// Function to activate the extension
export function activate(context: vscode.ExtensionContext) {
  // Create a diagnostic collection for Python
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("python");
  // Add the diagnostic collection to the context's subscriptions
  context.subscriptions.push(diagnosticCollection);

  // Create a new PromiseQueue
  const queue = new PromiseQueue();
  // Function to process all workspace folders and add to queue
  const processWorkspaces = () => queue.enqueue(() => processAllWorkspaceFolders(diagnosticCollection));

  // Register a command for linting
  const disposable = vscode.commands.registerCommand("extension.vscodeRadonLinter.lint", processWorkspaces);

  // Add the command to the context's subscriptions
  context.subscriptions.push(disposable);

  // Function to handle document events and add to queue
  const handleDocumentEvent = (document: vscode.TextDocument, eventType: string) =>
    queue.enqueue(() => handlePythonDocument(document, diagnosticCollection, eventType));

  vscode.workspace.onDidChangeTextDocument((event) => handleDocumentEvent(event.document, "changed"));

  // Handle document open events
  vscode.workspace.onDidOpenTextDocument((document) => handleDocumentEvent(document, "opened"));

  // Handle configuration change events
  vscode.workspace.onDidChangeConfiguration((event) => {
    // If the configuration change affects the linter
    if (event.affectsConfiguration("vscodeRadonLinter")) {
      // If debug mode is on, log the configuration change
      if (getConfig().get<boolean>("debug")) {
        console.log("Configuration changed, reloading...");
      }
      // Re-process all workspace folders with the new configuration
      processWorkspaces();
    }
  });
  // Process all workspace folders for linting
  processWorkspaces();
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
// Remove the empty function declaration
// export function deactivate() {}
