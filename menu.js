// menu.js - Menu handling
class MemoryMenu {
    constructor(onStart, onSelectLevel) {
        this.onStart = onStart;
        this.onSelectLevel = onSelectLevel;
        this.container = document.getElementById('menu');
        this.mainContainer = document.getElementById('game-container');
    }

    render() {
        this.container.innerHTML = '';
        const startBtn = document.createElement('button');
        startBtn.textContent = window.gameLanguage === 'ru' ? 'Переиграть уровень' : 'Restart Level';
        startBtn.onclick = () => this.onStart();
        this.container.appendChild(startBtn);
    }

    renderMainMenu() {
        const i18n = {
            ru: { start: 'СТАРТ', levels: 'УРОВНИ', back: 'НАЗАД В МЕНЮ' },
            en: { start: 'START', levels: 'LEVELS', back: 'BACK TO MENU' }
        };
        const lang = window.gameLanguage || 'en';
        const t = i18n[lang];

        if (this.isTransitioning) return;

        const existingMenu = document.getElementById('main-menu-overlay');
        if (existingMenu) existingMenu.remove();

        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'main-menu-overlay';
        menuOverlay.style.display = 'flex';
        menuOverlay.style.flexDirection = 'column';
        menuOverlay.style.alignItems = 'center';
        menuOverlay.style.justifyContent = 'center';

        // 1. Создаем Заголовок
        const titleContainer = document.createElement('div');
        titleContainer.style.display = 'flex';
        /*titleContainer.style.flexDirection = 'column';*/
        titleContainer.style.alignItems = 'center';
        titleContainer.className = 'title-container';

        const memoryTitle = document.createElement('div');
        memoryTitle.textContent = 'Fun';
        memoryTitle.className = 'game-title-memory';
        
        const masterTitle = document.createElement('div');
        masterTitle.textContent = 'memory';
        masterTitle.className = 'game-title-master';

        titleContainer.appendChild(memoryTitle);
        titleContainer.appendChild(masterTitle);
        menuOverlay.appendChild(titleContainer);

         
       
        // 2. Создаем блок Настроек (Звук/Музыка)
        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'settings-side-container'; // Добавили ID
        settingsContainer.style.display = 'flex';
        settingsContainer.style.gap = '20px';
        settingsContainer.style.marginBottom = '10px';
        

        const musicToggle = document.createElement('img');
        musicToggle.id = 'music-toggle';
        musicToggle.src = gameMusic.isMuted ? 'off_music.webp' : 'on_music.webp';
        musicToggle.style.width = '50px';
        musicToggle.style.height = '50px';
        musicToggle.style.cursor = 'pointer';
        musicToggle.onclick = () => {
            gameSounds.playButton();
            musicToggle.src = gameMusic.toggleMute() ? 'off_music.webp' : 'on_music.webp';
        };

        const soundToggle = document.createElement('img');
        soundToggle.id = 'sound-toggle';
        soundToggle.src = gameMusic.isSoundEnabled ? 'on_sound.webp' : 'off_sound.webp';
        soundToggle.style.width = '50px';
        soundToggle.style.height = '50px';
        soundToggle.style.cursor = 'pointer';
        soundToggle.onclick = () => {
            const isEnabled = gameMusic.toggleSound();
            soundToggle.src = isEnabled ? 'on_sound.webp' : 'off_sound.webp';
            gameSounds.playButton();
        };

        settingsContainer.appendChild(musicToggle);
        settingsContainer.appendChild(soundToggle);
        menuOverlay.appendChild(settingsContainer);

        // 3. Создаем кнопки START и LEVELS
        const startBtn = document.createElement('button');
        startBtn.textContent = t.start;
        startBtn.onclick = () => {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            gameSounds.playButton();
            startBtn.style.backgroundColor = '#5dade2';
            setTimeout(() => {
                menuOverlay.remove();
                this.isTransitioning = false;
                this.onStart();
            }, 500);
        };

        const levelsBtn = document.createElement('button');
        levelsBtn.textContent = t.levels;
        levelsBtn.onclick = () => {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            gameSounds.playButton();
            levelsBtn.style.backgroundColor = '#5dade2';
            setTimeout(() => {
                menuOverlay.remove();
                this.isTransitioning = false;
                this.renderLevelSelect();
            }, 500);
        };

        // 4. Создаем обертку для кнопок
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.id = 'buttons-wrapper';
        buttonsWrapper.style.display = 'flex';
        buttonsWrapper.style.gap = '15px';

        // В горизонтальном режиме - в ряд, в портретном - в колонку
        if (document.body.classList.contains('landscape-mode') && window.innerHeight <= 450) {
            buttonsWrapper.style.flexDirection = 'row';
        } 
        else if (document.body.classList.contains('computer-mode') && window.innerHeight <= 450) {
            buttonsWrapper.style.flexDirection = 'row';
        }
            
        else {
            buttonsWrapper.style.flexDirection = 'column';
        }

        buttonsWrapper.appendChild(startBtn);
        buttonsWrapper.appendChild(levelsBtn);
        
        menuOverlay.appendChild(buttonsWrapper);
        this.mainContainer.appendChild(menuOverlay);
    }

    // Внутри класса MemoryMenu
    updateLevelGridStyles() {
        const grid = document.querySelector('#level-select-overlay div[style*="grid"]');
        if (!grid) return;

        const isLandscape = document.body.classList.contains('landscape-mode');
        const isComputer = document.body.classList.contains('computer-mode');
        const isSmallHeight = window.innerHeight < 450 ;
    
        let columns, gap;

        if (isComputer && window.innerHeight < 450) { 
            columns = 'repeat(6, 1fr)'; 

            gap = '8px';
        } 
        else if (isLandscape) {
            columns = 'repeat(6, 1fr)';
            gap = '10px';
        } 
        else {
            columns = 'repeat(4, 1fr)';
            gap = '15px';
        }

        grid.style.gridTemplateColumns = columns;
        grid.style.gap = gap;

        // Также обновляем размер самих кнопок внутри
        const buttons = grid.querySelectorAll('.level-btn');
        buttons.forEach(btn => {
            if (isLandscape && window.innerHeight <= 700 && window.innerWidth <= 700 || isComputer && innerHeight <= 700 && innerWidth <= 700) {
                btn.style.width = '80px';
                btn.style.height = '80px';
                btn.style.fontSize = '20px';
            }
            // Уменьшаем кнопки, если это ландшафт ИЛИ ПК с низкой высотой окна
            if (isLandscape && window.innerHeight <= 400 && window.innerHeight > 201 || (isComputer && isSmallHeight && window.innerHeight > 201)) {
                btn.style.width = '50px';
                btn.style.height = '50px';
                btn.style.fontSize = '15px';
            } 
            else if (isLandscape && window.innerHeight <= 200 || (isComputer && isSmallHeight && window.innerHeight <= 200 )) {
                btn.style.width = '30px';
                btn.style.height = '30px';
                btn.style.fontSize = '10px';
                
            }
            else {
                btn.style.width = ''; 
                btn.style.height = '';
                btn.style.fontSize = '';
            }           
            
        });
    }    
   

    renderLevelSelect() {
        const lang = window.gameLanguage || 'en';
        const backText = lang === 'ru' ? 'НАЗАД В МЕНЮ' : 'BACK TO MENU';

        const levelOverlay = document.createElement('div');
        levelOverlay.id = 'level-select-overlay';
        levelOverlay.style.display = 'flex';
        levelOverlay.style.flexDirection = 'column';
        levelOverlay.style.alignItems = 'center';
        levelOverlay.style.justifyContent = 'center'; // Центрируем по вертикали
        levelOverlay.style.height = '100%'; // На всю высоту
        levelOverlay.style.width = '100%';
        levelOverlay.style.gap = '10px'; // Маленький отступ между сеткой и кнопкой

        
        const grid = document.createElement('div');
        grid.style.display = 'grid';
         

        for (let i = 1; i <= 12; i++) {
            const btn = document.createElement('div');
            btn.textContent = i;
            btn.className = 'level-btn';
            
           
            btn.onclick = () => {
                if (this.isTransitioning) return;
                this.isTransitioning = true;

                gameSounds.playButton();
                levelOverlay.remove();
                this.isTransitioning = false;
                this.onSelectLevel(i);
                if (typeof updateBackground === 'function') updateBackground();
            };
            grid.appendChild(btn);
        }

        const backBtn = document.createElement('button');
        backBtn.textContent = backText;
        // Добавляем специальный класс, чтобы стилизовать через CSS если нужно
        backBtn.className = 'back-to-menu-btn'; 
        
        backBtn.onclick = () => {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            gameSounds.playButton();
            backBtn.style.backgroundColor = '#5dade2';
            setTimeout(() => {
                levelOverlay.remove();
                this.isTransitioning = false;
                this.renderMainMenu();
            }, 500);
        };

        levelOverlay.appendChild(grid);
        levelOverlay.appendChild(backBtn);
        this.mainContainer.appendChild(levelOverlay);
        
        // ВЫЗОВ ОБНОВЛЕНИЯ СРАЗУ ПОСЛЕ ДОБАВЛЕНИЯ
        this.updateLevelGridStyles();         
    
    }    
}





