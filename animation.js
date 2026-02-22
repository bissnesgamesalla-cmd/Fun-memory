// animation.js - Card flip animations and transitions

class CardAnimation {
    static flip(cardElement, isFlipped) {
        if (isFlipped) {
            cardElement.classList.add('flipped');
    
        } 
        else {
            cardElement.classList.remove('flipped');
        }
    }
}    
    /*static flip(cardElement, isFlipped) {
        const duration = 500; // Faster animation (0.5s total)
        if (isFlipped) {
            cardElement.classList.add('flipping-animation');
            setTimeout(() => {
                cardElement.classList.add('flipped');
                cardElement.classList.remove('flipping-animation');
            }, duration / 2);
        } else {
            cardElement.classList.add('flipping-animation');
            setTimeout(() => {
                cardElement.classList.remove('flipped');
                cardElement.classList.remove('flipping-animation');
            }, duration / 2);
        }
    }*/

    /*static setupStyles() {
        if (document.getElementById('card-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'card-animation-styles';
        style.textContent = `
            .card {
                transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-style: preserve-3d;
                perspective: 1000px;
            }
            .card.flipping-animation {
                transform: rotateY(90deg) scale(1.1);
            }
            .card.flipped, .card.matched {
                transform: rotateY(180deg);
            }
            .card.matched.recently-matched {
                animation: matchPulse 0.5s ease-out;
            }
            @keyframes matchPulse {
                0% { transform: rotateY(180deg) scale(1); }
                50% { transform: rotateY(180deg) scale(1.1); box-shadow: 0 0 15px rgba(46, 204, 113, 0.6); }
                100% { transform: rotateY(180deg) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }*/

    /*static setupStyles() {
    if (document.getElementById('card-animation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'card-animation-styles';
    style.textContent = `
        .card {
            transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
            perspective: 1000px;
            position: relative;
        }

        .card-front, .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            // КРИТИЧЕСКИ ВАЖНО: скрывает заднюю сторону при развороте 
            backface-visibility: hidden; 
            -webkit-backface-visibility: hidden;
            border-radius: 8px;
        }

        .card-front {
            // Лицевая сторона изначально повернута "от игрока" 
            transform: rotateY(180deg);
        }

        .card-back {
            // Рубашка смотрит на игрока 
            transform: rotateY(0deg);
            z-index: 2;
        }

        .card.flipped, .card.matched {
            transform: rotateY(180deg);
        }

        // Анимация при совпадении 
        .card.matched.recently-matched {
            animation: matchPulse 0.5s ease-out;
        }

        @keyframes matchPulse {
            0% { transform: rotateY(180deg) scale(1); }
            50% { transform: rotateY(180deg) scale(1.1); }
            100% { transform: rotateY(180deg) scale(1); }
        }
    `;
    document.head.appendChild(style);
    }
}

CardAnimation.setupStyles();*/
