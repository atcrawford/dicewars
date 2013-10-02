"use strict";

//(function () {
//    "use strict";
////    this function is strict...
//}());


// TODO:
// - Implement a better concept of which player is current
// - show the progress on the page.

// - Balance army allocation - right now it's random and can result in one side being lopsided.  Instead
// allocate armies randomly.  This is needed anyway for the end of turn.
// - fix the cell selection logic.
// - implement game AI


var state = {
//    init: false,
    players: 2,
    currentPlayer: 1,
    player: [],
    cells: {},
    // cells.number - the number of armies in the cell at the moment
    // cells.player - which player owns this cell

    selected1: 0,
    selected2: 0,
    cellList: ["a1", "a2", "a3", "a4", "b1", "b2", "b3", "b4", "c1", "c2", "c3", "c4", "d1", "d2", "d3", "d4"],
    cellArray: [ // offset so it's 1 based vs. 0 based.
        [],
        ["", "a1", "a2", "a3", "a4"],
        ["", "b1", "b2", "b3", "b4"],
        ["", "c1", "c2", "c3", "c4"],
        ["", "d1", "d2", "d3", "d4"]
    ],
    letters: {'a': 1, 'b': 2, 'c': 3, 'd': 4},
    minCol: "a",
    minColNum: 1,
    maxCol: "d",
    maxColNum: 4,
    minRow: 1,
    maxRow: 4,
    playerColor: ["lightGreen", "aqua"],
    clickEnabled: false,
    endTurnEnabled: false,
    queue: [],
    interval: 0,
    maxArmiesPerCell: 8,
    gameOver: 0
};


function log(message) {
    var debug = true;
    //noinspection JSLint
    var currentDate, dateTime;

    if (debug) {
        currentDate = new Date();
        dateTime = sprintf("%02d:%02d:%02d",
            currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());
        console.log(dateTime + ": " + message + "    ");
//        console.timestamp(message)
//        console.trace()
    }
}

function randomNumber(upper) {
    return Math.floor((Math.random() * upper) + 1);
}


// original source: http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function shuffle(oldArray) {
    var newArray = [], i;
    var randomNum, value;

    for (i = 0; i < oldArray.length; i++) {
        newArray[i] = oldArray[i];
    }
    for (i = oldArray.length - 1; i; i--) {
        randomNum = Math.floor(Math.random() * i);
        value = newArray[i];
        newArray[i] = newArray[randomNum];
        newArray[randomNum] = value;
    }
    return newArray;
}


// setTimeout(function() { alert('Hi') }, 1000)

//// TODO: refactor to remove this!!
//function sleep(ms) {
//    var unixtime_ms = new Date().getTime();
//    while(new Date().getTime() < unixtime_ms + ms) {}
//}


function initPlayers() {
    var p;
    for (p = 1; p < state.players + 1; p++) {
        state.player[p] = [];
        state.player[p].allCells = {};
    }
}
function generateBoard() {
    var letters = ['a', 'b', 'c', 'd'];
    var rows = 4;
    var cols = 4;
    var row, col;
    var html = "<tr><th></th><th>1</th><th>2</th><th>3</th><th>4</th></tr>";
    for (row = 1; row < rows + 1; row++) {
        html += "<tr>\n";
        html += "<th>" + letters[row - 1] + "</th>";
        for (col = 1; col < cols + 1; col++) {
            html += '\t<td class="diceCell" onclick="cellClick(\'' + letters[row - 1] + col + '\')" id="' + letters[row - 1] + col + '">tbd</td>\n'
        }
        html += "</tr>\n"
    }
    document.getElementById('idDiceTable').innerHTML = html
}


function setDiceImage(cell, numDice) {
    var diceString = "";
    var numberDice = numDice;
    while (numberDice) {
        diceString += '<img height="50%" src="soldier' + randomNumber(6) + '.png">';
        numberDice--;
    }
    diceString = diceString.replace(/,+$/, "");
//    log(sprintf("setDiceImage(%s, %s) = %s", cell, numDice, diceString))
    document.getElementById(cell).innerHTML = diceString;
}

function setBoard() {
    var cells = state.cellList;
    var i, numberDice;
    for (i = 0; i < cells.length; i++) {
        numberDice = randomNumber(4);
        state.cells[cells[i]] = {};
        state.cells[cells[i]].number = numberDice;
        setDiceImage(cells[i], numberDice)

    }
    /* Now determine which side owns which cell */

//    var cellsToAllocate = shuffle(clone(cells))

    var cellsToAllocate = shuffle(cells);
    var cellsAllocated = 0;
    var player = 1;
    while (cellsAllocated !== cellsToAllocate.length) {
        state.cells[cellsToAllocate[cellsAllocated]].player = player;
        state.cells[cellsToAllocate[cellsAllocated]].selected1 = 0;
        document.getElementById(cellsToAllocate[cellsAllocated]).className = "dicePlayer" + player;
        // TODO: flip images horizontally for one of the players
        // style="filter:FlipH"
        player++;
        if (player > state.players) {
            player = 1;
        }
        cellsAllocated++;
    }
//    log(state.cells)
}

// TODO: fix logic in attack
function attack(cell1, cell2) {
    // this function runs the attack logic.
    // cell1 is attacking cell2
    // roll the number of dice for each side.
    // sum the results.
    // higher wins.

    log("attack(" + cell1 + "," + cell2 + ")");
    var numDice1 = state.cells[cell1].number;
    var numDice2 = state.cells[cell2].number;
    log(sprintf("** numDice1 = %s, numDice2 = %s", numDice1, numDice2));

    var roll1 = roll(numDice1);
    var roll1Sum = array_sum(roll1);
    var roll2 = roll(numDice2);
    var roll2Sum = array_sum(roll2);
    var whoWon = 0;
    var delay = 1000;
    var delayAdditional = 1000;


    setTimeout2(function () {
        status(sprintf("Attacker rolls %s dice for %s result", roll1, roll1Sum));
    }, delay);
    delay += delayAdditional;

    setTimeout2(function () {
        status(sprintf("Defender rolls %s dice for %s result", roll2, roll2Sum));
    }, delay);
    delay += delayAdditional;



    if (roll1Sum > roll2Sum) { // attacker wins
        whoWon = state.cells[cell1].player;
        numDice2 = numDice1 - 1;
        numDice1 = 1;
        setTimeout2(function () {
            status(sprintf("Attacker wins, %s beats %s.", roll1Sum, roll2Sum));
        }, delay);
        delay += delayAdditional

    } else {
        whoWon = state.cells[cell2].player;
        numDice1 = 1;
        setTimeout2(function () {
            status(sprintf("Defender wins, %s beats %s.", roll2Sum, roll1Sum));
        }, delay);
        delay += delayAdditional;

    }
//    log(sprintf("++ whoWon=%s, numDice1=%s, numDice2=%s", whoWon, numDice1, numDice2));

    setTimeout2(function () {
        commitAttackResults(whoWon, numDice1, numDice2, cell1, cell2);
        status("Ready");
        state.clickEnabled = true;
    }, delay);

//    return [whoWon, numDice1, numDice2, roll1, roll2, roll1Sum, roll2Sum]
}


function roll(numDice, diceSides) {
    var diceRoll = [];
    if (diceSides === undefined) {
        diceSides = 6
    }
    for (var i = 0; i < numDice; i++) {
        diceRoll[i] = randomNumber(diceSides)
    }
    return diceRoll;
//    return diceRoll.sort(function (a, b) {
//        return b - a
//    }) // reverse sort
}

function canAttack(cell1, cell2) {
    // TODO: rewrite this to use the neighbors to check if can attack

    // purpose of this function is to determine if cell2 is next to cell1 and can attack
    // criteria:
    // A1 can attack A2, B1 but not otherwise.
    // in other words, must be +/- 1 on either index.
//    var letters = {'a':1,'b':2,'c':3,'d':4}
    var letters = state.letters;

    var col1 = letters[cell1.slice(0, 1)];
    var row1 = cell1.slice(1, 2);
    var col2 = letters[cell2.slice(0, 1)];
    var row2 = cell2.slice(1, 2);
    if (state.cells[cell1].player === state.cells[cell2].player) {
        return false
    }
    if (col1 === col2) {
        if (Math.abs(row1 - row2) === 1) {
            return true
        }
    } else if (row1 === row2) {
        if (Math.abs(col1 - col2) === 1) {
            return true
        }
    }

    return false;
}

function cellClick(cell) {
//    log("Selected on " + cell + " state.selected1=" + state.selected1);
    if (!state.clickEnabled) { // not ready for the click
        return
    }
    if (state.selected1 === cell || state.selected2 === cell) { // deselect cell
        deselectCell(cell);
        return
    }
    if (!state.selected1) {
        if (state.cells[cell].player !== state.currentPlayer) {
            status("Please first select the cell you want to attack from");
            return
        }
        if (state.cells[cell].number < 2) {
            status("Sorry you cannot initiate an attack unless you have at least 2 soldiers");
            return
        }
        selectCell(cell);
        return
    }
    if (canAttack(state.selected1, cell)) {
        selectCell(cell);
        state.clickEnabled = false;
        attack(state.selected1, state.selected2); // state.selected2 is same as cell

        // any followup work will be queued via setTimeout by the attack function -- this is to allow time to update UI.
    } else {
        status("Unable to attack as the cell you clicked is not adjacent to the first cell")
    }
}

function status(message) {
    log(message);
    document.getElementById("status").innerHTML = message
}

function error(message) {
    console.error(message)
}
function deselectCells() {
    log("deselectCells()")
    if (state.selected2) {
        deselectCell(state.selected2)
    }
    if (state.selected1) {
        deselectCell(state.selected1)
    }
}

function deselectCell(cell) {
    log(sprintf("deselectCell(%s)", cell))
    var player = state.cells[cell].player;
    if (state.selected1 !== cell && state.selected2 !== cell) {
        error(sprintf("deselectCell(%s) called and neither are selected, state.selected1=%s state.selected2=%s", cell, state.selected1, state.selected2));
        return false; // failure
    }
    if (state.selected2 === cell) {
        state.selected2 = ''
    }
    if (state.selected1 === cell) {
        if (state.selected2) {
            state.selected1 = state.selected2;
            state.selected1 = ''

        } else {
            state.selected1 = ''
        }
    }
    document.getElementById(cell).className = "dicePlayer" + player;
    return true; // success
}

function selectCell(cell) {
    log(sprintf("selectCell(%s)", cell));
    log(sprintf("selected1=%s selected2=%s", state.selected1, state.selected2));
    var player = state.cells[cell].player;
    if (state.selected1 === cell || state.selected2 === cell) { // deselect cell
        log("Both cells selected, calling deselectCell");
        deselectCell(cell);
        return true;
    }
    if (state.selected1 && state.selected2) {
        error("Selected1 and Selected2 are already set!")
        return false;
    }
    if (!state.selected1) {
        state.selected1 = cell;
    } else if (state.selected1 && !state.selected2) {
        state.selected2 = cell;
    } else {
        error("Unable to select cell %s", cell)
    }
    document.getElementById(cell).className = "dicePlayer" + player + "Selected";
    return true;
}

function commitAttackResults(whoWon, dice1, dice2, cell1, cell2) {
//    var results = attack(state.selected1, cell);
//    var whoWon = results[0];
//    var dice1 = results[1];
//    var dice2 = results[2];
//    deselectCells()
    log(sprintf("results received, whowon=%s dice1=%s dice2=%s", whoWon, dice1, dice2));

    if (whoWon === state.currentPlayer) { // attacker won
        // TODO: implement concept of player 1 vs. player 2 playing
        updateCell(state.selected1, state.cells[cell1].player, dice1);
        updateCell(state.selected2, state.cells[cell1].player, dice2)
    } else { // defender won
        // TODO: assumption here that second Selected is always enemy
        updateCell(state.selected1, state.cells[cell1].player, dice1)
    }
    deselectCells()
    if (!state.interval) {
        attackFinished();
    }
}

function attackFinished() {
    deselectCells();
    updatePlayerStats();
    // TODO - check if the human player has won!
//    log("need to check if won");
    if (state.player[2].maxAdjCellsNumber === 0) {
        log("You won!!!");
        document.getElementById("screen").innerHTML = "<h1>You Won!!!</h1>"
        state.gameOver = true;
    }
    if (state.player[1].maxAdjCellsNumber === 0) {
        log("You lost!!!");
        document.getElementById("screen").innerHTML = "<h1>You Lost!!!</h1>"
        state.gameOver = true;
    }

}

function updateCell(cell, player, number, selected) {
    log(sprintf("updateCell(%s,%s,%s,%s)", cell, player, number, selected));
    if (selected === undefined) {
        selected = false;
//        log("updateCell setting selected to false")
    }
    state.cells[cell].player = player;
    state.cells[cell].number = number;

    if (selected) {
        document.getElementById(cell).className = "dicePlayer" + player + "Selected"
    } else {
        document.getElementById(cell).className = "dicePlayer" + player
    }
    setDiceImage(cell, number)

}


// this function will update the table definition for the # of players
function buildPlayerStats() {
    var html = "";
    html += "<tr>";
    for (var p = 1; p < state.players + 1; p++) {
        html += "<td id='statPlayer" + p + "' class='dicePlayer" + p + "'>##</td>"
    }
    html += "</tr>";
    document.getElementById("playerStats").innerHTML = html

}
// this function will update the cells to indicate how many users...
function updatePlayerStats() {
    for (var p = 1; p < state.players + 1; p++) {
        var results = countSpaces(p);
        document.getElementById("statPlayer" + p).innerHTML = results[0];
        state.player[p].maxAdjCells = results[1];
        state.player[p].maxAdjCellsNumber = results[0]
    }
}



// iterate through state.cells and compute the neighbors, regardless of player
function computeNeighbors() {
    var cellIndex;
    var neighbor = '';
    var cell, row, col;

//    for (cellIndex in state.cellList) {
    for (cellIndex = 0; cellIndex < state.cellList.length; cellIndex++) {
        cell = state.cellList[cellIndex];
        row = state.letters[cell.slice(0, 1)]; // a, b, c, d
        col = parseInt(cell.slice(1, 2)); // 1, 2, 3, 4

        state.cells[cell].neighbors = [];
        if (col < state.maxColNum) { // add right
            neighbor = state.cellArray[row][col + 1];
//            log(sprintf("**** %s %s", cell, neighbor))
            state.cells[cell].neighbors.push(neighbor)
        }
        if (row < state.maxRow) { // add below
            neighbor = state.cellArray[row + 1][col];
            state.cells[cell].neighbors.push(neighbor)
        }
        if (row > state.minRow) { // add above
            neighbor = state.cellArray[row - 1][col];
            state.cells[cell].neighbors.push(neighbor)
        }
        if (col > state.minColNum) { // add left
            neighbor = state.cellArray[row][col - 1];
            state.cells[cell].neighbors.push(neighbor)
        }
    }
//    log("computeNeighbors complete")
}

//// iterate through state.cells and set all to visited=false in prep for calling visit()
function resetMarked() {
    var cellIndex, cell;
    for (cellIndex = 0; cellIndex < state.cellList.length; cellIndex++) {
        cell = state.cellList[cellIndex];
//        log(sprintf("resetMarked, cell=%s", cell))
        state.cells[cell].marked = false
    }
}

function countMarked() {
    var cellIndex, cell;
    var marked = 0;
    var cells = [];
    for (cellIndex = 0; cellIndex < state.cellList.length; cellIndex++) {
        cell = state.cellList[cellIndex];
        if (state.cells[cell].marked) {
            cells.push(cell);

            marked++;
        }
    }
    return [marked, cells]
}

function countSpaces(player) {
    // iterate through each player #
    // find cells owned by that player
    // call visit on each cell
    // count how many cells are marked
    // keep that as max # of marked
    // repeat, determine max # of marked for that player
    var numMarked = 0;
    var maxMarked = 0;
    var cell = '';
    var cells = [];
    var maxCells = [];
    var results;


    // iterate through board, count max # of adjacent spaces and return that number
    log("countSpaces:" + player);
    if (state.interval) {
        error("****** state.interval is set!!! ******");
        return [0, 0]
    }
//    state.iteration = 0
    for (var cellNum = 0; cellNum < state.cellList.length; cellNum++) {
        cell = state.cellList[cellNum];
        resetMarked();
        if (state.cells[cell].player === player) {
            visit(cell, player);
//            numMarked = countMarked();
            results = countMarked();
            numMarked = results.shift();
            cells = results.shift();
            if (numMarked > maxMarked) {
                maxMarked = numMarked;
                maxCells = [];
                for (var i=0; i < cells.length; i++) {
                    maxCells[i] = cells[i]
                }
            }
        }
    }
    return [maxMarked, maxCells]
}

function visit(cell, player) {
//    log(sprintf("visit(%s, %s)",cell, player))
    var neighbor;
    var neighborIndex;
    if (state.cells[cell].marked) {
        return
    }
    state.player[player].allCells[cell] = true;
    state.cells[cell].marked = true;
    for (neighborIndex = 0; neighborIndex < state.cells[cell].neighbors.length; neighborIndex++) {
        neighbor = state.cells[cell].neighbors[neighborIndex];
        if (state.cells[neighbor].player === player) {
            visit(neighbor, player)
        }
    }
}
// TODO: bug prevent EndTurn running until everything is done.
function endTurn() {
//    state.endTurnEnabled = false
    if (state.gameOver) {
        return;
    }
    if (!state.endTurnEnabled) {
        return;
    }
    endTurnDisable();
    deselectCells();
    log("End Turn");
    allocateArmies(state.currentPlayer);
    changeSides()

}

function changeSides() {
    var player = state.currentPlayer;
    if (player+1 > state.players) {
        player = 1
    } else {
        player += 1
    }
    state.currentPlayer = player;
    status("Ready Player: " + player);
    if (player > 1) {
//        computerTurn(player)
        aiAttack()
    }
}

// allocate armies randomly among the contiguous cells
function allocateArmies(player) {
    log(sprintf("allocateArmies(%s", player))
    var armiesToAllocate = state.player[player].maxAdjCellsNumber;
    var cells = state.player[player].maxAdjCells;
    var cell;
    var numRounds;

    for (var i = 0; i < armiesToAllocate; i++) {
        numRounds = state.player[player].maxAdjCellsNumber * 3;
        log(sprintf("numrounds = %s", numRounds))

        // loop until you find a random cell to allocate to.
        while (true) {
            var cellNum = randomNumber(cells.length) - 1;
            log(sprintf("cellNum=%s", cellNum));
            cell = cells[cellNum];
            log(sprintf("cell=%s", cell));
            log(sprintf("state.cells[%s].number=%s",cell, state.cells[cell].number))
            if (state.cells[cell].number < state.maxArmiesPerCell) {
                updateCell(cell, player, state.cells[cell].number + 1);
                break
            } else {
                log(sprintf("couldn't allocate at cell %s, one less round %s", cell, numRounds))
                numRounds -= 1;
            }
            if (!numRounds) {
                // this is a bit of a hack but necessary to ensure we don't loop forever.
                // the code above will randomly allocate armies among the largest block of adjacent cells.
                // if all cells have the maxArmiesPerCell it will loop forever.
                // numRounds is a backstop -- it will loop 3x the num of cells to ensure each has a chance to get the army
                // and if an army can't be found, assume all are full - and break out of the loop.
                // TODO: rewrite this in a better way...
                log("numrounds == 0, breaking out of loop")
                break;

            }
        }
    }
}

//function computerTurn(player) {
//    state.queue = []
//    status("The computer is considering it's options...")
//    // find cells where I have more players than the enemies adjacent cells
//    var maxAdjCells = state.player[player].maxAdjCells
//    for (var i=0; i < maxAdjCells.length; i++) {
//        cell = maxAdjCells[i]
//        var neighbors = state.cells[cell].neighbors
//        for (var n=0; n < neighbors.length; n++) {
//            var enemy = neighbors[n]
//            if (
//                (state.cells[enemy].player !== player && state.cells[enemy].number < state.cells[cell].number) ||
//                    (state.cells[enemy].player !== player && state.cells[enemy].number === state.cells[cell].number && state.cells[enemy].number === state.maxArmiesPerCell)
//                ) {
//                // ATTACK!!!
//                state.queue.push(["attack", cell, enemy])
//                log(sprintf("CPU to queue attack from %s to %s", cell, enemy))
//                break;
//            }
//
//        }
//    }
//    state.interval = setInterval(aiAttack, 5000)
//}
//
//function processQueue() {
////    var delay = 0;
////    var delayAdditional = 6000;
//    log("processQueue")
//    var q = state.queue.shift()
//    if (q) {
//        log(sprintf("%s %s %s", q[0], q[1], q[2]))
//        if (q[0] === 'attack') {
//            var cell1 = q[1]
//            var cell2 = q[2]
//            selectCell(cell1);
//            selectCell(cell2);
//            attack(cell1, cell2);
//        }
//    } else {
//        endTurn();
//        if (state.interval) {
//            clearInterval(state.interval)
//            log("Interval Cleared")
//            state.interval = 0
//            state.endTurnEnabled = true
////            endTurn()
//        }
//        return
//    }
//}

// TODO - rewrite this function to determine which is the best cell to attack first, vs first one I find.
function aiAttack() {
    status("The computer is considering it's options...");
    // find cells where I have more players than the enemies adjacent cells
    var player = state.currentPlayer;
    var maxAdjCells = state.player[player].maxAdjCells;
    var cellAttackFrom = '';
    var cellAttackTo = '';
    var cellAttackRatio = 0;
    var ratio = 0;

    for (var i=0; i < maxAdjCells.length; i++) {
        var cell = maxAdjCells[i];
        var neighbors = state.cells[cell].neighbors;
        for (var n=0; n < neighbors.length; n++) {
            var enemy = neighbors[n];
            if (
                (state.cells[enemy].player !== player && state.cells[enemy].number < state.cells[cell].number) ||
                    (state.cells[enemy].player !== player && state.cells[enemy].number === state.cells[cell].number && state.cells[enemy].number === state.maxArmiesPerCell)
                ) {
                // ATTACK!!!
                ratio = state.cells[cell].number / state.cells[enemy].number;
                if (ratio > cellAttackRatio) {
                    cellAttackFrom = cell;
                    cellAttackTo = enemy;
                    cellAttackRatio = ratio;
                    log(sprintf("attack from %s to %s as ratio %s is better than %s", cell, enemy, ratio, cellAttackRatio));
                }

//                selectCell(cell);
//                selectCell(enemy);
//                attack(cell, enemy);
//                if (!state.interval) {
//                    state.interval = setInterval(aiAttack, 10000);
//                    log(sprintf("setInterval(aiAttack, 5000)=%s",state.interval))
//                }
//                return
            }

        }
    }
    if (cellAttackFrom && cellAttackTo) {
        log(sprintf("attack from %s to %s with ratio %s", cell, enemy, cellAttackRatio));

        selectCell(cellAttackFrom);
        selectCell(cellAttackTo);
        attack(cellAttackFrom, cellAttackTo);
        if (!state.interval) {
            state.interval = setInterval(aiAttack, 7000);
            log(sprintf("setInterval(aiAttack, 7000)=%s",state.interval))
        }
    } else {
        log("No more cells found to attack!");
        if (state.interval) {
            clearInterval(state.interval);
            log("Interval Cleared");
            state.interval = 0

        }
        setTimeout2(function () {
            attackFinished();
            endTurn();
            endTurnEnable();
        }, 1000);
    }
}

function setTimeout2(command, delay) {
    log(sprintf("setTimeout2(%s, %s)", command, delay));
    setTimeout(command, delay)
}

function endTurnEnable() {
    log("---> endTurnEnable");

//    log(arguments.callee.name)
    state.endTurnEnabled = true
}

function endTurnDisable() {
    log("endTurnDisable");

//    log(arguments.callee.name)
//    console.trace()
    state.endTurnEnabled = false
}


function initGame() {
//    log("initGame");
    generateBoard();
    setBoard();
    initPlayers();
    computeNeighbors();
    buildPlayerStats();
    updatePlayerStats();
    state.clickEnabled = true;
    endTurnEnable();
//    state.endTurnEnabled = true;
    status("Ready Player: 1");
//    log("init complete")
}