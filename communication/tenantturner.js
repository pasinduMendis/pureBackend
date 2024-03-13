const https = require('https');
const Model = require('../model/model');
const IndexModel = require('../model/indexModel');

module.exports = {
    getData : async function(id){

        https.get(`https://app.tenantturner.com/listings/group/${id}`, (resp) => {
            let data = '';

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', async () => {
                try {
                    console.log("save Entries in DB started");
                    const dataArr = JSON.parse(data);
                    var newDataIds = [];
                    for (let i = 0; i < dataArr.length; i++) {
                        const data = new Model(dataArr[i]);
                        var stateFullName = getStateFullName(dataArr[i].state);
                        const indexData = new IndexModel({
                            id: dataArr[i].id,
                            companyName: dataArr[i].companyName,
                            address: dataArr[i].address,
                            city: dataArr[i].city,
                            state: dataArr[i].state,
                            zip: dataArr[i].zip,
                            stateFullName: stateFullName
                        });

                        data._id = dataArr[i].id;
                        indexData._id = dataArr[i].id;
                        newDataIds.push(dataArr[i].id);
                        // var doc = await Model.findOne({id: dataArr[i].id});
                        // var indexDoc = await IndexModel.findOne({id: dataArr[i].id});

                        if(data.cats == null){
                            data.cats = 'false';
                        }
                        if(data.dogs == null){
                            data.dogs = 'false';
                        }
                        if(data.propertyType == null || data.propertyType ==''){
                            data.propertyType = 'Not Mentioned'
                        }
                        if(data.description == null){
                            data.description = '';
                        }
                        if(data.beds == 'Studio' || data.beds == 'TBD'){
                            data.beds = 0;
                        }

                        data.save();
                        indexData.save();
                        // await data.update( {upsert: true});
                    }

                    console.log("save Entries in DB Finished");
                    id++;
                }catch (e) {
                    console.log("Error: " + e);
                }
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });

        function getStateFullName(state){

            switch (state) {
                case 'AL':
                    return 'Alabama';
                case 'AK':
                    return 'Alaska';
                case 'AZ':
                    return 'Arizona';
                case 'AR':
                    return 'Arkansas';
                case 'CA':
                    return 'California';
                case 'CO':
                    return 'Colorado';
                case 'CT':
                    return 'Connecticut';
                case 'DE':
                    return 'Delaware';
                case 'DC':
                    return 'District of Columbia';
                case 'FL':
                    return 'Florida';
                case 'GA':
                    return 'Georgia';
                case 'HI':
                    return 'Hawaii';
                case 'ID':
                    return 'Idaho';
                case 'IL':
                    return 'Illinois';
                case 'IN':
                    return 'Indiana';
                case 'IA':
                    return 'Iowa';
                case 'KS':
                    return 'Kansas';
                case 'KY':
                    return 'Kentucky';
                case 'LA':
                    return 'Louisiana';
                case 'ME':
                    return 'Maine';
                case 'MD':
                    return 'Maryland';
                case 'MA':
                    return 'Massachusetts';
                case 'MI':
                    return 'Michigan';
                case 'MN':
                    return 'Minnesota';
                case 'MS':
                    return 'Mississippi';
                case 'MO':
                    return 'Missouri';
                case 'MT':
                    return 'Montana';
                case 'NE':
                    return 'Nebraska';
                case 'NV':
                    return 'Nevada';
                case 'NH':
                    return 'New Hampshire';
                case 'NJ':
                    return 'New Jersey';
                case 'NM':
                    return 'New Mexico';
                case 'NY':
                    return 'New York';
                case 'NC':
                    return 'North Carolina';
                case 'ND':
                    return 'North Dakota';
                case 'OH':
                    return 'Ohio';
                case 'OK':
                    return 'Oklahoma';
                case 'OR':
                    return 'Oregon';
                case 'PA':
                    return 'Pennsylvania';
                case 'RI':
                    return 'Rhode Island';
                case 'SC':
                    return 'South Carolina';
                case 'SD':
                    return 'South Dakota';
                case 'TN':
                    return 'Tennessee';
                case 'TX':
                    return 'Texas';
                case 'UT':
                    return 'Utah';
                case 'VT':
                    return 'Vermont';
                case 'VA':
                    return 'Virginia';
                case 'WA':
                    return 'Washington';
                case 'WV':
                    return 'West Virginia';
                case 'WI':
                    return 'Wisconsin';
                case 'WY':
                    return 'Wyoming';

                default:
                    return '';
            }
        }
    }



    // getData : function(id){
    //
    //     https.get(`https://app.tenantturner.com/listings/group/${id}`, (resp) => {
    //         let data = '';
    //
    //         // A chunk of data has been received.
    //         resp.on('data', (chunk) => {
    //             data += chunk;
    //         });
    //
    //         // The whole response has been received. Print out the result.
    //         resp.on('end', async () => {
    //             try {
    //                 // console.log(JSON.parse(data));
    //                 const dataArr = JSON.parse(data);
    //                 var newDataIds = [];
    //                 for (let i = 0; i < dataArr.length; i++) {
    //                     const data = new Model(dataArr[i]);
    //                     const indexData = new IndexModel({
    //                         id: dataArr[i].id,
    //                         companyName: dataArr[i].companyName,
    //                         address: dataArr[i].address,
    //                         city: dataArr[i].city,
    //                         state: dataArr[i].state,
    //                         zip: dataArr[i].zip
    //                     });
    //                     data._id = dataArr[i].id;
    //                     indexData._id = dataArr[i].id;
    //                     newDataIds.push(dataArr[i].id);
    //                     var doc = await Model.findOne({id: dataArr[i].id});
    //                     var indexDoc = await IndexModel.findOne({id: dataArr[i].id});
    //
    //                     if (doc) {
    //                         Model.findOneAndUpdate({id: dataArr[i].id}, data);
    //                     }else {
    //                         data.save();
    //                     }
    //
    //                     if (indexDoc) {
    //                         IndexModel.findOneAndUpdate({id: dataArr[i].id}, indexData);
    //                     }else {
    //                         indexData.save();
    //                     }
    //                     // await data.update( {upsert: true});
    //                 }
    //
    //
    //                 const allIdList = await Model.find({},{ _id:1 });
    //                 var deletedIdList = [];
    //                 allIdList.forEach(function (item) {
    //                     if(!newDataIds.includes(item._id)){
    //                         deletedIdList.push(item._id);
    //                     }
    //                 })
    //
    //
    //                 if(deletedIdList.length !=0){
    //                     for (let i = 0; i < deletedIdList.length; i++) {
    //                         await Model.findByIdAndDelete(deletedIdList[i])
    //                         await IndexModel.findByIdAndDelete(deletedIdList[i])
    //                     }
    //                 }
    //
    //                 id++;
    //                 this.getData(id);
    //             }catch (e) {
    //                 console.log("Error: " + e);
    //             }
    //         });
    //
    //     }).on("error", (err) => {
    //         console.log("Error: " + err.message);
    //     });
    // }
}
