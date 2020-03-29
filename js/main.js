// this program lets a human play tictactoe against an ai
// the human always goes first
// the ai looks a number of turns ahead to move
// as well as having some heuristics for weighting boards
//
// only 8 ways to win need to be checked
// 3 vertical, 3 horizontal, 2 diagonal
//
// typical game loop
// 1. wait for human input
// 1a. check for win
// 2. call function for computer move then execute move
// 2a. check for loss
// 3. repeat 1 and 2 until no spaces are left
// 3a. an easy way to do that is if computer cannot move, the game is a tie
// 
// settings before game starts
// 1. cpu difficulty
// 2. maybe some cosmetics (color of backgrounds?)
//

// index numbers of winning combos (triplets)
const triplets = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
]

// board array stores all moves: 0 = empty, 1 = player, 2 = cpu
let board = []
// box stores DOM elements for the 9 boxes
let boxes = []
// game difficulty variable
let diff = 3 // we'll just use 1-3-5

// user can only click if canGo
let canGo = false

for (i = 0; i < 9; i++) {
  // we will do one for loop and fill up the board (array of ints)
  // as well as boxes (array of DOM elements)
  board[i] = 0
  boxes[i] = document.getElementById('box' + (i + 1).toString())

}

// typical syntax: boxes[1].style.backgroundColor = "red"

// store the DOM form
const gameForm = document.getElementById("gameForm")
const startButton = document.getElementById("gameStart")
const resetButton = document.getElementById("gameReset")
const messages = document.getElementById("messages")
const easy = document.getElementById("easy")
const medium = document.getElementById("medium")
const hard = document.getElementById("hard")

// add a listener for form submittal
gameForm.addEventListener("submit", (e) => {
  e.preventDefault()
  console.log(e)

  // determine the difficult based on the radio buttons
  // only one can be pressed at once

  if (easy.checked) {
    diff = 1
    printMsg('Easy CPU chosen.')
  } else if (medium.checked) {
    printMsg('Medium CPU chosen.')
    diff = 3
  } else if (hard.checked) {
    diff = 6
    printMsg('Hard CPU chosen.')
  } else {
    diff = 3
    printMsg('No difficulty chosen. \n CPU starting as medium.')
  }

  startButton.disabled = true
  canGo = true
})

// add a listener for reset button
resetButton.addEventListener("click", (e) => {
  e.preventDefault()

  // reset function here
  resetGame()
})

// add listeners for hover and click for game boxes
for (let i = 0; i < boxes.length; i++) {
  boxes[i].addEventListener("mouseover", (e) => {
    if (canGo) { boxes[i].style.backgroundColor = 'blue' }
  })
  boxes[i].addEventListener("mouseout", (e) => {
    boxes[i].style.backgroundColor = null
  })

  boxes[i].addEventListener("click", (e) => {
    // process a move with the input i (corresponds to the 1d matrix, or array)
    // we always edit the board and not directly the box html
    // a function called printBoard will take the board and print to the boxes

    // only do these things if canGo
    if (canGo) {
      console.log('diff ' + diff)
      canGo = false
      let moveIndex = parseInt(boxes[i].id[3] - 1)
      // if the space is empty we make the move
      if (board[moveIndex] === 0) {
        board[moveIndex] = 1
        printBoard()
        // check victory
        processWin()

        // computer goes here
        let cpu = cpuMove()
        console.log('Move: ' + cpu)
        if (cpu > -1) {
          board[cpu] = 2
        } else {
          // it's a tie
          canGo = false
          printMsg('========')
          printMsg(' No more legal moves! ')
          printMsg(' Reset to play again! ')
          printMsg('========')
        }
        printBoard()
        console.log(scoreBoard(board))
        canGo = true

        // check victory
        processWin()


        // if computer went and game not over, player needs to go again

      } else {
        printMsg('That space already has a piece.')
        canGo = true // if player picked illegal move he needs to move again
      }


    }

  })
}


// function to print the board to html boxes
function printBoard() {
  // take the state of the global variable, board and change each box
  for (let i = 0; i < board.length; i++) {
    if (board[i] === 1) {
      boxes[i].innerHTML = 'X'
    } else if (board[i] === 2) {
      boxes[i].innerHTML = 'O'
    } else if (board[i] !== 0) {
      console.log(`Position ${i} is not equal to 0, 1, or 2`)
    }
  }
}

// function to quickly print one string to messages box
function printMsg(msg) {
  // messages variable holds our element
  messages.innerHTML += msg + '<br> <br>'
}

function eraseMsg() {
  // nuke all content in messages
  messages.innerHTML = ''
}

function resetGame() {
  canGo = false
  startButton.disabled = false

  for (let i = 0; i < board.length; i++) {
    board[i] = 0
    boxes[i].innerHTML = ''
  }

  eraseMsg()
  printMsg('Game was reset.')
}

// checkwin function handles posting a message if either victory is achieved
function checkWin(board) {
  for (trip of triplets) {

    let pieces = { '0': 0, '1': 0, '2': 0 }

    for (let num of trip) {

      pieces[board[num].toString()]++

    }

    if (pieces['2'] === 3) {
      return -1
    } else if (pieces['1'] === 3) {
      return 1
    }

  }
  return 0
}

function processWin() {
  // flag: 1 = player win, -1 = cpu win, 0 = neither
  const flag = checkWin(board)

  switch (flag) {
    case 1:
      canGo = false
      printMsg('===========')
      printMsg(' You won! ')
      printMsg(' Reset to play again! ')
      printMsg('===========')
      break
    case -1:
      canGo = false
      printMsg('===========')
      printMsg(' You lost... ')
      printMsg(' Reset to play again! ')
      printMsg('===========')
      break
    default:
      canGo = true
  }

}


// function cpuMove
function cpuMove() {
  // for each space calculate the score of the move
  // save the highest one
  bestMove = [-1, -Infinity]

  for (let i = 0; i < board.length; i++) {
    if (board[i] === 0) {
      let mockBoard = board.slice()
      mockBoard[i] = 2

      currentMove = [i, evaluateBoard(mockBoard, 2, diff)]
      if (bestMove[1] < currentMove[1]) {
        bestMove = currentMove
      }
      console.log(`Move: ${currentMove[0]}, Score: ${currentMove[1]}`)
    }
  }


  // return -1 is for no available moves
  return bestMove[0]
}

// function evaluate move using a version of minimax
// board = length 9 array representing 3x3 board
// turn = 1 or 2 (so we can differentiate between the two players on different turns)
// levels = how many recursive calls it makes before stopping
// (how many turns ahead it looks)
// return score of the move
function evaluateBoard(inboard, turn, levels) {
  if (levels <= 0) {
    return 0
  }

  let score = 0
  // console.log(board)

  // now to score this board on a few heuristics
  score += scoreBoard(inboard)

  // then we reduce the level by one and if it is greater than zero
  // for each of the possible squares
  // we recursively call this function again with the mockboard

  // we set it to zero assuming that the enemy wants to cause damage
  // and cpu punishes its own future mistakes
  let maxDamage = Infinity

  for (let i = 0; i < inboard.length; i++) {
    // for each of the possible spaces
    // if it's empty try to calculate a move
    // else ignore it 
    if (inboard[i] === 0) {
      // make a hypothetical board and score it
      let newBoard = inboard.slice()
      newBoard[i] = turn // put a piece there of the proper turn

      let possibleBranch = 0
      if (checkWin(newBoard) === 0) {
        possibleBranch = evaluateBoard(newBoard, turn === 2 ? 1 : 2, levels - 1)
      }



      // console.log(levels)

      // have to change the turn to reflect proper order

      if (maxDamage > possibleBranch) {
        maxDamage = possibleBranch

      }


    }
  }

  // we add the best or worst move of the next player
  if (maxDamage < Infinity) {
    score += 0.9 * maxDamage
  }



  return score
}

// function score board just returns a number for a board
// 2 is positive and 1 is negative (because only computer uses this)
function scoreBoard(mockboard) {
  let score = 0
  for (trip of triplets) {
    // for each triplet
    // 3x 2 = 1000
    // 3x 1 = -1000
    // 2x 2 and a 0 = 100
    // 2x 1 and a 0 = -100

    let pieces = { '0': 0, '1': 0, '2': 0 }

    for (let num of trip) {

      pieces[mockboard[num].toString()]++

    }
    // console.log(pieces)

    if (pieces['2'] === 3) {
      score += 1000
    } else if (pieces['1'] === 3) {
      score -= 1000
    } else if (pieces['2'] === 2 && pieces['0'] === 1) {
      score += 10
    } else if (pieces['1'] === 2 && pieces['0'] === 1) {
      score -= 10
    }
    // console.log(score)
  }

  // 2 in a diagonal = 1
  // 1 in a diagonal = 1
  for (let num of [0, 2, 6, 8]) {
    if (mockboard[num] === 2) {
      score++
    } else if (mockboard[num] === 1) {
      score--
    }
  }

  return score
}