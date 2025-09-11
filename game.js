// Double Coin Dispatcher - Game Engine
class DoubleCoinDispatcher {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.timeLeft = 120;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        
        // Level configuration
        this.levelConfig = {
            1: {
                inboundDocks: 1,
                outboundDocks: 1,
                spawnInterval: 3000,
                truckTypes: ['inbound', 'outbound']
            },
            2: {
                inboundDocks: 2,
                outboundDocks: 2,
                spawnInterval: 2500,
                truckTypes: ['inbound', 'outbound']
            },
            3: {
                inboundDocks: 3,
                outboundDocks: 3,
                spawnInterval: 2000,
                truckTypes: ['inbound_tires', 'inbound_rims', 'inbound_tools', 'outbound_tires', 'outbound_rims', 'outbound_tools']
            }
        };
        
        // Game objects
        this.trucks = [];
        this.docks = [];
        this.particles = [];
        
        // Drag and drop
        this.dragging = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Timing
        this.lastTime = 0;
        this.truckSpawnTimer = 0;
        this.truckSpawnInterval = 3000; // 3 seconds
        this.gameTimer = 0;
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 60;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createDocks();
        this.bindEvents();
        this.gameLoop();
    }
    
    setupCanvas() {
        // Make canvas responsive
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Set up canvas styling
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }
    
    createDocks() {
        this.docks = []; // Clear existing docks
        const config = this.levelConfig[this.level];
        
        // Create inbound docks (left side)
        for (let i = 0; i < config.inboundDocks; i++) {
            const dockHeight = this.level === 3 ? 120 : 200;
            const spacing = this.level === 3 ? 140 : 220;
            const startY = this.level === 3 ? 150 : 200;
            
            let dockType, color, label;
            if (this.level === 3) {
                const types = ['inbound_tires', 'inbound_rims', 'inbound_tools'];
                const colors = ['#27ae60', '#16a085', '#2980b9'];
                const labels = ['INBOUND\nTIRES', 'INBOUND\nRIMS', 'INBOUND\nTOOLS'];
                dockType = types[i];
                color = colors[i];
                label = labels[i];
            } else {
                dockType = 'inbound';
                color = '#27ae60';
                label = 'INBOUND\nDOCK' + (config.inboundDocks > 1 ? ` ${i+1}` : '');
            }
            
            this.docks.push({
                type: dockType,
                x: 20 + (i * 60),
                y: startY + (i * (spacing / config.inboundDocks)),
                width: 100,
                height: dockHeight,
                color: color,
                label: label
            });
        }
        
        // Create outbound docks (right side)
        for (let i = 0; i < config.outboundDocks; i++) {
            const dockHeight = this.level === 3 ? 120 : 200;
            const spacing = this.level === 3 ? 140 : 220;
            const startY = this.level === 3 ? 150 : 200;
            
            let dockType, color, label;
            if (this.level === 3) {
                const types = ['outbound_tires', 'outbound_rims', 'outbound_tools'];
                const colors = ['#e74c3c', '#e67e22', '#f39c12'];
                const labels = ['OUTBOUND\nTIRES', 'OUTBOUND\nRIMS', 'OUTBOUND\nTOOLS'];
                dockType = types[i];
                color = colors[i];
                label = labels[i];
            } else {
                dockType = 'outbound';
                color = '#3498db';
                label = 'OUTBOUND\nDOCK' + (config.outboundDocks > 1 ? ` ${i+1}` : '');
            }
            
            this.docks.push({
                type: dockType,
                x: this.canvas.width - 120 - (i * 60),
                y: startY + (i * (spacing / config.outboundDocks)),
                width: 100,
                height: dockHeight,
                color: color,
                label: label
            });
        }
    }
    
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }
    
    onMouseDown(e) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if we clicked on a truck
        for (let truck of this.trucks) {
            if (this.isPointInTruck(x, y, truck)) {
                this.dragging = truck;
                this.dragOffset.x = x - truck.x;
                this.dragOffset.y = y - truck.y;
                truck.isDragging = true;
                break;
            }
        }
    }
    
    onMouseMove(e) {
        if (this.gameState !== 'playing' || !this.dragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.dragging.x = x - this.dragOffset.x;
        this.dragging.y = y - this.dragOffset.y;
    }
    
    onMouseUp(e) {
        if (this.gameState !== 'playing' || !this.dragging) return;
        
        const truck = this.dragging;
        truck.isDragging = false;
        
        // Check if truck was dropped on correct dock
        const dock = this.getDockAtPosition(truck.x + truck.width/2, truck.y + truck.height/2);
        
        if (dock) {
            this.processDropoff(truck, dock);
        } else {
            // Return truck to original position or remove it
            this.returnTruckToLane(truck);
        }
        
        this.dragging = null;
    }
    
    isPointInTruck(x, y, truck) {
        return x >= truck.x && x <= truck.x + truck.width &&
               y >= truck.y && y <= truck.y + truck.height;
    }
    
    getDockAtPosition(x, y) {
        for (let dock of this.docks) {
            if (x >= dock.x && x <= dock.x + dock.width &&
                y >= dock.y && y <= dock.y + dock.height) {
                return dock;
            }
        }
        return null;
    }
    
    processDropoff(truck, dock) {
        const isCorrect = truck.type === dock.type;
        
        if (isCorrect) {
            // Correct placement
            this.score += 100 + (this.combo * 10);
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            
            // Speed bonus
            const speedBonus = Math.max(0, Math.floor((5000 - truck.age) / 100));
            this.score += speedBonus;
            
            this.createParticles(truck.x + truck.width/2, truck.y + truck.height/2, '#27ae60', isCorrect);
            this.playSound('success');
            if (this.combo > 1) {
                this.playSound('combo', this.combo);
            }
        } else {
            // Wrong placement
            this.score = Math.max(0, this.score - 50);
            this.combo = 0;
            
            this.createParticles(truck.x + truck.width/2, truck.y + truck.height/2, '#e74c3c', isCorrect);
            this.playSound('error');
        }
        
        // Remove truck
        const index = this.trucks.indexOf(truck);
        if (index > -1) {
            this.trucks.splice(index, 1);
        }
        
        this.updateUI();
    }
    
    returnTruckToLane(truck) {
        // Animate truck back to its spawn lane or remove it
        truck.returning = true;
    }
    
    spawnTruck() {
        const config = this.levelConfig[this.level];
        const truckTypes = config.truckTypes;
        const type = truckTypes[Math.floor(Math.random() * truckTypes.length)];
        
        // Determine truck properties based on type
        let color, label, isInbound;
        if (this.level === 3) {
            const typeMap = {
                'inbound_tires': { color: '#27ae60', label: 'TIRES', isInbound: true },
                'inbound_rims': { color: '#16a085', label: 'RIMS', isInbound: true },
                'inbound_tools': { color: '#2980b9', label: 'TOOLS', isInbound: true },
                'outbound_tires': { color: '#e74c3c', label: 'TIRES', isInbound: false },
                'outbound_rims': { color: '#e67e22', label: 'RIMS', isInbound: false },
                'outbound_tools': { color: '#f39c12', label: 'TOOLS', isInbound: false }
            };
            const props = typeMap[type];
            color = props.color;
            label = props.label;
            isInbound = props.isInbound;
        } else {
            color = type === 'inbound' ? '#27ae60' : '#3498db';
            label = type === 'inbound' ? 'IN' : 'OUT';
            isInbound = type === 'inbound';
        }
        
        const truck = {
            type: type,
            x: isInbound ? -80 : this.canvas.width + 20,
            y: 100 + Math.random() * 50,
            width: 60,
            height: 30,
            speed: 0.5 + Math.random() * 0.5,
            color: color,
            label: label,
            isInbound: isInbound,
            isDragging: false,
            age: 0,
            returning: false,
            targetY: 100 + Math.random() * 50
        };
        
        this.trucks.push(truck);
        this.playSound('truck_spawn');
    }
    
    updateTrucks(deltaTime) {
        for (let i = this.trucks.length - 1; i >= 0; i--) {
            const truck = this.trucks[i];
            truck.age += deltaTime;
            
            if (!truck.isDragging && !truck.returning) {
                // Move truck across screen
                if (truck.isInbound) {
                    truck.x += truck.speed * deltaTime / 16; // Normalize for 60fps
                } else {
                    truck.x -= truck.speed * deltaTime / 16;
                }
                
                // Remove trucks that went off screen
                if ((truck.isInbound && truck.x > this.canvas.width + 50) ||
                    (!truck.isInbound && truck.x < -100)) {
                    this.trucks.splice(i, 1);
                    // Penalty for missing trucks
                    this.score = Math.max(0, this.score - 25);
                    this.combo = 0;
                }
            }
            
            if (truck.returning) {
                // Animate back to lane
                truck.x += (truck.isInbound ? -2 : 2) * deltaTime / 16;
                if (truck.x < -100 || truck.x > this.canvas.width + 100) {
                    this.trucks.splice(i, 1);
                }
            }
            
            // Remove trucks that are too old (timeout)
            if (truck.age > 10000) { // 10 seconds timeout
                this.trucks.splice(i, 1);
                this.score = Math.max(0, this.score - 25);
                this.combo = 0;
            }
        }
    }
    
    createParticles(x, y, color, success) {
        const count = success ? 10 : 5;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: color,
                life: 1.0,
                decay: 0.02
            });
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.drawDocks();
        this.drawTrucks();
        this.drawParticles();
        
        // Draw UI elements
        this.drawGameUI();
        
        // Draw game state overlays
        if (this.gameState === 'menu') {
            this.drawMenuOverlay();
        } else if (this.gameState === 'paused') {
            this.drawPauseOverlay();
        }
    }
    
    drawBackground() {
        // Warehouse floor
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Road lanes
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 80, this.canvas.width, 80);
        this.ctx.fillRect(0, 440, this.canvas.width, 80);
        
        // Lane dividers
        this.ctx.strokeStyle = '#f39c12';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 120);
        this.ctx.lineTo(this.canvas.width, 120);
        this.ctx.moveTo(0, 480);
        this.ctx.lineTo(this.canvas.width, 480);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawDocks() {
        for (let dock of this.docks) {
            // Dock area
            this.ctx.fillStyle = dock.color + '40';
            this.ctx.fillRect(dock.x, dock.y, dock.width, dock.height);
            
            // Dock border
            this.ctx.strokeStyle = dock.color;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(dock.x, dock.y, dock.width, dock.height);
            
            // Dock label
            this.ctx.fillStyle = dock.color;
            this.ctx.font = 'bold 16px Arial';
            const lines = dock.label.split('\n');
            lines.forEach((line, index) => {
                this.ctx.fillText(line, 
                    dock.x + dock.width/2, 
                    dock.y + dock.height/2 - 10 + (index * 25));
            });
        }
    }
    
    drawTrucks() {
        for (let truck of this.trucks) {
            this.ctx.save();
            
            // Truck shadow
            if (!truck.isDragging) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
                this.ctx.fillRect(truck.x + 2, truck.y + 2, truck.width, truck.height);
            }
            
            // Truck body
            this.ctx.fillStyle = truck.color;
            this.ctx.fillRect(truck.x, truck.y, truck.width, truck.height);
            
            // Truck outline
            this.ctx.strokeStyle = truck.isDragging ? '#f39c12' : '#2c3e50';
            this.ctx.lineWidth = truck.isDragging ? 3 : 2;
            this.ctx.strokeRect(truck.x, truck.y, truck.width, truck.height);
            
            // Truck cab
            this.ctx.fillStyle = '#2c3e50';
            const cabWidth = 15;
            if (truck.isInbound) {
                this.ctx.fillRect(truck.x, truck.y, cabWidth, truck.height);
            } else {
                this.ctx.fillRect(truck.x + truck.width - cabWidth, truck.y, cabWidth, truck.height);
            }
            
            // Truck wheels
            this.ctx.fillStyle = '#1a1a1a';
            const wheelRadius = 6;
            this.ctx.beginPath();
            this.ctx.arc(truck.x + 12, truck.y + truck.height, wheelRadius, 0, Math.PI * 2);
            this.ctx.arc(truck.x + truck.width - 12, truck.y + truck.height, wheelRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Type/SKU indicator
            this.ctx.fillStyle = 'white';
            this.ctx.font = this.level === 3 ? 'bold 8px Arial' : 'bold 10px Arial';
            this.ctx.fillText(truck.label, truck.x + truck.width/2, truck.y + truck.height/2);
            
            this.ctx.restore();
        }
    }
    
    drawParticles() {
        for (let p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawGameUI() {
        // Combo indicator
        if (this.combo > 1) {
            this.ctx.fillStyle = '#f39c12';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(`COMBO x${this.combo}!`, this.canvas.width/2, 50);
        }
        
        // Rush hour indicator (placeholder for future enhancement)
        // if (this.isRushHour) {
        //     this.ctx.fillStyle = '#e74c3c';
        //     this.ctx.font = 'bold 20px Arial';
        //     this.ctx.fillText('RUSH HOUR!', this.canvas.width/2, 30);
        // }
    }
    
    drawMenuOverlay() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f39c12';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('READY TO DISPATCH?', this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Click "Start Game" to begin!', this.canvas.width/2, this.canvas.height/2 + 50);
    }
    
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f39c12';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
    }
    
    updateGame(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update timer
        this.gameTimer += deltaTime;
        this.timeLeft = Math.max(0, 120 - Math.floor(this.gameTimer / 1000));
        
        if (this.timeLeft <= 0) {
            this.endGame();
            return;
        }
        
        // Spawn trucks
        this.truckSpawnTimer += deltaTime;
        if (this.truckSpawnTimer >= this.truckSpawnInterval) {
            this.spawnTruck();
            this.truckSpawnTimer = 0;
            
            // Gradually increase spawn rate
            const minInterval = this.level === 1 ? 1500 : (this.level === 2 ? 1200 : 1000);
            this.truckSpawnInterval = Math.max(minInterval, this.truckSpawnInterval - 50);
        }
        
        // Update game objects
        this.updateTrucks(deltaTime);
        this.updateParticles(deltaTime);
        
        // Update UI
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('timeValue').textContent = this.timeLeft;
        document.getElementById('levelValue').textContent = this.level;
    }
    
    selectLevel(level) {
        if (level >= 1 && level <= 3) {
            this.level = level;
            this.createDocks();
            this.updateUI();
            
            // Clear trucks when changing levels (if not playing)
            if (this.gameState !== 'playing') {
                this.trucks = [];
                this.particles = [];
            }
        }
    }
    
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.updateGame(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.timeLeft = 120;
        this.combo = 0;
        this.maxCombo = 0;
        this.trucks = [];
        this.particles = [];
        this.gameTimer = 0;
        this.truckSpawnTimer = 0;
        this.truckSpawnInterval = this.levelConfig[this.level].spawnInterval;
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        document.getElementById('gameOver').style.display = 'none';
        
        this.updateUI();
        this.playSound('game_start');
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseBtn').textContent = 'Resume';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseBtn').textContent = 'Pause';
        }
    }
    
    endGame() {
        this.gameState = 'gameOver';
        
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
        
        // Save to leaderboard
        this.saveScore(this.score);
        this.playSound('game_over');
    }
    
    playSound(type, ...args) {
        if (window.audioSystem) {
            window.audioSystem.play(type, ...args);
        }
    }
    
    saveScore(score) {
        const leaderboard = JSON.parse(localStorage.getItem('dcDispatcherLeaderboard') || '[]');
        const entry = {
            score: score,
            date: new Date().toISOString(),
            maxCombo: this.maxCombo
        };
        
        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(10); // Keep only top 10
        
        localStorage.setItem('dcDispatcherLeaderboard', JSON.stringify(leaderboard));
    }
}

// Initialize game
let game;

window.addEventListener('load', () => {
    game = new DoubleCoinDispatcher();
});

// Global functions for UI buttons
function startGame() {
    if (game) {
        game.startGame();
    }
}

function pauseGame() {
    if (game) {
        game.pauseGame();
    }
}

function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('dcDispatcherLeaderboard') || '[]');
    
    let message = 'TOP DISPATCHERS:\n\n';
    if (leaderboard.length === 0) {
        message += 'No scores yet! Be the first to play!';
    } else {
        leaderboard.forEach((entry, index) => {
            const date = new Date(entry.date).toLocaleDateString();
            message += `${index + 1}. ${entry.score} points (Combo: ${entry.maxCombo}) - ${date}\n`;
        });
    }
    
    alert(message);
}
