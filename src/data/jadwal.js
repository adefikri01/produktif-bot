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

function getCategoryEmoji(name = '') {
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


async function tampilKategori(ctx, baseDate = new Date()) {
  const tanggal = getEffectiveDate();
  const displayDate = formatDisplayDate(tanggal);

  // ✅ Ambil semua activity
  const allActivitiesRes = await pool.query(
    `SELECT id FROM activities`
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
       AND activity_id = ANY($2::int[])`,
      [tanggal, allActivityIds]
    );

    doneAll = parseInt(doneAllRes.rows[0].count);
  }

  const overallProgress =
    totalAll === 0 ? 0 : Math.round((doneAll / totalAll) * 100);

  const overallBar = generateProgressBar(overallProgress);

  // ✅ Ambil kategori
  const result = await pool.query(
    `SELECT DISTINCT category FROM activities ORDER BY category ASC`
  );

  const categories = result.rows;
  const keyboard = [];

  for (let i = 0; i < categories.length; i += 2) {
    const row = [];

    for (let j = 0; j < 2; j++) {
      const catObj = categories[i + j];
      if (!catObj) continue;

      const category = catObj.category;

      const activitiesRes = await pool.query(
        `SELECT id FROM activities WHERE category = $1`,
        [category]
      );

      const activityIds = activitiesRes.rows.map(a => a.id);

      let done = 0;
      let total = activityIds.length;

      if (total > 0) {
        const doneRes = await pool.query(
          `SELECT COUNT(*) 
           FROM daily_logs
           WHERE date = $1
           AND is_done = true
           AND activity_id = ANY($2::int[])`,
          [tanggal, activityIds]
        );

        done = parseInt(doneRes.rows[0].count);
      }

      const progressText =
        total === 0 ? '(0/0)' : `(${done}/${total})`;

      row.push({
        text: `${getCategoryEmoji(category)}  ${category} ${progressText}`,
        callback_data: `category_${category}`
      });
    }

    keyboard.push(row);
  }

  keyboard.push([{
    text: '🔄 Reset Hari Ini',
    callback_data: 'confirm_reset'
  }]);

  // ✅ Overall status label (sama vibe seperti kategori)
  let statusLabel;
  if (overallProgress === 100) statusLabel = '🎉 Semua kategori selesai!';
  else if (overallProgress >= 75) statusLabel = '💪 Hampir selesai!';
  else if (overallProgress >= 50) statusLabel = '🔥 Sudah setengah jalan!';
  else if (overallProgress > 0) statusLabel = '⚡ Sudah mulai, lanjutkan!';
  else statusLabel = '📋 Belum ada progress hari ini';

  const pesan =
    `🗓 <b>TODAY PLAN</b>
<i>Rencanamu untuk hari ini</i>

<b>${displayDate}</b>

<b>Progress Keseluruhan</b>
${overallBar} <b>${overallProgress}%</b>  <i>(${doneAll}/${totalAll})</i>

${statusLabel}

Pilih kategori kegiatan yang ingin kamu lacak 👇`;

  if (ctx.callbackQuery) {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      pesan,
      {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      }
    );
  } else {
    await ctx.reply(pesan, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
}



async function tampilIsiKategori(ctx, category, baseDate = new Date()) {
  const userId = ctx.from.id;
  const tanggal = getEffectiveDate();
  const displayDate = formatDisplayDate(tanggal);

  const result = await pool.query(
    `SELECT * FROM activities WHERE category = $1 ORDER BY id ASC`,
    [category]
  );

  const kegiatan = result.rows;

  const logs = await pool.query(
    `SELECT activity_id FROM daily_logs
     WHERE date = $1 AND is_done = true`,
    [tanggal]
  );

  const doneIds = logs.rows.map(r => r.activity_id);

  const total = kegiatan.length;
  const done = kegiatan.filter(k => doneIds.includes(k.id)).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);
  const progressBar = generateProgressBar(progress);

  // Grid 2 kolom
  const keyboard = [];
  for (let i = 0; i < kegiatan.length; i += 2) {
    const row = [];

    const item1 = kegiatan[i];
    row.push({
      text: doneIds.includes(item1.id)
        ? `${DONE_EMOJI}  ${item1.name}`
        : `${UNDONE_EMOJI}  ${item1.name}`,
      callback_data: `check_${item1.id}`
    });

    const item2 = kegiatan[i + 1];
    if (item2) {
      row.push({
        text: doneIds.includes(item2.id)
          ? `${DONE_EMOJI}  ${item2.name}`
          : `${UNDONE_EMOJI}  ${item2.name}`,
        callback_data: `check_${item2.id}`
      });
    }

    keyboard.push(row);
  }

  keyboard.push([{
    text: '‹  Kembali ke Kategori',
    callback_data: 'back_main'
  }]);

  let statusLabel;
  if (progress === 100) statusLabel = '🎉 Semua selesai! Luar biasa!';
  else if (progress >= 75) statusLabel = '💪 Hampir selesai, tetap semangat!';
  else if (progress >= 50) statusLabel = '🔥 Sudah setengah jalan!';
  else if (progress > 0) statusLabel = '⚡ Baru mulai, yuk lanjut!';
  else statusLabel = '📋 Belum ada yang diselesaikan';

  const pesan =
    `${getCategoryEmoji(category)} <b>${category}</b>

<b>Progress Hari Ini</b>
${progressBar} <b>${progress}%</b>  <i>(${done}/${total} kegiatan)</i>

${statusLabel}`;

  await ctx.telegram.editMessageText(
    ctx.chat.id,
    ctx.callbackQuery?.message?.message_id || ctx.message?.message_id,
    null,
    pesan,
    {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    }
  );
}

module.exports = { tampilKategori, tampilIsiKategori };