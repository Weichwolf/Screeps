const mainController = require('controller.main');

global.MOVING_AVERAGE_GENERATIONS = 10;

module.exports.loop = function () {
    mainController.run();
    mainController.cleanup();
}
