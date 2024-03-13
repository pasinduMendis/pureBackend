const tenantturner = require('../communication/tenantturner');
const Model = require("../model/model");
const IndexModel = require("../model/indexModel");

module.exports = {
    dataCollectFromTenantturner : async function () {
        await Model.deleteMany();
        await IndexModel.deleteMany();
        await tenantturner.getData(1);
    }
}
