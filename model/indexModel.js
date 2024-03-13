const mongoose = require('mongoose');

const indexDataSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    id: {
        required: true,
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
    stateFullName:{
        type: String
    }
})

module.exports = mongoose.model('IndexData', indexDataSchema)
