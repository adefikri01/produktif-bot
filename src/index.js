const express = require('express');
const bot = require('./config/bot');

require('./commands/start');
require('./commands/checklist');
require('./commands/jadwal');

const app = express();
app.use(express.json());

app.use(bot.webhookCallback('/webhook'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  const webhookUrl = "https://produktif-bot-production-c72e.up.railway.app/webhook";

  await bot.telegram.setWebhook(webhookUrl);
  console.log("✅ Webhook set:", webhookUrl);
});