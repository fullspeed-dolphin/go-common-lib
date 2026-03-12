<template>
    <view class="info">
        <up-form :model="form" ref="uForm" :rules="formRules" labelPosition="left" labelWidth="80">

            <view class="card-section">
                <view class="title">参赛者信息</view>
                <view class="content">
                    <up-form-item label="真实姓名" prop="real_name" required>
                        <view class="flex-start">
                            <input v-model="form.real_name" class="u-input" @input="validateField('real_name')"
                                maxlength="50" placeholder-style="color: #64748B;" placeholder="请输入您的真实姓名" />
                        </view>
                    </up-form-item>
                    <up-form-item label="性别" prop="sex" required>
                        <view class="flex-start">
                            <input v-model="form.sex" class="u-input" @input="validateField('real_name')" maxlength="50"
                                placeholder-style="color: #64748B;" placeholder="请输入您的真实姓名" />
                        </view>
                    </up-form-item>
                    <up-form-item label="联系电话" prop="contact_number" required>
                        <view class="flex-start">
                            <input v-model="form.contact_number" class="u-input"
                                @input="validateField('contact_number')" maxlength="11"
                                placeholder-style="color: #64748B;" placeholder="请输入您的联系电话" />
                        </view>
                    </up-form-item>
                    <up-form-item label="证件类型" prop="cert_type" required>
                        <view class="flex-start">
                            <PickerCell v-model="form.cert_type" :border="false" @change="validateField('cert_type')"
                                :columns="cert_typeOptions" />
                        </view>
                    </up-form-item>

                    <up-form-item label="证件号码" prop="cert_number" required>
                        <view class="flex-start">
                            <input v-model="form.cert_number" class="u-input" @input="validateField('cert_number')"
                                maxlength="18" placeholder-style="color: #64748B;" placeholder="请输入您的证件号码" />
                        </view>
                    </up-form-item>
                    <up-form-item label="收货地址" prop="shipping_address" required>
                        <view class="flex-start">
                            <up-input v-model="form.shipping_address" border="none"
                                @change="validateField('shipping_address')" maxlength="100" placeholder="请输入您的收货地址">
                                <template #suffix>
                                    <view class="map-btn" @click="chooseAddress">
                                        <up-icon name="map-fill" size="36rpx" color="#ff5c5c" />
                                    </view>
                                </template>
                            </up-input>
                        </view>
                    </up-form-item>
                </view>
            </view>
            <view class="card-section ">
                <view class="content">
                    <view style="margin:0 32rpx">
                        <view class="tips">参赛项目（提交后不能修改）</view>
                        <u-radio-group v-model="radiovalue1" placement="column" @change="groupChange">
                            <u-radio :customStyle="{ marginBottom: '8px' }" v-for="(item, index) in radiolist1"
                                :key="index" :label="item.name" :name="item.name" @change="radioChange">
                            </u-radio>
                        </u-radio-group>
                    </view>
                </view>
            </view>
        </up-form>

        <view class="combo">
            <view class="title">
                <view>已选套餐：</view>
                <view class="txt">{{ currentCombo }}</view>
            </view>
            <view class="combo-content">
                <view class="combo-content_left">
                    <!-- <image></image> -->
                    <view class="img">
                        <u-image
                            :showLoading="true"
                            :src="imageSrc"
                            width="206rpx"
                            height="206rpx"
                            :lazy-load="true"
                        ></u-image>
                    </view>
                    <view class="name">套餐你懂东奥给你</view>
                    <view class="send">邮寄发放</view>
                </view>
                <view class="combo-content_right">
                    <view class="h3">套餐款式</view>
                    <view class="tag">
                        <view class="u-page__tag-item" v-for="(item, index) in comboType" :key="index">
                            <u-tag :text="item.text" :plain="!item.checked" type="warning" :name="index"
                                @click="comboTypeClick">
                            </u-tag>
                        </view>
                    </view>

                    <view class="h3">套餐尺寸</view>
                    <view class="tag">
                        <view class="u-page__tag-item" v-for="(item, index) in radios" :key="index">
                            <u-tag :text="item.text" :plain="!item.checked" type="warning" :name="index"
                                @click="radioClick">
                            </u-tag>
                        </view>

                    </view>

                </view>
            </view>
        </view>
        <!-- <section class="section-bottom" style="width: 682rpx;margin: 0rpx auto 40rpx;">
            <view class="txt flex-start">
                <up-checkbox shape="circle" activeColor="#8CC63E" v-model:checked="isAgree" :usedAlone="true"
                    :customStyle="{ marginRight: '-10rpx' }" size="32rpx" />
                <text @click="isAgree = !isAgree">
                    <text class="u-ml-5">我已阅读并同意该</text>
                </text>
                <text style="color: #ff8c00"
                    @click="$u.route('pagesDashboard/pkEvent/activeRule?type=disclaimer')">《免责声明》</text>
            </view>
        </section> -->

        <div style="height: 120rpx;"></div>
        <view class="submit-wrapper flex-between-center">
            <!-- <view class="" style="font-size: 24rpx;color: #6A7282;">
                应付金额
                <view class="u-mt-10" style="font-weight: bold;font-size: 40rpx;color: #ff5c5c;">
                    ￥{{packageList.find((item) => item.id === form.package_id)?.price || "0.00"}}
                </view>
            </view> -->
            <u-button type="primary" color="#ff5c5c" shape="circle"
                customStyle="width: 686rpx;height: 72rpx;margin:0;border-radius: 999rpx;" @click="submitForm()">
                <!-- {{props.teamID ? '加入战队并报名' : '立即报名'}} -->
                立即报名
            </u-button>
        </view>
    </view>
</template>
<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import FileUpload from "@/components/common/FileUpload.vue";
import PickerTime from "@/components/common/PickerTime.vue";
import PickerCell from "@/components/common/PickerCell.vue";
import request from "@/utils/request.js";

import { useStore } from "vuex";
const store = useStore();
const userInfo = computed(() => store.state.userInfo);

const uForm = ref(null);
const activetyId = ref("");

const isAgree = ref(false);
const props = defineProps({
    teamID: {
        type: String,
        default: ""
    }
});

const form = ref({
    real_name: "",
    sex: "",
    contact_number: "",
    shipping_address: "",
    package_id: "",
    cert_type: "",
    cert_number: ""
});

function validateField(propName) {
    uForm.value.validateField(propName, () => { }, "change");
}

const cert_typeOptions = [
    {
        label: "身份证",
        value: "CN_ID"
    },
    {
        label: "香港居民身份证",
        value: "HK_ID"
    },
    {
        label: "澳门居民身份证",
        value: "MA_ID"
    },
    {
        label: "港澳居民往来大陆通行证(回乡证)",
        value: "HK_MA_PASS"
    },
];
const imageSrc = ref("https://uviewui.com/album/1.jpg");
const radiovalue1 = ref("3.14公里");
const radiolist1 = ref([{
    name: '3.14公里',
    disabled: false
},
{
    name: '5.20公里',
    disabled: false
},
]
)
const comboType = ref([{
    checked: true,
    text: "男款"
},
{
    checked: false,
    text: "女款"
}])
const radios = ref([
    {
        checked: true,
        text: "XS"
    },
    {
        checked: false,
        text: "S"
    },
    {
        checked: false,
        text: "M"
    },
    {
        checked: false,
        text: "XM"
    },
    {
        checked: false,
        text: "L"
    },
    {
        checked: false,
        text: "XL"
    },
    {
        checked: false,
        text: "2XL"
    },
    {
        checked: false,
        text: "3XL"
    },
    {
        checked: false,
        text: "4XL"
    },
    {
        checked: false,
        text: "5XL"
    },
])
const currentCombo = ref("套餐"); // 当前选中的套餐
// 选择尺码
const radioClick = (name) => {
    radios.value.map((item, index) => {
        item.checked = index === name ? true : false;
    });
}
//   选择款式
const comboTypeClick = (name) => {
    comboType.value.map((item, index) => {
        item.checked = index === name ? true : false;
    });
}
const formRules = ref({
    real_name: [
        {
            required: true,
            message: "必填项",
            trigger: ["blur", "change"],
        },
    ],
    sex: [
        {
            required: true,
            message: "必填项",
            trigger: ["blur", "change"],
        },
    ],
    contact_number: [
        {
            required: true,
            message: "请输入手机号码",
            trigger: ["blur", "change"],
        },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入正确的手机号码",
            trigger: ["blur", "change"],
        },
    ],
    shipping_address: [
        {
            required: true,
            message: "必填项",
            trigger: ["blur", "change"],
        },
    ],
    cert_type: [
        {
            required: true,
            message: "必填项",
            trigger: ["blur", "change"],
        },
    ],
    cert_number: [
        {
            required: true,
            message: "必填项",
            trigger: ["blur", "change"],
        },
        {
            pattern: /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/,
            message: "请输入正确的身份证号码",
            trigger: ["blur", "change"],
        },
    ],
    package_id: [
        {
            required: true,
            message: "请选择套餐",
            trigger: ["blur", "change"],
        },
    ],
});

watch(
    () => form.value.cert_type,
    () => {
        formRules.value.cert_number = [
            {
                required: true,
                message: "必填项",
                trigger: ["blur", "change"],
            },
            {
                validator: (rule, value, callback) => {
                    const type = form.value.cert_type;
                    const typeMapping = {
                        CN_ID: "idCard",
                        HK_ID: "isValidHKId",
                        MA_ID: "isValidMacauId",
                        HK_MA_PASS: "isValidExitPermit",
                    };
                    const validatorFuncName = typeMapping[type];
                    if (!validatorFuncName) {
                        callback(new Error("未知的证件类型"));
                        return;
                    }
                    const validatorFunc = uni.$u.test[validatorFuncName];
                    return validatorFunc(value);
                },
                message: "请输入正确的证件号码",
                trigger: ["blur", "change"],
            },
        ];
    }
);
// 获取套餐列表
const packageList = ref([]);
const getPackageList = () => {
    const data = {
        event_id: activetyId.value,
    };
    request.get(`/event-api/online_events_packages`, data).then((res) => {
        packageList.value = res;
        const package_id = res.find((i) => i.is_recommended)?.id || "";
        changePackage(package_id);
    });
};
// 页面加载
onLoad((options) => {
    console.log("option", options);
    // activetyId.value = options.id;
    activetyId.value = options.eventId || options.id;
    // 套餐列表
    getPackageList();
});

const submitForm = () => {
    uForm.value.validate().then((res) => {
        if (!isAgree.value) return uni.$u.toast('请查阅并勾选免责声明~');

        // 如果传入 teamID，说明先需要进入战队后报名活动
        if (props.teamID) {
            // 加入战队
            joinTeamAPi()
            return false
        }

        // 报名活动
        const data = {
            ...form.value,
            event_id: activetyId.value,
        };

        uni.showLoading({
            mask: true,
        });

        request.post("/booking-api/online_events/registration", data).then(async (res) => {
            // 检测到某个package的price为0的情况下，调用此接口，不要走支付接口
            const isFree = packageList.value.find((i) => i.id === form.value.package_id)?.price === 0;
            if (isFree) {
                freeToPay(res.reg_no);
            } else {
                payOrder(res.reg_no);
            }
        });
    });
};

//加入战队
function joinTeamAPi(item) {
    console.log("joinTeamAPi", item);
    uni.showLoading({ mask: true });
    request
        .post("/event-api/online_events_team/join", {
            event_id: activetyId.value,
            team_id: props.teamID,
        })
        .then(() => {
            getUserStatus();
            // uni.$u.toast("成功加入战队, 准备跳转到活动报名页...", 2000, function success() {
            // 	goToSignEvent();
            // });
            const data = {
                ...form.value,
                event_id: activetyId.value,
            };

            uni.showLoading({
                mask: true,
            });

            request.post("/booking-api/online_events/registration", data).then(async (res) => {
                // 检测到某个package的price为0的情况下，调用此接口，不要走支付接口
                const isFree = packageList.value.find((i) => i.id === form.value.package_id)?.price === 0;
                if (isFree) {
                    freeToPay(res.reg_no);
                } else {
                    payOrder(res.reg_no);
                }
            });
        })
        .catch((e) => {
            console.log("e", e);
        });
}
const userStatusInfo = ref({});
function getUserStatus() {
    request
        .get(
            "/event-api/online_events_team/user_status?event_id=" + activetyId.value
        )
        .then((res) => {
            console.log("userStatus", res);
            userStatusInfo.value = res;
        });
}

function changePackage(id) {
    form.value.package_id = id;
}

const isFreePackage = computed(() => {
    const pkg = packageList.value.find(i => i.id === form.value.package_id);
    return pkg?.price === 0;
});

function chooseAddress() {
    uni.chooseLocation({
        success: (res) => {
            const addr = res.address || '';
            const name = res.name || '';

            if (addr) {
                form.value.shipping_address = addr.includes(name) ? addr : addr + ' ' + name;
                validateField('shipping_address');
            } else if (res.latitude && res.longitude) {
                // address 为空，用高德逆地理编码 REST API 获取完整地址
                wx.request({
                    url: 'https://restapi.amap.com/v3/geocode/regeo',
                    data: {
                        key: '86473c6f37b174b14803c2c118c4ab62',
                        location: `${res.longitude},${res.latitude}`,
                    },
                    success: (apiRes) => {
                        const regeoAddr = apiRes.data?.regeocode?.formatted_address || '';
                        form.value.shipping_address = regeoAddr ? regeoAddr + ' ' + name : name;
                        validateField('shipping_address');
                    },
                    fail: () => {
                        form.value.shipping_address = name;
                        validateField('shipping_address');
                    }
                });
            } else {
                form.value.shipping_address = name;
                validateField('shipping_address');
            }
        },
    });
}

const payOrder = async (reg_no) => {
    const data = {
        reg_no,
        event_id: activetyId.value,
        openid: userInfo.value.openid,
        order_type: 'online_events'
    };

    uni.showLoading({
        mask: true,
    });

    request.post(`/pay/wechat/payment`, data).then((res) => {
        wxPay(res);
    });
};

function freeToPay(reg_no) {
    const data = {
        reg_no,
        event_id: activetyId.value,
        status: "SUCC"
    };
    request.post(`/booking-api/online_events/registration/status`, data).then(() => {
        uni.hideLoading();
        uni.$u.toast("报名成功");
        setTimeout(() => {
            uni.navigateBack();
        }, 300);
    });
}

function wxPay(respay) {
    // 触发微信支付
    wx.requestPayment({
        timeStamp: respay.timeStamp,
        nonceStr: respay.nonceStr,
        package: respay.package,
        signType: respay.signType,
        paySign: respay.paySign,
        success: (res) => {
            uni.hideLoading();
            uni.$u.toast("支付成功");
            setTimeout(() => {
                uni.navigateBack()
                // uni.$u.route("pagesSub/orderSuccess?order_no=" + respay.order_no);
            }, 300);
        },
        fail: (res) => {
            uni.hideLoading();
            console.log("res======>", res);
            uni.$u.toast("支付未完成");
            setTimeout(() => {
                // uni.navigateBack()
                // uni.$u.route("pagesSub/orderFail?order_no=" + respay.order_no);
            }, 300);
        },
    });
}
</script>

<style lang="less" scoped>
.info {
    background: #F7F8F8;
    // padding:32rpx;
}

.input-wrap {
    height: 100rpx;
    padding-left: 30rpx;
    border-radius: 16rpx 16rpx 16rpx 16rpx;
    border: 2rpx solid #e2e8f0;
}

.map-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    border-radius: 12rpx;
    border: 2rpx solid #e2e8f0;
    background: #fafafa;
    margin-right: 10rpx;
}

.package-item {
    width: 686rpx;
    min-height: 222rpx;
    padding: 42rpx 20rpx 32rpx 34rpx;
    background: #ffffff;
    border-radius: 32rpx 32rpx 32rpx 32rpx;
    border: 2rpx solid #e2e8f0;
    margin-bottom: 20rpx;
    position: relative;

    .recommended-tag {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        background: #ff5c5c;
        color: #fff;
        font-size: 24rpx;
        padding: 4rpx 16rpx;
        border-radius: 16rpx 16rpx 16rpx 16rpx;
    }

    .package-image {
        flex-shrink: 0;
        width: 80rpx;
        height: 80rpx;
        background: #f3f4f6;
        border-radius: 32rpx 32rpx 32rpx 32rpx;
        margin-right: 26rpx;
        font-size: 40rpx;
        font-weight: 500;
    }

    .name {
        font-weight: 500;
        line-height: 48rpx;
        font-size: 32rpx;
        color: #101828;
    }

    .target {
        line-height: 48rpx;
        font-size: 32rpx;
        color: #ff5c5c;
        font-weight: 500;
        margin-bottom: 10rpx;
    }

    &.active {
        background: #fff1f2;
        border: 2rpx solid #ff5c5c;

        .iconfont {
            background: #fff;
            color: #ff5c5c;
        }
    }

    .txt {
        color: #929dae;
        font-size: 24rpx;
        line-height: 1.2;
    }
}

.cert_type-line {
    padding-right: 20rpx;

    ::v-deep {
        .u-cell {
            width: 630rpx;
        }

        .u-cell__body__content {
            display: none;
        }

        .u-cell__value {
            flex: 1;
            text-align: left;
            margin-left: 0;
        }
    }
}

// 卡片通用样式
.card-section {
    padding: 0 32rpx;

    .title {
        margin-top: 40rpx;
        margin-bottom: 10rpx;
        font-size: 28rpx;
        color: #aaa;
        padding-left: 22rpx;
        line-height: 44rpx;
    }

    .content {
        width: 686rpx;
        background: #FFFFFF;
        border-radius: 16rpx 16rpx 16rpx 16rpx;
        border: 2rpx solid #E2E8F0;
        margin-bottom: 40rpx;

        .tips {
            border-bottom: 2rpx solid #F6F6F8;
            height: 78rpx;
            font-family: PingFang SC, PingFang SC;
            font-weight: 500;
            font-size: 28rpx;
            color: #323232;
            line-height: 78rpx;
            text-align: left;
            font-style: normal;
            text-transform: none;
        }

        ::v-deep {
            .u-radio {
                border-bottom: 2rpx solid #F6F6F8;
                padding: 24rpx 0;
                flex-direction: row-reverse;
                justify-content: space-between;
            }
        }
    }
}

::v-deep {
    .u-tag {

        width: 76rpx;
        height: 52rpx;
        background: #FFFFFF;
        border-radius: 0rpx 0rpx 0rpx 0rpx;
        border: none;
        text-align: center;
        justify-content: center;
        font-family: PingFang SC, PingFang SC;
        margin-right: 14rpx !important;
        margin-bottom: 20rpx;
        font-weight: 500;
        font-size: 24rpx;
        // color: #000000 !important;
        line-height: 36rpx;
        text-align: center;
        font-style: normal;
        text-transform: none;
        background: #FF5D5B;

        &.u-tag--warning--plain {
            background: #fff;
        }
        &.u-tag--medium {
            padding:0;
        }

        .u-tag__text--warning--plain {
            color: #000;
        }

    }
}

.combo {
    padding: 0 32rpx;

    .title {
        display: flex;
        height: 36rpx;
        font-family: PingFang SC, PingFang SC;
        font-weight: bold;
        font-size: 24rpx;
        color: #AAAAAA;
        line-height: 36rpx;
        text-align: left;
        font-style: normal;
        text-transform: none;
        margin: 44rpx 0;

        .txt {
            width: 210rpx;
            height: 44rpx;
            border-radius: 8rpx 8rpx 8rpx 8rpx;
            border: 1rpx solid #FF5D5B;
            font-family: PingFang SC, PingFang SC;
            font-weight: bold;
            font-size: 24rpx;
            color: #FF5D5B;
            line-height: 36rpx;
            text-align: center;
            font-style: normal;
            text-transform: none;
        }
    }

    .h3 {
        padding-left: 10rpx;
        height: 42rpx;
        font-family: PingFang SC, PingFang SC;
        font-weight: 500;
        font-size: 28rpx;
        color: #0F172A;
        line-height: 42rpx;
        text-align: left;
        font-style: normal;
        text-transform: none;
        position: relative;

        &:after {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 6rpx;
            height: 30rpx;
            background: #FF5D5B;
            border-radius: 3rpx;
            margin-top: -15rpx;
        }
    }
    .combo-content { 
        display: flex;
        flex-shrink: 0;
    }
    .combo-content_left {
        width: 206rpx;
        height: 330rpx;
        background: #FFFFFF;
        border-radius: 0rpx 0rpx 0rpx 0rpx;
        margin-right:30rpx;
        text-align: center;
        .img {
            width: 206rpx;
height: 206rpx;
background: #B0B0B0;
text-align: center;
        }
        .name {
            margin-left:18rpx;
            margin-right:44rpx;
            margin-top:18rpx;
            width: 144rpx;
            height: 42rpx;
            font-family: PingFang SC, PingFang SC;
            font-weight: bold;
            font-size: 28rpx;
            color: #000000;
            line-height: 42rpx;
            font-style: normal;
            text-transform: none;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .send {
            margin-left:18rpx;
            margin-top:12rpx;
            width: 96rpx;
            height: 36rpx;
            font-family: PingFang SC, PingFang SC;
            font-weight: 500;
            font-size: 24rpx;
            color: #FF5D5B;
            line-height: 36rpx;
            text-align: left;
            font-style: normal;
            text-transform: none;
        }
    }
    .combo-content_right {

        .tag {
            display: flex;
            flex-wrap: wrap;
            margin-top: 20rpx;
        }
    }
}

::v-deep {
    .u-form-item {
        border-bottom: 2rpx solid #F6F6F8;
        margin: 0 32rpx;
    }
}

// Logo 卡片特殊样式
.logo-card {
    padding: 40rpx 20rpx 30rpx;
    text-align: center;
}

.logo-hint {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
}

// 分组标题
.section-header {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.section-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
}

// 表单内容区
.section-content {
    padding: 0 32rpx;
}

// 提交按钮
.submit-wrapper {
    position: fixed;
    width: 100%;
    bottom: 0;
    padding: 20rpx 32rpx 40rpx;
    // box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

::v-deep {
    .u-form-item__body__left__content__required {
        top: 0 !important;
        left: -10rpx !important;
        font-size: 24px;
        // position: relative !important;
        // top: 0 !important;
        // left: 0 !important;
        // order: 1 !important;
        // margin-left: 4rpx !important;
    }

    .uni-input-placeholder {
        color: #C8C9CD !important;
    }

    .u-cell__right-icon-wrap {
        display: none;
    }

    .u-cell__value {
        text-align: left;
        margin-left: 0;
    }

    .u-cell__body {
        flex-direction: column;
        align-items: start;

    }

    .u-form-item__body__left__content__label {
        flex: none !important;
        padding-left: 26rpx;
        font-size: 30rpx;
    }

    .u-FileUploader {
        .u-upload__wrap {
            display: flex;
            justify-content: center;

            .u-upload__button {
                background: #fafafa;
                border-radius: 16rpx;
            }
        }
    }
}
</style>