// export const check = async (code: string): Promise<String> => {
//   try {

//     return "";
//   } catch (error) {
//     console.log('error', error);
//     return "";
//   }
// };

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ...existing code...



import { exec, spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';

import { v4 as uuid } from 'uuid';

/**
 * Compiles and runs a C++ code string.
 * @param code The C++ code to execute.
 * @param input Optional standard input to be passed to the code.
 * @returns A promise that resolves to the standard output or an error message.
 */
export const check = async (code: string, input: string = ''): Promise<string> => {
    console.log('sumit')
    const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  const tempDir = path.join(__dirname, 'temp');
  const jobId = uuid();
  const cppFilePath = path.join(tempDir, `${jobId}.cpp`);
  const outputFilePath = path.join(tempDir, `${jobId}.out`);

  try {

    // 1. Ensure the temporary directory exists.
    await mkdir(tempDir, { recursive: true });

    // 2. Write the C++ code to a temporary file.
    await writeFile(cppFilePath, code);

    // 3. Compile the code using g++.
    // We wrap the callback-based `exec` in a Promise for use with async/await.
    await new Promise<void>((resolve, reject) => {
      exec(`g++ "${cppFilePath}" -o "${outputFilePath}"`, (error, stdout, stderr) => {
        if (error || stderr) {
          reject(new Error(stderr || error?.message));
        } else {
          resolve();
        }
      });
    });

    // 4. Run the compiled executable.
    // We use `spawn` as it's better for handling streams (stdin, stdout, stderr).
    return await new Promise<string>((resolve, reject) => {
      const childProcess = spawn(outputFilePath);
      let output = '';
      let errorOutput = '';

      // Set a timeout to kill the process if it runs for too long.
      const timeout = setTimeout(() => {
        childProcess.kill();
        reject(new Error('Execution timed out after 5 seconds.'));
      }, 5000);

      childProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      childProcess.on('close', () => {
        clearTimeout(timeout);
        // Resolve with the error output if it exists, otherwise resolve with standard output.
        resolve(errorOutput || output);
      });

      childProcess.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      // Provide the input to the process.
      childProcess.stdin.write(input);
      childProcess.stdin.end();
    });

  } catch (error: any) {
    console.log('error', error);
    // This catches errors from file writing, compilation, or execution timeout.
    return error.message;
  } finally {
    // 5. Clean up temporary files, regardless of success or failure.
    // We use empty catch blocks to ensure cleanup continues even if a file doesn't exist.
    try { await unlink(cppFilePath); } catch {}
    try { await unlink(outputFilePath); } catch {}
  }
};