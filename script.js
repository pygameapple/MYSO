const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

function resizeCanvas(){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener("resize", resizeCanvas)

let ship = {x:0,y:0,speed:6}
let bullets = []
let fires = []
let score = 0
let highScore = 0
let gameOver = false
let started = false
let keys = {}

let lastDir = {x:0, y:-1}

const up = document.getElementById("up")
const down = document.getElementById("down")
const left = document.getElementById("left")
const right = document.getElementById("right")
const shoot = document.getElementById("shoot")

const fireImg = new Image()
fireImg.src="images/asteroid.png"

const shipLeft = new Image()
shipLeft.src = "images/IfMisoGoesLeft.png"

const shipRight = new Image()
shipRight.src = "images/IfMisoGoesRight.png"

const shipUpDown = new Image()
shipUpDown.src = "images/IfMisoGoesUporDown.png"

const startScreen = document.getElementById("startScreen")
startScreen.addEventListener("click", ()=>{
    startScreen.style.display = "none"
    started = true
    resetGame()
})

document.addEventListener("keydown", e => keys[e.key] = true)
document.addEventListener("keyup", e => keys[e.key] = false)

function bind(btn, key){
    btn.addEventListener("touchstart", ()=>keys[key]=true)
    btn.addEventListener("touchend", ()=>keys[key]=false)
    btn.addEventListener("mousedown", ()=>keys[key]=true)
    btn.addEventListener("mouseup", ()=>keys[key]=false)
}

bind(up, "ArrowUp")
bind(down, "ArrowDown")
bind(left, "ArrowLeft")
bind(right, "ArrowRight")
bind(shoot, " ")

function spawnFire(size=50){
    let x,y
    do{
        x = Math.random()*canvas.width
        y = Math.random()*canvas.height
    }while(Math.hypot(x-ship.x, y-ship.y) < 150)

    fires.push({
        x:x,
        y:y,
        dx:(Math.random()-0.5)*2,
        dy:(Math.random()-0.5)*2,
        size:size
    })
}

function resetGame(){
    ship.x = canvas.width/2
    ship.y = canvas.height/2
    bullets = []
    fires = []
    score = 0
    highScore = 0
    gameOver = false

    for(let i=0;i<3;i++) spawnFire()
}

let fireTimer = 0

function update(){
    if(!started || gameOver) return

    const shipSize = Math.min(canvas.width, canvas.height)/3

    if(keys["ArrowLeft"]){
        ship.x -= ship.speed
        lastDir = {x:-1, y:0}
    }
    if(keys["ArrowRight"]){
        ship.x += ship.speed
        lastDir = {x:1, y:0}
    }
    if(keys["ArrowUp"]){
        ship.y -= ship.speed
        lastDir = {x:0, y:-1}
    }
    if(keys["ArrowDown"]){
        ship.y += ship.speed
        lastDir = {x:0, y:1}
    }

    ship.x = Math.max(20, Math.min(canvas.width-20, ship.x))
    ship.y = Math.max(20, Math.min(canvas.height-20, ship.y))

    if(keys[" "]){
        bullets.push({
            x: ship.x,
            y: ship.y,
            dx: lastDir.x * 12,
            dy: lastDir.y * 12
        })
        keys[" "] = false
    }

    bullets.forEach(b=>{
        b.x += b.dx
        b.y += b.dy
    })

    bullets = bullets.filter(b =>
        b.x > 0 && b.x < canvas.width &&
        b.y > 0 && b.y < canvas.height
    )

    fireTimer++
    if(fireTimer>120){
        spawnFire()
        fireTimer = 0
    }

    fires.forEach(f=>{
        f.x += f.dx
        f.y += f.dy
    })

    bullets.forEach((b, bi)=>{
        fires.forEach((f, fi)=>{
            if(Math.hypot(b.x-f.x, b.y-f.y) < f.size){
                score += 10
                bullets.splice(bi, 1)
                fires.splice(fi, 1)
                spawnFire()
            }
        })
    })

    fires.forEach(f=>{
        if(Math.hypot(ship.x-f.x, ship.y-f.y) < f.size){
            gameOver = true
            if(score > highScore) highScore = score
        }
    })
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)

    ctx.fillStyle = "#2E7D32"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    ctx.fillStyle = "#4CAF50"
    ctx.fillRect(20,20,canvas.width-40,canvas.height-40)

    const shipSize = Math.min(canvas.width, canvas.height)/3

    let currentShip = shipUpDown
    if(lastDir.x === -1) currentShip = shipLeft
    else if(lastDir.x === 1) currentShip = shipRight

    ctx.drawImage(
        currentShip,
        ship.x-shipSize/2,
        ship.y-shipSize/2,
        shipSize,
        shipSize
    )

    ctx.fillStyle="#00BFFF"
    bullets.forEach(b=>{
        ctx.fillRect(b.x-5,b.y-5,10,10)
    })

    fires.forEach(f=>{
        ctx.drawImage(fireImg,f.x-f.size,f.y-f.size,f.size*2,f.size*2)
    })

    ctx.fillStyle="white"
    ctx.font="20px monospace"
    ctx.fillText("Score: "+score,20,30)
    ctx.fillText("Highscore: "+highScore,20,60)

    if(gameOver){
        ctx.font="40px monospace"
        ctx.fillText("GAME OVER", canvas.width/2-120, canvas.height/2)

        ctx.font="20px monospace"
        ctx.fillText("Tap to restart", canvas.width/2-90, canvas.height/2+40)
    }
}

function loop(){
    update()
    draw()
    requestAnimationFrame(loop)
}
loop()

canvas.addEventListener("click", ()=>{
    if(gameOver) resetGame()
})
