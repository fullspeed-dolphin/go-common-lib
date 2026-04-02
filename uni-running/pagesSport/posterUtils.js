export const DEFAULT_EVENT_ID = 'default';

/**
 * 从打卡成功的活动中找到第一个有 checkin_poster_url 的活动
 * @param {string[]} eventIds - 打卡成功的活动ID列表
 * @param {Array} events - 后端返回的活动完整信息
 * @returns {{ showPoster1: boolean, showPoster2: boolean, posterUrl: string|null, activityEventId: string|null }}
 */
export function resolvePosterVisibility(eventIds, events = []) {
  if (!eventIds || !eventIds.length) {
    return { showPoster1: false, showPoster2: true, posterUrl: null, activityEventId: null };
  }

  const successSet = new Set(eventIds);
  const matched = events.find(
    (e) => successSet.has(e.id) && e.checkin_poster_url
  );

  return {
    showPoster1: !!matched,
    showPoster2: eventIds.includes(DEFAULT_EVENT_ID),
    posterUrl: matched?.checkin_poster_url || null,
    activityEventId: matched?.id || null,
  };
}

/**
 * 根据可见海报列表和当前 swiper 索引，获取当前海报图片路径
 * @param {string[]} posterPaths - 可见海报的图片路径列表
 * @param {number} swiperIndex - 当前 swiper 索引
 * @returns {string}
 */
export function getCurrentPosterPath(posterPaths, swiperIndex) {
  return posterPaths[swiperIndex] || '';
}

/**
 * 构建可见海报路径列表
 * @param {boolean} showPoster1
 * @param {boolean} showPoster2
 * @param {string} picturePath1
 * @param {string} picturePath2
 * @returns {string[]}
 */
export function buildPosterPaths(showPoster1, showPoster2, picturePath1, picturePath2) {
  const list = [];
  if (showPoster1) list.push(picturePath1);
  if (showPoster2) list.push(picturePath2);
  return list;
}
