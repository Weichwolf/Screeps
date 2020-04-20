const mainController = require('controller.main');

global.MOVING_AVERAGE_GENERATIONS = 10;
global.RESCHEDULE_TICKS = 1500 * 10;
global.WORKER_BODY = [WORK,CARRY,MOVE];
global.WORKERS_SOURCE = 4;

module.exports.loop = function () {
    mainController.run();
    mainController.cleanup();
}
