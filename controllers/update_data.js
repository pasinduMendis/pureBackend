const dataCollectingService = require('../services/data_collecting_service');

module.exports = {
    updateData : async function(){
        dataCollectingService.dataCollectFromTenantturner().then(r => {});
    }
}
