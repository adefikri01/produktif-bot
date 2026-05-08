const cron = require('node-cron'); 
const bot = require('../config/bot');
const { tampilKategori } = require('../data/jadwal');

function makeScheduledCtx() {
  const chatId = Number(process.env.CHAT_ID);

  return {
    from: { id: chatId },
    chat: { id: chatId },
    telegram: bot.telegram,
    reply: (text, opts) => bot.telegram.sendMessage(process.env.CHAT_ID, text, opts),
    editMessageText: (text, opts) => bot.telegram.sendMessage(process.env.CHAT_ID, text, opts)
  };
}

// Run at 03:00 (uses existing reset logic: day shifts at 03:00)
cron.schedule('0 3 * * *', async () => {
  console.log('🤖 Scheduled: sending daily plan at 03:00');
  try {
    await tampilKategori(makeScheduledCtx());
  } catch (err) {
    console.error('Error running scheduled 03:00 job', err);
  }
}, {
  timezone: 'Asia/Jakarta'
});

// Run at 00:00 (perpindahan hari) — send using calendar date (no early-morning shift)
cron.schedule('0 0 * * *', async () => {
  console.log('🤖 Scheduled: sending daily plan at 00:00');
  try {
    await tampilKategori(makeScheduledCtx(), { useCalendarDate: true });
  } catch (err) {
    console.error('Error running scheduled 00:00 job', err);
  }
}, {
  timezone: 'Asia/Jakarta'
});