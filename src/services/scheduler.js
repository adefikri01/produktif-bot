const cron = require('node-cron'); 
const bot = require('../config/bot');
const { tampilKategori } = require('../data/jadwal');

cron.schedule('0 3 * * *', async () => {
  console.log('🧪 TEST AUTO RUN (2 MENIT)');
  await tampilKategori({
    reply: (...args) => bot.telegram.sendMessage(process.env.CHAT_ID, ...args),
    telegram: bot.telegram,
    chat: { id: process.env.CHAT_ID }
  });
}, {
  timezone: "Asia/Jakarta"
});