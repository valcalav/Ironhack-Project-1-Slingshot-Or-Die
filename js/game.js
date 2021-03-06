const appGame = {
    name: 'Slingshot or die',
    description: 'Use your slingshot to survive!',
    authors: 'Verónica Alcalá & Jaime Fernández',
    version: '1.0.0',
    license: undefined,
    /** @type {CanvasRenderingContext2D} */
    ctx: undefined,
    canvasDOM: undefined,
    canvasSize: {
        w: undefined,
        h: undefined
    },
    startImage: undefined,
    boardImage: undefined,
    slingShot: undefined,
    heart: undefined,
    wave: 1,
    characters: [],
    bloodSpills: [],
    explosions: [],
    cracks: [],
    isCollisionDistance: undefined,
    enemiesFrequency: 80,
    frames: 0,
    endWaveFrames: 0,
    waveBanners: [],
    score: 0,
    enemiesKilled: 0,
    innocentsKilled: 0,
    innocentsSaved: 0,
    highscore: localStorage.getItem("highscore"),
    maxLives: 5,
    lives: undefined,
    hearts: [],
    init(id) {
        this.canvasDOM = document.getElementById(id)
        this.ctx = this.canvasDOM.getContext('2d')
        this.setDimensions()
        this.printStartScreen()
        this.canvasDOM.addEventListener('click', e => { !this.frames && this.startGame() })
    },
    printStartScreen() {
        this.startImage = new Image()
        this.startImage.src = "./img/startbackground.jpg"
        this.startImage.onload = () => {
            this.ctx.drawImage(this.startImage, -50, 0, this.canvasSize.w + 100, this.canvasSize.h + 200)
            this.ctx.textAlign = 'center'
            this.ctx.fillStyle = 'rgba(200,200,200, 0.9)'
            this.ctx.font = '17px "Press Start 2P"'
            this.ctx.fillText(`You have THE Holy Slingshot`, this.canvasSize.w / 2, Math.floor(this.canvasSize.h * 2 / 3) - 60)
            this.ctx.fillText(`blessed by Archbishop Germán`, this.canvasSize.w / 2, Math.floor(this.canvasSize.h * 2 / 3) - 20)
            this.ctx.fillText(`and Father Teo.`, this.canvasSize.w / 2, Math.floor(this.canvasSize.h * 2 / 3) + 20)
            this.ctx.fillText(`Use your mouse to control the slingshot,`, this.canvasSize.w / 2, Math.floor(this.canvasSize.h * 2 / 3) + 90)
            this.ctx.fillText(`kill dragons and save innocents.`, this.canvasSize.w / 2, Math.floor(this.canvasSize.h * 2 / 3) + 130)
            this.ctx.font = '25px "Press Start 2P"'
            this.ctx.fillText(`Click when ready!`, this.canvasSize.w / 2, Math.floor(this.canvasSize.h * 2 / 3) + 220)
            this.ctx.textAlign = 'left'
            this.ctx.fillStyle = 'white'
        }
    },
    setEventListeners() {
        this.slingShot.setEventListeners()
    },
    setDimensions() {
        this.canvasSize = {
            w: 900,
            h: window.innerHeight
        }
        this.canvasDOM.setAttribute('width', this.canvasSize.w)
        this.canvasDOM.setAttribute('height', this.canvasSize.h)
    },
    startGame() {
        sounds.gameStart.play()
        this.lives = this.maxLives
        this.createSlingshot()
        this.setEventListeners()
        this.interval = setInterval(() => {
            this.frames++
            this.clearScreen()
            this.createWave()
            this.drawAll()
            this.animateAll()
            this.updateScore(this.isCollision())
            this.clearCharacter()
            this.clearBombs()
            this.isGameOver()
        }, 40)
    },
    drawAll() {
        this.showBoardImage()
        this.printLives()
        this.printScore()
        this.explodeBomb()
        this.slingShot.draw()
        this.characters.forEach(elm => elm.draw(this.frames))
        this.waveBanners.forEach(elm => elm.draw())
        this.bloodSpills.forEach(elm => elm.draw())
    },
    animateAll() {
        this.slingShot.bombs.forEach(elm => elm.animate())
        this.explosions.forEach(elm => elm.animate())
        this.bloodSpills.forEach(elm => elm.animate())
    },
    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h)
    },
    showBoardImage() {
        this.boardImage = new Image()
        this.boardImage.src = "./img/background.jpg"
        this.ctx.drawImage(this.boardImage, -50, 0, this.canvasSize.w + 100, this.canvasSize.h + 200)
    },
    showHeartImg(num) {
        this.heart = new Image()
        this.heart.src = "./img/heart.png"
        this.ctx.globalAlpha = 0.7
        this.ctx.drawImage(this.heart, num, this.canvasSize.h - 80, 40, 40)
        this.ctx.globalAlpha = 1.0
    },
    showEmptyHeartImg(num) {
        let heart = new Image()
        heart.src = "./img/heartgris.png"
        this.ctx.globalAlpha = 0.5
        this.ctx.drawImage(heart, num, this.canvasSize.h - 80, 40, 40)
        this.ctx.globalAlpha = 1.0
    },
    createWave() {
        this.wave === 1 && this.firstWave()
        if (this.wave === 2) {
            this.frames >= (this.endWaveFrames + 350) && this.secondWave()
        }
        if (this.wave === 3) {
            this.frames >= (this.endWaveFrames + 250) && this.thirdWave()
        }
    },
    firstWave() {
        !(this.frames % this.enemiesFrequency) && this.createRedDragon()
        !(this.frames % 80) && this.enemiesFrequency--
        if (this.enemiesFrequency === 60) {
            this.wave = 2
            this.wave === 2 && this.waveBanners.push(new Banner(this.ctx, "SECOND WAVE COMING!"))
            setTimeout(() => { sounds.waves.play() }, 7000)
            this.endWaveFrames = this.frames
            this.enemiesFrequency = 70
        }
    },
    secondWave() {
        !(this.frames % this.enemiesFrequency) && this.createRedDragon()
        !(this.frames % 80) && this.enemiesFrequency--
        !(this.frames % 400) && this.createInnocent()
        if (this.enemiesFrequency === 45) {
            this.wave = 3
            this.wave === 3 && this.waveBanners.push(new Banner(this.ctx, "THIRD WAVE COMING!"))
            this.endWaveFrames = this.frames
            this.enemiesFrequency = 50
        }
    },
    thirdWave() {
        !(this.frames % this.enemiesFrequency) && this.createRedDragon()
        !(this.frames % 80) && this.enemiesFrequency--
        !(this.frames % 80) && this.createWhiteDragon()
        !(this.frames % 400) && this.createInnocent()
        if (this.enemiesFrequency === 1) {
            this.enemiesFrequency += 5
        }
    },
    createSlingshot() {
        this.slingShot = new Slingshot(this.ctx, this.canvasDOM, this.canvasSize, this.canvasSize.w / 2 - 25, this.canvasSize.h - 200, 100, 100, this.lives)
    },
    createRedDragon() {
        this.characters.push(new Character(this.ctx, this.canvasSize, 'redDragon', 40))
    },
    createWhiteDragon() {
        this.characters.push(new Character(this.ctx, this.canvasSize, 'whiteDragon', 40))
    },
    createInnocent() {
        this.characters.push(new Character(this.ctx, this.canvasSize, 'innocent', 10))
    },
    clearCharacter() {
        this.characters.forEach((elm, i) => {
            elm.position.y > this.canvasSize.h + elm.radius ? this.characters.splice(i, 1) : null
        })
        this.bloodSpills.forEach((elm, i) => {
            elm.clearSpill(this.frames) && this.bloodSpills.splice(i, 1)
        })
    },
    clearBombs() {
        this.slingShot.bombs.forEach((elm, i) => {
            if (elm.hasBombLanded()) {
                this.explosions.push(new Explosions(this.ctx, elm.position))
                this.slingShot.bombs.splice(i, 1)
                this.cracks.push(new Crack(this.ctx, elm.position))
            }
        })
    },
    explodeBomb() {
        this.cracks.forEach(elm => elm.draw())
        this.explosions.forEach((elm, i) => {
            elm.explode()
            sounds.explosion.play()
            elm.radius === 84 ? this.explosions.splice(i, 1) : null
        })
    },
    isCollision() {
        let returnedCharacter = undefined
        this.explosions.forEach(eachExp => {
            this.characters.forEach((eachCharacter, eachCharacterIndex) => {
                this.isCollisionDistance = Math.sqrt((eachExp.position.x - eachCharacter.position.x) ** 2 + (eachExp.position.y - eachCharacter.position.y) ** 2)
                if (this.isCollisionDistance < eachExp.radius + eachCharacter.radius) {
                    returnedCharacter = eachCharacter.character
                    this.characters.splice(eachCharacterIndex, 1)
                    if (returnedCharacter === 'innocent') {
                        sounds.innocentCry.play()
                    } else {
                        sounds.dragonCry.play()
                        sounds.blood.play()
                    }
                    this.bloodSpills.push(new Spill(this.ctx, returnedCharacter, eachCharacter.position, this.frames))
                }
            })
        })
        return returnedCharacter
    },
    updateScore(character) {
        if (character === 'redDragon') {
            this.score += 100
            this.enemiesKilled++
        }
        else if (character === 'whiteDragon') {
            this.score += 200
            this.enemiesKilled++
        }
        else if (character === 'innocent') {
            this.score -= 200
            this.innocentsKilled++
        }
        this.characters.forEach(elm => {
            if ((elm.character === 'redDragon' || elm.character === 'whiteDragon') && elm.position.y > this.canvasSize.h + elm.radius) {
                this.lives--
                this.slingShot.lives--
                sounds.dragonRoar.play()
            } else if (elm.character === 'innocent' && elm.position.y > this.canvasSize.h + elm.radius) {
                this.lives === 5 ? null : this.lives++
                this.slingShot.lives++
                this.innocentsSaved++
                sounds.extraLive.play()
            }
        })
    },
    printScore() {
        this.ctx.fillStyle = 'rgba(10,10,10, 0.5)'
        this.ctx.font = '30px "Press Start 2P"'
        this.ctx.fillText(`SCORE: ${this.score}`, 60, this.canvasSize.h - 40)
        this.ctx.fillStyle = 'white'
    },
    printLives() {
        for (let i = 0; i < this.maxLives; i++) {
            i < this.lives && this.showHeartImg(i * 50 + 600)
            i >= this.lives && this.showEmptyHeartImg(i * 50 + 600)
        }
    },
    isGameOver() {
        if (this.lives === 0) {
            clearInterval(this.interval)
            sounds.gameOver.play()
            this.clearScreen()
            this.score > this.highscore ? this.highscore = this.score : null
            localStorage.setItem("highscore", this.highscore)
            this.showBoardImage()
            this.ctx.textAlign = 'center'
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
            this.ctx.font = '80px "Press Start 2P"'
            this.ctx.fillText(`GAME OVER`, this.canvasSize.w / 2, this.canvasSize.h / 2 - 150)
            this.ctx.font = '45px "Press Start 2P"'
            this.ctx.fillText(`High score: ${this.highscore}`, this.canvasSize.w / 2, this.canvasSize.h / 2 - 50)
            this.ctx.font = '35px "Press Start 2P"'
            this.ctx.fillText(`Your score: ${this.score}`, this.canvasSize.w / 2, this.canvasSize.h / 2 + 50)
            this.ctx.font = '20px "Press Start 2P"'
            this.ctx.fillText(`Enemies killed: ${this.enemiesKilled}`, this.canvasSize.w / 2, this.canvasSize.h / 2 + 100)
            this.ctx.fillText(`Innocents killed: ${this.innocentsKilled}`, this.canvasSize.w / 2, this.canvasSize.h / 2 + 150)
            this.ctx.fillText(`Innocents saved: ${this.innocentsSaved}`, this.canvasSize.w / 2, this.canvasSize.h / 2 + 200)
            this.ctx.font = '25px "Press Start 2P"'
            this.ctx.fillText(`Click to play again!`, this.canvasSize.w / 2, this.canvasSize.h / 2 + 280)
            this.ctx.textAlign = 'left'
            this.ctx.fillStyle = 'white'
            this.resetGame()
        }
    },
    resetGame() {
        this.slingShot = undefined
        this.wave = 1
        this.characters = []
        this.bloodSpills = []
        this.explosions = []
        this.cracks = []
        this.isCollisionDistance = undefined
        this.enemiesFrequency = 80
        this.frames = 0
        this.endWaveFrames = 0
        this.waveBanners = []
        this.score = 0
        this.lives = this.maxLives
        this.hearts = []
    }
}