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
export class PromiseQueue {
  // An array to hold the tasks that return promises
  private _queue: Array<() => Promise<any>>;
  // A flag to indicate if the queue is currently running
  private _isRunning: boolean;

  constructor() {
    // Initialize the queue as an empty array
    this._queue = [];
    // Set the running flag to false
    this._isRunning = false;
  }

  // Method to add a new task to the queue and run the queue
  enqueue(task: () => Promise<any>): Promise<any> {
    // Add the task to the queue
    this._queue.push(task);
    // Run the queue
    return this.run();
  }

  // Method to run the tasks in the queue
  async run() {
    // If the queue is already running or there are no tasks in the queue, return
    if (this._isRunning || this._queue.length === 0) {
      return;
    }
    // Set the running flag to true
    this._isRunning = true;
    // Get the first task from the queue
    let task = this._queue.shift();
    // While there is a task
    while (task) {
      // Wait for the task to complete
      await task();
      // Get the next task from the queue
      task = this._queue.shift();
    }
    // Set the running flag to false
    this._isRunning = false;
  }
}
