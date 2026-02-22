// orentesan.js - Orientation and device management
const screenConfigs = {
    port: {
        id: 'port',
        isMatch: () => window.innerWidth < window.innerHeight,
        apply: () => {
            document.body.classList.remove('landscape-mode', 'computer-mode');
            document.body.classList.add('portrait-mode');
            document.body.style.backgroundImage = "url('fon_port.webp')";
        }
    },
    gorezont: {
        id: 'gorezont',
        isMatch: () => window.innerWidth >= window.innerHeight && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
        apply: () => {
            document.body.classList.remove('portrait-mode', 'computer-mode');
            document.body.classList.add('landscape-mode');
            document.body.style.backgroundImage = "url('fone_game.webp')";
        }
    },
    computer: {
        id: 'computer',
        isMatch: () => {
            const isWide = window.innerWidth >= window.innerHeight;
            const hasMouse = !('ontouchstart' in window || navigator.maxTouchPoints > 0);
            return isWide && hasMouse;
        },
        apply: () => {
            document.body.classList.remove('portrait-mode', 'landscape-mode');
            document.body.classList.add('computer-mode');
            document.body.style.backgroundImage = "url('fone_pk.webp')";
        }
    }
};

function updateBackground() {
    let activeConfig;
    
    // Определяем текущий конфиг
    if (screenConfigs.computer.isMatch()) {
        activeConfig = screenConfigs.computer;
    } else if (screenConfigs.gorezont.isMatch()) {
        activeConfig = screenConfigs.gorezont;
    } else {
        activeConfig = screenConfigs.port;
    }

    // Применяем классы и фон
    activeConfig.apply();
    
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';

    // --- ОБНОВЛЕНИЕ МЕНЮ (Вынесено из условий, работает всегда) ---
    if (window.gameMenu) {
        // Обновляем сетку уровней (если она открыта)
        window.gameMenu.updateLevelGridStyles();

        // Обновляем направление кнопок главного меню
        const buttonsWrapper = document.getElementById('buttons-wrapper');
        if (buttonsWrapper) {
            const isLandscape = document.body.classList.contains('landscape-mode') || 
                                document.body.classList.contains('computer-mode') && window.innerHeight <= 450;
            buttonsWrapper.style.flexDirection = isLandscape ? 'row' : 'column';
        }
    }
}

// Слушатели вешаются только один раз при загрузке скрипта
window.addEventListener('resize', updateBackground);
window.addEventListener('load', updateBackground);


