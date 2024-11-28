// 自定义Alert弹窗逻辑
window.alert = function(message) {
    // 获取自定义alert元素
    const customAlert = document.getElementById('customAlert');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertCloseBtn = document.getElementById('alertCloseBtn');

    // 设置弹窗内容
    alertTitle.textContent = "提示";
    alertMessage.textContent = message;

    // 显示弹窗
    customAlert.style.display = 'flex';

    // 关闭按钮的点击事件
    alertCloseBtn.onclick = function() {
        customAlert.style.display = 'none'; // 隐藏弹窗
    }

    // 关闭弹窗的功能也可以通过点击背景区域来实现
    customAlert.onclick = function(event) {
        if (event.target === customAlert) {
            customAlert.style.display = 'none'; // 隐藏弹窗
        }
    }
}
