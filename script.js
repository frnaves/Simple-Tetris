document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    for (let i = 0; i < 200; i++) {
        const div = document.createElement('div');
        grid.appendChild(div);
    }

    // Adding "taken" divs to the bottom of the grid
    for (let i = 0; i < 10; i++) {
        const div = document.createElement('div');
        div.classList.add('taken');
        grid.appendChild(div);
    }

    let squares = Array.from(document.querySelectorAll('.grid div'));
    const width = 10;
    let score = 0;
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    let timerId;
    let isPaused = false;

    // The Tetrominoes
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    // Randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // Draw the Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
        });
    }

    // Undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
        });
    }

    // Move down function
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Freeze function
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // Start a new Tetromino falling
            random = Math.floor(Math.random() * theTetrominoes.length);
            currentRotation = 0;
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            checkRow();
            gameOver();
        }
    }

    // Move the Tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
        if (!isPaused) {
            undraw();
            const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
            if (!isAtLeftEdge) currentPosition -= 1;
            if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
                currentPosition += 1;
            }
            draw();
        }
    }

    // Move the Tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
        if (!isPaused) {
            undraw();
            const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
            if (!isAtRightEdge) currentPosition += 1;
            if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
                currentPosition -= 1;
            }
            draw();
        }
    }

    // Rotate the Tetromino
    function rotate() {
        if (!isPaused) {
            undraw();
            currentRotation++;
            if (currentRotation === current.length) {
                currentRotation = 0;
            }
            current = theTetrominoes[random][currentRotation];
            // Check if the rotation is valid (not causing overlap)
            if (current.some(index => squares[currentPosition + index].classList.contains('taken')) ||
                current.some(index => (currentPosition + index) % width === 0) ||
                current.some(index => (currentPosition + index) % width === width - 1)) {
                currentRotation--;
                if (currentRotation < 0) {
                    currentRotation = current.length - 1;
                }
                current = theTetrominoes[random][currentRotation];
            }
            draw();
        }
    }

    // Drop the Tetromino to the bottom
    function drop() {
        if (!isPaused) {
            undraw();
            while (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
                currentPosition += width;
            }
            draw();
            freeze();
        }
    }

    // Assign functions to keyCodes
    function control(e) {
        if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        } else if (e.keyCode === 32) {
            drop();
        } else if (e.keyCode === 13) {
            pauseGame();
        }
    }
    document.addEventListener('keydown', control);

    // Check for completed rows
    function checkRow() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // Check for game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'Game Over';
            clearInterval(timerId);
        }
    }

    // Start/Pause the game
    function startGame() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 1000);
            isPaused = false;
        }
    }

    // Pause/Resume the game
    function pauseGame() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            isPaused = true;
        } else {
            timerId = setInterval(moveDown, 1000);
            isPaused = false;
        }
    }

    startButton.addEventListener('click', startGame);
});
