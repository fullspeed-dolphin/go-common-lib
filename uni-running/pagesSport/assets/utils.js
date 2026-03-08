// 将秒数转换为 时分 格式，小时为0时省略
// 将秒数转换为 01:30:31 或 30:15（无小时部分）的格式。秒数为0时返回空字符串。
export function formatDuration(sec) {
  const s = parseInt(sec, 10) || 0;
  if (s === 0) return '--';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const secRemain = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(secRemain)}`;
  }
  return `${pad(m)}:${pad(secRemain)}`;
}

// 米数转为 km 显示，0km 则显示米数整数
export function formatDistance(meters) {
  const m = parseFloat(meters) || 0;
  const km = m / 1000;

  if (km < 0.1) {
    // less than 0.1 km show meters
    return `${Math.round(m)} m`;
  }
  // display with one decimal if < 10km, else no decimal
  const display = km.toFixed(1);
  return `${display} km`;
}

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

export function getTypeSum(list, type) {
  return list.reduce((sum, i) => (sum + (parseFloat(i[type]) || 0) * 100), 0) / 100;
}

// 创建标记
export const createMarker = (id, latitude, longitude, type, strDistance) => {
  const isStart = type === "start";
  return {
    id,
    latitude,
    longitude,
    // width: 40,
    // height: 40,
    // anchor: { x: 0.5, y: 0.5 },
    label:{
      borderRadius:10,
      borderWidth:1,
      padding:2,
      content: String(strDistance),
      fontSize:10,
      bgColor:"#000",
      borderColor:"#fff",
      color:"#fff"
    },
    // iconPath: isStart
    //   ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/go@2x.png"
    //   : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/end@2x.png",
    // title: isStart ? "起" : "终",
  };
};

export const getTime = (t) => {
  let h = parseInt((t / 60 / 60) % 24);
  let m = parseInt((t / 60) % 60);
  let s = parseInt(t % 60);
  h < 10 ? " 0 " + h : h;
  m < 10 ? " 0 " + m : m;
  s < 10 ? " 0 " + s : s;

  if (h) {
    return `${h}:${m}:${s}`;
  } else {
    return `00:${m}:${s}`;
  }
};