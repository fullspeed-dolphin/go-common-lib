import { ref, onMounted } from 'vue';

export function useMescrollWxs(mescroll, downLoadType) {
    // 传入wxs视图层的数据 (响应式)
    const wxsProp = ref({
        optDown: {}, // 下拉刷新的配置
        scrollTop: 0, // 滚动条的距离
        bodyHeight: 0, // body的高度
        isDownScrolling: false, // 是否正在下拉刷新中
        isUpScrolling: false, // 是否正在上拉加载中
        isScrollBody: true, // 是否为mescroll-body滚动
        isUpBoth: true, // 上拉加载时,是否同时可以下拉刷新
        t: 0 // 数据更新的标记 (只有数据更新了,才会触发wxs的Observer)
    });

    // 标记调用wxs视图层的方法
    const callProp = ref({
        callType: '', // 方法名
        t: 0 // 数据更新的标记 (只有数据更新了,才会触发wxs的Observer)
    });

    // 不用wxs的平台使用此处的wxsBiz对象,抹平wxs的写法
    // #ifndef MP-WEIXIN || MP-QQ || APP-PLUS || H5
    const wxsBiz = {
        touchstartEvent: e => {
            mescroll.value.touchstartEvent(e);
        },
        touchmoveEvent: e => {
            mescroll.value.touchmoveEvent(e);
        },
        touchendEvent: e => {
            mescroll.value.touchendEvent(e);
        },
        propObserver() {}, // 抹平wxs的写法
        callObserver() {} // 抹平wxs的写法
    };
    // #endif

    // 不用renderjs的平台使用此处的renderBiz对象,抹平renderjs的写法
    // #ifndef APP-PLUS || H5
    const renderBiz = {
        propObserver() {} // 抹平renderjs的写法
    };
    // #endif

    // wxs视图层调用逻辑层的回调
    function wxsCall(msg) {
        if (msg.type === 'setWxsProp') {
            // 更新wxsProp数据 (值改变才触发更新)
            wxsProp.value = {
                optDown: mescroll.value.optDown,
                scrollTop: mescroll.value.getScrollTop(),
                bodyHeight: mescroll.value.getBodyHeight(),
                isDownScrolling: mescroll.value.isDownScrolling,
                isUpScrolling: mescroll.value.isUpScrolling,
                isUpBoth: mescroll.value.optUp.isBoth,
                isScrollBody: mescroll.value.isScrollBody,
                t: Date.now()
            };
        } else if (msg.type === 'setLoadType') {
            // 设置inOffset,outOffset的状态
            downLoadType.value = msg.downLoadType;
            // 状态挂载到mescroll对象, 以便在其他组件中使用
            mescroll.value.downLoadType = downLoadType.value;
            // 重置是否加载成功的状态
            mescroll.value.isDownEndSuccess = null;
        } else if (msg.type === 'triggerDownScroll') {
            // 主动触发下拉刷新
            mescroll.value.triggerDownScroll();
        } else if (msg.type === 'endDownScroll') {
            // 结束下拉刷新
            mescroll.value.endDownScroll();
        } else if (msg.type === 'triggerUpScroll') {
            // 主动触发上拉加载
            mescroll.value.triggerUpScroll(true);
        }
    }

    onMounted(() => {
        // #ifdef MP-WEIXIN || MP-QQ || APP-PLUS || H5
        // 配置主动触发wxs显示加载进度的回调
        mescroll.value.optDown.afterLoading = () => {
            callProp.value = { callType: "showLoading", t: Date.now() }; // 触发wxs的方法
        };

        // 配置主动触发wxs隐藏加载进度的回调
        mescroll.value.optDown.afterEndDownScroll = () => {
            callProp.value = { callType: "endDownScroll", t: Date.now() }; // 触发wxs的方法
            let delay = 300 + (mescroll.value.optDown.beforeEndDelay || 0);
            setTimeout(() => {
                if (downLoadType.value === 4 || downLoadType.value === 0) {
                    callProp.value = { callType: "clearTransform", t: Date.now() }; // 触发wxs的方法
                }
                // 状态挂载到mescroll对象
                mescroll.value.downLoadType = downLoadType.value;
            }, delay);
        };

        // 初始化wxs的数据
        wxsCall({ type: 'setWxsProp' });
        // #endif
    });

    return {
        wxsProp,
        callProp,
        // #ifndef MP-WEIXIN || MP-QQ || APP-PLUS || H5
        wxsBiz,
        // #endif
        // #ifndef APP-PLUS || H5
        renderBiz,
        // #endif
        wxsCall
    };
}
