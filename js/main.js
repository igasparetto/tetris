
let basicBlocks = [
  [
    [1,1],
    [1,1]
  ],
  [
    [1,1,1],
    [0,1,0]
  ],
  [
    [1,1],
    [0,1],
    [0,1]
  ],
  [
    [1,1,0],
    [0,1,1]
  ],
  [
    [1],
    [1],
    [1],
    [1]
  ]
];
let blocks = basicBlocks;
let extraBlocks = [
  [
    [1],
  ],
  [
    [1,1],
    [1,0]
  ],
  [
    [0,0,1],
    [0,1,0],
    [1,0,0]
  ],
  [
    [1,1,1],
    [1,0,1]
  ],
  [
    [1,1,1],
    [0,1,1]
  ]
];
let colors = [
  "red",
  "green",
  "blue",
  "cyan",
  "yellow",
  "pink",
  "orange"
];

let clockTick;
let speed;
let gameInPlay = false;
let gameIsPaused = false;

let numberOfRows = 20;
let numberOfColumns = 10;
let matrix = [];

let nextNumberOfRows = 6;
let nextNumberOfColumns = 5;
let nextMatrix = [];

let currentBlockPositions = [];
let currentColor = "";

let currentBlock = [];
let nextBlock = [];
let nextColor = colors[getRandom(colors.length)];

let score = 0;
let level = 1;
let lines = 0;
let totalBlocks = 0;

let speedReductionFactor= 0.7; // 0.7 for -30%

let $score = document.getElementById("score");
let $level = document.getElementById("level");
let $lines = document.getElementById("lines");
let $speed = document.getElementById("speed");
let $totalBlocks = document.getElementById("total-blocks");

let $game = document.getElementById("game");
let $start = document.getElementById("start");

let $printMatrixStatus = document.getElementById('print-matrix-status');

let $message = document.getElementById("message");
function message(text) {
  $message.innerHTML = text;
}

// setting the matrices 
function setInitialMatrix(matrix, numberOfRows, numberOfColumns){
  for(let i=0; i<numberOfRows; i++){
    let singleRow = [];
    for(let j=0; j<numberOfColumns; j++){
      singleRow[j] = {
        "occupied":0,
        "color":""
      };
    }
    matrix[i] = singleRow;
  }
  return matrix;
}
function setNextBlockMatrix(block, color) {
  let nextMatrix = setInitialMatrix([], nextNumberOfRows, nextNumberOfColumns);
  let offsetX = Math.floor((nextNumberOfColumns - block[0].length)/2);
  let offsetY = Math.floor((nextNumberOfRows - block.length)/2);

  for(let row=0; row<block.length; row++) {
    for(let col=0; col<block[row].length; col++) {
      if(block[row][col]) {
        nextMatrix[row+offsetY][col+offsetX] = {
          "occupied":1,
          "color":color
        }
      }
    }
  }
  return nextMatrix;
}

function getRandom(max) {
  return Math.floor(Math.random() * max);
}

function drawMatrix(id, matrix) {
  let $area = document.getElementById(id);
  let printStatus = $printMatrixStatus.checked;
  $area.innerHTML = "";
  for(let row=0; row<matrix.length; row++) {
    $row = document.createElement("div");
    $row.setAttribute("class", "row");
    for(let col=0; col<matrix[row].length; col++) {
      $block = document.createElement("div");
      if(printStatus) {
        $block.innerHTML = matrix[row][col]["occupied"];
      }
      $block.setAttribute("class", "block " + (matrix[row][col]["occupied"] ? matrix[row][col]["color"] : ""));
      $row.appendChild($block);
    }
    $area.appendChild($row);
  }
}

function pushNextBlockToGame(block, color) {
  let offsetX = Math.floor((numberOfColumns - block[0].length)/2);
  currentColor = color;
  currentBlockPositions = [];
  for(let row=0; row<block.length; row++) {
    for(let col=0; col<block[row].length; col++) {
      if(block[row][col]) {
        if(matrix[row][col+offsetX]["occupied"] !== 0) {
          gameOver();
          return;
        }
        currentBlockPositions.unshift({"row":row, "col":col+offsetX});
        matrix[row][col+offsetX] = {
          "occupied":1,
          "color":color
        }
      }
    }
  }
}

function genNextBlock() {
  nextColor = colors[getRandom(colors.length)];
  nextBlock = blocks[getRandom(blocks.length)];
  nextMatrix = setNextBlockMatrix(nextBlock, nextColor);
  drawMatrix("next-piece", nextMatrix);
}

function nextBlockIn(){
  pushNextBlockToGame(nextBlock, nextColor);
  currentBlock = nextBlock;
  totalBlocks++;
  if(totalBlocks%20 === 0) {
    speed = speed * speedReductionFactor;
    level++;
    $level.innerHTML = level;
  }
  $totalBlocks.innerHTML = totalBlocks;
  $speed.innerHTML = Math.floor(speed);
  drawMatrix("game", matrix);
  genNextBlock();
}

function addScore(n) {
  score = score + n;
  $score.innerHTML = score;
}

let rowClearedScore = 15;
function move1Down(){
  // can it move down to the next position?
  let canMove = true;

  currentBlockPositions.forEach((point) => {
    if(point.row+1 == numberOfRows) {
      canMove = false;
    } else if(matrix[point.row+1][point.col]["occupied"] === 2) {
      canMove = false;
    }
  });

  if(canMove) {
    let newCurrentBlockPositions = [];

    currentBlockPositions.forEach((point) => {
      newCurrentBlockPositions.unshift({"row":point.row+1, "col":point.col})
      matrix[point.row][point.col]["color"] = "";
      matrix[point.row][point.col]["occupied"] = 0;
    });
    newCurrentBlockPositions.forEach((point) => {
      matrix[point.row][point.col]["color"] = currentColor;
      matrix[point.row][point.col]["occupied"] = 1;
    });
    currentBlockPositions = newCurrentBlockPositions;
  } else {
    addScore(1);
    currentBlockPositions.forEach((point) => {
      matrix[point.row][point.col]["occupied"] = 2;
    });

    let rowsCleared = clearFirstCompleteRow();
    if(rowsCleared) {
      lines = lines+rowsCleared;
      $lines.innerHTML = lines;
      addScore(Math.pow(rowClearedScore, rowsCleared));
    }

    nextBlockIn();
  }
}

function clearFirstCompleteRow(total) {
  if(!total) {
    total = 1;
  }
  for(let row = matrix.length-1; row>=0; row--) {
    let removeRow = true;
    for(let col=0; col<matrix[row].length; col++) {
      if (matrix[row][col]["occupied"] !== 2) {
        removeRow = false;
      }
    }
    if(removeRow) {
      for(let kol=0; kol<matrix[row].length; kol++) {
        matrix[row][kol]["color"] = "removed";
        matrix[row][kol]["occupied"] = 0;
      }
      matrix.unshift(matrix.splice(row, 1)[0]);
      return total + clearFirstCompleteRow();
    }
  }
  return 0;
}

function moveRL(direction){
  // can it move down to the next position?
  let canMove = true;

  currentBlockPositions.forEach((point) => {
    let newX = point.col+direction;
    if(newX == numberOfColumns || newX === -1) {
      canMove = false;
    } else if(matrix[point.row][newX]["occupied"] === 2) {
      canMove = false;
    }
  });

  if(canMove) {
    let newCurrentBlockPositions = [];
    currentBlockPositions.forEach((point) => {
      newCurrentBlockPositions.unshift({"row":point.row, "col":point.col+direction})
      matrix[point.row][point.col]["color"] = "";
      matrix[point.row][point.col]["occupied"] = 0;
    });
    newCurrentBlockPositions.forEach((point) => {
      matrix[point.row][point.col]["color"] = currentColor;
      matrix[point.row][point.col]["occupied"] = 1;
    });
    currentBlockPositions = newCurrentBlockPositions;
  }
}

function validateMinAxisValue(v, max, side){
  if(v < 0) {
    v = 0;
  }
  if(v + side > max) {
    v = max - side;
  }
  return v;
}

function rotate() {
  let canRotate = true;
  let startMatrix = [];
  let newCurrentBlockPositions = [];
  let maxY;
  let minX = 1000;
  let minY = 1000;
  let side;  
  let rowCounter = 0;
  let colCounter = 0;

  side = (currentBlock[0].length > currentBlock.length ? currentBlock[0].length : currentBlock.length);

  currentBlockPositions.forEach((point) => {
    if(minY > point.row) {
      minY = point.row;
    }
    if(minX > point.col) {
      minX = point.col;
    }
  });

  minX = validateMinAxisValue(minX, numberOfColumns, side);
  minY = validateMinAxisValue(minY, numberOfRows, side);
  maxY = minY + side - 1;

  for(var i=minY; i<minY+side; i++) {
    for(var j=minX; j<minX+side; j++) {
      if(!startMatrix[i]) {
        startMatrix[i] = [];
      }
      startMatrix[i][j] = false;
    }
  }
  currentBlockPositions.forEach((point) => {
    startMatrix[point.row][point.col] = true;
  });

  startMatrix.forEach((point) => {
    point.forEach((value) => {
      if(value) {
        newCurrentBlockPositions.push({
          "row": maxY - colCounter,
          "col": minX + rowCounter
        })
      }
      colCounter++;
    });
    rowCounter++;
    colCounter = 0;
  });
  newCurrentBlockPositions.sort(function(a, b) {
    return a["row"] - b["row"];
  });

  newCurrentBlockPositions.forEach((point) => {
    if(matrix[point.row][point.col]["occupied"] === 2) {
      canRotate = false;
    }
  });

  if(canRotate) {
    currentBlockPositions.forEach((point) => {
      matrix[point.row][point.col]["color"] = "";
      matrix[point.row][point.col]["occupied"] = 0;
    });
    newCurrentBlockPositions.forEach((point) => {
      matrix[point.row][point.col]["color"] = currentColor;
      matrix[point.row][point.col]["occupied"] = 1;
    });
    currentBlockPositions = newCurrentBlockPositions;
  }
}

function gameOver(){
  message("Game Over<br>" + "Score: " + score);
  clearInterval(clockTick);
  gameInPlay = false;
  gameIsPaused = false;
  $start.innerHTML = "Start";
}

function pause(){
  clearInterval(clockTick);
  message("Game paused");
  gameIsPaused = true;
  $start.innerHTML = "Start";
}

function startTimer(){
  gameIsPaused = false;
  message("Playing");
  $start.innerHTML = "Pause";
  clockTick = setInterval(function(){
    move1Down();
    drawMatrix("game", matrix);
  }, speed);
}

function init(){
  message("Playing");
  matrix = setInitialMatrix([], numberOfRows, numberOfColumns);
  speed = 600;
  currentBlockPositions = [];
  currentColor = "";
  currentBlock = [];
  nextBlock = [];
  score = 0;
  level = 1;
  lines = 0;
  clearInterval(clockTick);
}

function start() {
  init();
  genNextBlock();
  nextBlockIn();
  startTimer();
  gameInPlay = true;
  $start.innerHTML = "Pause";
}

document.getElementById('extra-blocks').addEventListener("change", function (e) {
  if(e.target.checked) {
    blocks = basicBlocks.concat(extraBlocks);
  } else {
    blocks = basicBlocks;
  }
});

$start.addEventListener("click", function () {
  if(!gameInPlay) {
    start();
  } else if(gameIsPaused) {
    startTimer();
  } else if(!gameIsPaused) {
    pause();
  }
  $game.focus();
});

function action(foo, param){
  if(gameIsPaused || !gameInPlay) {
    return;
  }
  foo(param);
  drawMatrix("game", matrix);
}
function actionRight(){
  action(moveRL, 1);
}
function actionLeft(){
  action(moveRL, -1);
}
function actionRotate(){
  action(rotate);
}
function actionMoveDown(){
  action(move1Down);
}

document.getElementById("btnRight").addEventListener("click", actionRight);
document.getElementById("btnLeft").addEventListener("click", actionLeft);
document.getElementById("btnRotate").addEventListener("click", actionRotate);
document.getElementById("btnDown").addEventListener("click", actionMoveDown);

window.addEventListener("keydown", function (e) {
  if(e.code == "ArrowRight") {
    actionRight();
  } else if (e.code == "ArrowLeft") {
    actionLeft();
  } else if (e.code == "ArrowUp") {
    actionRotate()
  } else if (e.code == "ArrowDown"){
    actionMoveDown();
  }
});

window.addEventListener("keypress", function (e) {
  if(gameInPlay) {
    if (e.code == "Space") {
      if(gameIsPaused) {
        startTimer();
      } else {
        pause();
      }
    }
  }
});

drawMatrix("game", setInitialMatrix([], numberOfRows, numberOfColumns));
drawMatrix("next-piece", setInitialMatrix([], nextNumberOfRows, nextNumberOfColumns));
