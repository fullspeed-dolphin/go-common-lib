<template>
  <view :class="{ 'xz-slider-range--disabled': $props.disabled }"
        class="xz-slider-range">
    <view class="xz-slider-range__inner">
      <!-- 滑动条 -->
      <view class="xz-slider-range__bar">
        <view class="xz-slider-range__bar-bg" />
        <view :style="sliderRangeStyle.activeBarStyle" class="xz-slider-range__bar-active" />
      </view>
      <view v-for="(item, index) in sliderBlockCtx.blocks" :key="index"
            :style="item.style"
            class="xz-slider-range__controls"
            @touchmove="blockEvent($event, index)">
        <!-- 滑块值提示 -->
        <!-- <view v-if="item.showHint"
              :class="{
                'xz-slider-range__hint--top': /^top$/.test($props.hintMode),
                'xz-slider-range__hint--bottom': /^bottom$/.test($props.hintMode),
                'xz-slider-range__hint--insert': /^insert$/.test($props.hintMode),
                'xz-slider-range__hint--toast': /^toast$/.test($props.hintMode)
              }"
              class="xz-slider-range__hint">
          <text>{{ item.hint }}</text>
        </view> -->
        <!-- 滑块 -->
        <view :class="{'xz-slider-range__block--decoration': sliderBlockCtx.decoration}"
              class="xz-slider-range__block">{{ item.hint+1 }}/{{$props.max}}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
  /*
   * 组件名: xz-slider-range
   * 组件用途: 范围滑块组件
   * 创建日期: 2023/5/18
   * 编写者: XianZhe
   */
  import { useXzSliderRange } from "./hook";
  import { xzSilderRangeProps, xzSilderRangeEmits } from "./props";

  const $props = defineProps(xzSilderRangeProps);
  const $emits = defineEmits(xzSilderRangeEmits);
  const {
    sliderRangeStyle,
    sliderBlockCtx,
    blockEvent,
    reset,
  } = useXzSliderRange($props, $emits);
// console.log('sliderBlockCtx',sliderBlockCtx)
  defineExpose({
    reset
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
	  font-size:18rpx;
	  // line-height: calc(v-bind("sliderRangeStyle.blockSize") / 2);
	  text-align:center
	  
    }

    &__hint {
      font-size: v-bind("$props.hintSize");
      color: v-bind("$props.hintColor");
    }
  }

</style>
