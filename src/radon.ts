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
async function executeRadon(
  targetPath: string,
  radonExecutable: string,
  minComplexityRank: string,
  excludeFiles: string[] = [],
  ignoreFolders: string[] = []
): Promise<RadonOutput> {
  return new Promise((resolve, reject) => {
    const _excludeFiles = excludeFiles.map((pattern) => `--exclude ${pattern}`).join(" ");
    const _ignoreFolders = ignoreFolders.map((pattern) => `--ignore ${pattern}`).join(" ");

    childProcess.exec(
      `${radonExecutable} cc -n ${minComplexityRank} -j ${_excludeFiles} ${_ignoreFolders} ${targetPath}`,
      (error, stdout) => {
        if (error) {
          reject(new Error(`Could not lint due to an error: ${error}`));
          return;
        }

        try {
          const radonOutput: RadonOutput = JSON.parse(stdout);
          resolve(radonOutput);
        } catch (e) {
          reject(new Error(`Could not parse Radon output due to an error: ${e}`));
        }
      }
    );
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
  if (getConfig().get<boolean>("debug")) {
    console.log(`Running Radon on ${isFile ? "file" : "workspace"}: ${targetPath}`);
  }

  const radonExecutable = getConfig().get<string>("radonExecutable") || "radon";
  const minComplexityRank = getConfig().get<string>("minComplexityRank") || "C";
  const excludeFiles = getConfig().get<string[]>("excludeFiles") || ["**/!(*.py)"];
  const ignoreFolders = getConfig().get<string[]>("ignoreFolders") || [
    "**/node_modules/**",
    "**/venv/**",
    "**/.venv/**",
  ];

  try {
    const radonOutput = await executeRadon(targetPath, radonExecutable, minComplexityRank, excludeFiles, ignoreFolders);
    await processRadonOutput(radonOutput, targetPath, isFile, diagnosticCollection);
  } catch (error) {
    console.error((error as Error).message);
  }
}
