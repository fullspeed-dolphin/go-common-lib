<template>
  <view>
		<section class="top-panel">
			<u-navbar :title="isShowTitle ? '全速运动' : ''" bgColor="transparent" placeholder></u-navbar>

			<div style="font-weight: bold;font-size: 55rpx;margin-top:70rpx;">全速运动</div>
			<view class="u-mt-20" style="line-height:62rpx">让运动成为每个人的生活方式</view>
			<view style="">线上+线下融合，打造全民运动嘉年华</view>
			<view class="flex-center" style="width: 157rpx;
height: 46rpx;
background: #FFFFFF;
margin-top: 50rpx;
color:#FF5C28;
font-size: 24rpx;
border-radius: 11rpx 11rpx 11rpx 11rpx;">
				<view class="iconfont icon-bofang"></view>
				立即体验
			</view>
		</section>
		
		<section class="tac" style="margin-top:40rpx;margin-bottom:40rpx;">
			<view style="font-weight: 800;font-size: 36rpx;">我们的服务</view>
			<view style="color:#7A8289;margin-top:20rpx;">为用户提供全方位的运动服务体验</view>
		</section>
		
		<section class="panel-1">
			<view class="img-box">
				<image src="./img/新对话5 1@2x.png" class="img" mode="aspectFill"></image>
			</view>
			<view class="name">跑团俱乐部</view>
			<view class="desc">
				为跑团而生，助力全国跑团发展，为跑团赋能，实现自动化管理。
			无论是新手入门、马拉松爱好者，还是亲子趣跑团，欢迎加入我
			们。		
			</view>
			<view class="flex-row flex-wrap u-mt-20" style="gap: 20rpx;">
				<view class="tag-item">自动化管理</view>
				<view class="tag-item">社群陪伴</view>
				<view class="tag-item">专业指导</view>
				<view class="tag-item">活动组织</view>
			</view>
		</section>
		
		<section class="panel-1">
			<view class="img-box" style="background:#155DFC">
				<image src="./img/生成清晰图标5 1@2x.png" class="img" mode="aspectFill"></image>
			</view>
			<view class="name">悦月跑</view>
			<view class="desc">线下欢乐跑，打造低门槛、高趣味、强氛围的全民赛事IP。个性
特色跑、亲子跑、情侣跑、宠物跑，运动是释放欢乐的载体。</view>
			<view class="flex-row flex-wrap u-mt-20" style="gap: 20rpx;">
				<view class="tag-item">低门槛参与</view>
				<view class="tag-item">高趣味体验</view>
				<view class="tag-item">多样化主题</view>
				<view class="tag-item">全民参与</view>
			</view>
		</section>
		
		<section class="panel-1">
			<view class="img-box" style="background:#00A63E">
				<image src="./img/生成清晰图标 6 1@2x.png" class="img" mode="aspectFill"></image>
			</view>
			<view class="name">线上主题跑</view>
			<view class="desc">突破时空限制，通过小程序参与各种创意活动。自主完成挑战，
获得专属电子勋章与实体完赛礼包，让仪式感无处不在。</view>
			<view class="flex-row flex-wrap u-mt-20" style="gap: 20rpx;">
				<view class="tag-item">文化探索</view>
				<view class="tag-item">创意主题</view>
				<view class="tag-item">电子勋章</view>
				<view class="tag-item">实体奖品</view>
			</view>
		</section>
		
		<section class="panel-1">
			<view class="img-box" style="background:#FF8C00">
				<image src="./img/生成清晰图标 (1)5 1@2x.png" class="img" mode="aspectFill"></image>
			</view>
			<view class="name">跑步去旅行</view>
			<view class="desc">结合各类运动主题，提供特色文旅服务。一站式报名、星城、住
宿、观光服务，让旅行融入体育，成为一场深度的文化探索。</view>
			<view class="flex-row flex-wrap u-mt-20" style="gap: 20rpx;">
				<view class="tag-item">文旅结合</view>
				<view class="tag-item">一站式服务</view>
				<view class="tag-item">深度体验</view>
				<view class="tag-item">文化探索</view>
			</view>
		</section>
		
		<section class="panel-1" style="padding-left:24rpx;">
			<view class="flex-col-center" style="width: 690rpx;margin: -30rpx 0 0 -24rpx;
height: 232rpx;
color:#fff;
background: linear-gradient( 90deg, #FF5722 0%, #D86968 20%, #B17093 40%, #8871B8 60%, #5A6BDA 80%, #155DFC 100%);
box-shadow: 0rpx 8rpx 9rpx 0rpx rgba(0,0,0,0.1);
border-radius: 13rpx 13rpx 13rpx 13rpx;">
				<view class="iconfont icon-aixin1 flex-center" style="width: 62rpx;
height: 62rpx;
color:#fff;
font-size: 28rpx;
background: rgba(255,255,255,0.2);
border-radius: 99rpx;"></view>
				<view style="font-weight: 800;margin-top:30rpx;margin-bottom:20rpx;
font-size: 36rpx;">关于我们-全速运动</view>
				<view>全速运动，不止于运动</view>
			</view>
			<view class="flex-row" style="margin-top:28rpx;">
				<view class="iconfont icon-baxin flex-center" style="width:28rpx;height:28rpx;font-size: 28rpx;color:#FF5722;"></view>
				<view style="margin-left:18rpx;">
					<view style="font-weight: 800;line-height: 36rpx;
font-size: 24rpx;">品牌愿景</view>
					<view class="u-mt-20" style="font-size:20rpx;color:#6C757D;">让运动成为每个人的生活方式</view>
				</view>
			</view>
			<view class="flex-row" style="margin-top:28rpx;">
				<view class="iconfont icon-diqiu flex-center" style="width:28rpx;height:28rpx;font-size: 28rpx;color:#155DFC;"></view>
				<view style="margin-left:18rpx;">
					<view style="font-weight: 800;line-height: 36rpx;
font-size: 24rpx;">核心使命</view>
					<view class="u-mt-20" style="font-size:20rpx;color:#6C757D;">助力全民健身，影响亿万人健康生活</view>
				</view>
			</view>
			
			<view style='width: 644rpx;
margin-top:40rpx; padding:20rpx;
background: #F8F9FA;
border-radius: 11rpx 11rpx 11rpx 11rpx;'>
				<view class="b">平台定位</view>
				<view style="color:#6C757D;font-size:24rpx;line-height:1.3;margin-top:20rpx;">我们是一站式运动服务平台，始于线下主题欢乐跑，却不止于单一跑步场景。以多元化运 动服务为载体，践行“助力全民健身，影响亿万人健康生活”的使命初心。为每一位运动爱 好者打造具趣味性与体验感的线下运动场景，搭建社群联动平台，让运动不在孤单。</view>
			</view>
		</section>
		
		<section class="panel-1" style="padding-left:18rpx;">
			<view class="flex-center gradient-text" style="font-size: 36rpx;font-weight: 600;margin: 20rpx 0 40rpx;">为什么选择全速运动</view>
			<view v-for="(item,index) in benifitList" :key="index" style="width: 653rpx;
min-height: 263rpx;
background: #F0F8FF;
margin: 28rpx 0;padding: 36rpx 42rpx;
border-radius: 47rpx 47rpx 47rpx 47rpx;">
				<view class="flex-start">
					<view class="flex-center" style="width: 35rpx;
height: 35rpx;color:#fff;font-size:27rpx;
background: #FF5722;
border-radius: 99px;">{{index + 1}}</view>
					<view style="font-weight: bold;font-size: 31rpx;margin-left:16rpx;">{{item.label}}</view>
				</view>
				<view style="line-height: 41rpx;color:#6C757D;margin-top:26rpx;">{{item.text}}</view>
			</view>
		</section>
		
		<view class="flex-center gradient-text" style="font-size: 36rpx;font-weight: 600;margin: 50rpx 0 30rpx;">诚挚邀请您加入</view>
		<view style="width: 550rpx;margin: 0 auto;fong-size:24rpx;text-align: center; line-height: 1.3;font-size: 24rpx;color:#6C757D;">
			联结彼此，全速向前。让我们一起，跑出健康，跑出欢乐，跑向更美好的生活。
		</view>
		<view class="flex-between-center" style="width:620rpx;margin:0 auto;padding-top:20rpx;font-weight:500;padding-bottom: 60rpx;">
			<view @click="phoneCall('13660717370')" class="flex-center" style="
font-size: 24rpx;color:#fff;padding: 10rpx 20rpx;
background: linear-gradient( 90deg, #FF5722 0%, #D86968 20%, #B17093 40%, #8871B8 60%, #5A6BDA 80%, #155DFC 100%);
border-radius: 10rpx 10rpx 10rpx 10rpx;
border: 1rpx solid rgba(0,0,0,0.05);">
				<view class="iconfont icon-dianhua flex-center" style="width:28rpx;height:28rpx;margin-right:10rpx;font-size: 28rpx;color:#fff;"></view>
				+86 13660717370
				</view>
			<view class="flex-center" style="
font-size: 24rpx;padding: 10rpx 20rpx;
background: #fff;
border-radius: 10rpx 10rpx 10rpx 10rpx;
border: 1rpx solid rgba(0,0,0,0.05);">
				<view class="iconfont icon-youxiang flex-center" style="margin-right:10rpx;width:28rpx;height:28rpx;font-size: 28rpx;color:#000;"></view>
				enterprise@speexpay.com
			</view>
		</view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad, onPageScroll } from '@dcloudio/uni-app'

const isShowTitle = ref(true);
let timer = null;
onPageScroll((e) => {
  isShowTitle.value = e.scrollTop < 30
});

const benifitList = ref([
	{
		label: '独特的“线上+线下”融合模式',
		text: '我们不是单一的线上平台，是以平台为服务中枢，连 接线下丰富的场景与参与者，实现线上参与、线下体 验、服务升级的完整闭环。'
	},
	{
		label: '深度的社群运营基因',
		text: '我们坚信“一个人可以跑得很快，但一群人才能跑得 更远”。我们通过精细化的运营，将用户从“参与者” 转变为“共建者”。'
	},
	{
		label: '专业的服务能力',
		text: '从活动策划执行到健康管理方案，从文旅资源整合到 人才对接，我们具备端到端的项目落地能力。能为政 府、企业、社区、景区提供定制化服务。'
	},
	{
		label: '科技赋能的人文体验',
		text: '使用数字化工具提升参与和管理效率，始终坚持有温度的服务。让每一份数据背后，都是对用户健康需求的关切；让每一次活动，都能建立难忘的情感连接。'
	},
])

function phoneCall(phoneNumber) {
	console.log("32")
	uni.makePhoneCall({
		phoneNumber: phoneNumber
	})
}
</script>

<style lang="scss" scoped>
.top-panel {
	width: 750rpx;
	min-height: 522rpx;
	padding-left: 66rpx;
	padding-bottom: 60rpx;
	color:#fff;
	background: linear-gradient( 71deg, #FF5722 0%, #FFBF00 50.48%, #FF8C00 100%);
	box-shadow: 0rpx 8rpx 10rpx 0rpx rgba(0,0,0,0.1);
	border-radius: 0rpx 0rpx 32rpx 32rpx;
}
.gradient-text {
  background: linear-gradient(to right, #FF5722, #D86968,#8871B8, #5A6BDA, #155DFC );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.panel-1{
	width: 688rpx;
	min-height: 360rpx;
	padding: 30rpx 34rpx;
	background: #FFFFFF;
	margin: 20rpx auto;
	box-shadow: 0rpx 16rpx 19rpx 0rpx rgba(0,0,0,0.08);
	border-radius: 27rpx 27rpx 27rpx 27rpx;
	.img-box{
		width: 94rpx;
		height: 94rpx;
		background: #FF5722;
		border-radius: 23rpx 23rpx 23rpx 23rpx;
		.img{
			width: 94rpx;
			height: 94rpx;
		}
	}
	.name{
		margin-top: 20rpx;
		font-weight: 800;
		font-size: 32rpx;
	}
	.desc{
		margin-top: 20rpx;
		color: #7A8289;
		line-height: 1.2;
	}
	.tag-item{
		min-width: 95rpx;
		min-height: 31rpx;
		padding: 10rpx 18rpx;
		font-size: 22rpx;
		background: #F5F5F5;
		font-weight: 500;
		border-radius: 16rpx 16rpx 16rpx 16rpx;
	}
}
</style>
