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
})("HARD")

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

function initialStates() {
  return {
    "bgImage": [{ x: 0, y: 0 }],
    "bird": [{ x: 0, y: 120, yspeed: 0, yacc: 200, score: 0 }],
    "upperPipes": [
      { x: 25, y: -100, xspeed: -30 },
      { x: 75, y: -50, xspeed: -30 },
      { x: 130, y: -70, xspeed: -30 }
    ],
    "lowerPipes": [
      { x: 25, y: 150, xspeed: -30 },
      { x: 75, y: 150, xspeed: -30 },
      { x: 130, y: 160, xspeed: -30 }
    ],
  }
}

addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    keyPresses.push(true)
  }
  if (gameOver && event.key === 'Enter') {
    gameOver = false
    loop(initialStates())
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
  requestAnimationFrame(() => loop(newState(states)))
}
loop(initialStates())

function newState(prevState) {
  let newState = {}
  for (state in prevState) {
    switch (state) {
      case "bgImage":
        newState["bgImage"] = [{ x: 0, y: 0 }]
        break
      case "bird":
        newState["bird"] = prevState[state].map(s => ({
          x: s.x,
          y: s.y + s.yspeed * modifier,
          yspeed: keyPresses.length ? -100 : s.yspeed + s.yacc * modifier,
          yacc: s.yacc,
          score: prevState['upperPipes'].some(pipe => pipe.x < -25) ? s.score + 1 : s.score
        }))
        break
      case "upperPipes":
        newState["upperPipes"] = prevState[state].map(s => newPipeState(s, 'upper'))
        break
      case "lowerPipes":
        newState["lowerPipes"] = prevState[state].map(s => newPipeState(s, 'lower'))
        break
    }
  }
  destroy(prevState)
  if (detectCollision(newState)) {
    gameOver = true
    const { bird } = newState
    displayScore(bird[0].score)
    ctx.font = "12px Helvetica"
    ctx.fillText("press enter to continue", 10, 110)
    return initialStates()
  }
  return newState
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

function destroy(obj) {
  for (let prop in obj) {
    delete obj[prop]
  }
  obj = null
}

function newPipeState(prevState, pipe) {
  if (prevState.x < -25) {
    return {
      x: 144,
      y: (pipe === 'upper' ? -30 : 200) - Math.random() * 50,
      xspeed: prevState.xspeed
    }
  }
  return {
    x: prevState.x + prevState.xspeed * modifier * difficulty,
    y: prevState.y, xspeed: prevState.xspeed
  }
}
