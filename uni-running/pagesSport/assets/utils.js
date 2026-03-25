import * as turf from '@turf/turf'
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
  const display = km.toFixed(2);
  return `${display} km`;
}

/**
 * 根据米数和秒数计算配速
 * @param {number} meters - 跑步距离（米）
 * @param {number} totalSeconds - 跑步总用时（秒）
 * @returns {string} 配速字符串，格式为 "mm:ss" (分:秒/公里)
 */
export function calculatePaceFromMeters(meters, totalSeconds) {
  if (meters <= 0 || totalSeconds <= 0 || isNaN(meters) || isNaN(totalSeconds)) {
    return "0:00"; // 或者抛出错误
  }

  // 1. 将米转换为公里
  const kilometers = meters / 1000;

  // 2. 计算每公里需要的秒数 (Pace in seconds per km)
  // 公式：总秒数 / 公里数
  const secondsPerKm = totalSeconds / kilometers;

  // 3. 将秒数转换为 "分:秒" 格式
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);

  // 处理秒数进位问题 (例如 59.9 秒 进位为 60 秒 -> 1 分 00 秒)
  if (seconds === 60) {
    return `${minutes + 1}’00”`;
  }

  // 格式化秒数，确保是两位数 (例如 5 变成 "05")
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${minutes}’${formattedSeconds}”`;
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
    width: 10,
    height: 15,
    // anchor: { x: 0.5, y: 0.5 },
    label: {
      borderRadius: 10,
      borderWidth: 1,
      padding: 2,
      content: String(strDistance),
      fontSize: 10,
      bgColor: "#000",
      borderColor: "#fff",
      color: "#fff"
    },
    // iconPath: isStart
    //   ? "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/go@2x.png"
    //   : "https://ccrun.oss-cn-guangzhou.aliyuncs.com/weapp-static/images/end@2x.png",
    title: isStart ? "起" : "终",
  };
};

export const getTime = (t) => {
  let h = parseInt((t / 60 / 60) % 24);
  let m = parseInt((t / 60) % 60);
  let s = parseInt(t % 60);

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;

  return `${h}:${m}:${s}`;
};

const speedConfig = [
  { max: 6, color: '#7fba3a' },   // 慢
  { max: 8, color: '#8dc645' },   // 轻松
  { max: 10, color: '#9bbd3e' },  // 中速
  { max: 12, color: '#aeb33e' },  // 速度
  { max: 14, color: '#c6a636' },  // 快
  { max: 99, color: '#f58b2d' }   // 冲刺
];

function getColorBySpeed(kmh) {
  if (kmh == null || isNaN(kmh) || kmh <= 0) return speedConfig[0].color;
  return speedConfig.find((it) => kmh <= it.max)?.color || speedConfig[speedConfig.length - 1].color;
}

// 速度转换 m/s -> km/h
function covertSpeed(ms) {
  if (ms == null || isNaN(ms) || ms <= 0) return 0;
  const kmh = (ms * 3600) / 1000;
  return Number(kmh.toFixed(2));
}

// 根据速度生成多段彩色轨迹
export function generateSpeedPolylines(points) {
  const list = [];
  if (!Array.isArray(points) || points.length < 2) return list;

  let segment = [];
  let segmentColor = null;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!p1 || !p2) continue;

    const s1 = covertSpeed(p1.speed);
    const s2 = covertSpeed(p2.speed);
    if (s1 <= 0 && s2 <= 0) continue;

    const avgSpeed = (s1 + s2) / 2;
    const color = getColorBySpeed(avgSpeed);

    if (!segment.length) {
      segment = [{ latitude: p1.latitude, longitude: p1.longitude }, { latitude: p2.latitude, longitude: p2.longitude }];
      segmentColor = color;
    } else if (color === segmentColor) {
      segment.push({ latitude: p2.latitude, longitude: p2.longitude });
    } else {
      list.push({
        points: segment,
        color: segmentColor,
        arrowLine: true,
        width: 8
      });
      segment = [{ latitude: p1.latitude, longitude: p1.longitude }, { latitude: p2.latitude, longitude: p2.longitude }];
      segmentColor = color;
    }
  }

  if (segment.length > 1) {
    list.push({
      points: segment,
      color: segmentColor || speedConfig[0].color,
      arrowLine: true,
      width: 8
    });
  }

  return list;
}

// 获取计算地图缩放级别
export function getCenterScale(start, end, centerPoint) {
    /* let distance1 = getDistance(start.latitude, start.longitude, centerPoint.latitude, centerPoint.longitude)
    let distance2 = getDistance(centerPoint.latitude, centerPoint.longitude, end.latitude, end.longitude)
    const distance = Number(distance1) + Number(distance2)
    console.log('计算两点之间的距离', distance1, distance2, distance) */
    // console.log('start, end',start, end)
    var startFrom = turf.point([start.longitude, start.latitude]);
    var startTo = turf.point([centerPoint.longitude, centerPoint.latitude]);
    // var options = { units: "miles" };

    var startDistance = turf.distance(startFrom, startTo) * 1000;

    var endFrom = turf.point([end.longitude, end.latitude]);
    var endTo = turf.point([centerPoint.longitude, centerPoint.latitude]);
    var endDistance = turf.distance(endFrom, endTo)  * 1000;
    // console.log("distance===",startDistance,endDistance)
    const distance = Number(startDistance) + Number(endDistance)
    // console.log("direction===",getOrientation(start,centerPoint))
    console.log("direction===222",analyzeOrientationViaMid(
      [start.longitude, start.latitude],
      [centerPoint.longitude, centerPoint.latitude], 
      [end.longitude, end.latitude]))
    const directionObJ = analyzeOrientationViaMid(
      [start.longitude, start.latitude],
      [centerPoint.longitude, centerPoint.latitude], 
      [end.longitude, end.latitude])
    let scale = 17
    if(directionObJ.orientation === 'vertical') {
      scale = 14
      if(directionObJ.details.totalSpan.v >= 10000 && directionObJ.details.totalSpan.v < 15000) {
        scale = 12
      }
    } else {
      if (distance < 200) {
        scale = 17
      }
      if (distance >= 200 && distance < 1000) {
        scale = 16
      }
      if (distance >= 1000 && distance < 5000) {
        scale = 15
      }
      if (distance >= 5000 && distance < 10000) {
        scale = 14
      }
      if (distance >= 10000 && distance < 15000) {
        scale = 13
      }
      if (distance >= 15000 && distance < 50000) {
        scale = 12
      }
      if (distance >= 50000 && distance < 200000) {
        scale = 10
      }
      if (distance > 200000) {
        scale = 8
      }

    }
    console.log('计算地图缩放级别',scale,"距离",distance)
    return scale
  }
/**
 * 判断两个点相对于中间点的分布方向
 * @param {Array} start - 起点坐标 [lng, lat]
 * @param {Array} mid - 中间点坐标 [lng, lat]
 * @param {Array} end - 终点坐标 [lng, lat]
 * @returns {Object} 包含整体方向判断及详细数据
 */
function analyzeOrientationViaMid(start, mid, end) {
  // 辅助函数：计算某点相对于参考点的横向和纵向实际距离
  function getComponents(reference, target) {
    // 构造纯横向点：保持参考点纬度，目标点经度
    const pureHoriz = [target[0], reference[1]];
    // 构造纯纵向点：保持参考点经度，目标点纬度
    const pureVert = [reference[0], target[1]];

    // 计算实际距离 (单位: 米)
    // 注意：如果经度相同，东西距离为0；如果纬度相同，南北距离为0
    const distH = turf.distance(reference, pureHoriz, { units: 'meters' });
    const distV = turf.distance(reference, pureVert, { units: 'meters' });

    return { h: distH, v: distV };
  }

  // 1. 分析 起点 -> 中间点
  const compStart = getComponents(mid, start);
  
  // 2. 分析 终点 -> 中间点
  const compEnd = getComponents(mid, end);

  // 3. 累加总的横向跨度和纵向跨度
  // 这里我们关心的是整体覆盖的范围是横长还是竖长
  const totalHorizontalSpan = compStart.h + compEnd.h;
  const totalVerticalSpan = compStart.v + compEnd.v;

  let orientation = '';
  if (totalHorizontalSpan > totalVerticalSpan) {
    orientation = 'horizontal'; // 横向为主 (东西向)
  } else {
    orientation = 'vertical';   // 纵向为主 (南北向)
  }

  return {
    orientation: orientation,
    details: {
      startToMid: { horizontalDist: compStart.h, verticalDist: compStart.v },
      endToMid: { horizontalDist: compEnd.h, verticalDist: compEnd.v },
      totalSpan: { h: totalHorizontalSpan, v: totalVerticalSpan }
    }
  };
}
 // 计算两坐标点之间的距离
function getDistance(lat1, lng1, lat2, lng2) {
  let rad1 = lat1 * Math.PI / 180.0;
  let rad2 = lat2 * Math.PI / 180.0;
  let a = rad1 - rad2;
  let b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  let r = 6378137;
  return (r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math
    .sin(b / 2), 2)))).toFixed(0)

}
