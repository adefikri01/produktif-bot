const bot = require('./config/bot');
require('./services/scheduler');

// Load commands
require('./commands/start');
require('./commands/jadwal');
require('./commands/checklist');
require('./config/db');

bot.launch();
console.log('🚀 Bot berjalan...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));