'use strict'

var gBoard
var gStartTime
var gTimeInterval
var gLivesCounter
var gCountMinesMarked = 0

const elLives = document.querySelector('.lives span')
const elTimer = document.querySelector('.timer span')
const elSmiley = document.querySelector('.smiley')
const elMarked = document.querySelector('.marked span')
const defaultLivesCounter = 3

const gLevel = {
    SIZE: 4,
    MINES: 2
}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

// initGame - initialize the game board
function initGame() {
    resetGlobalVars()
    renderScoresTable()
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
}

// resetGlobalVars - resets global variables between executions
function resetGlobalVars() {
    gStartTime = null
    elSmiley.classList.remove('mine_smiley')
    gGame.markedCount = 0
    gGame.shownCount = 0
    elMarked.innerText = 0
    gCountMinesMarked = 0
    gLivesCounter = getMaxLives()
    elLives.innerText = gLivesCounter
    clearInterval(gTimeInterval)
    elTimer.innerText = '00:00'
}

// getMaxLives - returns the number of lives according to the game level
function getMaxLives() {
    return gLevel.MINES < defaultLivesCounter ? gLevel.MINES : defaultLivesCounter
}

// buildBoard - initialize a new board model
function buildBoard() {
    const SIZE = gLevel.SIZE
    const board = []
    for (var i = 0; i < SIZE; i++) {
        board.push([])
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    
    return board
}

// cellClicked - holds the logic of exposing a cell
function cellClicked(i, j) {
    checkFirstClick(i, j)
    
    const cell = gBoard[i][j]
    if (cell.isShown || cell.isMarked) {
        return
    }

    // Model
    cell.isShown = true
    increaseShownCount()

    // DOM
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.add('exposed')

    if (cell.isMine) {
        gLivesCounter--
        elSmiley.classList.add('mine_smiley')
        elLives.innerText = gLivesCounter
        if (!gLivesCounter) {
            gameOver()
            return
        }
    } else {
        elSmiley.classList.remove('mine_smiley')
    }

    checkVictory()

    if (!cell.isMine && cell.minesAroundCount === 0) {
        openNeighbors(gBoard, i, j)
    }
}

// checkFirstClick - called upon first click to init the board
function checkFirstClick(i, j) {
    if (!gStartTime) {
        gStartTime = Date.now()
        gGame.isOn = true
        setMines(i, j)
        countMines(gBoard)
        renderBoard(gBoard, '.board-container')
        startGameClock()
    }
}

// setFlag - toggle a flag on right click
function setFlag(event, i, j) {
    event.preventDefault()
    checkFirstClick(i, j)
    var modelCell = gBoard[i][j]

    if (modelCell.isShown) {
        return
    }

    gGame.markedCount += modelCell.isMarked ? -1 : 1
    elMarked.innerText = gGame.markedCount

    modelCell.isMarked = !modelCell.isMarked // Model

    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.toggle('flag') // DOM

    if (modelCell.isMine) {
        gCountMinesMarked += modelCell.isMarked ? 1 : -1
        checkVictory()
    }
}

// countMines - count the number of adjacent mines around each cell
function countMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (!cell.isMine) {
                cell.minesAroundCount = countMinesAroundCell(board, i, j)
            }
        }
    }
}

// setMines - sets mines in random cells according to game level
function setMines(i, j) {
    var counter = gLevel.MINES

    while (counter > 0) {
        const randPos = randMines(gBoard)

        if (gBoard[randPos[0]][randPos[1]].isMine) {
            console.log('already mined')
            continue
        }
        if (randPos[0] === i && randPos[1] === j) {
            console.log('user clicked, skip')
            continue
        }
        var randMinePos = gBoard[randPos[0]][randPos[1]]
        randMinePos.isMine = true

        counter--
    }
}

// countMinesAroundCell - counts the number of adjacent mines for specific cell
function countMinesAroundCell(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            if (cell.isMine) count++
        }
    }
    return count
}

// openNeighbors - opens the adjacent cells for given cell (for non mine cells)
function openNeighbors(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j]
            if (!cell.isMine && !cell.isMarked && !cell.isShown) {
                cell.isShown = true
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.classList.add('exposed')
                increaseShownCount()
                checkVictory()
            }
        }
    }
}

// gameOver - finishes the game
function gameOver() {
    gGame.isOn = false
    stopWatch()
    toggleModal('Game over', false)
}

// stopWatch - stopping the game clock
function stopWatch() {
    clearInterval(gTimeInterval)
}

// getNumberOfExplodedMines - returns the number of mines that were already exploded
function getNumberOfExplodedMines() {
    return getMaxLives() - gLivesCounter
}

// increaseShownCount - increase the number of shown cells on the board 
function increaseShownCount() {
    gGame.shownCount++
    console.log("Shown count", gGame.shownCount)
}

// checkVictory - verifies if all mines were flagged and all other cells are visible
// additionally it checks if user achieved new score
function checkVictory() {
    const numExploded = getNumberOfExplodedMines()
    if (gGame.shownCount === gLevel.SIZE ** 2 - (gLevel.MINES - numExploded) &&
        gCountMinesMarked === gLevel.MINES - numExploded) {
        gGame.isOn = false
        stopWatch()
        toggleModal('You Won', checkBestScore())
    }
}
