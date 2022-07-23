'use strict';

// getScore - get the score per level from the local storage
function getScore(level) {
    return localStorage.getItem(`score-${level}`)
}

// setNewScore - sets a new high score in local storage
function setNewScore(scoreSeconds) {
    localStorage.setItem(`score-${gLevel.SIZE}`, scoreSeconds)
}

// getGameDurationSeconds - returns the number of seconds elapsed
function getGameDurationSeconds() {
    return (Date.now() - gStartTime) / 1000
}

// checkBestScore - checks if a new high score was achieved and stores the score
function checkBestScore() {
    var duration = getGameDurationSeconds()
    var bestScore = getScore(gLevel.SIZE)

    if (!bestScore || duration < bestScore) {
        setNewScore(duration)
        renderScoresTable()
        return true
    }

    return false
}

// renderScoresTable - renders the high scores table to the DOM
function renderScoresTable() {
    const boardSizes = [4, 8, 12]

    var tableBody = document.querySelector('.scores tbody')
    tableBody.innerHTML = ''

    for (var i in boardSizes) {
        const size = boardSizes[i]
        const tr = document.createElement('tr')

        var tdLevel = document.createElement('td')
        var tdScore = document.createElement('td')

        var score = getScore(size)
        if (!score) {
            score = 'Not set yet'
        } else {
            score = formatTime(score)
        }

        tdLevel.innerText = size
        tdScore.innerText = score

        tr.appendChild(tdLevel)
        tr.appendChild(tdScore)

        tableBody.appendChild(tr)
    }
}