let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")
const modifier = 0.015
let gameOver = false
let imagePaths = imgPaths()
let keyPresses = []
const difficulty = ((str) => {
  switch (str) {
    case "EASY":
      return 1.5
    case "MEDIUM":
      return 2
    case "HARD":
      return 2.5
  }
})("MEDIUM")

function image(path) {
  const img = new Image();
  img.src = path;
  return new Promise(resolve => img.onload = () => resolve(img))
}

function imgPaths() {
  return {
    "bgImage": "assets/background.png",
    "bird": "assets/bird.png",
    "upperPipes": "assets/upper.png",
    "lowerPipes": "assets/lower.png"
  }
}

class Bird {
  constructor() {
    this.x = 0
    this.y = 120
    this.yspeed = 0
    this.yacc = 200
    this.score = 0
  }
}

class Pipe {
  constructor(x, y, xspeed) {
    this.x = x
    this.y = y
    this.xspeed = xspeed
  }
}

function initalStates() {
  return {
    "bgImage": [{ x: 0, y: 0 }],
    "bird": [new Bird()],
    "upperPipes": [new Pipe(25, -100, -30), new Pipe(75, -50, -30), new Pipe(130, -70, -30)],
    "lowerPipes": [new Pipe(25, 150, -30), new Pipe(75, 150, -30), new Pipe(130, 160, -30)]
  }
}

addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    keyPresses.push(true)
  }
  if (gameOver && event.key === 'Enter') {
    gameOver = false
    loop(initalStates())
  }
})

addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp') {
    keyPresses.pop()
  }
})

function render(states) {
  for (let state in states) {
    states[state].forEach(async s => {
      const img = await image(imagePaths[state])
      ctx.drawImage(img, s.x, s.y)
    })
  }
  const { bird } = states
  displayScore(bird[0].score)
}

function displayScore(score) {
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`score: ${score}`, 35, 15);
}


function loop(states) {
  if (gameOver) return
  render(states)
  requestAnimationFrame(() => loop(newStates(states)))
}
loop(initalStates())

function newStates(prevState) {
  prevState['bird'].forEach(bird => {
    bird.y += bird.yspeed * modifier
    bird.yspeed = keyPresses.length ? -100 : bird.yspeed + bird.yacc * modifier
    bird.score = prevState['upperPipes'].some(pipe => pipe.x < -25) ? bird.score + 1 : bird.score
  })
  prevState['upperPipes'].forEach(pipe => {
    if (pipe.x < -25) {
      pipe.x = 144
      pipe.y = -30 - Math.random() * 50
    } else {
      pipe.x += pipe.xspeed * modifier * difficulty
    }
  })
  prevState['lowerPipes'].forEach(pipe => {
    if (pipe.x < -25) {
      pipe.x = 144
      pipe.y = 200 - Math.random() * 50
    } else {
      pipe.x += pipe.xspeed * modifier * difficulty
    }
  })
  if (detectCollision(prevState)) {
    gameOver = true
    const { bird } = prevState
    displayScore(bird[0].score)
    ctx.font = "12px Helvetica"
    ctx.fillText("press enter to continue", 10, 110)
    return initalStates()
  }
  return prevState
}

function detectCollision(state) {
  const { bird, ...rest } = state
  let upperPipeCollision = rest['upperPipes'].some(pipe =>
    pipe.x < 15 && bird[0].y < pipe.y + 135
  )
  let lowerPipeCollision = rest['lowerPipes'].some(pipe =>
    pipe.x < 15 && bird[0].y > pipe.y - 10
  )
  return upperPipeCollision || lowerPipeCollision
}
