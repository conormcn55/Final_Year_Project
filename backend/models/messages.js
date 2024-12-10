const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sentBy: { type: String, required: true },
    room:{ type: String, required: true },
    message:{ type: String, required: true },
    time:{type:Date, required:true}

});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;