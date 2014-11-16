/*eslint quotes:0*/
/*eslint no-use-before-define:0*/

/** @class elevator */
var Elevator = {
    destinationQueue: [],
    checkDestinationQueue: function () {
    },
    currentFloor: function () {
    },
    goToFloor: function () {
    },
    loadFactor: function(){},
    stop: function(){}
}

var Floor = {
    floorNum: function () {
    }
}

var obj = {
    init: function (elevators, floors) {
        var elevator = elevators[0]; // Let's use the first elevator
        var floorObjects = [];
        var upQueue = [];
        var downQueue = [];
        var elevatorDirection = '';

        initFloors();

        elevator.on('idle', function(){
            var currentFloor = elevator.currentFloor();
            var topMostPressedFloor = _.findLastIndex(floorObjects, function(buttonsObj){
                return buttonsObj.up || buttonsObj.down;
            });
            var bottomMostPressedFloor = _.findIndex(floorObjects, function(buttonsObj){
                return buttonsObj.up || buttonsObj.down;
            });
            switch (elevatorDirection) {
                case 'up':
                    if (topMostPressedFloor === -1){
                        // no pressed floors
                        return;
                    }
                    if (topMostPressedFloor > currentFloor){
                        insertNewDest(topMostPressedFloor, elevatorDirection);
                    } else {
                        elevatorDirection = 'down';
                        insertNewDest(bottomMostPressedFloor, elevatorDirection);
                    }
                    break;
                case 'down':
                    if (bottomMostPressedFloor === -1){
                        // no pressed floors
                        return;
                    }
                    if (bottomMostPressedFloor < currentFloor){
                        insertNewDest(bottomMostPressedFloor, elevatorDirection);
                    } else {
                        elevatorDirection = 'up';
                        insertNewDest(topMostPressedFloor, elevatorDirection);
                    }
                    break;
            }
        });
        elevator.on('stopped_at_floor', function(floorNum){
            floorObjects[floorNum] = {};
        });
        elevator.on('floor_button_pressed', function(floorNum){
            var currentFloor = elevator.currentFloor();
            if (elevator.destinationQueue.length === 0){
                elevatorDirection = currentFloor > floorNum ? 'down' : 'up';
            }
            switch (elevatorDirection){
                case 'up':
                    if (floorNum > currentFloor){
                        insertNewDest(floorNum, elevatorDirection);
                    } else {
                        downQueue.push(floorNum);
                    }
                    break;
                case 'down':
                    if (floorNum < currentFloor){
                        insertNewDest(floorNum, elevatorDirection);
                    } else {
                        upQueue.push(floorNum);
                    }
                    break;
            }
        });
        elevator.on('passing_floor', function (floorNum, direction) {
            if (elevator.loadFactor() > 0.8){
                return;
            }
            if (floorObjects[floorNum][direction]) {
                insertNewDest(floorNum, direction);
            }
        });

        function initFloors() {
            _.forEach(floors, function (floor) {
                var floorNum = floor.floorNum();
                floorObjects[floorNum] = {};
                floor.on('up_button_pressed', upButtonPressed.bind(undefined, floorNum));
                floor.on('down_button_pressed', downButtonPressed.bind(undefined, floorNum));
            });

            function upButtonPressed(floorNum) {
                floorObjects[floorNum].up = true;
                if (!elevator.destinationQueue.length) {
                    insertNewDest(floorNum);
                }
            }

            function downButtonPressed(floorNum) {
                floorObjects[floorNum].down = true;
                if (!elevator.destinationQueue.length) {
                    insertNewDest(floorNum);
                }
            }
        }

        function insertNewDest(floorNum, direction) {
            var currentFloor = elevator.currentFloor();
            if (_(elevator.destinationQueue).contains(floorNum)) {
                return;
            }
            elevator.destinationQueue.push(floorNum);
            if (direction) {
                switch (direction) {
                    case 'up':
                        elevator.destinationQueue.sort(function (a, b) {
                            return a - b;
                        });
                        break;
                    case 'down':
                        elevator.destinationQueue.sort(function (a, b) {
                            return b - a;
                        });
                        break;
                }
            }
            if (elevator.destinationQueue.length === 1){
                elevatorDirection = currentFloor > floorNum ? 'down' : 'up';
            }
            elevator.checkDestinationQueue();
        }
    },
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}