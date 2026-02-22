// main.js - Application entry point
let logic, game, menu, levelManager;

const translations = {
    en: {
        play: "PLAY",
        settings: "SETTINGS",
        level: "Level",
        loading: "LOADING...",
        preparing: "PREPARING LEVEL...",
        mainMenu: "MAIN MENU",
        nextLevel: "NEXT LEVEL",
        win: "YOU WIN",
        gameOver: "GAME OVER",
        retry: "RETRY"
    },
    ru: {
        play: "ИГРАТЬ",
        settings: "НАСТРОЙКИ",
        level: "Уровень",
        loading: "ЗАГРУЗКА...",
        preparing: "ПОДГОТОВКА...",
        mainMenu: "ГЛАВНОЕ МЕНЮ",
        nextLevel: "СЛЕДУЮЩИЙ УРОВЕНЬ",
        win: "ПОБЕДА",
        gameOver: "ИГРА ОКОНЧЕНА",
        retry: "ПОВТОРИТЬ"
    }
};

/*const canvas = document.querySelector('canvas');
canvas.addEventListener('mousedown', () => {
    window.focus();
});*/

// Функция-помощник для получения текста
function t(key) {
    const lang = window.gameLanguage || 'en';
    return translations[lang][key] || translations['en'][key];
}


async function preloadAssets() {
    const essentialImages = [
        'fon_port.webp', 'fone_game.webp', 'fone_pk.webp', 'on_music.webp', 'off_music.webp', 'on_sound.webp', 'off_sound.webp'
    ];

    const backgroundImages = [
        'home.webp'
    ];

    const gameAssets = [
        'card_bake1.webp', 'card_bake2.webp', 'card_bake3.webp', 'card_bake4.webp', 'card_bake5.webp',
        'card_bake6.webp', 'card_bake7.webp', 'card_bake8.webp', 'card_bake9.webp', 'card_bake10.webp',
        'card_bake11.webp', 'card_bake12.webp',
        'i1.webp', 'i2.webp', 'i3.webp', 'i4.webp', 'i5.webp',
        'i6.webp', 'i7.webp', 'i8.webp', 'i9.webp', 'i10.webp',
        'i11.webp', 'i12.webp', 'i13.webp', 'i14.webp', 'i15.webp',
        'i16.webp', 'i17.webp', 'i18.webp', 'i19.webp', 'i20.webp',
        'i21.webp', 'i22.webp', 'i23.webp', 'i24.webp', 'i25.webp'
    ];

    const loadImages = (list) => {
        return Promise.all(list.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = src;
            });
        }));
    };

    // Load essential menu images first to show the menu quickly
    await loadImages(essentialImages);
    if (window.mainLoader) window.mainLoader.remove();
    document.getElementById('game-container').style.display = 'flex';
    if (typeof updateBackground === 'function') updateBackground();

    // Background load other assets without blocking the main menu
    loadImages(backgroundImages);
    setTimeout(() => loadImages(gameAssets), 1000);
}

function startLevel() {
    const cardsCount = levelManager.getCardsCount();
    document.getElementById('level-info').textContent = `Level: ${levelManager.currentLevel}`;
    
    const levelLoader = document.createElement('div');
    levelLoader.id = 'level-loading-overlay';
    levelLoader.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle, #3498db, #1a2a6c);color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9998;font-family:Arial;';
    levelLoader.innerHTML = `
        <div class="star-loader" style="font-size: 60px; color: #f1c40f; text-shadow: 0 0 15px #f1c40f; animation: spinStar 2s linear infinite; margin-bottom: 15px;">★</div>
        <h2 style="color: #f1c40f; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 0 8px #f1c40f;">${t('preparing')}</h2>
    `;
    document.body.appendChild(levelLoader);

    document.getElementById('game-board').innerHTML = '';

    const logicForLevel = new MemoryLogic(cardsCount);
    const imagesToLoad = new Set();
    imagesToLoad.add(levelManager.getCardBack());
    logicForLevel.allCards.forEach(card => imagesToLoad.add(`i${card.value}.webp`));

    const promises = Array.from(imagesToLoad).map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
        });
    });

    Promise.all(promises).then(async () => {
        levelLoader.remove();
        document.getElementById('level-info').style.display = 'block';
        document.getElementById('menu-wrapper').style.display = 'flex';
        document.getElementById('game-board').style.display = 'grid';
        
        logic = logicForLevel;
        window.logic = logic;
       
        game = new MemoryGame(logic, () => {
            // Проверяем, не ушли ли мы в меню, прежде чем показывать окно победы
            const board = document.getElementById('game-board');
            if (board && board.style.display !== 'none') {
                setTimeout(() => {
                    // Еще одна проверка внутри timeout на случай, если за 500мс нажали "Home"
                    if (board.style.display !== 'none') {
                        levelManager.showWinWindow();
                    }
                }, 500);
            }
        }, levelManager);
        window.gameInstance = game;

           

        game.render();
        if (typeof handleResize === 'function') {
            handleResize();
            setTimeout(handleResize, 100); 
        }
        
        levelManager.timeLeft = 10 + ((levelManager.currentLevel - 1) * 10);
        levelManager.updateTimerDisplay();
        document.getElementById('timer-display').parentElement.style.display = 'flex';
        
        await logic.startPreview(game);
        levelManager.startTimer();
    });
}

function initGame() {
    levelManager = new LevelManager(startLevel, () => {
        levelManager.reset();
        showMainMenu();
    });
    window.levelManager = levelManager;


    // Сохраняем меню в window, чтобы orientation.js мог к нему обращаться
    window.gameMenu = new MemoryMenu(
        () => {
            levelManager.reset();
            startLevel();
        },
        (lvl) => {
            levelManager.currentLevel = lvl;
            startLevel();
        }
    );   


    // Для удобства обратных вызовов
    menu = window.gameMenu;
    
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        let isTransitioning = false;
        homeBtn.onclick = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            homeBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                homeBtn.style.transform = 'scale(1)';
                levelManager.stopTimer();
                levelManager.onGoToMenu();
                isTransitioning = false;
            }, 200);
        };
    }
    
    showMainMenu();
}

// защита от скрола
const keysToBlock = ["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown"];

window.addEventListener("keydown", (e) => {
    if (keysToBlock.includes(e.code)) {
        e.preventDefault();
    }
}, false);

window.addEventListener("wheel", (e) => {
    e.preventDefault();
}, { passive: false });


function showMainMenu() {
    if (levelManager) {
        levelManager.stopTimer(); 
    }
    
    
    const menuLoader = document.createElement('div');
    menuLoader.id = 'menu-loading-overlay';
    menuLoader.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle, #3498db, #1a2a6c);color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9999;font-family:Arial;';
    menuLoader.innerHTML = `
        <div class="star-loader" style="font-size: 60px; color: #f1c40f; text-shadow: 0 0 15px #f1c40f; animation: spinStar 2s linear infinite; margin-bottom: 15px;">★</div>
        <h2 style="color: #f1c40f; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 0 8px #f1c40f;">${t('loading')}</h2>
    `;
    document.body.appendChild(menuLoader);

    setTimeout(() => {
        menuLoader.remove();
        document.getElementById('level-info').style.display = 'none';
        document.getElementById('menu-wrapper').style.display = 'none';
        document.getElementById('game-board').style.display = 'none';
        document.getElementById('timer-display').parentElement.style.display = 'none';
        menu.renderMainMenu();
        if (typeof updateBackground === 'function') updateBackground();
    }, 500);
}

window.addEventListener('DOMContentLoaded', async () => {
    // ✅ Показываем красивый лоадер сразу
    const loader = document.createElement('div');
    loader.id = 'loading-overlay';
    loader.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle, #1a2a6c, #000);color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9999;font-family:Arial;';
    loader.innerHTML = `
        <div class="star-loader" style="
            font-size: 80px;
            color: #f1c40f;
            text-shadow: 0 0 20px #f1c40f;
            animation: spinStar 2s linear infinite;
            margin-bottom: 20px;
        ">★</div>
        <h1 style="
            color: #f1c40f;
            text-transform: uppercase;
            letter-spacing: 5px;
            text-shadow: 0 0 10px #f1c40f;
            animation: pulseText 1.5s infinite ease-in-out;
        ">LOADING</h1>
        <style>
            @keyframes spinStar {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.2); }
                100% { transform: rotate(360deg) scale(1); }
            }
            @keyframes pulseText {
                0%, 100% { opacity: 0.6; transform: scale(0.95); }
                50% { opacity: 1; transform: scale(1); }
            }
        </style>
    `;
    document.body.appendChild(loader);
    window.mainLoader = loader;

    window.gameLanguage = 'en';
    await preloadAssets();
    
    initGame();

   

    // ✅ Обработка фокуса вкладки для автоматической паузы
    window.addEventListener('blur', () => {
        const board = document.getElementById('game-board');
        const isMenuVisible = !!(document.getElementById('main-menu-overlay') || document.getElementById('level-select-overlay'));
        
        // Пауза только если мы в игре, а не в меню
        if (board && board.style.display !== 'none' && !isMenuVisible && levelManager) {
            levelManager.showPauseWindow();
        }
    });
});
