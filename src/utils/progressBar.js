function generateProgressBar(percent) {
  const totalBars = 10;
  const filledBars = Math.round((percent / 100) * totalBars);
  const emptyBars = totalBars - filledBars;

  return '█'.repeat(filledBars) + '░'.repeat(emptyBars);
}

module.exports = generateProgressBar;