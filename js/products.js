// 获取元素
const container = document.querySelector('.products-grid');
const carouselContainer = document.querySelector('.carousel-container');
const cards = document.querySelectorAll('.product-card');
const cardWidth = cards[0].offsetWidth + 40; // 卡片宽度 + 两侧外边距
const totalCards = cards.length;
const scrollbarThumb = document.querySelector('.carousel-scrollbar-thumb');
const scrollbar = document.querySelector('.carousel-scrollbar');

// 自动滚动相关变量
let autoScrollInterval;
let isMouseOver = false;
const autoScrollSpeed = 1.5; // 滚动速度 (像素/帧)
let autoScrollPosition = 0;

// 复制卡片以实现无限循环效果
function setupInfiniteCarousel() {
    // 克隆前面的卡片放到末尾
    for (let i = 0; i < 3; i++) {
        const clone = cards[i].cloneNode(true);
        carouselContainer.appendChild(clone);
    }
    
    // 克隆最后的卡片放到开头
    for (let i = totalCards - 1; i >= totalCards - 3; i--) {
        const clone = cards[i].cloneNode(true);
        carouselContainer.insertBefore(clone, carouselContainer.firstChild);
    }
    
    // 更新卡片引用
    const allCards = document.querySelectorAll('.product-card');
    
    // 设置初始位置，显示原始卡片，而不是克隆的卡片
    const initialOffset = -3 * cardWidth;
    carouselContainer.style.transform = `translateX(${initialOffset}px)`;
    
    return allCards;
}

// 初始化
const allCards = setupInfiniteCarousel();
let currentIndex = 3; // 开始于第一个原始卡片
let isDragging = false;
let startPosition = 0;
let currentTranslate = -3 * cardWidth;
let prevTranslate = currentTranslate;
autoScrollPosition = currentTranslate;

// 更新滚动条位置
function updateScrollbarThumb() {
    // 计算相对位置 (0-1)
    const scrollProgress = (currentIndex - 3) / totalCards;
    // 计算滚动条宽度（整体宽度的百分比）
    const thumbWidth = (scrollbar.offsetWidth * (window.innerWidth / (cardWidth * totalCards)));
    // 设置滚动条宽度（根据卡片总数调整）
    scrollbarThumb.style.width = `${Math.max(10, Math.min(thumbWidth, 20))}%`;
    // 计算最大滚动距离
    const maxScroll = scrollbar.offsetWidth - scrollbarThumb.offsetWidth;
    // 设置滚动条位置
    scrollbarThumb.style.transform = `translateX(${scrollProgress * maxScroll}px)`;
}

// 标记当前活跃卡片
function updateActiveCard() {
    allCards.forEach((card, index) => {
        if (index === currentIndex) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // 更新滚动条位置
    updateScrollbarThumb();
}

// 平滑滚动到指定位置
function smoothScrollTo(translate) {
    carouselContainer.style.transition = 'transform 0.3s ease-out';
    carouselContainer.style.transform = `translateX(${translate}px)`;
    currentTranslate = translate;
    autoScrollPosition = translate;
}

// 处理循环
function handleInfiniteScroll() {
    const totalClonedCards = allCards.length;
    
    // 如果滚动到了右边的克隆卡片区域
    if (currentIndex >= totalCards + 3) {
        // 禁用过渡动画，立即跳转到左侧对应的原始卡片
        setTimeout(() => {
            carouselContainer.style.transition = 'none';
            currentIndex = currentIndex - totalCards;
            currentTranslate = -currentIndex * cardWidth;
            autoScrollPosition = currentTranslate;
            carouselContainer.style.transform = `translateX(${currentTranslate}px)`;
            
            // 重新启用过渡动画
            setTimeout(() => {
                carouselContainer.style.transition = 'transform 0.3s ease-out';
            }, 50);
        }, 300);
    }
    // 如果滚动到了左边的克隆卡片区域
    else if (currentIndex < 3) {
        // 禁用过渡动画，立即跳转到右侧对应的原始卡片
        setTimeout(() => {
            carouselContainer.style.transition = 'none';
            currentIndex = currentIndex + totalCards;
            currentTranslate = -currentIndex * cardWidth;
            autoScrollPosition = currentTranslate;
            carouselContainer.style.transform = `translateX(${currentTranslate}px)`;
            
            // 重新启用过渡动画
            setTimeout(() => {
                carouselContainer.style.transition = 'transform 0.3s ease-out';
            }, 50);
        }, 300);
    }
}

// 自动滚动功能
function startAutoScroll() {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    
    autoScrollInterval = setInterval(() => {
        if (isMouseOver) return; // 如果鼠标悬停在容器上则暂停
        
        // 缓慢向右滚动
        autoScrollPosition -= autoScrollSpeed;
        
        // 更新视觉位置
        carouselContainer.style.transition = 'none';
        carouselContainer.style.transform = `translateX(${autoScrollPosition}px)`;
        
        // 计算当前应该显示的卡片索引
        const newIndex = Math.round(Math.abs(autoScrollPosition) / cardWidth);
        
        // 如果索引变化，更新活跃卡片
        if (newIndex !== currentIndex) {
            currentIndex = newIndex;
            currentTranslate = autoScrollPosition;
            prevTranslate = currentTranslate;
            updateActiveCard();
            
            // 检查是否需要循环
            if (currentIndex >= totalCards + 3 || currentIndex < 3) {
                handleInfiniteScroll();
            }
        }
    }, 16); // 约60fps
}

// 停止自动滚动
function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// 鼠标拖动事件
function touchStart(event) {
    if (event.type === 'touchstart') {
        startPosition = event.touches[0].clientX;
    } else {
        startPosition = event.clientX;
        container.style.cursor = 'grabbing';
    }
    
    isDragging = true;
    carouselContainer.style.transition = 'none';
    
    // 暂停自动滚动
    stopAutoScroll();
}

let animationID = null;

function touchMove(event) {
    if (!isDragging) return;
    
    const currentPosition = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const diff = currentPosition - startPosition;
    currentTranslate = prevTranslate + diff;
    autoScrollPosition = currentTranslate;
    
    // 应用变换
    carouselContainer.style.transform = `translateX(${currentTranslate}px)`;
}

function touchEnd() {
    isDragging = false;
    container.style.cursor = 'grab';
    
    const moveDistance = currentTranslate - prevTranslate;
    
    // 如果移动距离足够大，向相应方向切换卡片
    if (moveDistance < -100 && currentIndex < allCards.length - 1) {
        currentIndex += 1;
    } else if (moveDistance > 100 && currentIndex > 0) {
        currentIndex -= 1;
    }
    
    prevTranslate = currentTranslate;
    smoothScrollTo(-currentIndex * cardWidth);
    updateActiveCard();
    handleInfiniteScroll();
    
    // 如果鼠标不在容器上，重新启动自动滚动
    if (!isMouseOver) {
        startAutoScroll();
    }
}

// 容器鼠标事件
container.addEventListener('mouseenter', () => {
    isMouseOver = true;
    
    // 当鼠标移入时停止自动滚动
    stopAutoScroll();
    
    // 平滑过渡到当前最近的卡片
    const nearestCardIndex = Math.round(Math.abs(autoScrollPosition) / cardWidth);
    currentIndex = nearestCardIndex;
    smoothScrollTo(-currentIndex * cardWidth);
    updateActiveCard();
});

container.addEventListener('mouseleave', () => {
    isMouseOver = false;
    
    // 当鼠标移出时重新启动自动滚动
    startAutoScroll();
});

// 卡片hover事件
allCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        // 计算需要滚动的位置，使当前卡片居中
        const centerOffset = -index * cardWidth + (container.offsetWidth - cardWidth) / 2;
        smoothScrollTo(centerOffset);
        currentIndex = index;
        
        // 更新滚动条位置
        const scrollProgress = (index - 3) / totalCards;
        const maxScroll = scrollbar.offsetWidth - scrollbarThumb.offsetWidth;
        scrollbarThumb.style.transform = `translateX(${scrollProgress * maxScroll}px)`;
    });
});

// 滚动条点击事件
scrollbar.addEventListener('click', function(e) {
    // 获取点击位置相对于滚动条的位置
    const clickPosition = e.clientX - scrollbar.getBoundingClientRect().left;
    // 计算相对位置 (0-1)
    const clickRatio = clickPosition / scrollbar.offsetWidth;
    // 计算对应卡片索引
    const targetIndex = Math.round(clickRatio * totalCards) + 3;
    
    // 滚动到目标卡片
    currentIndex = Math.max(3, Math.min(targetIndex, totalCards + 2));
    smoothScrollTo(-currentIndex * cardWidth);
    updateActiveCard();
    handleInfiniteScroll();
    
    // 暂停自动滚动
    stopAutoScroll();
    
    // 如果鼠标不在容器上，重新启动自动滚动
    if (!isMouseOver) {
        setTimeout(startAutoScroll, 2000);
    }
});

// 添加鼠标/触摸事件监听
container.addEventListener('mousedown', touchStart);
container.addEventListener('touchstart', touchStart);
window.addEventListener('mousemove', touchMove);
window.addEventListener('touchmove', touchMove);
window.addEventListener('mouseup', touchEnd);
window.addEventListener('touchend', touchEnd);
window.addEventListener('mouseleave', () => {
    if (isDragging) {
        touchEnd();
    }
});

// 鼠标滚轮事件
container.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // 停止自动滚动
    stopAutoScroll();
    
    // 根据滚轮方向滚动卡片
    if (e.deltaX > 20 || e.deltaY > 20) {
        if (currentIndex < allCards.length - 1) {
            currentIndex += 1;
            smoothScrollTo(-currentIndex * cardWidth);
            updateActiveCard();
            handleInfiniteScroll();
        }
    } else if (e.deltaX < -20 || e.deltaY < -20) {
        if (currentIndex > 0) {
            currentIndex -= 1;
            smoothScrollTo(-currentIndex * cardWidth);
            updateActiveCard();
            handleInfiniteScroll();
        }
    }
    
    // 如果鼠标不在容器上，重新启动自动滚动
    if (!isMouseOver) {
        setTimeout(startAutoScroll, 2000);
    }
}, { passive: false });

// 处理左右箭头键
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // 停止自动滚动
        stopAutoScroll();
        
        if (e.key === 'ArrowRight') {
            if (currentIndex < allCards.length - 1) {
                currentIndex += 1;
                smoothScrollTo(-currentIndex * cardWidth);
                updateActiveCard();
                handleInfiniteScroll();
            }
        } else if (e.key === 'ArrowLeft') {
            if (currentIndex > 0) {
                currentIndex -= 1;
                smoothScrollTo(-currentIndex * cardWidth);
                updateActiveCard();
                handleInfiniteScroll();
            }
        }
        
        // 如果鼠标不在容器上，重新启动自动滚动
        if (!isMouseOver) {
            setTimeout(startAutoScroll, 2000);
        }
    }
});

// 初始化激活当前卡片和滚动条
updateActiveCard();

// 开始自动滚动
startAutoScroll();

// 添加点击事件处理
allCards.forEach(card => {
    card.addEventListener('click', function() {
        const modal = document.getElementById('projectModal');
        const title = this.dataset.title;
        const description = this.dataset.description;
        const image = this.dataset.image;
        const github = this.dataset.github;
        const demo = this.dataset.demo;

        modal.querySelector('.modal-image').src = image;
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-description').textContent = description;
        modal.querySelector('.github-link').href = github;
        modal.querySelector('.demo-link').href = demo;
        modal.classList.add('active');
        
        // 停止自动滚动
        stopAutoScroll();
    });
});

// 关闭弹出层
document.querySelector('.modal-close').addEventListener('click', function() {
    document.getElementById('projectModal').classList.remove('active');
    
    // 如果鼠标不在容器上，重新启动自动滚动
    if (!isMouseOver) {
        startAutoScroll();
    }
});

// 点击背景关闭弹出层
document.getElementById('projectModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
        
        // 如果鼠标不在容器上，重新启动自动滚动
        if (!isMouseOver) {
            startAutoScroll();
        }
    }
});

// 添加键盘事件支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('projectModal').classList.remove('active');
        
        // 如果鼠标不在容器上，重新启动自动滚动
        if (!isMouseOver) {
            startAutoScroll();
        }
    }
}); 