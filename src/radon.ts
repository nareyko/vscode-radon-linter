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

/**
 * Executes the Radon command and returns the output.
 * Radon is a Python tool that computes various metrics from the source code.
 * This function uses the `child_process.execFile` method to execute the Radon command.
 *
 * @param targetPath - The path of the file or directory to analyze.
 * @param radonExecutable - The path to the Radon executable.
 * @param minComplexityRank - The minimum rank for complexity (i.e., A-F). Only blocks with this rank or worse are reported.
 * @param excludeFiles - An array of glob patterns for files to exclude from analysis.
 * @param ignoreFolders - An array of glob patterns for folders to ignore during analysis.
 * @returns A promise that resolves with the Radon output. The output is an object where each key is a file path and the value is an array of blocks for that file.
 * Each block is an object with details about the complexity of a certain part of the code.
 * If there is an error executing the Radon command or parsing its output, the promise is rejected with an error.
 */
async function executeRadon(
  targetPath: string,
  radonExecutable: string,
  minComplexityRank: string,
  excludeFiles: string[] = [],
  ignoreFolders: string[] = []
): Promise<RadonOutput> {
  return new Promise((resolve, reject) => {
    // Convert the excludeFiles and ignoreFolders arrays to strings that can be used as command line arguments
    const _excludeFiles = excludeFiles.map((pattern) => `--exclude ${pattern}`).join(" ");
    const _ignoreFolders = ignoreFolders.map((pattern) => `--ignore ${pattern}`).join(" ");

    // Construct the arguments for the Radon command
    const args = [
      "cc", // Use the Cyclomatic Complexity (CC) command
      "-j", // Output JSON
      "-n", // Set the minimum rank for complexity
      minComplexityRank,
      ..._excludeFiles.split(" "), // Add the exclude files arguments
      ..._ignoreFolders.split(" "), // Add the ignore folders arguments
      targetPath, // Add the target path
    ];

    // Execute the Radon command
    childProcess.execFile(radonExecutable, args, (error, stdout) => {
      if (error) {
        // If there is an error executing the command, reject the promise with an error
        reject(new Error(`Could not lint due to an error: ${error}`));
        return;
      }

      try {
        // Try to parse the output from Radon
        const radonOutput: RadonOutput = JSON.parse(stdout);
        // If successful, resolve the promise with the output
        resolve(radonOutput);
      } catch (e) {
        // If there is an error parsing the output, reject the promise with an error
        reject(new Error(`Could not parse Radon output due to an error: ${(e as Error).message}`));
      }
    });
  });
}
/**
 * Function to process Radon output and update the diagnostic collection.
 * It takes the Radon output, target path, a boolean indicating if the target is a file, and the diagnostic collection as parameters.
 *
 * @param radonOutput - The output from Radon, a tool for static code analysis.
 * @param targetPath - The path of the file or directory to analyze.
 * @param isFile - A boolean indicating whether the target is a file.
 * @param diagnosticCollection - The collection of diagnostics where the results will be stored.
 */
async function processRadonOutput(
  radonOutput: RadonOutput,
  targetPath: string,
  isFile: boolean,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  // Get the file paths from the Radon output.
  // If the target is a file, the list of paths will only contain the target path.
  // If the target is a directory, the list of paths will be the keys of the Radon output object.
  const filePaths = isFile ? [targetPath] : Object.keys(radonOutput);

  // Process each file path.
  for (const filePath of filePaths) {
    try {
      // Create diagnostics from the Radon output for the file.
      const diagnostics = createDiagnostics(radonOutput[filePath]);

      // Set the diagnostics for the file in the diagnostic collection.
      diagnosticCollection.set(vscode.Uri.file(filePath), diagnostics);
    } catch (e) {
      // If there's an error creating the diagnostics, throw an error with a descriptive message.
      throw new Error(`Could not create diagnostics due to an error: ${(e as Error).message}`);
    }
  }
}

// This is the main function to process a target with Radon.
// Radon is a Python tool that computes various metrics from the source code.
export async function processRadon(
  targetPath: string, // The path to the target file or directory
  diagnosticCollection: vscode.DiagnosticCollection, // The collection of diagnostics (problems) in VS Code
  isFile: boolean // A flag indicating whether the target is a file
) {
  // If the "debug" configuration option is set to true, log the target path
  if (getConfig().get<boolean>("debug")) {
    console.log(`Running Radon on ${isFile ? "file" : "workspace"}: ${targetPath}`);
  }

  // Get the path to the Radon executable from the configuration, or use "radon" if it's not set
  const radonExecutable = getConfig().get<string>("radonExecutable") || "radon";

  // Get the minimum complexity rank from the configuration, or use "C" if it's not set
  const minComplexityRank = getConfig().get<string>("minComplexityRank") || "C";

  // Get the list of file patterns to exclude from the configuration, or use ["*.pyx"] if it's not set
  const excludeFiles = getConfig().get<string[]>("excludeFiles") || ["*.pyx"];

  // Get the list of folders to ignore from the configuration, or use ["node_modules,venv,.venv,env,.venv"] if it's not set
  const ignoreFolders = getConfig().get<string[]>("ignoreFolders") || ["node_modules,venv,.venv,env,.venv"];

  try {
    // Run Radon on the target path with the given parameters and get the output
    const radonOutput = await executeRadon(targetPath, radonExecutable, minComplexityRank, excludeFiles, ignoreFolders);

    // Process the output of Radon and update the diagnostic collection
    await processRadonOutput(radonOutput, targetPath, isFile, diagnosticCollection);
  } catch (error) {
    // If an error occurs, log the error message
    console.error((error as Error).message);
  }
}
