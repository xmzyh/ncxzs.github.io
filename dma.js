// 配置车主信息车主的UID数组
        const wxpusherUIDs = {
            "皖SN6352": ['UID_10gq26e5DEdsMIjlHFuPNW3dAmD9'],
            "测试": ['']
        }; 
//车牌号填写位置 对应手机号填写位置
        const phoneNumbers = {
            "皖SN6352": "15665410590",
            "测试": "16666666666"
        };            
  // Wxpusher APP Token
  const wxpusherAppToken = 'AT_FggIqEWlvf7Nuw0SM8G9M1A1zzq2yn2o';
 // 违禁词列表 
  const forbiddenWords = [
   "操你",
   "操你妈",
   "你妈",
   "你他妈",
   "妈的",
    "去死",
    "死",
    "傻逼",
    "畜生",
    "猪",
    "狗",
    "垃圾",
    "有病",
    "神经病",
    "乡里别",
    "恶心",
    "闭嘴",
    "别废话",
    "广告",       // 广告相关词汇
    "推广",       // 广告相关词汇
    "优惠",       // 广告相关词汇
    "免费",       // 广告相关词汇
    "点击",       // 广告相关词汇
    "注册",       // 广告相关词汇
    "赚钱",       // 广告相关词汇
    "代理",       // 广告相关词汇
    "转发",       // 广告相关词汇
    "信息",       // 广告相关词汇
    "活动",       // 广告相关词汇
    "购买",       // 广告相关词汇
    "服务",       // 广告相关词汇
    "宣传",       // 广告相关词汇
    "营销",       // 广告相关词汇
    "网站",       // 广告相关词汇
    "链接",       // 广告相关词汇
    "折扣",       // 与折扣相关的词汇
    "特价",       // 与折扣相关的词汇
    "优惠券",     // 与折扣相关的词汇
    "促销",       // 与折扣相关的词汇
    "打折",       // 与折扣相关的词汇
    "保单",       // 与保险相关的词汇
    "理赔",       // 与保险相关的词汇
    "投保",       // 与保险相关的词汇
    "保险公司",   // 与保险相关的词汇
    "车险",       // 与保险相关的词汇
    "意外险",     // 与保险相关的词汇
    "医疗险"      // 与保险相关的词汇
	]; 
    const maxNotificationsPerHour = 5; // 每小时最多发送通知次数
    const intervalTime = 2 * 1000; // 每次通知间隔时间45秒
    let currentUIDs = [];
    let currentPhone = '';

// 获取本地存储的发送次数和时间戳
let notificationCount = 0; // 当前小时内的发送次数
let lastNotificationTime = 0; // 上次发送通知的时间戳（当前小时内的）
let hourStartTime = new Date().setHours(new Date().getHours(), 0, 0, 0); // 当前小时的开始时间戳
let timeUntilReset = 0; // 剩余时间直到重置（以毫秒为单位）
 let countdownInterval;  // 用来存储倒计时的定时器

//车牌框代码
   function checkLicensePlate() {
            const licensePlate = document.getElementById('licensePlateInput').value.trim().toUpperCase();
            if (wxpusherUIDs[licensePlate]) {
                currentUIDs = wxpusherUIDs[licensePlate];
                currentPhone = phoneNumbers[licensePlate];
                document.getElementById('inputContainer').style.display = 'none';
                document.getElementById('notificationContainer').style.display = 'block';
            } else {
                document.getElementById('errorMessage').style.display = 'block';
            }
        }

// 更新发送次数显示
function updateNotificationCountDisplay() {
    const displayElement = document.getElementById("notificationCountDisplay");
    displayElement.textContent = `已发送微信通知次数：${notificationCount}/${maxNotificationsPerHour}`;
}

// 更新剩余时间显示
function updateTimeUntilReset() {
    const resetElement = document.getElementById("timeUntilReset");
    const currentTime = new Date().getTime();
    const nextHourStartTime = hourStartTime + 3600 * 1000;
    timeUntilReset = nextHourStartTime - currentTime;
    const minutesUntilReset = Math.floor(timeUntilReset / (1000 * 60));
    const secondsUntilReset = Math.floor((timeUntilReset % (1000 * 60)) / 1000);
    resetElement.textContent = `距下时段微信通知次数恢复剩余: ${minutesUntilReset}分钟${secondsUntilReset}秒`;
}
  
    // 更新通知字符数
    function updateCharCount() {
        const message = document.getElementById("messageInput").value;
        const count = message.length;
        document.getElementById("charCount").textContent = `${count}/50字`;
    }

// 使用选择的模板内容更新消息框
function useTemplateFromSelect() {
    const template = document.getElementById("messageTemplate").value;
    const messageInput = document.getElementById("messageInput");
    
    if (template) {
        messageInput.value = template;  // 更新消息框内容
        updateCharCount();  // 更新字符数
    }
}
  
// 检查通知违禁词
    function containsForbiddenWords(message) {
        return forbiddenWords.some(word => message.includes(word));
    }

// 发送通知的函数
function notifyOwner() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();  // 获取并去除前后空格

    // 如果消息为空，则提示用户填写内容
    if (!message) {
        alert("通知发送失败，请选择模板或输入通知内容。");
        return;
    }
    
    // 检查网络连接
    if (!navigator.onLine) {
        alert("通知发送出错，请检查您的网络连接。");
        return;
    }

    // 违禁词检查
    if (containsForbiddenWords(message)) {
        alert("通知内容包含违禁词，无法发送");
        return;
    }

    // 通知发送频率限制（每小时）
    const currentTime = new Date().getTime();
    if (currentTime < hourStartTime + 3600 * 1000) { // 确保在当前小时内
        if (currentTime - lastNotificationTime < intervalTime) {
            const remainingTime = Math.ceil((intervalTime - (currentTime - lastNotificationTime)) / 1000);
            alert(`请等待 ${remainingTime} 秒后再发送通知。`);
            return;
        }

        // 更新发送次数和时间戳
        notificationCount++;
        lastNotificationTime = currentTime;
        if (notificationCount > maxNotificationsPerHour) {
            notificationCount = maxNotificationsPerHour; // 防止超过最大次数
        }
        localStorage.setItem('notificationCount', notificationCount);
        localStorage.setItem('lastNotificationTime', lastNotificationTime);
        localStorage.setItem('hourStartTime', hourStartTime); // 存储当前小时的开始时间，用于重置
    } else {
        // 新的一小时开始，重置发送次数和时间戳
        notificationCount = 1;
        lastNotificationTime = currentTime;
        hourStartTime = currentTime - (currentTime % 3600 * 1000) + 3600 * 1000 - intervalTime; // 确保下一次发送不会立即触发（减去间隔时间）
        localStorage.setItem('notificationCount', notificationCount);
        localStorage.setItem('lastNotificationTime', lastNotificationTime);
        localStorage.setItem('hourStartTime', hourStartTime);
    }

    // 更新发送次数显示
    updateNotificationCountDisplay();

    // 页面加载完成后或发送通知后更新剩余时间
    updateTimeUntilReset();

    // 禁用通知按钮并开始倒计时
    const notifyBtn = document.getElementById("notifyBtn");
    notifyBtn.classList.add("disabled");  // Add disabled class for opacity mask
    let countdownTime = 45;
    notifyBtn.innerHTML = `剩余 <span>${countdownTime}</span> 秒可重发`;

    countdownInterval = setInterval(() => {
        countdownTime--;
        notifyBtn.querySelector('span').textContent = countdownTime;  // Update countdown time
  
      // 保存倒计时剩余时间到localStorage
        localStorage.setItem('countdownTime', countdownTime);
        
        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            notifyBtn.classList.remove("disabled");  // Remove the disabled class after countdown ends
            notifyBtn.innerHTML = "微信通知车主📱";  // 恢复按钮文本
        }
    }, 1000);

    // 如果网络可用，继续发送通知逻辑
    fetch("https://wxpusher.zjiecode.com/api/send/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            appToken: wxpusherAppToken,
            content: message,
            uids: currentUIDs
        })
    }).then(response => response.json())
    .then(data => {
        if (data.code === 1000) {
            alert("通知已送达，请耐心等待车主。");
            // 编辑框重置为空白
            document.getElementById("messageInput").value = '';
            updateCharCount();
            document.getElementById("messageTemplate").value = '';
        }
    });

    // 检查是否达到显示电话号码的条件
    if (notificationCount >= maxNotificationsPerHour) {
        alert("本时段通知次数已用完，请滑动拨打车主电话。");
        document.getElementById("notifyBtn").style.display = "none"; // 达到指定次数后隐藏发送信息按钮
        document.getElementById("callSlider").style.display = "block"; // 发送通知后显示拨打电话按钮
    }
}
