import { describe, it, expect } from 'vitest';
import {
  resolvePosterVisibility,
  getCurrentPosterPath,
  buildPosterPaths,
  ACTIVITY_EVENT_ID,
  DEFAULT_EVENT_ID,
} from './posterUtils.js';

describe('resolvePosterVisibility', () => {
  it('只勾选"打卡送跑币" → 只显示跑币海报', () => {
    const result = resolvePosterVisibility([DEFAULT_EVENT_ID]);
    expect(result).toEqual({ showPoster1: false, showPoster2: true });
  });

  it('只勾选520活动 → 只显示活动海报', () => {
    const result = resolvePosterVisibility([ACTIVITY_EVENT_ID]);
    expect(result).toEqual({ showPoster1: true, showPoster2: false });
  });

  it('两个都勾选 → 两张海报都显示', () => {
    const result = resolvePosterVisibility([ACTIVITY_EVENT_ID, DEFAULT_EVENT_ID]);
    expect(result).toEqual({ showPoster1: true, showPoster2: true });
  });

  it('空数组 → 兜底全部显示', () => {
    const result = resolvePosterVisibility([]);
    expect(result).toEqual({ showPoster1: true, showPoster2: true });
  });

  it('undefined → 兜底全部显示', () => {
    const result = resolvePosterVisibility(undefined);
    expect(result).toEqual({ showPoster1: true, showPoster2: true });
  });

  it('null → 兜底全部显示', () => {
    const result = resolvePosterVisibility(null);
    expect(result).toEqual({ showPoster1: true, showPoster2: true });
  });

  it('包含无关活动ID → 两张都不显示', () => {
    const result = resolvePosterVisibility(['some-other-event']);
    expect(result).toEqual({ showPoster1: false, showPoster2: false });
  });

  it('包含无关活动 + default → 只显示跑币海报', () => {
    const result = resolvePosterVisibility(['some-other-event', DEFAULT_EVENT_ID]);
    expect(result).toEqual({ showPoster1: false, showPoster2: true });
  });
});

describe('buildPosterPaths', () => {
  it('两张都显示 → 返回两个路径', () => {
    const paths = buildPosterPaths(true, true, '/img/a.png', '/img/b.png');
    expect(paths).toEqual(['/img/a.png', '/img/b.png']);
  });

  it('只显示海报1 → 返回一个路径', () => {
    const paths = buildPosterPaths(true, false, '/img/a.png', '/img/b.png');
    expect(paths).toEqual(['/img/a.png']);
  });

  it('只显示海报2 → 返回一个路径', () => {
    const paths = buildPosterPaths(false, true, '/img/a.png', '/img/b.png');
    expect(paths).toEqual(['/img/b.png']);
  });

  it('都不显示 → 返回空数组', () => {
    const paths = buildPosterPaths(false, false, '/img/a.png', '/img/b.png');
    expect(paths).toEqual([]);
  });
});

describe('getCurrentPosterPath', () => {
  it('两张海报，选第一张', () => {
    expect(getCurrentPosterPath(['/a.png', '/b.png'], 0)).toBe('/a.png');
  });

  it('两张海报，选第二张', () => {
    expect(getCurrentPosterPath(['/a.png', '/b.png'], 1)).toBe('/b.png');
  });

  it('只有一张海报，index=0 → 返回该海报', () => {
    expect(getCurrentPosterPath(['/b.png'], 0)).toBe('/b.png');
  });

  it('空数组 → 返回空字符串', () => {
    expect(getCurrentPosterPath([], 0)).toBe('');
  });

  it('index 越界 → 返回空字符串', () => {
    expect(getCurrentPosterPath(['/a.png'], 1)).toBe('');
  });
});
