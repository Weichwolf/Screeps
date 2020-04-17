const mainController = require('controller.main');

module.exports.loop = function () {
    mainController.run();
    mainController.cleanup();
}
