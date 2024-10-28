const mongoose = require('mongoose');
const Schema= mongoose.Schema;

const UserSchema = new Schema({
    name:{type:String,required:true},
    googleId:{type:String,required:false},
    email:{type:String,required:true},
    number:{type:String,required:false},
    avatar: {
        public_id: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        }
    },
    files:[
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            },
            filename: {  
                type: String,
                required: false
            }
        }],
        description:{type:String,required:false},
        userType:{type:String,required:true},
        regNumber:{type:String,required:false},
   
})
const User = mongoose.model("User",UserSchema);
module.exports =User;