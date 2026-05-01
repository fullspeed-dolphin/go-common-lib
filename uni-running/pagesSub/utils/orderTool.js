export function isUnder14(idCard) {
  // 基础校验：必须是18位
  if (!idCard || idCard.length !== 18) {
    throw new Error('请输入有效的18位身份证号码');
  }

  // 提取出生年月日（第7到14位）
  const birthStr = idCard.substring(6, 14);
  const year = parseInt(birthStr.substring(0, 4), 10);
  const month = parseInt(birthStr.substring(4, 6), 10) - 1; // JS 月份是 0-11
  const day = parseInt(birthStr.substring(6, 8), 10);

  const birthDate = new Date(year, month, day);

  // 校验日期是否有效（防止如 20209999 这种非法日期）
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month ||
    birthDate.getDate() !== day
  ) {
    throw new Error('身份证号码中的出生日期无效');
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // 如果还没过生日，减一岁
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age <= 14;
}

export const wxPay = (respay) => {
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
        if (respay.success) {
          return respay.success();
        }
				setTimeout(() => {
					// uni.navigateBack()
					// uni.$u.route("pagesSub/orderSuccess?order_no=" + respay.order_no);
					
					uni.navigateTo({
					  url: "/pagesSub/orderSuccess?order_no=" + respay.order_no
					});
				}, 300);
			},
			fail: (res) => {
        if (respay.fail) {
          return respay.fail();
        }

				uni.hideLoading();
				console.log("res======>", res);
				uni.$u.toast("支付未完成");
				setTimeout(() => {
					// uni.navigateBack()
					// uni.$u.route("pagesSub/orderFail?order_no=" + respay.order_no);
					
					uni.navigateTo({
					  url: "/pagesSub/orderFail?order_no=" + respay.order_no
					});
				}, 300);
			},
		});
	};


export function formatPackageCapacity(data) {
  const result = {};

  data.capacity.forEach(item => {
    result[item.package] = {
      capacity: item.capacity,
      capacity_used: 0 // 默认值，后续覆盖
    };
  });

  data.capacity_used.forEach(item => {
    if (result.hasOwnProperty(item.package)) {
      result[item.package].capacity_used = item.capacity_used;
    } else {
      // 如果 capacity 中没有这个 package，也可以选择创建它（按需）
      result[item.package] = {
        capacity: 0,
        capacity_used: item.capacity_used
      };
    }
  });

  return result;
}

export function getPackageData(tickets, res_capacity) {
  // 处理套餐数据
  let packageCapacityMap = {};
  if (res_capacity?.mode === 'package') {
    packageCapacityMap = formatPackageCapacity(res_capacity);
  }

  let packageData = [];
  tickets?.forEach((ticket) => {
    Object.keys(ticket?.price || {}).forEach((i) => {
      const priceValue = ticket?.price[i];

      // 判断是新格式还是旧格式
      let itemData = {};
      if (typeof priceValue === 'object' && priceValue !== null) {
        // 新格式：带容量限制, 会 demisen capacity 和 capacity_used 字段
        let capacity = priceValue?.capacity;
        let capacityUsed = priceValue?.capacity_used;

        // 如果是按套餐限制容量，从 packageCapacityMap 中获取
        if (res_capacity?.mode === 'package') {
          capacity = packageCapacityMap[i].capacity;
          capacityUsed = packageCapacityMap[i].capacity_used;
        }

        // 判断是否已满：capacity_used >= capacity（只有两者都不为 null 时才判断）
        const isFull = capacityUsed && capacity && capacityUsed >= capacity;

        itemData = {
          ...priceValue,
          price: priceValue.price,
          label: i,
          capacity: capacity,
          capacityUsed: capacityUsed,
          isFull: isFull,
          isToggle: false,

          isMutliGroup: priceValue.signers > 1,  // 是否是多人组
          groups: [],
          maxGroups: priceValue.max_groups || 20,  // 最多N个组，默认20
          groupSize: priceValue.signers  // 单个组报名人数
        };

        console.log(`套餐 ${i}: 容量 ${capacityUsed}/${capacity}, 已满: ${isFull}`);
      } else {
        // 旧格式：直接是数字
        itemData = {
          price: priceValue,
          label: i,
          isFull: false, // 旧格式默认不限制
        };
      }

      packageData.push(itemData);
    });
  });
  console.log("packageData======>", packageData)
  return packageData;
			
}

// 从身份证号码解析出生日期
export	const parseBirthDateFromIdCard = (idCard) => {
		if (!idCard || idCard.length !== 18) return null;
		const birthStr = idCard.substring(6, 14); // YYYYMMDD
		const year = parseInt(birthStr.substring(0, 4));
		const month = parseInt(birthStr.substring(4, 6));
		const day = parseInt(birthStr.substring(6, 8));
		return new Date(year, month - 1, day);
	};

	// 从身份证号码解析性别 (第17位,奇数为男,偶数为女)
export	const parseGenderFromIdCard = (idCard) => {
		if (!idCard || idCard.length !== 18) return null;
		const genderCode = parseInt(idCard.charAt(16));
		return genderCode % 2 === 1 ? '男' : '女';
	};