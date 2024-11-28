// 对浏览器的UserAgent进行正则匹配，不含有微信独有标识的则为其他浏览器
    var useragent = navigator.userAgent;
    if (useragent.match(/MicroMessenger/i) != 'MicroMessenger') {
        // 这里警告框会阻塞当前页面继续加载
        alert('已禁止本次访问：您必须使用微信扫描二维码访问本页面！');
        // 以下代码是用javascript强行关闭当前页面
        var opened = window.open('about:blank', '_self');
        opened.opener = null;
        opened.close();
    }

// 页面加载完成后执行
window.addEventListener("load", function() {
    // 从localStorage获取数据（如果存在）
    const storedNotificationCount = parseInt(localStorage.getItem('notificationCount')) || 0;
    const storedLastNotificationTime = parseInt(localStorage.getItem('lastNotificationTime')) || 0;
    const storedHourStartTime = parseInt(localStorage.getItem('hourStartTime')) || new Date().setHours(new Date().getHours(), 0, 0, 0);
    const storedCountdownTime = parseInt(localStorage.getItem('countdownTime')) || 0; // 获取存储的倒计时

    // 初始化变量
    notificationCount = (new Date().getTime() < storedHourStartTime + 3600 * 1000) ? storedNotificationCount : 0; // 判断是否在同一小时内
    lastNotificationTime = storedLastNotificationTime;
    hourStartTime = new Date().setHours(new Date().getHours(), 0, 0, 0); // 当前小时的开始时间戳

    // 更新发送次数显示和剩余时间显示
    updateNotificationCountDisplay();
    updateTimeUntilReset();

    // 如果通知次数已用完，不在车牌输入界面提示
    if (notificationCount >= maxNotificationsPerHour) {
        document.getElementById("notifyBtn").style.display = "none"; // 隐藏发送通知按钮
        document.getElementById("callSlider").style.display = "block"; // 显示拨打电话滑块
    } else {
        document.getElementById("notifyBtn").style.display = "block"; // 显示发送通知按钮
        document.getElementById("callSlider").style.display = "none"; // 隐藏拨打电话滑块
    }

    // 如果倒计时时间存在，恢复倒计时
    if (storedCountdownTime > 0) {
        const notifyBtn = document.getElementById("notifyBtn");
        let countdownTime = storedCountdownTime;
        notifyBtn.classList.add("disabled");  // Add disabled class for opacity mask
        notifyBtn.innerHTML = `剩余 <span>${countdownTime}</span> 秒可重发`;

        countdownInterval = setInterval(() => {
            countdownTime--;
            notifyBtn.querySelector('span').textContent = countdownTime;  // Update countdown time
            localStorage.setItem('countdownTime', countdownTime); // 保存倒计时剩余时间到localStorage
            
            if (countdownTime <= 0) {
                clearInterval(countdownInterval);
                notifyBtn.classList.remove("disabled");  // Remove the disabled class after countdown ends
                notifyBtn.innerHTML = "微信通知车主📱";  // 恢复按钮文本
            }
        }, 1000);
    }

    // 设置一个定时器每秒更新剩余时间（可选，但推荐以实现实时更新）
    setInterval(updateTimeUntilReset, 1000);
});

function checkLicensePlate() {
    const licensePlate = document.getElementById('licensePlateInput').value.trim().toUpperCase();
    if (wxpusherUIDs[licensePlate]) {
        currentUIDs = wxpusherUIDs[licensePlate];
        currentPhone = phoneNumbers[licensePlate];
        document.getElementById('inputContainer').style.display = 'none';
        document.getElementById('notificationContainer').style.display = 'block';

 // 检查是否已用完通知次数
        if (notificationCount >= maxNotificationsPerHour) {
            alert("本时段通知次数已用完，请选择拨打车主电话。");
            document.getElementById("notifyBtn").style.display = "none"; // 隐藏发送通知按钮
            document.getElementById("callSlider").style.display = "block"; // 显示拨打电话滑块
        } else {
            document.getElementById("notifyBtn").style.display = "block"; // 显示发送通知按钮
            document.getElementById("callSlider").style.display = "none"; // 隐藏拨打电话滑块
        }
    } else {
        document.getElementById('errorMessage').style.display = 'block';
    }
}
