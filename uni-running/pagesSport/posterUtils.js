/**
 * 根据用户勾选的活动ID列表，判断需要生成哪些海报
 * @param {string[]} eventIds - 用户勾选并打卡成功的活动ID列表
 * @returns {{ showPoster1: boolean, showPoster2: boolean }}
 */
export const ACTIVITY_EVENT_ID = '01KH0WQX4H2C7Q4GJ217P8T922';
export const DEFAULT_EVENT_ID = 'default';

export function resolvePosterVisibility(eventIds) {
  if (!eventIds || !eventIds.length) {
    return { showPoster1: true, showPoster2: true };
  }
  return {
    showPoster1: eventIds.includes(ACTIVITY_EVENT_ID),
    showPoster2: eventIds.includes(DEFAULT_EVENT_ID),
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
