const mongoose = require("mongoose")

const CustomerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
})

const CustomerModel = mongoose.model("Customer", CustomerSchema)

module.exports = CustomerModel; 