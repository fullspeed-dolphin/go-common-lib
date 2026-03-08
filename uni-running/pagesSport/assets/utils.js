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
  h < 10 ? " 0 " + h : h;
  m < 10 ? " 0 " + m : m;
  s < 10 ? " 0 " + s : s;

  if (h) {
    return `${h}:${m}:${s}`;
  } else {
    return `00:${m}:${s}`;
  }
};

let maxSpeed = null
export function getPointsSpeed(points) {
  let lineColor = '#7fba3a'
  let list = []

  if (!points || !points.length) {
    return list
  }

  let lastArr = []
  let lastSpeed = 0
  for (let i = 0; i < points.length; i++) {
    let speed = covertSpeed(points[i].speed)
    if (!maxSpeed) {
      maxSpeed = points[i]
    } else {
      if (points[i].speed > maxSpeed.speed) {
        maxSpeed = points[i]
      }
    }
    if (i === points.length - 1 || !speed) {
      // 还剩最后一个不计入
      continue
    }
    let nextPoint = points[i + 1]
    let nextSpeed = covertSpeed(points[i + 1].speed)
    if (!nextSpeed) {
      continue
    }
    lastSpeed = speed
    if (!lastArr.length) {
      lastArr.push(points[i], nextPoint)
    } else {
      lastArr.push(nextPoint)
    }
    if (speed <= 20) {
      lineColor = '#8dc645'
      if (nextSpeed > 20) {
        // 清空
        list.push({
          points: lastArr,
          color: lineColor,
          arrowLine: true, //带箭头的线
          width: 8,
        })
        lastArr = []
      }
    }
    if (speed > 20 && speed <= 40) {
      lineColor = '#9bbd3e'
      if (nextSpeed <= 20 || nextSpeed > 40) {
        // 清空
        list.push({
          points: lastArr,
          color: lineColor,
          arrowLine: true, //带箭头的线
          width: 8,
        })
        lastArr = []
      }
    }
    if (speed > 40 && speed <= 60) {
      lineColor = '#aeb33e'
      if (nextSpeed <= 40 || nextSpeed > 60) {
        // 清空
        list.push({
          points: lastArr,
          color: lineColor,
          arrowLine: true, //带箭头的线
          width: 8,
        })
        lastArr = []
      }

    }
    if (speed > 60 && speed <= 80) {
      lineColor = '#c6a636'
      if (nextSpeed <= 60 || nextSpeed > 80) {
        // 清空
        list.push({
          points: lastArr,
          color: lineColor,
          arrowLine: true, //带箭头的线
          width: 8,
        })
        lastArr = []
      }
    }
    if (speed > 80 && speed <= 100) {
      lineColor = '#d49a29'
      if (nextSpeed <= 80 || nextSpeed > 100) {
        // 清空
        list.push({
          points: lastArr,
          color: lineColor,
          arrowLine: true, //带箭头的线
          width: 8,
        })
        lastArr = []
      }
    }
    if (speed > 100 && speed <= 120) {
      lineColor = '#e4a752'
      if (nextSpeed <= 100 || nextSpeed > 120) {
        // 清空
        list.push({
          points: lastArr,
          color: lineColor,
          arrowLine: true, //带箭头的线
          width: 8,
        })
        lastArr = []
      }
    }
    if (speed > 120) {
      lineColor = '#f58b2d'
      if (nextSpeed <= 120) {
        // 清空
        list.push({
          points: lastArr,
          color: lineColor,
          arrowLine: true, //带箭头的线
          width: 8,
        })
        lastArr = []
      }
    }
  }
  this.centerPoint = points[Math.round(points.length / 2)]
  // console.log("centerPoint", this.centerPoint)
  if (!list.length && lastArr.length) {
    list.push({
      points: lastArr,
      color: lineColor,
      arrowLine: true, //带箭头的线
      width: 8,
    })
  }
  return list
}

// 速度转换 m/s -> km/h
function covertSpeed(ms) {
  if (ms <= 0) {
    return 0.00
  }
  const kmh = ms * (60 * 60)
  return parseFloat(String(kmh / 1000)).toFixed(2)
}

// 获取计算地图缩放级别
export function getCenterScale(start, end, centerPoint) {
    let distance1 = getDistance(start.latitude, start.longitude, centerPoint.latitude, centerPoint.longitude)
    let distance2 = getDistance(centerPoint.latitude, centerPoint.longitude, end.latitude, end.longitude)
    const distance = Number(distance1) + Number(distance2)
    console.log('计算两点之间的距离', distance1, distance2, distance)

    let scale = 17
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

    console.log('计算地图缩放级别', scale)
    return scale
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
