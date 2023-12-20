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
import { RadonBlock } from "./radonTypes";

/**
 * Creates a diagnostic message from a RadonBlock object if its complexity is greater than or equal to the minimum complexity.
 * @param block - The RadonBlock object to create a diagnostic from.
 * @param minComplexity - The minimum complexity for a block to be considered complex.
 * @returns A vscode.Diagnostic object if the block's complexity is greater than or equal to the minimum complexity, or null otherwise.
 */
function createDiagnosticFromBlock(block: RadonBlock, minComplexity: number): vscode.Diagnostic | null {
  // If the block's complexity is greater than or equal to the minimum complexity...
  if (block.complexity >= minComplexity) {
    // Create a range object representing the line of code where the block is located.
    const range = new vscode.Range(block.lineno - 1, 0, block.lineno - 1, Number.MAX_VALUE);

    // Create a message string describing the block's type, name, and complexity.
    const message = `Radon: ${block.type} '${block.name}' has a complexity of ${block.complexity}`;

    // Determine the severity of the diagnostic based on the block's complexity.
    const severity = block.complexity > 5 ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information;

    // Return a new vscode.Diagnostic object with the range, message, and severity.
    return new vscode.Diagnostic(range, message, severity);
  }

  // If the block's complexity is less than the minimum complexity, return null.
  return null;
}

/**
 * Creates a diagnostic message from an error in the radon output.
 * @param radonOutput - The output from the radon tool.
 * @param showErrors - A flag indicating whether to show errors.
 * @returns A vscode.Diagnostic object if an error is present in the radon output and showErrors is true, or null otherwise.
 */
function createDiagnosticFromError(radonOutput: any, showErrors: boolean): vscode.Diagnostic | null {
  // If radonOutput is an object, is not null, contains an "error" property, and showErrors is true...
  if (typeof radonOutput === "object" && radonOutput !== null && "error" in radonOutput && showErrors) {
    // Initialize the line number to 0.
    let line = 0;

    // Try to match the error message with a regular expression to extract the line number.
    const errorLineMatch = /line (\d+)/.exec(radonOutput["error"] as string);

    // If a match was found, parse the line number from the match and subtract 1 (because line numbers in vscode start from 0).
    if (errorLineMatch) {
      line = parseInt(errorLineMatch[1]) - 1;
    }

    // Create a range object representing the line of code where the error occurred.
    const range = new vscode.Range(line, 0, line, Number.MAX_VALUE);

    // Create a message string containing the error message from the radon output.
    const message = `Radon error: ${radonOutput["error"]}`;

    // Set the severity of the diagnostic to Error.
    const severity = vscode.DiagnosticSeverity.Error;

    // Return a new vscode.Diagnostic object with the range, message, and severity.
    return new vscode.Diagnostic(range, message, severity);
  }

  // If radonOutput does not contain an error or showErrors is false, return null.
  return null;
}

/**
 * Creates an array of diagnostic messages from the output of the radon tool.
 * @param radonOutput - The output from the radon tool, which can be an array of RadonBlock objects or an error object.
 * @returns An array of vscode.Diagnostic objects representing the complex blocks or the error in the radon output.
 */
export function createDiagnostics(radonOutput: RadonBlock[] | null): vscode.Diagnostic[] {
  // Get the showErrors and minComplexity settings from the configuration.
  const showErrors = getConfig().get<boolean>("showErrors") ?? true;
  const minComplexity = getConfig().get<number>("minComplexity") ?? 0;

  // If radonOutput is an array (i.e., it's an array of RadonBlock objects)...
  if (Array.isArray(radonOutput)) {
    // Map each RadonBlock object to a diagnostic message (if its complexity is greater than or equal to minComplexity),
    // filter out any null values (i.e., blocks whose complexity is less than minComplexity),
    // and return the resulting array of diagnostic messages.
    return radonOutput
      .map((block) => createDiagnosticFromBlock(block, minComplexity))
      .filter(Boolean) as vscode.Diagnostic[];
  } else {
    // If radonOutput is not an array (i.e., it's an error object)...
    // Create a diagnostic message from the error (if showErrors is true) and return an array containing the diagnostic message.
    // If showErrors is false or there's no error in radonOutput, return an empty array.
    const errorDiagnostic = createDiagnosticFromError(radonOutput, showErrors);
    return errorDiagnostic ? [errorDiagnostic] : [];
  }
}
