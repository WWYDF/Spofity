import { startBot } from "./components/discord/bot.js";
import { config, reloadConfig } from "./components/system/config.js";
import sendLog, { refreshLogs } from "./components/system/logger.js";

async function main() {
    sendLog('info', 'Starting application...');
    await refreshLogs();
    if (config.bot_token == "" || config.bot_token == undefined) { sendLog('critical', 'Bot token is undefined. Please put it in config.json!'); return;}

    await startBot();

    sendLog('success', 'Application started successfully!');
}

main();