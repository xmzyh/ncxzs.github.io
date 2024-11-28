// 立即执行函数，避免全局变量污染
(() => {
    // DOM元素引用
    const elements = {
         callSlider: document.getElementById('callSlider'),
        callHandle: document.getElementById('callHandle'),
        callProgress: document.getElementById('callProgress'),
        toastContainer: document.getElementById('toastContainer'),
        themeBtns: document.querySelectorAll('.theme-btn')
    };
  
    // 状态管理
    const state = {
        lastNotifyTime: 0,
        isDragging: false,
        startX: 0,
        currentX: 0,
        maxProgress: 0,
        notificationHistory: JSON.parse(localStorage.getItem('notificationHistory') || '[]')
    };

    // 触觉反馈功能
    const hapticFeedback = {
        light: () => navigator.vibrate?.(10),
        medium: () => navigator.vibrate?.(30),
        heavy: () => navigator.vibrate?.([50, 50, 50]),
        success: () => navigator.vibrate?.([50, 30, 50, 30, 50])
    };

    // 主题设置功能
    function setTheme(theme) {
        document.body.className = theme;
        elements.themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        localStorage.setItem('theme', theme);
        hapticFeedback.light();
    }
  
    // 滑块更新功能
    function updateSlider(clientX) {
        const rect = elements.callSlider.getBoundingClientRect();
        const maxX = rect.width - elements.callHandle.offsetWidth;
        state.currentX = Math.max(0, Math.min(maxX, clientX - rect.left - elements.callHandle.offsetWidth / 2));
        
        const progress = (state.currentX / maxX) * 100;
        
        if (progress > state.maxProgress) {
            state.maxProgress = progress;
            if (progress > 25 && progress < 90) {
                hapticFeedback.light();
            }
        }
        
	elements.callHandle.style.transform = `translateX(${state.currentX}px)`;
        elements.callProgress.style.width = `${progress}%`;

        if (progress > 90) {
            hapticFeedback.success();
            window.location.href = `tel:${currentPhone}`;  // 自动拨打电话
            setTimeout(resetSlider, 300);
        }
    }
  
    // 重置滑块状态
    function resetSlider() {
        elements.callHandle.style.transform = 'translateX(0)';
        elements.callProgress.style.width = '0';
        state.currentX = 0;
        state.isDragging = false;
        state.maxProgress = 0;
        hapticFeedback.medium();
    }

    // 结束拖动处理
    function endDrag() {
        if (!state.isDragging) return;
        state.isDragging = false;
        elements.callHandle.style.transition = 'transform 0.3s';
        elements.callProgress.style.transition = 'width 0.3s';
        resetSlider();
    }  

    // 初始化
    function init() {
        // 设置初始主题
        setTheme(localStorage.getItem('theme') || 'light');

             // 绑定事件监听器
        elements.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.dataset.theme));
        });

        // 触摸事件
        elements.callSlider.addEventListener('touchstart', (e) => {
            state.isDragging = true;
            state.startX = e.touches[0].clientX;
            elements.callHandle.style.transition = 'none';
            elements.callProgress.style.transition = 'none';
            hapticFeedback.light();
        }, { passive: true });

        elements.callSlider.addEventListener('touchmove', (e) => {
            if (!state.isDragging) return;
            e.preventDefault();
            updateSlider(e.touches[0].clientX);
        }, { passive: false });

        // 鼠标事件
        elements.callSlider.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.startX = e.clientX;
            elements.callHandle.style.transition = 'none';
            elements.callProgress.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            e.preventDefault();
            updateSlider(e.clientX);
        }, { passive: false });

        // 结束拖动事件
        ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(event => {
            document.addEventListener(event, endDrag, { passive: true });
        });

        document.addEventListener('touchmove', (e) => {
            if (state.isDragging) e.preventDefault();
        }, { passive: false });
    }

    // 启动应用
    init();
})();
