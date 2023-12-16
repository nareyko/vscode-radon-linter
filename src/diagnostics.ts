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

// Function to create diagnostics from Radon output
export function createDiagnostics(radonOutput: RadonBlock[]): vscode.Diagnostic[] {
  // Initialize an empty array of diagnostics
  let diagnostics: vscode.Diagnostic[] = [];

  // Get the minimum complexity from the configuration, or use 0 as a default
  const minComplexity = getConfig().get<number>("minComplexity") || 0;

  // For each block in the Radon output
  radonOutput.forEach((block: RadonBlock) => {
    // If the complexity of the block is greater than or equal to the minimum complexity
    if (block.complexity >= minComplexity) {
      // Create a range for the diagnostic, which is the line where the block starts
      const range = new vscode.Range(block.lineno - 1, 0, block.lineno - 1, Number.MAX_VALUE);

      // Create a message for the diagnostic, which includes the type, name, and complexity of the block
      const message = `Radon: ${block.type} '${block.name}' has a complexity of ${block.complexity}`;

      // Determine the severity of the diagnostic based on the complexity of the block
      const severity = block.complexity > 5 ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information;

      // Add the diagnostic to the array of diagnostics
      diagnostics.push(new vscode.Diagnostic(range, message, severity));
    }
  });

  // Return the array of diagnostics
  return diagnostics;
}
