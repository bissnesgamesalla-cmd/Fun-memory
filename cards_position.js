function updateGridLayout() {
    const board = document.getElementById('game-board');
    if (!board || board.style.display === 'none') return;

    const cards = board.querySelectorAll('.card');
    if (cards.length === 0) return;

    // 1. Вычисляем доступную высоту
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const levelInfo = document.getElementById('level-info');
    const menuWrapper = document.getElementById('menu-wrapper');

    let reservedHeight = 40; // Базовый запас
    if (levelInfo && levelInfo.offsetParent) reservedHeight += levelInfo.offsetHeight + 10;
    if (menuWrapper && menuWrapper.offsetParent) reservedHeight += menuWrapper.offsetHeight + 10;

    const availableWidth = vw * 0.94;
    const availableHeight = vh - reservedHeight;

    // 2. Подбираем колонки (best fit)
    let possibleCols = vw > vh ? [4, 5, 6, 7, 8] : [3, 4, 5];
    let bestCols = possibleCols[0];
    let finalW = 0, finalH = 0;

    possibleCols.forEach(cols => {
        const rows = Math.ceil(cards.length / cols);
        const gap = vw < 600 ? 5 : 8;

        // Считаем размер исходя из ширины
        let w = (availableWidth - (cols - 1) * gap) / cols;
        let h = w * 1.35; // Соотношение сторон

        // Если по высоте не влезает — сжимаем по высоте
        if ((rows * h + (rows - 1) * gap) > availableHeight) {
            h = (availableHeight - (rows - 1) * gap) / rows;
            w = h / 1.35;
        }

        if (w > finalW) {
            finalW = w;
            finalH = h;
            bestCols = cols;
        }
    });

    // Ограничение гигантизма
    if (finalW > 150) { finalW = 150; finalH = 150 * 1.35; }

    // Ограничение минимализма
    if (finalW < 75 && window.innerHeight <= 450 && window.innerHeight >= 250) { finalW = 75; finalH = 75 * 1.35; }

    else if (finalW < 40) { finalW = 40; finalH = 40 * 1.35;}

  
    // 3. Применяем размеры
    board.style.gridTemplateColumns = `repeat(${bestCols}, ${Math.floor(finalW)}px)`;
    cards.forEach(card => {
        card.style.width = `${Math.floor(finalW)}px`;
        card.style.height = `${Math.floor(finalH)}px`;
    });
}

//window.addEventListener('resize', updateGridLayout);

// Global handleResize function that now uses the centralized logic
function handleResize() {
    updateGridLayout();
    // Keep any other background/menu resizing logic if needed
    if (typeof updateBackground === 'function') updateBackground();
}

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);