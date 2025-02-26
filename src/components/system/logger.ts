import chalk from "chalk";
import path from "path";
import fs from "fs";

export const logPath = path.join(process.cwd(), 'logs/latest.log');

const LOG_DIR = path.join(process.cwd(), 'logs');
const LATEST_LOG = path.join(LOG_DIR, 'latest.log');
const MAX_LOG_FILES = 30;

const logLevels = {
    info: chalk.cyan,
    success: chalk.greenBright,
    warn: chalk.yellow,
    error: chalk.red.bold,
    debug: chalk.gray,
    critical: chalk.bgRed,
    registry: chalk.hex('#CD31DE'),
}

export default async function sendLog(level: keyof typeof logLevels, message: string) {
    const { config } = await import("./config.js"); // Import dynamically inside function

    writeLog(`[${level.toUpperCase()}] ${message}`)

    if (level === 'debug' && !config.debug) return;

    if (logLevels[level]) {
        console.log(logLevels[level](`[${level.toUpperCase()}] ${message}`));
    } else {
        throw new Error(`Log level '${level}' not found!`);
    }
}

export async function refreshLogs() {
    try {
        sendLog('info', `Refreshing logs...`);
        rotateLogFile();
        cleanOldLogs();
        sendLog('info', `Logs rotated successfully.`);
    } catch (e) {
        sendLog('critical', `Logs failed to rotate! ${e}`);
    }
}

function writeLog(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(LATEST_LOG, logMessage, 'utf8');
}

function rotateLogFile() {
    // Ensure the log directory exists
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    if (fs.existsSync(LATEST_LOG)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format timestamp safely
        const archivedLog = path.join(LOG_DIR, `logs-${timestamp}.log`);
        fs.renameSync(LATEST_LOG, archivedLog);
    }
}

function cleanOldLogs() {
    const logFiles = fs.readdirSync(LOG_DIR)
        .filter(file => file.endsWith('.log') && file !== 'latest.log') // Get only log files, ignore latest.log
        .map(file => ({ file, time: fs.statSync(path.join(LOG_DIR, file)).mtimeMs })) // Get modified time
        .sort((a, b) => a.time - b.time); // Sort oldest first

    while (logFiles.length >= MAX_LOG_FILES) {
        const oldest = logFiles.shift(); // Remove oldest log
        if (oldest) {
            fs.unlinkSync(path.join(LOG_DIR, oldest.file));
            console.log(`Deleted old log file: ${oldest.file}`);
        }
    }
}