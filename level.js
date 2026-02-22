// level.js - Level and UI management
class LevelManager {
    constructor(onNextLevel, onGoToMenu) {
        this.currentLevel = 1;
        this.maxLevel = 12;
        this.onNextLevel = onNextLevel;
        this.onGoToMenu = onGoToMenu;
        this.overlay = null;
        this.timerInterval = null;
        this.timeLeft = 10;
        this.isPaused = false;
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        console.log("Timer stopped manually");
    }

    startTimer() {
        this.stopTimer();
        // timeLeft is now set in main.js before startTimer is called
        this.updateTimerDisplay();
        
        // Ensure display is visible
        const display = document.getElementById('timer-display');
        if (display) display.parentElement.style.display = 'flex';

        this.timerInterval = setInterval(() => {
            // Проверка: если мы не в игровом режиме (например, в меню), останавливаем таймер
            const board = document.getElementById('game-board');
            if (!board || board.style.display === 'none') {
                this.stopTimer();
                return;
            }

            if (window.logic && window.logic.isGameOver()) {
                this.stopTimer();
                this.showWinWindow();
                return;
            }
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.showLossWindow();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const display = document.getElementById('timer-display');
        if (display) {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    getCardsCount() {
        return 4 + (this.currentLevel - 1) * 4;
    }

    getCardBack() {
        if (this.currentLevel >= 1 && this.currentLevel <= 12) {
            return `card_bake${this.currentLevel}.webp`;
        }
        return null;
    }

    showWinWindow() {
        this.stopTimer();
        
        if (this.currentLevel >= this.maxLevel) {
            this.showOverlay('CONGRATULATIONS!', 'RESTART GAME', () => {
                this.removeOverlay();
                this.reset();
                this.onNextLevel();
            });
        } else {
            this.showOverlay(
                t('win'),
                t('nextLevel'), () => {
                    this.removeOverlay();
                    this.nextLevel();
                }
            );
        }
    }

    showLossWindow() {
        const lang = window.gameLanguage || 'en';
        const t = lang === 'ru' ? { title: 'ИГРА ОКОНЧЕНА', btn: 'ПОВТОРИТЬ' } : { title: 'GAME OVER', btn: 'RETRY' };
        this.showOverlay(t.title, t.btn, () => {
            this.removeOverlay();
            this.onNextLevel(); // Restart current level
        }, true);
    }

    showPauseWindow() {
        if (this.overlay) return;
        const lang = window.gameLanguage || 'en';
        const tResume = lang === 'ru' ? 'ПРОДОЛЖИТЬ' : 'RESUME';
        
        this.isPaused = true;
        this.stopTimer();
        this.showOverlay('PAUSE', tResume, () => {
            this.isPaused = false;
            this.removeOverlay();
            this.startTimer();
        });
    }

    showOverlay(titleText, primaryBtnText, onPrimaryClick, isLoss = false) {
        if (this.overlay) return;
        this.isPaused = true;
        const lang = window.gameLanguage || 'en';
        const tMenu = lang === 'ru' ? 'ГЛАВНОЕ МЕНЮ' : 'MAIN MENU';
    

        this.overlay = document.createElement('div');
        this.overlay.id = 'win-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'modal-content';

        const title = document.createElement('h1');
        title.textContent = titleText;
        modal.appendChild(title);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexDirection = 'column';
        buttonsContainer.style.alignItems = 'center';
        buttonsContainer.style.gap = '20px';
        buttonsContainer.style.width = '100%';

        const menuBtn = document.createElement('button'); 
        menuBtn.textContent = tMenu;
        menuBtn.style.width = '100%';
        menuBtn.onclick = () => {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            gameSounds.playButton();
            menuBtn.style.backgroundColor = '#5dade2';
            setTimeout(() => {
                this.removeOverlay();
                this.onGoToMenu();
                this.isTransitioning = false;
            }, 500);
        };

        const primaryBtn = document.createElement('button');
        primaryBtn.textContent = primaryBtnText;
        primaryBtn.style.width = '100%';
        primaryBtn.onclick = () => {
            if (this.isTransitioning) return;
            this.isTransitioning = true;

            gameSounds.playButton();
            primaryBtn.style.backgroundColor = '#5dade2';
            setTimeout(() => {
                onPrimaryClick();
                this.isTransitioning = false;
            }, 500);
        };

        buttonsContainer.appendChild(menuBtn);
        buttonsContainer.appendChild(primaryBtn);

        modal.appendChild(buttonsContainer);
        this.overlay.appendChild(modal);
        document.body.appendChild(this.overlay);
    }

    startTimerFromReward() {
        this.stopTimer();
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            if (window.logic && window.logic.isGameOver()) {
                this.stopTimer();
                this.showWinWindow();
                return;
            }
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.showLossWindow();
            }
        }, 1000);
    }

    removeOverlay() {
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
            this.isPaused = false;
        }
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.onNextLevel();
        } else {
            this.stopTimer();
            

            this.showOverlay('CONGRATULATIONS!', 'RESTART GAME', () => {
                this.removeOverlay();
                this.reset();
                this.onNextLevel();
            });
        }
    }

    reset() {
        this.currentLevel = 1;
        this.stopTimer();
    }
}
