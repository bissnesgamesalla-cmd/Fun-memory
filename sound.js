// sound.js - Sound effects management
class SoundManager {
    constructor() {
        this.btnSound = new Audio('button_plim.wav');
        this.cardSound = new Audio('card_flip_whoosh.wav');
        this.btnSound.volume = 0.6;
        this.cardSound.volume = 0.6;
    }

    playButton() {
        if (gameMusic.isSoundEnabled) {
            this.btnSound.currentTime = 0;
            this.btnSound.play().catch(e => console.log("Sound play blocked"));
        }
    }

    playCard() {
        if (gameMusic.isSoundEnabled) {
            this.cardSound.currentTime = 0;
            this.cardSound.play().catch(e => console.log("Sound play blocked"));
        }
    }

    // ✅ Остановка всех звуков (CrazyGames Requirement)
    stopAll() {
        this.btnSound.pause();
        this.cardSound.pause();
        this.btnSound.muted = true;
        this.cardSound.muted = true;
    }

    resumeAll() {
        this.btnSound.muted = false;
        this.cardSound.muted = false;
    }
}

const gameSounds = new SoundManager();
