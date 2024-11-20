const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
    requesterId: { type: String, required: true },
    approverId: { type: String, required: true },
    propertyId: { type: String, required: true },
    amountAllowed: { type: String, required: false },
    approved: { type: Boolean, required:true }
});

const Request = mongoose.model("Request", RequestSchema);
module.exports = Request;