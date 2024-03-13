const cron = require("node-cron");
const updateDataController = require('../controllers/update_data');
const mailSender = require('../communication/email_sender');


module.exports = {

    db_check : function(){

                cron.schedule("0 0 */4 * * *", function () {
                    console.log("check for new entries");
                    updateDataController.updateData();
                });

                cron.schedule("0 0 * * *", function () {
                    console.log("send Lost Data email and Spreadsheet data");
                    mailSender.sendLostDataEmail();
                });

    }
}



