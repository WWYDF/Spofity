// src/ytdlp.ts
import { spawn } from 'child_process';
import { Readable } from 'stream';
import path from 'path';
import { existsSync } from 'fs';
import sendLog from './system/logger.js';

/**
 * getYtDlpStream
 * -----------------
 * Spawns the yt-dlp process either from the project's `deps` folder (if available)
 * or from the system PATH if not found in deps.
 *
 * On Windows, if available, it uses `deps/yt-dlp.exe`.
 * On Linux/macOS, if available, it uses `deps/yt-dlp` (make sure it has execute permissions).
 *
 * If the executable is not found in the deps folder, it falls back to the one in PATH.
 *
 * @param url - The YouTube video URL to stream.
 * @returns A readable stream containing the audio data.
 */
export function getYtDlpStream(url: string): Readable {
  // Determine the executable name based on platform.
  const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

  // Build the local path to the executable in the project's deps folder.
  const localPath = path.join(process.cwd(), 'deps', binaryName);

  // If the local executable exists, use it; otherwise, fall back to the one in the system PATH.
  const ytDlpExecutable = existsSync(localPath) ? localPath : binaryName;
  sendLog('debug', `Using yt-dlp executable: ${ytDlpExecutable}`);

  // Initialize arguments array.
  const args: string[] = [];

  // Check for a cookies file in the deps folder.
  const cookieFilePath = path.join(process.cwd(), 'deps', 'cookies.txt');
  if (existsSync(cookieFilePath)) {
    sendLog('debug', `Using cookie file: ${cookieFilePath}`);
    args.push('--cookies', cookieFilePath);
  }

  // Add the rest of the arguments.
  args.push(
    '-f', 'bestaudio',  // Use the best available audio format.
    '--no-playlist',    // Only process the single video.
    '-o', '-',          // Output the stream to stdout.
    url
  );

  // Spawn the yt-dlp process.
  const ytDlpProcess = spawn(ytDlpExecutable, args, {
    stdio: ['ignore', 'pipe', 'pipe'] // Ignore stdin, capture stdout and stderr.
  });

  // Log any errors that come from yt-dlp's stderr.
  ytDlpProcess.stderr.on('data', (data) => {
    sendLog('debug', `yt-dlp error: ${data.toString()}`);
  });

  ytDlpProcess.on('error', (error) => {
    sendLog('debug', `yt-dlp process error: ${error}`);
  });

  return ytDlpProcess.stdout;
}
