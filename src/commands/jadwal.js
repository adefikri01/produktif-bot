const bot = require('../config/bot');
const { tampilKategori } = require('../data/jadwal');

bot.command('jadwal', async (ctx) => {
  await tampilKategori(ctx);
});

bot.command('kategori', async (ctx) => {
  await ctx.reply(
    `📂 <b>Kelola Kategori</b>

Pilih aksi yang ingin dilakukan:`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Tambah', callback_data: 'menu_add_category' },
            { text: '👁️ Lihat', callback_data: 'view_categories' }
          ],
          [
            { text: '‹ Kembali', callback_data: 'back_start' }
          ]
        ]
      }
    }
  );
});