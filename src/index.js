const express = require('express');
const bot = require('./config/bot');

console.log('🔄 Loading commands...');

try {
  require('./commands/start');
  console.log('✅ start.js loaded');
  require('./commands/checklist');
  console.log('✅ checklist.js loaded');
  require('./commands/jadwal');
  console.log('✅ jadwal.js loaded');
  require('./commands/category');
  console.log('✅ category.js loaded');
} catch (err) {
  console.error('❌ Error loading commands:', err);
}

const app = express();
app.use(express.json());

app.use(bot.webhookCallback('/webhook'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  const webhookUrl = "https://produktif-bot-production-c72e.up.railway.app/webhook";

  await bot.telegram.setWebhook(webhookUrl);
  console.log("✅ Webhook set:", webhookUrl);
});