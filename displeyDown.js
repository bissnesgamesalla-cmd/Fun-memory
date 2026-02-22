// displeyDown.js - Scroll management
/*function initScroll() {
    // Ensure the body allows scrolling but hides scrollbars for a cleaner look
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    
    // Ensure the game container doesn't force a non-scrolling layout
    const container = document.getElementById('game-container');
    if (container) {
        container.style.display = 'block'; // Changed from flex to block to allow natural scroll
        container.style.paddingTop = '20px';
        container.style.paddingBottom = '40px';
    }
}

window.addEventListener('load', initScroll);*/


// displeyDown.js - УПРАВЛЕНИЕ ЭКРАНОМ БЕЗ СКРОЛЛА
function initScroll() {
    // 1. ЗАПРЕЩАЕМ любой скролл
    document.body.style.overflow = 'hidden'; 
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // 2. Делаем контейнер фиксированным по размеру экрана
    const container = document.getElementById('game-container');
    if (container) {
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.height = '100vh'; // Ровно на весь экран
        container.style.width = '100vw';
        container.style.boxSizing = 'border-box';
        container.style.padding = '10px';
    }
}

// Вызываем при загрузке и при изменении размера окна
window.addEventListener('load', initScroll);
window.addEventListener('resize', initScroll);


