<template>
	<view class="input-cell bgf flex-start">
		<view class="u-input-label">
			{{label}}
		</view>
		<uvInput
			:value="value"
			:type="type"
			:fixed="fixed"
			:disabled="disabled"
			:disabledColor="disabledColor"
			:clearable="clearable"
			:password="password"
			:maxlength="maxlength"
			:placeholder="placeholder"
			:placeholderClass="placeholderClass"
			:placeholderStyle="placeholderStyle"
			:showWordLimit="showWordLimit"
			:confirmType="confirmType"
			:confirmHold="confirmHold"
			:holdKeyboard="holdKeyboard"
			:focus="focus"
			:autoBlur="autoBlur"
			:disableDefaultPadding="disableDefaultPadding"
			:cursor="cursor"
			:cursorSpacing="cursorSpacing"
			:selectionStart="selectionStart"
			:selectionEnd="selectionEnd"
			:adjustPosition="adjustPosition"
			:inputAlign="inputAlign"
			:fontSize="fontSize"
			:color="color"
			:prefixIcon="prefixIcon"
			:suffixIcon="suffixIcon"
			:suffixIconStyle="suffixIconStyle"
			:prefixIconStyle="prefixIconStyle"
			:border="border"
			:readonly="readonly"
			:shape="shape"
			:customStyle="customStyle"
			:formatter="formatter"
			:ignoreCompositionEvent="ignoreCompositionEvent"
			@focus="$emit('focus')"
			@blur="e => $emit('blur', e)"
			@keyboardheightchange="$emit('keyboardheightchange')"
			@change="e => $emit('change', e)"
			@input="e => $emit('input', e)"
			@confirm="e => $emit('confirm', e)"
			@clear="$emit('clear')"
			@click="$emit('click')"
		>
			<!-- #ifdef MP -->
			<slot name="prefix"></slot>
			<slot name="suffix"></slot>
			<!-- #endif -->
			<!-- #ifndef MP -->
			<template #prefix>
				<slot name="prefix"></slot>
			</template>
			<template #suffix>
				<slot name="suffix"></slot>
			</template>
			<!-- #endif -->
		</uvInput>
	</view>
</template>

<script>
	/**
	 * 此组件存在的理由是，在nvue下，u-input被uni-app官方占用了，u-input在nvue中相当于input组件
	 * 所以在nvue下，取名为u--input，内部其实还是u-input.vue，只不过做一层中转
	 */
	import uvInput from '../u-input/u-input.vue';
	import props from '../u-input/props.js'
	export default {
		name: 'u--input',
		mixins: [uni.$u.mpMixin, props, uni.$u.mixin],
		components: {
			uvInput
		},
	}
</script>
<style lang="scss">
	.input-cell{
		padding: 10px 15px;
	}
	.u-input-label {
	    -webkit-box-flex: 0;
	    -webkit-flex: none;
	    flex: none;
	    box-sizing: border-box;
	    // width: 6.2em;
	    // margin-right: 12px;
			font-size: 15px;
			color: #303133;
	    text-align: left;
	    word-wrap: break-word;
			line-height: 1;
			// margin-bottom: 8px;
	}
</style>