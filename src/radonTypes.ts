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
// Define the structure of a Radon block
export interface RadonBlock {
  complexity: number; // The cyclomatic complexity of the block
  type: string; // The type of the block (e.g., "function", "method", "class")
  name: string; // The name of the block
  lineno: number; // The line number where the block starts
}

// Define the structure of the Radon output
export interface RadonOutput {
  [filePath: string]: RadonBlock[]; // A mapping from file paths to arrays of Radon blocks
}
