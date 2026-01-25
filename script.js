const moveCountEl = document.getElementById("moveCount");
let moves = 0;

const puzzleBoard = document.getElementById("puzzleBoard");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficulty");

let size = 3;
let puzzle = [];

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
    moves = 0;
    moveCountEl.textContent = moves;
    size = parseInt(difficultySelect.value);
    puzzle = createSolvedPuzzle(size);
    shufflePuzzle();
    renderPuzzle();
});
resetBtn.addEventListener("click", () => {
    moves = 0;
    moveCountEl.textContent = moves;
    size = parseInt(difficultySelect.value);
    puzzle = createSolvedPuzzle(size);
    shufflePuzzle();
    renderPuzzle();
});


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
    puzzleBoard.style.gridTemplateColumns = `repeat(${size}, 90px)`;

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
    setTimeout(() => {
        alert(`Puzzle solved in ${moves} moves!`);
    }, 100)


}
