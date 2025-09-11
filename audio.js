// Simple Audio System for Double Coin Dispatcher
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.sounds = {};
        this.enabled = true;
        
        this.init();
    }
    
    init() {
        try {
            // Create Web Audio API context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3; // Master volume
            
            // Resume context on first user interaction (required by browsers)
            document.addEventListener('click', this.resumeContext.bind(this), { once: true });
            document.addEventListener('touchstart', this.resumeContext.bind(this), { once: true });
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }
    
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Create a simple oscillator-based sound
    createTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Envelope for smooth attack and release
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Create a more complex sound with multiple tones
    createChord(frequencies, duration, type = 'sine', volume = 0.2) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, duration, type, volume);
            }, index * 50); // Slight delay between notes for chord effect
        });
    }
    
    // Success sound - ascending chord
    playSuccess() {
        this.createChord([440, 554.37, 659.25], 0.3, 'sine', 0.25); // A, C#, E major chord
    }
    
    // Error sound - descending dissonant tone
    playError() {
        this.createTone(220, 0.2, 'sawtooth', 0.3);
        setTimeout(() => {
            this.createTone(185, 0.3, 'sawtooth', 0.2);
        }, 100);
    }
    
    // Truck spawn sound - quick beep
    playTruckSpawn() {
        this.createTone(800, 0.1, 'square', 0.15);
    }
    
    // Combo sound - rising pitch
    playCombo(comboCount) {
        const baseFreq = 440;
        const freq = baseFreq * Math.pow(1.2, Math.min(comboCount, 10));
        this.createTone(freq, 0.2, 'sine', 0.2);
    }
    
    // Game start sound - fanfare
    playGameStart() {
        const melody = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.3, 'triangle', 0.25);
            }, index * 200);
        });
    }
    
    // Game over sound - descending melody
    playGameOver() {
        const melody = [880, 659.25, 523.25, 392]; // A, E, C, G
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.5, 'sine', 0.2);
            }, index * 300);
        });
    }
    
    // Rush hour sound - intense beeping
    playRushHour() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createTone(1000, 0.1, 'square', 0.2);
            }, i * 150);
        }
    }
    
    // Play specific sound effect
    play(soundName, ...args) {
        if (!this.enabled) return;
        
        switch (soundName) {
            case 'success':
                this.playSuccess();
                break;
            case 'error':
                this.playError();
                break;
            case 'truck_spawn':
                this.playTruckSpawn();
                break;
            case 'combo':
                this.playCombo(args[0] || 1);
                break;
            case 'game_start':
                this.playGameStart();
                break;
            case 'game_over':
                this.playGameOver();
                break;
            case 'rush_hour':
                this.playRushHour();
                break;
            default:
                console.warn('Unknown sound:', soundName);
        }
    }
    
    // Toggle audio on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // Set master volume
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
}

// Create global audio system instance
window.audioSystem = new AudioSystem();
