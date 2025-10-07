<template>
	<view class="flex1">
		<!-- <u-cell :title="title" :required="required" :border="false"> -->
			<u-upload :fileList="fileList" :file-mediatype="accept" :maxCount="maxCount" :mode="mode" @afterRead="afterRead"
				@delete="deleteFile" :auto-upload="false" :disabled="readonly"
				:disable-preview="disablePreview" :deletable="deletable" @fail="fail" />
		<!-- </u-cell> -->
	</view>
</template>
<script>
	import {
		asyncAlls
	} from "@/utils/util.js";
	import {
		baseLink
	} from "@/utils/config.js";
	export default {
		options: {
			styleIsolation: "shared",
		},
		props: {
			title: {
				type: String,
				default: "",
			},
			required: {
				type: Boolean,
				default: false,
			},
			customClass: {
				type: String,
				default: "",
			},
			value: [String, Object, Array],
			capture: {
				type: Array,
				default () {
					return ["album", "camera"];
				},
			},
			accept: {
				type: String,
				default: "image",
			},
			mode: {
				type: String,
				default: "grid",
			},
			imageStyles: {
				type: Object,
				default () {
					return {
						width: 90,
						height: 90,
						border: {
							radius: "8",
						},
					};
				},
			},
			maxCount: {
				type: Number | String,
				default: 1,
			},
			readonly: {
				type: Boolean,
				default: false,
			},
			disablePreview: {
				type: Boolean,
				default: false,
			},
			deletable: {
				type: Boolean,
				default: true,
			},
		},

		data() {
			return {
				fileList: [],
				fileTempList: [],
			};
		},
		watch: {
			value: {
				handler(val) {
					if (val) {
						let temp = 1;
						// 首先将值转为数组
						const list = Array.isArray(val) ? val : this.value.split(",");
						// 然后将数组转为对象数组
						this.fileList = list.map((item) => {
							if (typeof item === "string") {
								item = {
									name: item,
									url: item,
									extname: ""
								};
							}
							item.uid = item.uid || new Date().getTime() + temp++;
							return item;
						});
					} else {
						this.fileList = [];
						return [];
					}
				},
				deep: true,
				immediate: true,
			},
		},
		methods: {
			// 删除文件
			deleteFile(event) {
				const index = this.fileList.findIndex((i) => i === event.tempFilePath);
				this.fileList.splice(index, 1);
				this.$emit("input", this.listToString(this.fileList));
			},
			async afterRead(event) {
				console.log("event", event)
				uni.showLoading({
					mask: true,
					title: "上传图片中"
				});
				const promiseList = [event].map((item) =>
					this.uploadFile(item.file)
				);

				try {
					
					const tempFile = await asyncAlls(promiseList);
					
					console.log("promiseList=====>", tempFile)
					
					const temp = tempFile.filter((i) => !!i);
					if (!temp.length) {
						this.fileList = [];
						uni.hideLoading();
						return;
					}
					const tempList = tempFile.map((item) => ({
						name: item,
						url: item,
						extname: "png",
					}));
					
					this.fileList = [...this.fileList, ...tempList];
					
					console.log("this.fileList===========>", this.fileList);
					uni.hideLoading();
					this.$emit("input", this.listToString(this.fileList));
				} catch (e) {
					console.error(e)
				}
			},
			// 对象转成指定字符串分隔
			listToString(list, separator) {
				let strs = "";
				separator = separator || ",";
				for (const i in list) {
					// strs += list[i].url.replace(this.baseUrl, '') + separator
					strs += list[i].url + separator;
				}

				return strs != "" ? strs.substr(0, strs.length - 1) : "";
			},
			compressImage(src) {
				return new Promise((resolve) => {
					uni.compressImage({
						src,
						width: 750,
						height: "auto",
						quality: 80,
						success: (res) => {
							resolve(res.tempFilePath);
							console.log(res.tempFilePath);
						},
						fail(e) {
							console.error(e)
						}
					});
				});
			},
			async uploadFile(file) {
				console.log("file=====>", file)
				const filePath = await this.compressImage(file.url);
				console.log("file=====>", filePath)
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: baseLink + `/basic-service/image/upload`,
						filePath: filePath,
						name: "image",
						header: {
							Authorization: uni.getStorageSync('token'),
							'content-type': 'application/json',
						},
						success(res) {
							res = JSON.parse(res.data);
							if (res.data.url) {
								return resolve(res.data.url);
							} else {
								uni.showToast({
									icon: "none",
									title: res.msg || "上传失败",
								});
							}
						},
						fail(e) {
							return resolve("");

							uni.showToast({
								icon: "none",
								title: "上传失败",
							});

							console.error(e);
							reject(e);
						},
					});
				});
			},
		},
	};
</script>

<style lang="scss">
	.flex1{
		flex:1;
	}
	::v-deep{
		.u-upload__deletable{
			width: 18px!important;
			height: 18px!important;
		}
	}
</style>