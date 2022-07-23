'use strict'

const MINE_IMG = '<img src="img/mine.jpg" />'

// renderBoard - renders the board to the DOM
function renderBoard(mat, selector) {
    var strHTML = '<table><tbody>'

    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            var className = `cell cell-${i}-${j}`
            if (cell.isMine) {
                className += ' mine'
            } else if (cell.minesAroundCount > 0) {
                className += ' number'
            }
            if (cell.isMine) {
                strHTML += `<td class="${className}"  oncontextmenu="setFlag(event, ${i},${j});
                "onclick="cellClicked(${i},${j})">${MINE_IMG}</td>`
            } else {
                strHTML += `<td class="${className}"  oncontextmenu="setFlag(event, ${i},${j});
                "onclick="cellClicked(${i},${j})">${cell.minesAroundCount}</td>`

            }
        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// changeBoardSize - changes the board size on user selection
function changeBoardSize(newSize, newMines) {
    gLevel.SIZE = newSize
    gLevel.MINES = newMines
    initGame()
}

// randMines - returns a random cell position
function randMines(board) {
    return [
        getRandomInt(0, board.length), 
        getRandomInt(0, board.length)
    ]
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - 1 - min)) + min
}

// formatTime - formats seconds into `00:00` time format
function formatTime(timeSeconds) {
    var minutes = Math.floor((timeSeconds) / 60)
    var seconds = Math.floor((timeSeconds) % 60)
    if (minutes < 10) { minutes = `0${minutes}` } else { minutes = `${minutes}` }
    if (seconds < 10) { seconds = `0${seconds}` } else { seconds = `${seconds}` }

    return `${minutes}:${seconds}`
}

// startGameClock - sets the game clock update interval
function startGameClock() {
    gTimeInterval = setInterval(function () {
        var timeSeconds = Math.floor((Date.now() - gStartTime) / 1000)
        elTimer.innerText = formatTime(timeSeconds)
    }, 1000)
}

function restartGame() {
    initGame()
    toggleModal()
}

// toggleModal - displays or hide the end of game message modal
function toggleModal(message, newBestScore) {
    var elModalWrapper = document.querySelector('.modal-wrapper')

    var elH2ModalContent = document.querySelector('.modal .content')
    elH2ModalContent.innerHTML = ''

    var elMessage = document.createElement('h2')
    elMessage.innerText = message
    elH2ModalContent.appendChild(elMessage)

    if (newBestScore) {
        var elBestScore = document.createElement('div')
        elBestScore.classList.add('best-score')
        elBestScore.innerText = `New best score: ${formatTime(getScore(gLevel.SIZE))}`
        elH2ModalContent.appendChild(elBestScore)
    }

    elModalWrapper.classList.toggle('show')
}