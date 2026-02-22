// music.js - Background music management
class MusicManager {
    constructor() {
        this.bgMusic = new Audio('musick_1.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;
        this.isStarted = false;
        this.isMuted = false;
        this.isSoundEnabled = true;

        // Auto-play might be blocked by browser, so we listen for the first interaction
        window.addEventListener('click', () => {
            if (!this.isMuted) this.play();
        }, { once: true });
        
        window.addEventListener('touchstart', () => {
            if (!this.isMuted) this.play();
        }, { once: true });

        // ✅ Остановка звука при переключении вкладки (CrazyGames Requirement)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.bgMusic.pause();
                if (window.gameSounds) gameSounds.stopAll();
            } else {
                if (window.gameSounds) gameSounds.resumeAll();
                if (!this.isMuted && this.isStarted) {
                    this.bgMusic.play().catch(() => {});
                }
            }
        });
    }

    play() {
        if (this.isStarted || this.isMuted) return;
        this.bgMusic.play().then(() => {
            this.isStarted = true;
            console.log("Background music started");
        }).catch(err => {
            console.log("Audio play blocked by browser. Waiting for interaction.");
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgMusic.pause();
        } else {
            this.bgMusic.play();
        }
        return this.isMuted;
    }

    toggleSound() {
        this.isSoundEnabled = !this.isSoundEnabled;
        return this.isSoundEnabled;
    }

    stop() {
        this.bgMusic.pause();
        this.bgMusic.muted = true; // Дополнительная страховка
        this.isStarted = false;
    }
}

const gameMusic = new MusicManager();
