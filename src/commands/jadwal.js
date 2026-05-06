const bot = require('../config/bot');
const { tampilKategori } = require('../data/jadwal');

bot.command('jadwal', async (ctx) => {
  await tampilKategori(ctx);
});