import fs from 'fs';
import path from 'path';
import sendLog, { logPath } from './logger.js';

// Define the config file path in the root directory
const configPath = path.join(process.cwd(), 'config.json');

// Default contents
const defaultConfig = {
    debug: false,
    bot_token: "",
    default_volume: 50,
    text_prefix: "",
};

function genConfig() {
    // Check if the file exists
    if (fs.existsSync(configPath)) {
        sendLog('debug', `Config file exists: ${configPath}`);

    } else {
        sendLog('warn', 'Config file not found! Creating an empty one...');
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4)); // Create defauklt config
        sendLog('success', `Empty config file created: ${configPath}`);
    }

    fs.writeFileSync(logPath, '', 'utf8'); // Log file, creates or clears when ran.
}


const loadConfig = (): any => {
    try {
        genConfig();
        const rawData = fs.readFileSync(configPath, 'utf-8');
            sendLog('info', `Loaded config into memory.`)
            return JSON.parse(rawData);

    } catch (error) {
        sendLog('critical', `Error reading config: ${error}`)
        return {};
    }
}

export const reloadConfig = () => {
    Object.assign(config, loadConfig());
};


export const config = loadConfig();
export const version = 1.0;