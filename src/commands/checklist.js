const bot = require('../config/bot');
const pool = require('../config/database');
const { tampilIsiKategori, tampilKategori } = require('../data/jadwal');
const { setUserState, getUserState, clearUserState } = require('../state/userState');


function getEffectiveDate() {
  const now = new Date();
  const resetHour = 3;

  if (now.getHours() < resetHour) {
    now.setDate(now.getDate() - 1);
  }

  return now.toISOString().split('T')[0];
}

bot.action('confirm_reset', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  await ctx.editMessageText(
    `⚠️ <b>Reset Hari Ini?</b>

Semua progress hari ini akan dihapus.

Yakin ingin melanjutkan?`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Ya, Reset', callback_data: 'reset_today' },
            { text: '❌ Batal', callback_data: 'back_main' }
          ]
        ]
      }
    });
});

async function tampilListKegiatan(ctx, page = 1) {
  const userId = ctx.from.id;
  const limit = 5; // maksimal 5 kategori per halaman
  const offset = (page - 1) * limit;

  // Hitung total kategori
  const totalRes = await pool.query(
    `SELECT COUNT(*) FROM categories
     WHERE user_id = $1`,
    [userId]
  );

  const totalCategories = parseInt(totalRes.rows[0].count) || 0;
  const totalPages = Math.ceil(totalCategories / limit) || 1;

  // Ambil kategori untuk halaman ini
  const categoryRes = await pool.query(
    `SELECT id, name FROM categories
     WHERE user_id = $1
     ORDER BY name ASC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const categories = categoryRes.rows;

  let text = `📋 <b>Daftar Kegiatan</b>\n\n`;

  for (const cat of categories) {
    const activityRes = await pool.query(
      `SELECT name
       FROM activities
       WHERE user_id = $1 AND category_id = $2
       ORDER BY name ASC`,
      [userId, cat.id]
    );

    text += `📂 <b>${cat.name}</b> (${activityRes.rowCount})\n`;
    text += `────────────────\n`;

    for (const act of activityRes.rows) {
      text += `• ${act.name}\n`;
    }

    text += `\n`;
  }

  if (categories.length === 0) {
    text += `Belum ada kegiatan.\n\nTambahkan kegiatan baru dari menu ➕ Tambah.`;
  }

  const keyboard = [];

  const navRow = [];

  if (page > 1) {
    navRow.push({
      text: '‹ Prev',
      callback_data: `list_page_${page - 1}`
    });
  }

  navRow.push({
    text: `${page} / ${totalPages}`,
    callback_data: 'noop'
  });

  if (page < totalPages) {
    navRow.push({
      text: 'Next ›',
      callback_data: `list_page_${page + 1}`
    });
  }

  keyboard.push(navRow);

  keyboard.push([
    { text: '‹ Kembali', callback_data: 'menu_manage' }
  ]);

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
}

// ==========================================
// EDIT KEGIATAN
// ==========================================

bot.action('menu_edit', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const userId = ctx.from.id;

  const result = await pool.query(
    `SELECT id, name FROM activities
     WHERE user_id = $1
     ORDER BY name ASC`,
    [userId]
  );

  if (result.rowCount === 0) {
    return ctx.editMessageText(
      `Belum ada kegiatan untuk diedit.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '‹ Kembali', callback_data: 'menu_manage' }]
          ]
        }
      }
    );
  }

  const keyboard = result.rows.map(act => ([
    { text: `✏️ ${act.name}`, callback_data: `edit_${act.id}` }
  ]));

  keyboard.push([{ text: '‹ Kembali', callback_data: 'menu_manage' }]);

  await ctx.editMessageText(
    `✏️ <b>Pilih kegiatan yang ingin diedit:</b>`,
    {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    }
  );
});

bot.action(/edit_(\d+)/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const activityId = parseInt(ctx.match[1]);

  setUserState(ctx.from.id, {
    action: 'edit_activity',
    activityId
  });

  await ctx.editMessageText(
    `📝 Masukkan <b>nama baru</b> untuk kegiatan ini:`,
    { parse_mode: 'HTML' }
  );
});

// EDIT ACTIVITY

bot.action('reset_today', async (ctx) => {
  await ctx.answerCbQuery('Reset berhasil ✅');

  const tanggal = getEffectiveDate();

  await pool.query(
    `DELETE FROM daily_logs WHERE date = $1`,
    [tanggal]
  );

  await tampilKategori(ctx);
});

bot.action('menu_jadwal', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });
  const { tampilKategori } = require('../data/jadwal');
  await tampilKategori(ctx);
});

// ==========================================
// DELETE KEGIATAN
// ==========================================

bot.action('menu_delete', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const userId = ctx.from.id;

  const result = await pool.query(
    `SELECT id, name FROM activities
     WHERE user_id = $1
     ORDER BY name ASC`,
    [userId]
  );

  if (result.rowCount === 0) {
    return ctx.editMessageText(
      `Belum ada kegiatan untuk dihapus.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '‹ Kembali', callback_data: 'menu_manage' }]
          ]
        }
      }
    );
  }

  const keyboard = result.rows.map(act => ([
    { text: `🗑 ${act.name}`, callback_data: `delete_${act.id}` }
  ]));

  keyboard.push([{ text: '‹ Kembali', callback_data: 'menu_manage' }]);

  await ctx.editMessageText(
    `🗑 <b>Pilih kegiatan yang ingin dihapus:</b>`,
    {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    }
  );
});

bot.action(/^delete_(\d+)$/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const activityId = parseInt(ctx.match[1]);

  const result = await pool.query(
    `SELECT name FROM activities
     WHERE id = $1 AND user_id = $2`,
    [activityId, ctx.from.id]
  );

  if (!result.rowCount) return;

  const name = result.rows[0].name;

  try {
    await ctx.editMessageText(
      `⚠️ <b>Yakin ingin menghapus "${name}"?</b>

Tindakan ini tidak bisa dibatalkan.`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Ya, Hapus', callback_data: `confirm_delete_${activityId}` },
              { text: '❌ Batal', callback_data: 'menu_delete' }
            ]
          ]
        }
      }
    );
  } catch (err) {
    console.log('Pesan sudah sama, skip edit.');
  }

});

bot.action(/^confirm_delete_(\d+)$/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const activityId = parseInt(ctx.match[1]);

  // Hapus dari schedules dulu
  await pool.query(
    `DELETE FROM schedules
     WHERE activity_id = $1 AND user_id = $2`,
    [activityId, ctx.from.id]
  );

  // Hapus dari activities
  await pool.query(
    `DELETE FROM activities
     WHERE id = $1 AND user_id = $2`,
    [activityId, ctx.from.id]
  );

  await ctx.editMessageText(
    `✅ Kegiatan berhasil dihapus.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '‹ Kembali', callback_data: 'menu_manage' }]
        ]
      }
    }
  );
});

//add 

bot.action('menu_add', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  setUserState(ctx.from.id, {
    action: 'add_activity',
    step: 'waiting_name',
    temp: {}
  });

  await ctx.editMessageText(
    `➕ <b>Tambah Kegiatan</b>

📝 Silakan masukkan <b>nama kegiatan</b> yang ingin ditambahkan:`,
    { parse_mode: 'HTML' }
  );
});

bot.on('text', async (ctx) => {
  console.log("TEXT RECEIVED:", ctx.message.text);

  const state = getUserState(ctx.from.id);
  console.log("CURRENT STATE:", state);

  if (!state) return;

  // ✅ TAMBAH KEGIATAN
  if (state.action === 'add_activity' && state.step === 'waiting_name') {
    // kode tambah nama
  }

  // ✅ EDIT KEGIATAN
  if (state.action === 'edit_activity') {

    const newName = ctx.message.text;

    await pool.query(
      `UPDATE activities
       SET name = $1
       WHERE id = $2 AND user_id = $3`,
      [newName, state.activityId, ctx.from.id]
    );

    clearUserState(ctx.from.id);

    await ctx.reply(`✅ Nama kegiatan berhasil diubah menjadi "${newName}"`);
  }

});

bot.action(/add_cat_(.+)/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const state = getUserState(ctx.from.id);
  if (!state || state.action !== 'add_activity') return;

  const category = ctx.match[1];

  // Kalau pilih buat kategori baru
  if (category === 'new') {
    state.step = 'waiting_new_category';

    await ctx.editMessageText(
      `📂 <b>Buat Kategori Baru</b>

Silakan masukkan nama kategori baru:`,
      { parse_mode: 'HTML' }
    );

    return;
  }

  // Simpan kategori
  state.temp.category = category;
  state.step = 'waiting_days';

  await ctx.editMessageText(
    `📅 <b>Pilih hari untuk kegiatan ini</b>

Kegiatan "<b>${state.temp.name}</b>" akan aktif di hari mana?`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Senin', callback_data: 'add_day_Monday' },
            { text: 'Selasa', callback_data: 'add_day_Tuesday' }
          ],
          [
            { text: 'Rabu', callback_data: 'add_day_Wednesday' },
            { text: 'Kamis', callback_data: 'add_day_Thursday' }
          ],
          [
            { text: 'Jumat', callback_data: 'add_day_Friday' },
            { text: 'Sabtu', callback_data: 'add_day_Saturday' }
          ],
          [
            { text: 'Minggu', callback_data: 'add_day_Sunday' }
          ],
          [
            { text: '✅ Selesai', callback_data: 'add_finish' }
          ]
        ]
      }
    }
  );
});

bot.action(/add_day_(.+)/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const state = getUserState(ctx.from.id);
  if (!state || state.action !== 'add_activity') return;

  const day = ctx.match[1];

  if (!state.temp.days) state.temp.days = [];

  if (!state.temp.days.includes(day)) {
    state.temp.days.push(day);
  }

  await ctx.answerCbQuery(`✅ ${day} ditambahkan`);
});

bot.action('add_finish', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const state = getUserState(ctx.from.id);
  if (!state || state.action !== 'add_activity') return;

  const { name, category, days } = state.temp;

  if (!days || days.length === 0) {
    await ctx.answerCbQuery('Pilih minimal 1 hari dulu ❗');
    return;
  }

  // ✅ 1. Pastikan kategori ada
  let categoryResult = await pool.query(
    `SELECT id FROM categories
     WHERE name = $1 AND user_id = $2`,
    [category, ctx.from.id]
  );

  let categoryId;

  if (categoryResult.rowCount === 0) {
    const newCategory = await pool.query(
      `INSERT INTO categories (name, user_id)
       VALUES ($1, $2)
       RETURNING id`,
      [category, ctx.from.id]
    );

    categoryId = newCategory.rows[0].id;
  } else {
    categoryId = categoryResult.rows[0].id;
  }

  // ✅ 2. Insert activity pakai category_id
  const activityResult = await pool.query(
    `INSERT INTO activities (name, category_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [name, categoryId, ctx.from.id]
  );

  const activityId = activityResult.rows[0].id;

  // ✅ 3. Insert schedule untuk tiap hari
  for (const day of days) {
    await pool.query(
      `INSERT INTO schedules (activity_id, day_of_week, user_id)
       VALUES ($1, $2, $3)`,
      [activityId, day, ctx.from.id]
    );
  }

  clearUserState(ctx.from.id);

  await ctx.editMessageText(
    `✅ <b>${name}</b> berhasil ditambahkan ke kategori <b>${category}</b>!`,
    { parse_mode: 'HTML' }
  );
});

//setiings

bot.action('menu_settings', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  await ctx.editMessageText(
    `⚙️ <b>Pengaturan</b>

Di sini kamu bisa mengatur sistem produktifitas kamu.`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🗂 Kelola Kegiatan', callback_data: 'menu_manage' }
          ],
          [
            { text: '‹ Kembali', callback_data: 'back_start' }
          ]
        ]
      }
    }
  );
});

bot.action(/category_(.+)/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });
  const category = ctx.match[1];
  await tampilIsiKategori(ctx, category);
});

bot.action('back_main', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });
  await tampilKategori(ctx);
});

bot.action('menu_manage', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  await ctx.editMessageText(
    `🗂 <b>Kelola Kegiatan</b>

Pilih aksi yang ingin dilakukan:`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Tambah', callback_data: 'menu_add' },
            { text: '📋 Lihat Semua', callback_data: 'menu_list' }
          ],
          [
            { text: '✏️ Edit', callback_data: 'menu_edit' },
            { text: '🗑️ Hapus', callback_data: 'menu_delete' }
          ],
          [
            { text: '‹ Kembali', callback_data: 'menu_settings' }
          ]
        ]
      }
    }
  );
});

bot.action('back_start', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  await ctx.editMessageText(
    `👋 <b>Asisten Produktif</b>

Silakan pilih menu di bawah 👇`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 Lihat Jadwal', callback_data: 'menu_jadwal' }],
          [{ text: '⚙️ Pengaturan', callback_data: 'menu_settings' }]
        ]
      }
    }
  );
});

bot.action(/list_page_(\d+)/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });
  const page = parseInt(ctx.match[1]);
  await tampilListKegiatan(ctx, page);
});

bot.action('noop', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });
});

bot.action('menu_list', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });
  await tampilListKegiatan(ctx, 1);
});

bot.action(/check_(\d+)/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const activityId = parseInt(ctx.match[1]);
  const tanggal = getEffectiveDate();

  await pool.query(
    `INSERT INTO daily_logs (activity_id, date, is_done, user_id)
   VALUES ($1, $2, true, $3)
   ON CONFLICT (activity_id, date)
   DO UPDATE SET is_done = true`,
    [activityId, tanggal, ctx.from.id]
  );

  // Ambil kategori dari activity
  const result = await pool.query(
    `SELECT category FROM activities WHERE id = $1`,
    [activityId]
  );

  const category = result.rows[0].category;

  await tampilIsiKategori(ctx, category);
});