// logic.js - Game logic and state management
class MemoryLogic {
    constructor(size = 16) {
        this.size = size;
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.isProcessing = false;
        this.maxVisible = 12; // 6 pairs simultaneously
        this.init();
    }

    init() {
        this.isProcessing = true;
        this.flippedCards = [];
        this.matchedCards = [];
        
        const values = [];
        for (let i = 1; i <= this.size / 2; i++) {
            values.push(i, i);
        }
        
        const shuffledValues = values.sort(() => Math.random() - 0.5);
        
        this.allCards = shuffledValues.map((val, index) => ({
            id: index,
            value: val,
            isFlipped: false,
            isMatched: false
        }));
        
        this.updateVisibleCards();
    }

    updateVisibleCards() {
        const unmatched = this.allCards.filter(c => !c.isMatched);
        const unmatchedValues = [];
        const seenValues = new Set();
        
        for (const card of unmatched) {
            if (!seenValues.has(card.value)) {
                unmatchedValues.push(card.value);
                seenValues.add(card.value);
            }
            if (unmatchedValues.length >= this.maxVisible / 2) break;
        }

        this.cards = unmatched.filter(c => unmatchedValues.includes(c.value));
        this.cards.forEach(c => c.isFlipped = false);
    }

    async startPreview(gameInstance) {
        if (!gameInstance) return;

        this.isProcessing = true;
        this.cards.forEach(card => card.isFlipped = true);
        gameInstance.render();

        // Ждем 3 секунды, но проверяем паузу
        let elapsed = 0;
        const duration = 3000;
        while (elapsed < duration) {
            if (window.levelManager && window.levelManager.isPaused) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            elapsed += 100;
        }
        
        // Перед тем как закрыть карточки, тоже проверяем паузу
        while (window.levelManager && window.levelManager.isPaused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.cards.forEach(card => card.isFlipped = false);
        gameInstance.render();

        await new Promise(resolve => setTimeout(resolve, 500));
        this.isProcessing = false;
    }

    flipCard(id) {
        if (this.isProcessing) return null;
        
        const card = this.cards.find(c => c.id === id);
        if (!card || card.isFlipped || card.isMatched) return null;

        card.isFlipped = true;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.isProcessing = true;
            return { type: 'check', cards: [...this.flippedCards] };
        }

        return { type: 'flip', card };
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        this.flippedCardsBackup = [...this.flippedCards];
        const isMatch = card1.value === card2.value;

        if (isMatch) {
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedCards.push(card1, card2);
            
            const currentVisibleUnmatched = this.cards.filter(c => !c.isMatched);
            if (currentVisibleUnmatched.length === 0 && this.matchedCards.length < this.allCards.length) {
                this.isProcessing = true; // Block interaction during transition
                
                // Приостанавливаем таймер
                if (window.levelManager) {
                    window.levelManager.stopTimer();
                }

                // Индикатор следующей волны
                const batchLoader = document.createElement('div');
                batchLoader.id = 'batch-loading-overlay';
                batchLoader.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9998;font-family:Arial;opacity:0;transition:opacity 0.5s ease;';
                batchLoader.innerHTML = `
                    <h2 class="next-wave-text" style="
                        font-size: 60px; 
                        text-transform: uppercase; 
                        font-weight: 900; 
                        color: #3498db;
                        text-shadow: 0 0 20px rgba(52, 152, 219, 0.8), 2px 2px 5px #000;
                        animation: pulseNextWave 1.5s infinite ease-in-out;
                    ">Next Wave</h2>
                    <style>
                        @keyframes pulseNextWave {
                            0% { transform: scale(1); opacity: 0.8; text-shadow: 0 0 10px rgba(52, 152, 219, 0.5); }
                            50% { transform: scale(1.1); opacity: 1; text-shadow: 0 0 30px rgba(52, 152, 219, 1); }
                            100% { transform: scale(1); opacity: 0.8; text-shadow: 0 0 10px rgba(52, 152, 219, 0.5); }
                        }
                    </style>
                `;
                document.body.appendChild(batchLoader);
                
                // Плавное появление
                requestAnimationFrame(() => {
                    batchLoader.style.opacity = '1';
                });

                // Награда: +10 секунд времени
                if (window.levelManager) {
                    window.levelManager.timeLeft += 10;
                    window.levelManager.updateTimerDisplay();
                }

                setTimeout(async () => {
                    const board = window.gameInstance?.boardElement;
                    if (board) {
                        // Анимация ухода старой партии влево
                        board.classList.add('slide-out-left');
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        this.updateVisibleCards();
                        board.innerHTML = ''; 
                        board.classList.remove('slide-out-left');
                        board.classList.add('slide-in-right');
                        
                        // ✅ Гарантируем, что gameInstance существует и рендерим
                        if (window.gameInstance) {
                            window.gameInstance.render();
                        }
                        
                        // Плавное исчезновение индикатора
                        if (batchLoader) {
                            batchLoader.style.opacity = '0';
                            setTimeout(() => batchLoader.remove(), 500);
                        }
                        
                        // Плавное появление новой партии
                        await new Promise(resolve => requestAnimationFrame(resolve));
                        board.classList.remove('slide-in-right');
                        
                        // ✅ Убеждаемся, что превью запускается корректно
                        await this.startPreview(window.gameInstance);
                    } else {
                        // Fallback если board не найден
                        this.updateVisibleCards();
                        if (window.gameInstance) window.gameInstance.render();
                        if (batchLoader) batchLoader.remove();
                        this.isProcessing = false;
                    }
                    
                    // Возобновляем таймер после превью
                    if (window.levelManager) {
                        window.levelManager.startTimer();
                    }
                }, 1000);
            }
        } else {
            card1.isFlipped = false;
            card2.isFlipped = false;
        }

        this.flippedCards = [];
        this.isProcessing = false;
        return isMatch;
    }

    isGameOver() {
        return this.matchedCards.length === this.allCards.length;
    }
}
