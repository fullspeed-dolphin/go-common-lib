import { ref, computed, nextTick } from 'vue';

/**
 * Tab 切换动画 Composable
 *
 * 提供滑块动画、列表切换动画、手势滑动等功能
 *
 * @param {Object} options - 配置选项
 * @param {number} options.tabCount - Tab 数量，默认 2
 * @param {boolean} options.loop - 是否循环切换，默认 true
 * @param {Function} options.onBeforeChange - 切换前回调 (fromIndex, toIndex) => boolean|void
 * @param {Function} options.onAfterChange - 切换后回调 (index) => void
 */
export function useTabAnimation(options = {}) {
	const {
		tabCount = 2,
		loop = true,
		onBeforeChange,
		onAfterChange
	} = options;

	// ========== 状态 ==========
	const currentIndex = ref(0);
	const sliderOffset = ref(0);
	const sliderAnimClass = ref('');
	const listAnimClass = ref('');
	const isAnimating = ref(false);

	// Tab 位置信息
	const tabRects = ref([]);
	const tabContainerLeft = ref(0);

	// 手势相关
	const touchStartX = ref(0);
	const touchStartY = ref(0);

	// ========== 计算属性 ==========

	/**
	 * 滑块样式（动态计算位置和宽度）
	 */
	const sliderStyle = computed(() => {
		const index = currentIndex.value;
		if (!tabRects.value.length || index >= tabRects.value.length) {
			return {};
		}

		const rect = tabRects.value[index];
		const left = rect.left - tabContainerLeft.value + sliderOffset.value;

		return {
			width: rect.width + 'px',
			transform: `translateX(${left}px)`
		};
	});

	// ========== 方法 ==========

	/**
	 * 初始化 Tab 位置信息
	 * 需要在 onMounted 或 onShow 中调用
	 *
	 * @param {string} selectorPrefix - Tab 选择器前缀，默认 '#tab-'
	 */
	const initTabRects = (selectorPrefix = '#tab-') => {
		nextTick(() => {
			// 获取容器基准位置（第一个 tab 的 left）
			const containerQuery = uni.createSelectorQuery();
			containerQuery.select(`${selectorPrefix}0`).boundingClientRect();
			containerQuery.exec((res) => {
				if (res[0]) {
					tabContainerLeft.value = res[0].left;
				}
			});

			// 构建所有 tab 的选择器
			const selectors = Array.from({ length: tabCount }, (_, i) => `${selectorPrefix}${i}`).join(', ');

			// 获取所有 tab 位置
			const query = uni.createSelectorQuery();
			query.selectAll(selectors).boundingClientRect();
			query.exec((res) => {
				if (res[0]) {
					tabRects.value = res[0].map(item => ({
						width: item.width,
						left: item.left
					}));
				}
			});
		});
	};

	/**
	 * 切换 Tab
	 *
	 * @param {number} index - 目标 Tab 索引
	 * @param {Object} animOptions - 动画选项
	 * @param {string} animOptions.direction - 滑动方向 'left' | 'right'，不传则自动计算
	 * @param {boolean} animOptions.isLoop - 是否为循环切换（边界跳转）
	 */
	const changeTab = (index, animOptions = {}) => {
		const { direction = null, isLoop = false } = animOptions;

		// 防止重复切换或动画中切换
		if (index === currentIndex.value || isAnimating.value) {
			return false;
		}

		// 切换前回调，返回 false 可阻止切换
		if (onBeforeChange) {
			const result = onBeforeChange(currentIndex.value, index);
			if (result === false) {
				return false;
			}
		}

		isAnimating.value = true;

		// 自动计算方向
		const slideDirection = direction ?? (index > currentIndex.value ? 'right' : 'left');

		// 列表滑出动画
		listAnimClass.value = slideDirection === 'right' ? 'slide-out-left' : 'slide-out-right';

		// 滑块动画
		if (isLoop) {
			// 循环切换：先隐藏滑块，移到目标位置，再滑入
			const slideOffsetValue = slideDirection === 'left' ? -60 : 60;
			sliderAnimClass.value = 'no-transition slider-hidden';
			sliderOffset.value = slideOffsetValue;
			currentIndex.value = index;

			setTimeout(() => {
				sliderAnimClass.value = '';
				sliderOffset.value = 0;
			}, 30);
		} else {
			// 普通切换：直接过渡
			sliderAnimClass.value = '';
			sliderOffset.value = 0;
			currentIndex.value = index;
		}

		// 等待滑出动画完成，触发滑入动画
		setTimeout(() => {
			// 列表滑入动画
			listAnimClass.value = slideDirection === 'right' ? 'slide-in-right' : 'slide-in-left';

			// 切换后回调
			if (onAfterChange) {
				onAfterChange(index);
			}

			// 动画结束，重置状态
			setTimeout(() => {
				isAnimating.value = false;
				listAnimClass.value = '';
			}, 350);
		}, 250);

		return true;
	};

	/**
	 * 手势开始
	 */
	const onTouchStart = (e) => {
		touchStartX.value = e.touches[0].clientX;
		touchStartY.value = e.touches[0].clientY;
	};

	/**
	 * 手势结束
	 *
	 * @param {TouchEvent} e - 触摸事件
	 * @param {Array} tabs - Tab 列表，用于获取最大索引
	 * @returns {boolean} 是否触发了切换
	 */
	const onTouchEnd = (e, tabs = null) => {
		const touchEndX = e.changedTouches[0].clientX;
		const touchEndY = e.changedTouches[0].clientY;
		const deltaX = touchEndX - touchStartX.value;
		const deltaY = touchEndY - touchStartY.value;

		// 确保是水平滑动（水平距离大于垂直距离）且滑动距离超过阈值
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
			const maxIndex = (tabs?.length ?? tabCount) - 1;
			const swipeDirection = deltaX < 0 ? 'left' : 'right';

			if (deltaX < 0) {
				// 左滑 => 切换到下一个 tab
				if (currentIndex.value >= maxIndex) {
					// 已到最后一个
					if (loop) {
						changeTab(0, { direction: swipeDirection, isLoop: true });
						return true;
					}
					return false;
				}
				changeTab(currentIndex.value + 1, { direction: swipeDirection });
				return true;
			} else {
				// 右滑 => 切换到上一个 tab
				if (currentIndex.value <= 0) {
					// 已到第一个
					if (loop) {
						changeTab(maxIndex, { direction: swipeDirection, isLoop: true });
						return true;
					}
					return false;
				}
				changeTab(currentIndex.value - 1, { direction: swipeDirection });
				return true;
			}
		}

		return false;
	};

	/**
	 * 重置到初始状态
	 */
	const reset = () => {
		currentIndex.value = 0;
		sliderOffset.value = 0;
		sliderAnimClass.value = '';
		listAnimClass.value = '';
		isAnimating.value = false;
	};

	return {
		// 状态
		currentIndex,
		sliderStyle,
		sliderAnimClass,
		listAnimClass,
		isAnimating,

		// 方法
		changeTab,
		initTabRects,
		onTouchStart,
		onTouchEnd,
		reset
	};
}
