import {
  computed, reactive, onMounted,
  toRaw, getCurrentInstance,
  watch
} from "vue";
import type { SliderBlockCtx } from "../types";
import type { XzSilderRangeProps } from "../props";

export interface NodeInfo extends UniNamespace.NodeInfo {
  width: number;
  height: number;
}

let _blockDebounceTimer: number | null = null;

export function useXzSliderRange(
  $props: XzSilderRangeProps,
  $emits: (event: string, ...args: unknown[]) => void
) {
  const $refs = reactive({
    self: getCurrentInstance()
  });
  const $state = reactive({
    values: [$props.min, $props.max],
    rect: {} as NodeInfo
  });
  watch(()=>$props.modelValue,(val)=>{
	  console.log('===val==监听',val)
	  execute()
  },{deep:true})
  const sliderRangeStyle = computed(() => {
    const [lower, higher] = $state.values;
    const barPadding = $props.size / 2 + "px";
    const activeBarStyle = {
      width: getPercent(higher, lower) + "%",
      left: getPercent(lower, $props.min) + "%"
    };

    // 单区间模式下特殊计算
    if ($props.solo) {
      Object.assign(activeBarStyle, {
        width: getPercent(lower) + "%",
        left: "0%"
      });
    }
    return {
      barPadding, activeBarStyle,
      blockSize: $props.size + "px"
    };
  });

  // 滑块按钮上下文控制
  const sliderBlockCtx = computed<SliderBlockCtx>(() => {
    const [lower, higher] = $state.values;
    const lp = Math.round(getPercent(lower, $props.min) * 100) / 100;
    const rp = Math.round(getPercent(higher, $props.min) * 100) / 100;

    let lhint: string | number = lower, rhint: string | number = higher;
    // 自定义格式化
    if ($props.format && $props.format instanceof Function) {
      lhint = $props.format(lhint);
      rhint = $props.format(rhint);
    }

    const blocks: SliderBlockCtx["blocks"] = [{
      hint: lhint,
      showHint: true,
      style: { left: lp + "%" }
    }];
    if (!$props.solo) {
      blocks.push({
        hint: rhint,
        showHint: rp - lp > $props.hintSafeOverlap,
        style: { left: rp + "%" }
      });
    }
	console.log('blocks',blocks)
    return {
      blocks,
      decoration: $props.decoration && !["insert"].includes($props.hintMode)
    };
  });

  function blockEvent(e: TouchEvent, index: number) {
	  console.log('touch====')
    const { pageX } = e?.touches?.[e?.touches.length - 1] ?? {};
    const { left, width } = $state.rect;
	console.log('left===',left,width)
    if (left && width) {
      const target = Math.round(getPercent(pageX, left, width)
        * (($props.max - $props.min) / 100)
        * (1 + $props.rate * 0.1) + $props.min);

      // left为起始位置，大于其实位置的滑动操作才为正常
      switch (true) {
        // 高值不低于底值限制
        case index !== 0 && target <= $state.values[0]:
          break;
        // 低值不高于高值限制（排除sole模式下误杀）
        case !$props.solo && index === 0 && target >= ($state.values[1] ?? $props.max):
          break;
        // 过大处理
        case pageX >= left + width:
          $state.values[index] = $props.max;
          break;
        // 普通滑动
        case pageX >= left:
          $state.values[index] = target;
          break;
        // 过小处理
        default:
          $state.values[index] = $props.min;
      }

      // 赋值完毕才取值
      const extract = $state.values.slice(0, $props.solo ? 1 : $state.values.length);
	  console.log('extract===',extract)
      // 防抖过程
      _blockDebounceTimer && clearTimeout(_blockDebounceTimer);
      _blockDebounceTimer = setTimeout(() => {
        if ($props.hintMode && ["toast"].includes($props.hintMode)) {
          uni.showToast({
            title: `当前值: ${extract}`,
            icon: "none"
          });
        }
        $emits("change", toRaw(extract));
      }, 200) as unknown as number;
      $emits("update:modelValue", extract);
      $emits("move", toRaw(extract));
    }
  }

  function getPercent(
    higher: number, lower: number = 0,
    total = $props.max - $props.min
  ) {
    return (higher - lower) / total * 100;
  }

  function reset() {
    $state.values = [$props.min, $props.max];
  }

  async function execute() {
	  console.log('getRect===============sie')
    $state.rect = await getRect("#sliderRange", $refs.self);

    if ($props.modelValue && Array.isArray($props.modelValue) && $props.modelValue.length >= 1) {
      $state.values = $props.modelValue;
    }
	console.log("$state.values",$state.values)
    $emits("update:modelValue", $state.values);
  }

  onMounted(execute);

  return {
    $state, sliderRangeStyle,
    sliderBlockCtx, blockEvent, reset
  };
}

// 获取DOM元素矩形宽高
export function getRect(target: string, range?: unknown) {
	console.log('rang===',range,target)
  return new Promise<NodeInfo>((resolve) => {
    uni
      .createSelectorQuery()
      .in(range)
      .select(target)
      .boundingClientRect((size) => {
		console.log("size==================",size)
        resolve(size as NodeInfo);
      })
      .exec();
  });
}
