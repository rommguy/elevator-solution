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
        var floorObjects = [];
        var upQueue = [];
        var downQueue = [];
        // TODO - use the up and down queue when elevator is idle

        initFloors();
        initElevators();

        function initElevators(){
            _.forEach(elevators, function(elevator){
                elevator.elevatorDirection = '';
                elevator.on('idle', function(){
                    var currentFloor = elevator.currentFloor();
                    var topMostPressedFloor = _.findLastIndex(floorObjects, function(floorData){
                        return (floorData.up || floorData.down) && !floorData.assignedElevator;
                    });
                    var bottomMostPressedFloor = _.findIndex(floorObjects, function(floorData){
                        return (floorData.up || floorData.down) && !floorData.assignedElevator;
                    });
                    switch (elevator.elevatorDirection) {
                        case 'up':
                            if (topMostPressedFloor === -1){
                                // no pressed floors
                                return;
                            }
                            if (topMostPressedFloor > currentFloor){
                                insertNewDest(elevator, topMostPressedFloor, elevator.elevatorDirection);
                            } else {
                                elevator.elevatorDirection = 'down';
                                insertNewDest(elevator, bottomMostPressedFloor, elevator.elevatorDirection);
                            }
                            break;
                        case 'down':
                            if (bottomMostPressedFloor === -1){
                                // no pressed floors
                                return;
                            }
                            if (bottomMostPressedFloor < currentFloor){
                                insertNewDest(elevator, bottomMostPressedFloor, elevator.elevatorDirection);
                            } else {
                                elevator.elevatorDirection = 'up';
                                insertNewDest(elevator, topMostPressedFloor, elevator.elevatorDirection);
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
                        elevator.elevatorDirection = currentFloor > floorNum ? 'down' : 'up';
                    }
                    switch (elevator.elevatorDirection){
                        case 'up':
                            if (floorNum > currentFloor){
                                insertNewDest(elevator, floorNum, elevator.elevatorDirection);
                            } else {
                                downQueue.push(floorNum);
                            }
                            break;
                        case 'down':
                            if (floorNum < currentFloor){
                                insertNewDest(elevator, floorNum, elevator.elevatorDirection);
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
                        insertNewDest(elevator, floorNum, direction);
                    }
                });
            });
        }

        function initFloors() {
            _.forEach(floors, function (floor) {
                var floorNum = floor.floorNum();
                floorObjects[floorNum] = {};
                floor.on('up_button_pressed', upButtonPressed.bind(undefined, floorNum));
                floor.on('down_button_pressed', downButtonPressed.bind(undefined, floorNum));
            });

            function upButtonPressed(floorNum) {
                floorObjects[floorNum].up = true;
                var elevator = getFreeElevator();
                if (elevator) {
                    insertNewDest(elevator, floorNum);
                }
            }

            function downButtonPressed(floorNum) {
                floorObjects[floorNum].down = true;
                var elevator = getFreeElevator();
                if (elevator) {
                    insertNewDest(elevator, floorNum);
                }
            }
        }


        function insertNewDest(elevator, floorNum, direction) {
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
                elevator.elevatorDirection = currentFloor > floorNum ? 'down' : 'up';
            }
            setAssignedElevator(currentFloor, floorNum);
            elevator.checkDestinationQueue();
        }

        function getFreeElevator(){
            return _.find(elevators, function(elevator){
                return !(elevator.destinationQueue.length);
            });
        }

        function setAssignedElevator(fromFloor, toFloor){
            var fromIndex = Math.min(fromFloor, toFloor);
            var toIndex = Math.max(fromFloor, toFloor);
            for (var i = fromIndex; i < toIndex; i++){
                floors[i].assignedElevator = true;
            }
        }
    },
    update: function (dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}