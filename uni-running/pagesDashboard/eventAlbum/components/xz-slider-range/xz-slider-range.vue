<template>
  <view :class="{ 'xz-slider-range--disabled': $props.disabled }" class="xz-slider-range">
    <view class="xz-slider-range__inner" id="sliderRange">

      <!-- 滑动条 -->
      <view class="xz-slider-range__bar">
        <view class="xz-slider-range__bar-bg" />
        <view :style="sliderRangeStyle.activeBarStyle" class="xz-slider-range__bar-active" />
      </view>
      <view v-for="(item, index) in sliderBlockCtx.blocks" :key="index" :style="item.style" class="xz-slider-range__controls" @touchmove="blockEvent($event, index)" @touchstart="showHandle(0)" @touchend="showHandle(1)">
        <!-- 滑块值提示 -->
        <!-- <view v-if="item.showHint"
              :class="{
                'xz-slider-range__hint--top': /^top$/.test($props.hintMode),
                'xz-slider-range__hint--bottom': /^bottom$/.test($props.hintMode),
                'xz-slider-range__hint--insert': /^insert$/.test($props.hintMode),
                'xz-slider-range__hint--toast': /^toast$/.test($props.hintMode)
              }"
              class="xz-slider-range__hint">
          <text>总{{ $props.total }}</text>
        </view> -->
        <!-- 显示的滑块数字 -->
        <view :class="{'xz-slider-range__block--decoration': sliderBlockCtx.decoration}" class="xz-slider-range__block" :style="{opacity: isShow ? 0 : 1}">{{ item.hint+1 }}/{{$props.max}}</view>
        <!-- 显示的圆心滑块 -->
        <view style="width:10rpx;height:10rpx;background:#fff;border-radius:50%;"></view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useXzSliderRange } from "./hook";
import { xzSilderRangeProps, xzSilderRangeEmits } from "./props";
const $props = defineProps(xzSilderRangeProps);
const $emits = defineEmits(xzSilderRangeEmits);
const isShow = ref(false);

const showHandle = (num: number) => {
  if (num) {
    isShow.value = false;
  } else {
    isShow.value = true;
  }
  $emits("showNum", isShow.value);
};

const { sliderRangeStyle, sliderBlockCtx, blockEvent, reset } =
  useXzSliderRange($props, $emits);
// console.log('sliderBlockCtx',sliderBlockCtx)
defineExpose({
  reset,
});
</script>

<style lang="scss" scoped src="./scss/index.scss" />
<style lang="scss" scoped>
.xz-slider-range {
  padding: 0 v-bind("sliderRangeStyle.barPadding");

  &__bar {
    height: v-bind("$props.height");
    border-radius: v-bind("$props.height");

    &-bg {
      background-color: v-bind("$props.bgc");
    }

    &-active {
      background-color: v-bind("$props.activeBgc");
    }
  }

  &__block {
    width: auto;
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    height: calc(v-bind("sliderRangeStyle.blockSize") / 2);
    background-color: v-bind("$props.color");
    font-size: 18rpx;
    // line-height: calc(v-bind("sliderRangeStyle.blockSize") / 2);
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &__hint {
    font-size: v-bind("$props.hintSize");
    color: v-bind("$props.hintColor");
  }
}
</style>