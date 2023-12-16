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
import * as childProcess from "child_process";
import * as vscode from "vscode";
import { getConfig } from "./config";
import { createDiagnostics } from "./diagnostics";
import { RadonOutput } from "./radonTypes";

// Function to execute Radon and return the output
// It takes the target path and the Radon executable as parameters
// Returns a promise that resolves with the Radon output
async function executeRadon(targetPath: string, radonExecutable: string): Promise<RadonOutput> {
  return new Promise((resolve, reject) => {
    // Execute the Radon command
    childProcess.exec(`${radonExecutable} ${targetPath}`, (error, stdout) => {
      // If there's an error executing the command, reject the promise
      if (error) {
        reject(new Error(`Could not lint due to an error: ${error}`));
        return;
      }

      try {
        // Parse the stdout as JSON to get the Radon output
        const radonOutput: RadonOutput = JSON.parse(stdout);
        // Resolve the promise with the Radon output
        resolve(radonOutput);
      } catch (e) {
        // If there's an error parsing the output, reject the promise
        reject(new Error(`Could not parse Radon output due to an error: ${e}`));
      }
    });
  });
}

// Function to process Radon output and update the diagnostic collection
// It takes the Radon output, target path, a boolean indicating if the target is a file, and the diagnostic collection as parameters
async function processRadonOutput(
  radonOutput: RadonOutput,
  targetPath: string,
  isFile: boolean,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  // Get the file paths from the Radon output
  const filePaths = isFile ? [targetPath] : Object.keys(radonOutput);

  // For each file path
  for (const filePath of filePaths) {
    try {
      // Create diagnostics from the Radon output for the file
      const diagnostics = createDiagnostics(radonOutput[filePath]);
      // Set the diagnostics for the file in the diagnostic collection
      diagnosticCollection.set(vscode.Uri.file(filePath), diagnostics);
    } catch (e) {
      // If there's an error creating the diagnostics, throw an error
      throw new Error(`Could not create diagnostics due to an error: ${e}`);
    }
  }
}

// Main function to process a target with Radon
// It takes the target path, the diagnostic collection, and a boolean indicating if the target is a file as parameters
export async function processRadon(
  targetPath: string,
  diagnosticCollection: vscode.DiagnosticCollection,
  isFile: boolean
) {
  // If debug mode is on, log the Radon run
  if (getConfig().get<boolean>("debug")) {
    console.log(`Running Radon on ${isFile ? "file" : "workspace"}: ${targetPath}`);
  }

  // Get the Radon executable from the configuration, or use "radon cc -j" as a default
  const radonExecutable = getConfig().get<string>("radonExecutable") || "radon cc -j";

  try {
    // Execute Radon and get the output
    const radonOutput = await executeRadon(targetPath, radonExecutable);
    // Process the Radon output and update the diagnostic collection
    await processRadonOutput(radonOutput, targetPath, isFile, diagnosticCollection);
  } catch (error) {
    // If there's an error, log it
    console.error((error as Error).message);
  }
}
