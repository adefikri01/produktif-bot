const bot = require('../config/bot');

bot.start(async (ctx) => {
  const nama = ctx.from.first_name || 'Kamu';

  const pesan =
`👋 <b>Halo, ${nama}!</b>
<i>Selamat datang di Asisten Produktif</i>

Aku siap bantu kamu jadi lebih produktif setiap hari:

📌 Tracking kegiatan harian
📈 Monitoring progress ibadah & olahraga
🗂 Mengelola kategori kegiatan
🔄 Reset otomatis setiap jam 03:00

<b>Mau mulai dari mana? 👇</b>`;

  await ctx.reply(pesan, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        // Baris 1 — 2 tombol utama sejajar
        [
          { text: '📅  Lihat Jadwal',     callback_data: 'menu_jadwal' },
          { text: '➕  Tambah Kegiatan',  callback_data: 'menu_add'    }
        ],
        // Baris 2 — 2 tombol sejajar
        [
          { text: '📊  Laporan',          callback_data: 'menu_report'   },
          { text: '⚙️  Pengaturan',       callback_data: 'menu_settings' }
        ]
      ]
    }
  });
});