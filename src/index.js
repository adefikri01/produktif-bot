const express = require('express');
const bot = require('./config/bot');

// Load semua command
require('./commands/start');
require('./commands/checklist');
require('./commands/jadwal');

const app = express();
app.use(express.json());

// Endpoint webhook Telegram
app.use(bot.webhookCallback('/webhook'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});