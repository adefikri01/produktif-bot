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

let cachedDailyLogsDateColumn = null;

async function getDailyLogsDateColumn() {
  if (cachedDailyLogsDateColumn) return cachedDailyLogsDateColumn;

  const res = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'daily_logs'
       AND column_name IN ('effective_date', 'date')
     ORDER BY CASE WHEN column_name = 'effective_date' THEN 0 ELSE 1 END
     LIMIT 1`
  );

  cachedDailyLogsDateColumn = res.rows[0]?.column_name || 'date';
  return cachedDailyLogsDateColumn;
}

function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '/');
}

function getEffectiveDate(options = {}) {
  const now = options.referenceDate ? new Date(options.referenceDate) : new Date();
  const resetHour = 3; // reset jam 3 pagi

  // If caller wants the calendar date (no early-morning shift), return straight away
  if (options.useCalendarDate) {
    return now.toISOString().split('T')[0];
  }

  if (now.getHours() < resetHour) {
    now.setDate(now.getDate() - 1);
  }

  return now.toISOString().split('T')[0];
}

function getEffectiveDayOfWeek(options = {}) {
  const now = options.referenceDate ? new Date(options.referenceDate) : new Date();
  const resetHour = 3;

  if (options.useCalendarDate) {
    return now.getDay();
  }

  if (now.getHours() < resetHour) {
    now.setDate(now.getDate() - 1);
  }

  return now.getDay();
}


async function tampilKategori(ctx, options = {}) {
  const userId = ctx.from && ctx.from.id;
  const tanggal = getEffectiveDate(options);
  const dayOfWeek = getEffectiveDayOfWeek(options);
  const dateColumn = await getDailyLogsDateColumn();
  const displayDate = formatDisplayDate(tanggal);

  // Ambil activity user yang dijadwalkan untuk hari efektif
  const allActivitiesRes = await pool.query(
    `SELECT a.id
     FROM activities a
     JOIN schedules s ON s.activity_id = a.id AND s.user_id = a.user_id
     WHERE a.user_id = $1
       AND s.day_of_week = $2
     GROUP BY a.id`,
    [userId, dayOfWeek]
  );

  const allActivityIds = allActivitiesRes.rows.map(a => a.id);
  const totalAll = allActivityIds.length;

  let doneAll = 0;

  if (totalAll > 0) {
    const doneAllRes = await pool.query(
      `SELECT COUNT(*) 
       FROM daily_logs
       WHERE ${dateColumn} = $1
       AND is_done = true
       AND user_id = $2
       AND activity_id = ANY($3::int[])`,
      [tanggal, userId, allActivityIds]
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
        `SELECT a.id
         FROM activities a
         JOIN schedules s ON s.activity_id = a.id AND s.user_id = a.user_id
         WHERE a.category_id = $1
           AND a.user_id = $2
           AND s.day_of_week = $3
         GROUP BY a.id`,
        [cat.id, userId, dayOfWeek]
      );

      const activityIds = activityRes.rows.map(a => a.id);
      const total = activityIds.length;

      let done = 0;

      if (total > 0) {
        const doneRes = await pool.query(
          `SELECT COUNT(*)
           FROM daily_logs
           WHERE ${dateColumn} = $1
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
  const dayOfWeek = getEffectiveDayOfWeek();
  const dateColumn = await getDailyLogsDateColumn();

  const categoryRes = await pool.query(
    `SELECT name FROM categories
     WHERE id = $1 AND user_id = $2`,
    [categoryId, userId]
  );

  if (categoryRes.rowCount === 0) return;

  const categoryName = categoryRes.rows[0].name;

  const result = await pool.query(
    `SELECT a.id, a.name
     FROM activities a
     JOIN schedules s ON s.activity_id = a.id AND s.user_id = a.user_id
     WHERE a.category_id = $1
       AND a.user_id = $2
       AND s.day_of_week = $3
     ORDER BY a.id ASC`,
    [categoryId, userId, dayOfWeek]
  );

  const kegiatan = result.rows;

  const logs = await pool.query(
    `SELECT activity_id FROM daily_logs
     WHERE ${dateColumn} = $1 AND is_done = true AND user_id = $2`,
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