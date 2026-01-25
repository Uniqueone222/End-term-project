// ===== THEME TOGGLE =====
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});

// ===== BEST MOVES & GAME HISTORY =====
let bestMoves = JSON.parse(localStorage.getItem("bestMoves")) || { 3: null, 4: null };
let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];

function updateBestMovesDisplay() {
    document.getElementById("best3x3").textContent = bestMoves[3] !== null ? bestMoves[3] : "--";
    document.getElementById("best4x4").textContent = bestMoves[4] !== null ? bestMoves[4] : "--";
}

function updateGameHistoryDisplay() {
    const historyEl = document.getElementById("gameHistory");
    if (gameHistory.length === 0) {
        historyEl.innerHTML = '<li class="history-empty">No games played yet</li>';
        return;
    }
    // Show last 10 games, newest first
    const recentGames = gameHistory.slice(-10).reverse();
    historyEl.innerHTML = recentGames.map(game =>
        `<li class="history-win">${game.difficulty} — ${game.moves} moves</li>`
    ).join("");
}

function recordGameWin(difficulty, moveCount) {
    const diffLabel = difficulty === 3 ? "3×3" : "4×4";

    // Update best moves
    if (bestMoves[difficulty] === null || moveCount < bestMoves[difficulty]) {
        bestMoves[difficulty] = moveCount;
        localStorage.setItem("bestMoves", JSON.stringify(bestMoves));
    }

    // Add to history
    gameHistory.push({
        difficulty: diffLabel,
        moves: moveCount,
        date: new Date().toISOString()
    });
    // Keep only last 50 games
    if (gameHistory.length > 50) {
        gameHistory = gameHistory.slice(-50);
    }
    localStorage.setItem("gameHistory", JSON.stringify(gameHistory));

    updateBestMovesDisplay();
    updateGameHistoryDisplay();
}

// Initialize displays on load
updateBestMovesDisplay();
updateGameHistoryDisplay();

// ===== GAME LOGIC =====
const moveCountEl = document.getElementById("moveCount");
let moves = 0;
let gameStarted = false;

const puzzleBoard = document.getElementById("puzzleBoard");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficulty");

let size = 3;
let puzzle = [];

//PUZZLE CREATION
function createSolvedPuzzle(size) {
    const arr = [];
    for (let i = 1; i < size * size; i++) {
        arr.push(i);
    }
    arr.push(null); // empty tile
    return arr;
}

function countInversions(arr) {
    let inversions = 0;

    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] !== null && arr[j] !== null && arr[i] > arr[j]) {
                inversions++;
            }
        }
    }
    return inversions;
}
function isSolvable(arr, size) {
    const inversions = countInversions(arr);

    if (size % 2 === 1) {
        return inversions % 2 === 0;
    } else {
        const blankIndex = arr.indexOf(null);
        const blankRowFromBottom = size - Math.floor(blankIndex / size);
        return (
            (blankRowFromBottom % 2 === 0 && inversions % 2 === 1) ||
            (blankRowFromBottom % 2 === 1 && inversions % 2 === 0)
        );
    }
}
function shufflePuzzle() {
    let shuffled;

    do {
        shuffled = [...puzzle].sort(() => Math.random() - 0.5);
    } while (!isSolvable(shuffled, size));

    puzzle = shuffled;
}
startBtn.addEventListener("click", () => {
    gameStarted = true;
    moves = 0;
    moveCountEl.textContent = moves;
    document.getElementById("status").textContent = "Playing";
    size = parseInt(difficultySelect.value);
    puzzle = createSolvedPuzzle(size);
    shufflePuzzle();
    renderPuzzle();
});
resetBtn.addEventListener("click", () => {
    if(gameStarted == false){
        alert("Game has not started yet!");
        return;
    }
    moves = 0;
    moveCountEl.textContent = moves;
    document.getElementById("status").textContent = "Playing";
    size = parseInt(difficultySelect.value);
    puzzle = createSolvedPuzzle(size);
    shufflePuzzle();
    renderPuzzle();
});

//MOVE LOGIC
function canMove(tileIndex, emptyIndex) {
    const tileRow = Math.floor(tileIndex / size);
    const tileCol = tileIndex % size;

    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const rowDiff = Math.abs(tileRow - emptyRow);
    const colDiff = Math.abs(tileCol - emptyCol);

    return rowDiff + colDiff === 1;
}
function swapTiles(tileIndex, emptyIndex) {
    let temp = puzzle[tileIndex]
    puzzle[tileIndex] = puzzle[emptyIndex]
    puzzle[emptyIndex] = temp
}
function renderPuzzle() {
    puzzleBoard.innerHTML = "";
    puzzleBoard.style.gridTemplateColumns = `repeat(${size}, 70px)`;

    puzzle.forEach((value, index) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");

        if (value === null) {
            tile.classList.add("empty");
        } else {
            tile.textContent = value;
            tile.addEventListener("click", () => handleTileClick(index));
        }

        puzzleBoard.appendChild(tile);
    });
}
function handleTileClick(index) {
    const emptyIndex = puzzle.indexOf(null);

    if (!canMove(index, emptyIndex)) {
        return;
    }

    swapTiles(index, emptyIndex);
    moves++;
    moveCountEl.textContent = moves;

    renderPuzzle();

    if (isPuzzleSolved()) {
        handleWin();
    }
}

// WIN CHECKER
function getSolvedPuzzle(size) {
    const solved = [];
    for (let i = 1; i < size * size; i++) {
        solved.push(i);
    }
    solved.push(null);
    return solved;
}
function isPuzzleSolved() {
    const solved = getSolvedPuzzle(size);

    for (let i = 0; i < puzzle.length; i++) {
        if (puzzle[i] !== solved[i]) {
            return false;
        }
    }
    return true;
}
function handleWin() {
    document.getElementById("status").textContent = "Solved!";
    recordGameWin(size, moves);
    setTimeout(() => {
        showWinModal();
    }, 100);
}

function showWinModal() {
    // Create modal overlay
    const overlay = document.createElement("div");
    overlay.id = "winModal";
    overlay.innerHTML = `
        <div class="modal-content">
            <h2>🎉 Congratulations!</h2>
            <p>You solved the puzzle in <strong>${moves}</strong> moves!</p>
            <button id="playAgainBtn">Play Again</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Play Again button handler
    document.getElementById("playAgainBtn").addEventListener("click", () => {
        overlay.remove();
        moves = 0;
        moveCountEl.textContent = moves;
        document.getElementById("status").textContent = "Playing";
        puzzle = createSolvedPuzzle(size);
        shufflePuzzle();
        renderPuzzle();
    });

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}
