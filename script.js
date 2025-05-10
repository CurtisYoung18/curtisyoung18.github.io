// 添加页面加载动画
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.profile-card, .project-card, section');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});

// 添加鼠标移动视差效果
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.project-card');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2;
        const cardY = rect.top + rect.height / 2;
        
        const angleX = (mouseY - cardY / window.innerHeight) * 10;
        const angleY = (mouseX - cardX / window.innerWidth) * -10;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
});

// 重置卡片位置
document.addEventListener('mouseleave', () => {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
}); 