const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    id: {
        required: true,
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    propertyType: {
        type: String
    },
    companyName: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zip: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    beds: {
        type: String
    },
    baths: {
        type: String
    },
    dateAvailable: {
        type: String
    },
    rentAmount: {
        type: String
    },
    depositAmount: {
        type: String
    },
    squareFootage: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    applicationFee: {
        type: String
    },
    isFurnished: {
        type: String
    },
    dogs: {
        type: String
    },
    cats: {
        type: String
    },
    housingAssistance: {
        type: String
    },
    applyUrl: {
        type: String
    },
    btnUrl: {
        type: String
    },
    btnText: {
        type: String
    },
    virtualTour: {
        type: String
    },
    pmName: {
        type: String
    },
    pmEmail: {
        type: String
    },
    pmPhone: {
        type: String
    },
    propertyGroup: {
        type: String
    },
    photos: [{
        type: String
    }]
})

module.exports = mongoose.model('Data', dataSchema)
