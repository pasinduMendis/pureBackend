require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const Model = require('../model/model');
const IndexModel = require('../model/indexModel');
const mailSender = require('../communication/email_sender');
const updateDataController = require('../controllers/update_data');
const router = express.Router();

const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;


const authenticateToken = (req, res, next) => {

    const token = req.header('Authorization');
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, AUTH0_CLIENT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden

    req.user = user;
    next();
  })
}

// get token
router.get('/maploaderjs', (req, res) => {

    const token = jwt.sign({}, AUTH0_CLIENT_SECRET, {
        issuer: `https://${AUTH0_DOMAIN}/`,
        audience: AUTH0_CLIENT_ID,
        expiresIn: '1h',
        algorithm: 'HS256',
    });

    res.json({ token })
})

//Post Method
router.post('/post', async (req, res) => {
    const data = new Model(req.body)
    // console.log(data);

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})


router.post('/filterAddress', async (req, res) => {
    try {
        const filterDto = req.body;
        var catSearch = ['true', 'false'];
        var dogSearch = ['true', 'false'];

        if (!filterDto.email) {
            filterDto.email = '';
        }
        if (!filterDto.address) {
            filterDto.address = '';
        }
        if (!filterDto.city) {
            filterDto.city = '';
        }
        if (!filterDto.zip) {
            filterDto.zip = '';
        }
        if (!filterDto.companyName) {
            filterDto.companyName = [''];
        }
        else if(filterDto.companyName){
            filterDto.companyName = getCompanyName(filterDto.companyName);
        }

        if (!filterDto.phone) {
            filterDto.phone = '';
        }
        if (!filterDto.propertyType) {
            filterDto.propertyType = ['Single Family', 'Townhouse', 'Apartment Unit', 'Condo Unit', 'Not Mentioned', 'Duplex', 'Apartment Community', 'Room for Rent', 'Office'];
        }
        if (!filterDto.addressKey) {
            filterDto.addressKey = '';
        }else {
            if (filterDto.addressKey.includes(', ')) {
                filterDto.city = filterDto.addressKey.split(', ')[0];
                filterDto.state = filterDto.addressKey.split(', ')[1];
            }else{
                filterDto.city = filterDto.addressKey;
                filterDto.state = getStateShortName(filterDto.addressKey);
                filterDto.address = filterDto.addressKey;
                filterDto.zip = filterDto.addressKey;
            }
        }

        if (!filterDto.state) {
            filterDto.state = '';
        }
        if (!filterDto.title) {
            filterDto.title = '';
        }
        if (!filterDto.description) {
            filterDto.description = '';
        }
        if (!filterDto.bathsMin) {
            filterDto.bathsMin = -1;
        }
        if (!filterDto.bathsMax) {
            filterDto.bathsMax = 100;
        }
        if (!filterDto.bedsMin) {
            filterDto.bedsMin = -1;
        }
        if (!filterDto.bedsMax) {
            filterDto.bedsMax = 100;
        }
        if (!filterDto.rentMin) {
            filterDto.rentMin = 0.01;
        }else{
            filterDto.rentMin =  filterDto.rentMin - 0.01;
        }
        if (!filterDto.rentMax) {
            filterDto.rentMax = 100000;
        }else{
            filterDto.rentMax = filterDto.rentMax + 0.01;
        }

        if(filterDto.cats.toString() =='true'){
            catSearch = ['true'];
        }
        if(filterDto.cats.toString() =='false'){
            catSearch = ['false'];
        }

        if(filterDto.dogs.toString() =='true'){
            dogSearch = ['true'];
        }
        if(filterDto.dogs.toString() =='false'){
            dogSearch = ['false'];
        }

        if (!filterDto.latFrom) {
            filterDto.latFrom = -90;
        }
        if (!filterDto.latTo) {
            filterDto.latTo = 90;
        }
        if (!filterDto.lngFrom) {
            filterDto.lngFrom = -180;
        }
        if (!filterDto.lngTo) {
            filterDto.lngTo = 180;
        }
        if (!filterDto.limit) {
            filterDto.limit = 100000;
        }
        // console.log(filterDto);
        let responseData = [];
        if (filterDto.startDate && filterDto.endDate) {
            if (filterDto.addressKey.includes(', ')) {
                const data = await Model.find(
                    {$and :
                            [
                                // { "companyName" : { $regex: '.*' + filterDto.companyName.toLowerCase() + '.*', $options : 'i' } },
                                {"companyName": { $regex: filterDto.companyName.join("|"), $options: 'i'}},
                                { "email" : { $regex: '.*' + filterDto.email.toLowerCase() + '.*', $options : 'i' } },
                                { "phone" : { $regex: '.*' + filterDto.phone + '.*', $options : 'i' } },
                                { "city" : { $regex: '.*' + filterDto.city + '.*', $options : 'i' } },
                                { "state" : { $regex: '.*' + filterDto.state + '.*', $options : 'i' } },
                                { "title" : { $regex: '.*' + filterDto.title.toLowerCase() + '.*', $options : 'i' } },
                                // { "propertyType" : { $regex: '.*' + filterDto.propertyType.toLowerCase() + '.*', $options : 'i' } },
                                { "propertyType" : { $in: filterDto.propertyType }},
                                { "description" : { $regex: '.*' + filterDto.description.toLowerCase() + '.*', $options : 'i' } },
                                {"$expr" : {"$gt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMin]}},
                                {"$expr" : {"$lt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMax]}},
                                { "baths" : { $lt: filterDto.bathsMax } },
                                { "baths" : { $gt: filterDto.bathsMin } },
                                { "beds" : { $lt: filterDto.bedsMax } },
                                { "beds" : { $gt: filterDto.bedsMin } },
                                { "latitude" : { $lt: filterDto.latTo } },
                                { "latitude" : { $gt: filterDto.latFrom } },
                                { "longitude" : { $lt: filterDto.lngTo } },
                                { "longitude" : { $gt: filterDto.lngFrom } },
                                { "cats" : { $in: catSearch } },
                                { "dogs" : { $in: dogSearch } },
                                {"$expr" : {"$gte" : [
                                            {
                                                $dateFromString: {
                                                    dateString: "$dateAvailable",
                                                    format: "%m/%d/%Y"
                                                }
                                            },
                                            {
                                                $dateFromString: {
                                                    dateString: filterDto.startDate,
                                                    format: "%m/%d/%Y"
                                                }
                                            }
                                        ]}},
                                {"$expr" : {"$lt" : [
                                            {
                                                $dateFromString: {
                                                    dateString: "$dateAvailable",
                                                    format: "%m/%d/%Y"
                                                }
                                            },
                                            {
                                                $dateFromString: {
                                                    dateString: filterDto.endDate,
                                                    format: "%m/%d/%Y"
                                                }
                                            }
                                        ]}},
                            ]
                    }).limit(filterDto.limit)
                    .then(function (data, err) {
                        console.log('error1',err);
                        // console.log('data',data);
                        responseData = data;
                    });

                res.json(responseData);


            }else {
                const data = await Model.find(
                    {$and :
                            [
                                // { "companyName" : { $regex: '.*' + filterDto.companyName.toLowerCase() + '.*', $options : 'i' } },
                                {"companyName": { $regex: filterDto.companyName.join("|"), $options: 'i'}},
                                { "email" : { $regex: '.*' + filterDto.email.toLowerCase() + '.*', $options : 'i' } },
                                { "phone" : { $regex: '.*' + filterDto.phone + '.*', $options : 'i' } },
                                {
                                    $or : [
                                        { "address" : { $regex: '.*' + filterDto.address.toLowerCase() + '.*', $options : 'i' } },
                                        { "city" : { $regex: '.*' + filterDto.city.toLowerCase() + '.*', $options : 'i' } },
                                        { "zip" : { $regex: '.*' + filterDto.zip.toLowerCase() + '.*', $options : 'i' } },
                                        { "state" : { $regex: '.*' + filterDto.state + '.*', $options : 'i' } }
                                    ]
                                },
                                { "title" : { $regex: '.*' + filterDto.title.toLowerCase() + '.*', $options : 'i' } },
                                // { "propertyType" : { $regex: '.*' + filterDto.propertyType.toLowerCase() + '.*', $options : 'i' } },
                                { "propertyType" : { $in: filterDto.propertyType }},
                                { "description" : { $regex: '.*' + filterDto.description.toLowerCase() + '.*', $options : 'i' } },
                                {"$expr" : {"$gt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMin]}},
                                {"$expr" : {"$lt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMax]}},
                                { "baths" : { $lt: filterDto.bathsMax } },
                                { "baths" : { $gt: filterDto.bathsMin } },
                                { "beds" : { $lt: filterDto.bedsMax } },
                                { "beds" : { $gt: filterDto.bedsMin } },
                                { "latitude" : { $lt: filterDto.latTo } },
                                { "latitude" : { $gt: filterDto.latFrom } },
                                { "longitude" : { $lt: filterDto.lngTo } },
                                { "longitude" : { $gt: filterDto.lngFrom } },
                                { "cats" : { $in: catSearch } },
                                { "dogs" : { $in: dogSearch } },
                                {"$expr" : {"$gte" : [
                                            {
                                                $dateFromString: {
                                                    dateString: "$dateAvailable",
                                                    format: "%m/%d/%Y"
                                                }
                                            },
                                            {
                                                $dateFromString: {
                                                    dateString: filterDto.startDate,
                                                    format: "%m/%d/%Y"
                                                }
                                            }
                                        ]}},
                                {"$expr" : {"$lt" : [
                                            {
                                                $dateFromString: {
                                                    dateString: "$dateAvailable",
                                                    format: "%m/%d/%Y"
                                                }
                                            },
                                            {
                                                $dateFromString: {
                                                    dateString: filterDto.endDate,
                                                    format: "%m/%d/%Y"
                                                }
                                            }
                                        ]}},
                            ]
                    }).limit(filterDto.limit)
                    .then(function (data, err) {
                        console.log('error2',err);
                        // console.log('data',data);
                        responseData = data;
                    });

                res.json(responseData);

            }
        }else {
            if (filterDto.addressKey.includes(', ')) {
                const data = await Model.find(
                    {$and :
                            [
                                // { "companyName" : { $regex: '.*' + filterDto.companyName.toLowerCase() + '.*', $options : 'i' } },
                                {"companyName": { $regex: filterDto.companyName.join("|"), $options: 'i'}},
                                { "email" : { $regex: '.*' + filterDto.email.toLowerCase() + '.*', $options : 'i' } },
                                { "phone" : { $regex: '.*' + filterDto.phone + '.*', $options : 'i' } },
                                { "city" : { $regex: '.*' + filterDto.city + '.*', $options : 'i' } },
                                { "state" : { $regex: '.*' + filterDto.state + '.*', $options : 'i' } },
                                { "title" : { $regex: '.*' + filterDto.title.toLowerCase() + '.*', $options : 'i' } },
                                // { "propertyType" : { $regex: '.*' + filterDto.propertyType.toLowerCase() + '.*', $options : 'i' } }
                                { "propertyType" : { $in: filterDto.propertyType }},
                                { "description" : { $regex: '.*' + filterDto.description.toLowerCase() + '.*', $options : 'i' } },
                                {"$expr" : {"$gt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMin]}},
                                {"$expr" : {"$lt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMax]}},
                                { "baths" : { $lt: filterDto.bathsMax } },
                                { "baths" : { $gt: filterDto.bathsMin } },
                                { "beds" : { $lt: filterDto.bedsMax } },
                                { "beds" : { $gt: filterDto.bedsMin } },
                                { "latitude" : { $lt: filterDto.latTo } },
                                { "latitude" : { $gt: filterDto.latFrom } },
                                { "longitude" : { $lt: filterDto.lngTo } },
                                { "longitude" : { $gt: filterDto.lngFrom } },
                                { "cats" : { $in: catSearch } },
                                { "dogs" : { $in: dogSearch } },
                            ]
                    }).limit(filterDto.limit)
                    .then(function (data, err) {
                        console.log('error3',err);
                        responseData = data;
                    });

                res.json(responseData);

            }else {
                const data = await Model.find(
                    {$and :
                            [
                                // { "companyName" : { $regex: '.*' + filterDto.companyName.toLowerCase() + '.*', $options : 'i' } },
                                {"companyName": { $regex: filterDto.companyName.join("|"), $options: 'i'}},
                                { "email" : { $regex: '.*' + filterDto.email.toLowerCase() + '.*', $options : 'i' } },
                                { "phone" : { $regex: '.*' + filterDto.phone + '.*', $options : 'i' } },
                                {
                                    $or : [
                                        { "address" : { $regex: '.*' + filterDto.addressKey.toLowerCase() + '.*', $options : 'i' } },
                                        { "city" : { $regex: '.*' + filterDto.addressKey.toLowerCase() + '.*', $options : 'i' } },
                                        { "zip" : { $regex: '.*' + filterDto.addressKey.toLowerCase() + '.*', $options : 'i' } },
                                        { "state" : { $regex: '.*' + filterDto.state + '.*', $options : 'i' } }
                                    ]
                                },
                                { "title" : { $regex: '.*' + filterDto.title.toLowerCase() + '.*', $options : 'i' } },
                                // { "propertyType" : { $regex: '.*' + filterDto.propertyType.toLowerCase() + '.*', $options : 'i' } },
                                { "propertyType" : { $in: filterDto.propertyType }},
                                { "description" : { $regex: '.*' + filterDto.description.toLowerCase() + '.*', $options : 'i' } },
                                {"$expr" : {"$gt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMin]}},
                                {"$expr" : {"$lt" : [{"$toDouble" :"$rentAmount"} , filterDto.rentMax]}},
                                { "baths" : { $lt: filterDto.bathsMax } },
                                { "baths" : { $gt: filterDto.bathsMin } },
                                { "beds" : { $lt: filterDto.bedsMax } },
                                { "beds" : { $gt: filterDto.bedsMin } },
                                { "latitude" : { $lt: filterDto.latTo } },
                                { "latitude" : { $gt: filterDto.latFrom } },
                                { "longitude" : { $lt: filterDto.lngTo } },
                                { "longitude" : { $gt: filterDto.lngFrom } },
                                { "cats" : { $in: catSearch } },
                                { "dogs" : { $in: dogSearch } },
                            ]
                    }).limit(filterDto.limit)
                    .then(function (data, err) {
                        console.log('error4',err);
                        responseData = data;
                    });

                res.json(responseData);

            }
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get all Method
router.get('/getAll', async (req, res) => {
    try {
        // const data = await Model.find();
        let responseData = [];
        var colName="companyName";
            const data = await Model.find({ "a" : { $regex: '.*' + colName + '.*', $options : 'i' } })
            .then(function (data, err) {
                responseData = data;
            });
        res.json(responseData)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get all Method
router.get('/getAllIndex' , async (req, res) => {
    try {
        // const data = await Model.find();
        let responseData = [];
        var colName="companyName";
        const data = await IndexModel.find()
            .then(function (data, err) {
                console.log('error',err);
                responseData = data;
            });
        res.json(responseData)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get by ID Method
router.get('/getOne/:id', async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Update by ID Method
router.patch('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Model.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Delete by ID Method
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Model.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//send error report mail
router.post('/sendmail', async (req, res) => {

     try {
         await mailSender.sendLostDataEmail();
         res.send(`Mail send successfully`)
     }
     catch (error) {
       res.status(400).json({ message: error.message })
     }
})

//database updated scheduler
router.post('/databaseUpdate', async (req, res) => {

    try {
        await updateDataController.updateData();
        res.send(`Database update successfully`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})


//send error report mail
router.post('/userInquiryMail',async (req, res) => {

    const inquiryDetails = req.body;

    try {
        mailSender.sendUserInquiryEmail(inquiryDetails);
        res.send(`Enquiry Mail send successfully`)
        }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

function getStateShortName(state) {
    switch (state) {
        case 'Alabama':
            return 'AL';
        case 'Alaska':
            return 'AK';
        case 'Arizona':
            return 'AZ';
        case 'Arkansas':
            return 'AR';
        case 'California':
            return 'CA';
        case 'Colorado':
            return 'CO';
        case 'Connecticut':
            return 'CT';
        case 'Delaware':
            return 'DE';
        case 'District of Columbia':
            return 'DC';
        case 'Florida':
            return 'FL';
        case 'Georgia':
            return 'GA';
        case 'Hawaii':
            return 'HI';
        case 'Idaho':
            return 'ID';
        case 'Illinois':
            return 'IL';
        case 'Indiana':
            return 'IN';
        case 'Iowa':
            return 'IA';
        case 'Kansas':
            return 'KS';
        case 'Kentucky':
            return 'KY';
        case 'Louisiana':
            return 'LA';
        case 'Maine':
            return 'ME';
        case 'Maryland':
            return 'MD';
        case 'Massachusetts':
            return 'MA';
        case 'Michigan':
            return 'MI';
        case 'Minnesota':
            return 'MN';
        case 'Mississippi':
            return 'MS';
        case 'Missouri':
            return 'MO';
        case 'Montana':
            return 'MT';
        case 'Nebraska':
            return 'NE';
        case 'Nevada':
            return 'NV';
        case 'New Hampshire':
            return 'NH';
        case 'New Jersey':
            return 'NJ';
        case 'New Mexico':
            return 'NM';
        case 'New York':
            return 'NY';
        case 'North Carolina':
            return 'NC';
        case 'North Dakota':
            return 'ND';
        case 'Ohio':
            return 'OH';
        case 'Oklahoma':
            return 'OK';
        case 'Oregon':
            return 'OR';
        case 'Pennsylvania':
            return 'PA';
        case 'Rhode Island':
            return 'RI';
        case 'South Carolina':
            return 'SC';
        case 'South Dakota':
            return 'SD';
        case 'Tennessee':
            return 'TN';
        case 'Texas':
            return 'TX';
        case 'Utah':
            return 'UT';
        case 'Vermont':
            return 'VT';
        case 'Virginia':
            return 'VA';
        case 'Washington':
            return 'WA';
        case 'West Virginia':
            return 'WV';
        case 'Wisconsin':
            return 'WI';
        case 'Wyoming':
            return 'WY';
        default:
            return state;
    }
}

function getCompanyName(comapanyName) {
    switch (comapanyName) {
        case "Los Angeles Office CA":
            comapanyName = ['Los Angeles Office CA','Orange County Office CA'];
            return comapanyName;
        case "PURE Property Management of Texas":
            comapanyName = ['PURE Property Management of Texas','Fort Worth Office'];
            return comapanyName;
        case "Scottsdale Office":
            comapanyName = ['Scottsdale Office','Mesa office'];
            return comapanyName;
        case "North Bay Office CA":
            comapanyName = ['North Bay Office CA','Petaluma office'];
            return comapanyName;
        default:
            var sameCompanyName = []
            sameCompanyName.push(comapanyName);
            return sameCompanyName;
        }
}


module.exports = router;
