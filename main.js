const MainController = require('controller.main');

global.TASK_TRANSFER = 1;


module.exports.loop = function () {
    let mainController = new MainController();
    mainController.run();
    mainController.cleanup();
}
