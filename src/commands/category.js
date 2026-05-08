const bot = require('../config/bot');
const pool = require('../config/database');
const { setUserState, getUserState, clearUserState } = require('../state/userState');

// ==========================================
// VIEW CATEGORIES
// ==========================================

async function tampilDaftarKategori(ctx) {
  const userId = ctx.from.id;

  const result = await pool.query(
    `SELECT id, name FROM categories
     WHERE user_id = $1
     ORDER BY name ASC`,
    [userId]
  );

  const categories = result.rows;

  if (categories.length === 0) {
    return await ctx.editMessageText(
      `📂 <b>Daftar Kategori</b>

Belum ada kategori. Buat kategori baru dari menu ➕ Tambah.`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '‹ Kembali', callback_data: 'menu_manage_category' }]
          ]
        }
      }
    );
  }

  let text = `📂 <b>Daftar Kategori</b>\n\n`;

  for (const cat of categories) {
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM activities
       WHERE category_id = $1 AND user_id = $2`,
      [cat.id, userId]
    );

    const count = parseInt(countRes.rows[0].count) || 0;
    text += `• <b>${cat.name}</b> (${count} kegiatan)\n`;
  }

  const keyboard = categories.map(cat => ([
    { text: `📂 ${cat.name}`, callback_data: `view_cat_${cat.id}` }
  ]));

  keyboard.push([
    { text: '‹ Kembali', callback_data: 'menu_manage_category' }
  ]);

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
}

// ==========================================
// VIEW CATEGORY DETAILS
// ==========================================

bot.action(/^view_cat_(\d+)$/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const categoryId = parseInt(ctx.match[1]);
  const userId = ctx.from.id;

  const catRes = await pool.query(
    `SELECT name FROM categories WHERE id = $1 AND user_id = $2`,
    [categoryId, userId]
  );

  if (catRes.rowCount === 0) return;

  const categoryName = catRes.rows[0].name;

  const actRes = await pool.query(
    `SELECT id, name FROM activities
     WHERE category_id = $1 AND user_id = $2
     ORDER BY name ASC`,
    [categoryId, userId]
  );

  const activities = actRes.rows;

  let text = `📂 <b>${categoryName}</b>\n\n`;

  if (activities.length === 0) {
    text += `Tidak ada kegiatan di kategori ini.`;
  } else {
    text += `<b>Kegiatan:</b>\n`;
    for (const act of activities) {
      text += `• ${act.name}\n`;
    }
  }

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✏️ Edit', callback_data: `edit_cat_${categoryId}` },
          { text: '🗑️ Hapus', callback_data: `delete_cat_${categoryId}` }
        ],
        [
          { text: '‹ Kembali', callback_data: 'view_categories' }
        ]
      ]
    }
  });
});

// ==========================================
// ADD CATEGORY
// ==========================================

bot.action('menu_add_category', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  setUserState(ctx.from.id, {
    action: 'add_category',
    temp: {}
  });

  await ctx.editMessageText(
    `➕ <b>Tambah Kategori</b>

📝 Silakan masukkan <b>nama kategori</b> baru:`,
    { parse_mode: 'HTML' }
  );
});

// ==========================================
// EDIT CATEGORY
// ==========================================

bot.action(/^edit_cat_(\d+)$/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const categoryId = parseInt(ctx.match[1]);

  const result = await pool.query(
    `SELECT name FROM categories WHERE id = $1 AND user_id = $2`,
    [categoryId, ctx.from.id]
  );

  if (result.rowCount === 0) return;

  setUserState(ctx.from.id, {
    action: 'edit_category',
    categoryId,
    oldName: result.rows[0].name
  });

  await ctx.editMessageText(
    `✏️ <b>Edit Kategori</b>

Masukkan nama baru untuk kategori ini:`,
    { parse_mode: 'HTML' }
  );
});

// ==========================================
// DELETE CATEGORY CONFIRMATION
// ==========================================

bot.action(/^delete_cat_(\d+)$/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const categoryId = parseInt(ctx.match[1]);

  const result = await pool.query(
    `SELECT name FROM categories WHERE id = $1 AND user_id = $2`,
    [categoryId, ctx.from.id]
  );

  if (result.rowCount === 0) return;

  const categoryName = result.rows[0].name;

  // Cek ada kegiatan di kategori ini atau tidak
  const actRes = await pool.query(
    `SELECT COUNT(*) FROM activities WHERE category_id = $1`,
    [categoryId]
  );

  const activityCount = parseInt(actRes.rows[0].count) || 0;

  let warningText = `⚠️ <b>Yakin ingin menghapus kategori "${categoryName}"?</b>\n\n`;

  if (activityCount > 0) {
    warningText += `<i>Kategori ini memiliki ${activityCount} kegiatan. Semua kegiatan akan dihapus juga.</i>\n\n`;
  }

  warningText += `Tindakan ini tidak bisa dibatalkan.`;

  await ctx.editMessageText(warningText, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Ya, Hapus', callback_data: `confirm_delete_cat_${categoryId}` },
          { text: '❌ Batal', callback_data: `view_cat_${categoryId}` }
        ]
      ]
    }
  });
});

// ==========================================
// CONFIRM DELETE CATEGORY
// ==========================================

bot.action(/^confirm_delete_cat_(\d+)$/, async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  const categoryId = parseInt(ctx.match[1]);
  const userId = ctx.from.id;

  try {
    // Hapus schedule dari kegiatan di kategori ini
    await pool.query(
      `DELETE FROM schedules
       WHERE activity_id IN (
         SELECT id FROM activities WHERE category_id = $1 AND user_id = $2
       )`,
      [categoryId, userId]
    );

    // Hapus daily_logs dari kegiatan di kategori ini
    await pool.query(
      `DELETE FROM daily_logs
       WHERE activity_id IN (
         SELECT id FROM activities WHERE category_id = $1 AND user_id = $2
       )`,
      [categoryId, userId]
    );

    // Hapus kegiatan
    await pool.query(
      `DELETE FROM activities WHERE category_id = $1 AND user_id = $2`,
      [categoryId, userId]
    );

    // Hapus kategori
    const catRes = await pool.query(
      `DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING name`,
      [categoryId, userId]
    );

    const categoryName = catRes.rows[0]?.name || 'Kategori';

    await ctx.editMessageText(
      `✅ Kategori "${categoryName}" berhasil dihapus.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '‹ Kembali', callback_data: 'view_categories' }]
          ]
        }
      }
    );
  } catch (err) {
    console.error('❌ Gagal menghapus kategori:', err);
    await ctx.editMessageText(
      `❌ Gagal menghapus kategori. Coba lagi ya.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '‹ Kembali', callback_data: 'view_categories' }]
          ]
        }
      }
    );
  }
});

// ==========================================
// TEXT HANDLERS FOR CATEGORY
// ==========================================

bot.on('text', async (ctx) => {
  try {
    // Skip commands (messages starting with /)
    if (ctx.message.text.startsWith('/')) {
      return;
    }

    const state = getUserState(ctx.from.id);

    if (!state) return;

    // ==========================================
    // ADD CATEGORY
    // ==========================================
    if (state.action === 'add_category') {
      const categoryName = ctx.message.text.trim();

      if (!categoryName) {
        await ctx.reply('❌ Nama kategori tidak boleh kosong.');
        return;
      }

      // Cek kategori sudah ada atau tidak
      const existing = await pool.query(
        `SELECT id FROM categories WHERE name = $1 AND user_id = $2`,
        [categoryName, ctx.from.id]
      );

      if (existing.rowCount > 0) {
        await ctx.reply(`❌ Kategori "${categoryName}" sudah ada.`);
        return;
      }

      try {
        const result = await pool.query(
          `INSERT INTO categories (name, user_id)
           VALUES ($1, $2)
           RETURNING id`,
          [categoryName, ctx.from.id]
        );

        clearUserState(ctx.from.id);

        await ctx.reply(
          `✅ Kategori "${categoryName}" berhasil ditambahkan!`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '‹ Kembali', callback_data: 'view_categories' }]
              ]
            }
          }
        );
      } catch (err) {
        console.error('❌ Gagal menambah kategori:', err);
        await ctx.reply('❌ Gagal menambah kategori. Coba lagi ya.');
      }

      return;
    }

    // ==========================================
    // EDIT CATEGORY
    // ==========================================
    if (state.action === 'edit_category') {
      const newName = ctx.message.text.trim();

      if (!newName) {
        await ctx.reply('❌ Nama kategori tidak boleh kosong.');
        return;
      }

      // Cek nama kategori baru sudah dipakai atau tidak (tapi tidak sama dengan nama lama)
      if (newName !== state.oldName) {
        const existing = await pool.query(
          `SELECT id FROM categories WHERE name = $1 AND user_id = $2`,
          [newName, ctx.from.id]
        );

        if (existing.rowCount > 0) {
          await ctx.reply(`❌ Kategori "${newName}" sudah ada.`);
          return;
        }
      }

      try {
        await pool.query(
          `UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3`,
          [newName, state.categoryId, ctx.from.id]
        );

        clearUserState(ctx.from.id);

        await ctx.reply(
          `✅ Kategori berhasil diubah menjadi "${newName}"`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '‹ Kembali', callback_data: 'view_categories' }]
              ]
            }
          }
        );
      } catch (err) {
        console.error('❌ Gagal edit kategori:', err);
        await ctx.reply('❌ Gagal mengubah kategori. Coba lagi ya.');
      }

      return;
    }
  } catch (err) {
    console.error('❌ ERROR IN CATEGORY TEXT HANDLER:', err);
  }
});

// ==========================================
// MENU CATEGORY MANAGEMENT
// ==========================================

bot.action('menu_manage_category', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });

  await ctx.editMessageText(
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
            { text: '‹ Kembali', callback_data: 'menu_manage' }
          ]
        ]
      }
    }
  );
});

bot.action('view_categories', async (ctx) => {
  ctx.answerCbQuery().catch(() => { });
  await tampilDaftarKategori(ctx);
});

module.exports = { tampilDaftarKategori };
