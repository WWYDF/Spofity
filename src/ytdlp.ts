// src/ytdlp.ts
import { spawn } from 'child_process';
import { Readable } from 'stream';
import path from 'path';

/**
 * getYtDlpStream
 * -----------------
 * Spawns the yt-dlp process from the project's `deps` folder to extract an audio stream.
 *
 * Ensure that:
 * - On Windows, the executable is at `root/deps/yt-dlp.exe`
 * - On Linux/macOS, the executable is at `root/deps/yt-dlp` and has execute permissions.
 *
 * @param url - The YouTube video URL to stream.
 * @returns A readable stream containing the audio data.
 */
export function getYtDlpStream(url: string): Readable {
  // Determine executable name based on platform.
  const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

  // Build the path relative to the project root.
  // __dirname is 'root/src', so we go one directory up to 'root' then into 'deps'.
  const ytDlpPath = path.join(process.cwd(), 'deps', binaryName);

  const args = [
    '-f', 'bestaudio',  // Use the best available audio format.
    '--no-playlist',    // Only process the single video.
    '-o', '-',          // Output the stream to stdout.
    url,
  ];

  // Spawn the yt-dlp process.
  const ytDlpProcess = spawn(ytDlpPath, args, {
    stdio: ['ignore', 'pipe', 'pipe'] // Ignore stdin, capture stdout and stderr.
  });

  // Log any errors that come from yt-dlp's stderr.
  ytDlpProcess.stderr.on('data', (data) => {
    console.error(`yt-dlp error: ${data.toString()}`);
  });

  ytDlpProcess.on('error', (error) => {
    console.error(`yt-dlp process error: ${error}`);
  });

  return ytDlpProcess.stdout;
}
