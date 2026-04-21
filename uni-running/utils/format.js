// 将 average_pace（例如 7.29 或字符串）格式化为 7’29” 样式
export function formatPace(pace) {
  if (pace === null || pace === undefined || pace === '') return '--';
  const s = String(pace).trim();
  // 如果已经是带分秒的格式，直接返回
  if (s.includes(':') || s.includes("’") || s.includes("'")) return s;
  if (s.includes('.')) {
    const parts = s.split('.');
    const min = parseInt(parts[0], 10) || 0;
    const frac = parts[1] || '';
    let sec = 0;
    if (frac.length === 1) {
      sec = parseInt(frac, 10) * 10; // treat .2 as 20 seconds
    } else {
      sec = parseInt(frac.slice(0, 2), 10) || 0;
    }
    // if parsed seconds exceed 59, fallback to interpreting fraction as decimal minutes
    if (sec > 59) {
      sec = Math.round(parseFloat('0.' + frac) * 60);
    }
    return `${min}’${String(sec).padStart(2, '0')}”`;
  }
  // integer minutes
  const minOnly = parseInt(s, 10);
  if (!isNaN(minOnly)) return `${minOnly}’00”`;
  return s;
}
