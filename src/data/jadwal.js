const bot = require('../config/bot');
const pool = require('../config/database');
const generateProgressBar = require('../utils/progressBar');
const { setState } = require('../state/userState');

let lastMessageId = null;

// ── Emoji map berdasarkan nama kategori (case-insensitive)
const CATEGORY_EMOJI = {
  belajar: '📚',
  ibadah: '🕌',
  olahraga: '🏃',
  kerja: '💼',
  kesehatan: '❤️',
  hobi: '🎨',
  sosial: '👥',
  keuangan: '💰',
};

function getCategoryEmoji(name) {
  if (!name) return '📌';   // ✅ handle null

  return CATEGORY_EMOJI[name.toLowerCase()] ?? '📌';
}

const DONE_EMOJI = '✅';
const UNDONE_EMOJI = '◻️';

function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '/');
}

function getEffectiveDate() {
  const now = new Date();
  const resetHour = 3; // reset jam 3 pagi

  if (now.getHours() < resetHour) {
    now.setDate(now.getDate() - 1);
  }

  return now.toISOString().split('T')[0];
}


async function tampilKategori(ctx) {
  const userId = ctx.from.id;
  const tanggal = getEffectiveDate();
  const displayDate = formatDisplayDate(tanggal);

  // ✅ Ambil semua activity user
  const allActivitiesRes = await pool.query(
    `SELECT id FROM activities WHERE user_id = $1`,
    [userId]
  );

  const allActivityIds = allActivitiesRes.rows.map(a => a.id);
  const totalAll = allActivityIds.length;

  let doneAll = 0;

  if (totalAll > 0) {
    const doneAllRes = await pool.query(
      `SELECT COUNT(*) 
       FROM daily_logs
       WHERE date = $1
       AND is_done = true
       AND user_id = $2`,
      [tanggal, userId]
    );

    doneAll = parseInt(doneAllRes.rows[0].count);
  }

  const overallProgress =
    totalAll === 0 ? 0 : Math.round((doneAll / totalAll) * 100);

  const overallBar = generateProgressBar(overallProgress);

  // ✅ Ambil kategori dari table categories
  const categoryRes = await pool.query(
    `SELECT id, name FROM categories
     WHERE user_id = $1
     ORDER BY name ASC`,
    [userId]
  );

  const categories = categoryRes.rows;
  const keyboard = [];

  for (let i = 0; i < categories.length; i += 2) {
    const row = [];

    for (let j = 0; j < 2; j++) {
      const cat = categories[i + j];
      if (!cat) continue;

      const activityRes = await pool.query(
        `SELECT id FROM activities
         WHERE category_id = $1 AND user_id = $2`,
        [cat.id, userId]
      );

      const activityIds = activityRes.rows.map(a => a.id);
      const total = activityIds.length;

      let done = 0;

      if (total > 0) {
        const doneRes = await pool.query(
          `SELECT COUNT(*)
           FROM daily_logs
           WHERE date = $1
           AND is_done = true
           AND user_id = $2
           AND activity_id = ANY($3::int[])`,
          [tanggal, userId, activityIds]
        );

        done = parseInt(doneRes.rows[0].count);
      }

      const progressText =
        total === 0 ? '(0/0)' : `(${done}/${total})`;

      row.push({
        text: `${getCategoryEmoji(cat.name)} ${cat.name} ${progressText}`,
        callback_data: `category_${cat.id}`
      });
    }

    keyboard.push(row);
  }

  keyboard.push([
    { text: '🔄 Reset Hari Ini', callback_data: 'confirm_reset' }
  ]);

  const pesan =
    `🗓 <b>TODAY PLAN</b>
<i>Rencanamu untuk hari ini</i>

<b>${displayDate}</b>

<b>Progress Keseluruhan</b>
${overallBar} <b>${overallProgress}%</b>  <i>(${doneAll}/${totalAll})</i>

Pilih kategori kegiatan yang ingin kamu lacak 👇`;

  await ctx.editMessageText(pesan, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
}



async function tampilIsiKategori(ctx, categoryId) {
  const userId = ctx.from.id;
  const tanggal = getEffectiveDate();

  const categoryRes = await pool.query(
    `SELECT name FROM categories
     WHERE id = $1 AND user_id = $2`,
    [categoryId, userId]
  );

  if (categoryRes.rowCount === 0) return;

  const categoryName = categoryRes.rows[0].name;

  const result = await pool.query(
    `SELECT id, name FROM activities
     WHERE category_id = $1 AND user_id = $2
     ORDER BY id ASC`,
    [categoryId, userId]
  );

  const kegiatan = result.rows;

  const logs = await pool.query(
    `SELECT activity_id FROM daily_logs
     WHERE date = $1 AND is_done = true AND user_id = $2`,
    [tanggal, userId]
  );

  const doneIds = logs.rows.map(r => r.activity_id);

  const total = kegiatan.length;
  const done = kegiatan.filter(k => doneIds.includes(k.id)).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const progressBar = generateProgressBar(progress);

  const keyboard = [];

  for (let i = 0; i < kegiatan.length; i += 2) {
    const row = [];

    const item1 = kegiatan[i];
    row.push({
      text: doneIds.includes(item1.id)
        ? `✅ ${item1.name}`
        : `◻️ ${item1.name}`,
      callback_data: `check_${item1.id}`
    });

    const item2 = kegiatan[i + 1];
    if (item2) {
      row.push({
        text: doneIds.includes(item2.id)
          ? `✅ ${item2.name}`
          : `◻️ ${item2.name}`,
        callback_data: `check_${item2.id}`
      });
    }

    keyboard.push(row);
  }

  keyboard.push([
    { text: '‹  Kembali ke Kategori', callback_data: 'back_main' }
  ]);

  const pesan =
    `${getCategoryEmoji(categoryName)} <b>${categoryName}</b>

<b>Progress Hari Ini</b>
${progressBar} <b>${progress}%</b>  <i>(${done}/${total} kegiatan)</i>`;

  await ctx.editMessageText(pesan, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
}

module.exports = { tampilKategori, tampilIsiKategori };