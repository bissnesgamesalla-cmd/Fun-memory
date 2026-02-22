// game.js - Rendering and UI interaction
class MemoryGame {
    constructor(logic, onWin, levelManager) {
        this.logic = logic;
        this.onWin = onWin;
        this.levelManager = levelManager;
        this.boardElement = document.getElementById('game-board');
        this.clickQueue = [];
        this.isProcessingQueue = false;
    }

    render() {
        const cardBack = this.levelManager.getCardBack();
        
        if (this.boardElement.children.length !== this.logic.cards.length) {
            this.boardElement.innerHTML = '';
            
            this.logic.cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                cardElement.dataset.id = card.id;
                
                const front = document.createElement('div');
                front.className = 'card-front';
                front.style.backgroundImage = `url('i${card.value}.webp')`;
                front.style.backgroundSize = 'cover';
                front.style.backgroundPosition = 'center';
                
                const back = document.createElement('div');
                back.className = 'card-back';
                if (cardBack) {
                    back.style.backgroundImage = `url('${cardBack}')`;
                    back.style.backgroundSize = 'cover';
                    back.style.backgroundPosition = 'center';
                } else {
                    back.style.backgroundColor = '#3498db';
                }
                
                cardElement.appendChild(front);
                cardElement.appendChild(back);

                cardElement.onclick = () => {
                    if (typeof gameSounds !== 'undefined') gameSounds.playCard();
                    this.handleCardClick(card.id);
                };
                this.boardElement.appendChild(cardElement);
            });
        }

        this.logic.cards.forEach(card => {
            const cardElement = this.boardElement.querySelector(`[data-id="${card.id}"]`);
            if (cardElement) {
                if (card.isFlipped || card.isMatched) {
                    cardElement.classList.add('flipped');
                } else {
                    cardElement.classList.remove('flipped');
                }

                if (card.isMatched) {
                    cardElement.classList.add('matched');
                    if (this.recentlyMatchedIds && this.recentlyMatchedIds.includes(card.id)) {
                        cardElement.classList.add('recently-matched');
                    }
                } else {
                    cardElement.classList.remove('matched');
                    cardElement.classList.remove('recently-matched');
                }
            }
        });

        if (typeof updateGridLayout === 'function') {
            requestAnimationFrame(() => updateGridLayout());
        }
    }

    handleCardClick(id) {
        const card = this.logic.cards.find(c => c.id === id);
        if (!card || card.isFlipped || card.isMatched || this.clickQueue.includes(id)) return;
        
        this.clickQueue.push(id);
        this.processQueue();
    }

    async processQueue() {
        if (this.isProcessingQueue || this.clickQueue.length === 0) return;
        this.isProcessingQueue = true;
        
        while (this.clickQueue.length > 0) {
            const id = this.clickQueue.shift();
            const card = this.logic.cards.find(c => c.id === id);
        
            if (!card || card.isFlipped || card.isMatched) continue;

            this.logic.flipCard(id);
            this.render();
            
            await new Promise(resolve => setTimeout(resolve, 500));

            if (this.logic.flippedCards.length === 2) {
                await new Promise(resolve => setTimeout(resolve, 600));
                
                const currentAttempt = [...this.logic.flippedCards]; 
                const isMatch = this.logic.checkMatch();
            
                if (isMatch) {
                    this.recentlyMatchedIds = currentAttempt.map(c => c.id);
                    this.render();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.recentlyMatchedIds = null;
                }
            
                this.render();
            
                if (this.logic.isGameOver()) {
                    if (this.onWin) this.onWin();
                }
            }
        }
        this.isProcessingQueue = false;
    }
}