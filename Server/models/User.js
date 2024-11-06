const mongoose = require("mongoose");

exports.userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        trim:true,
        required:true,
    },
    lastName:{
        type:String,
        trim:true,
        required:true,
    },
    email:{
        type:String,
        trim:true,
        required:true,
    },
    password:{
        type:String,
        trim:true,
    },
    accountType:{
        type:String,
        enum:["Admin","Instructor","Student"],
        required:true,
    },
    approved:{
      type:Boolean,
      default:true,  
    },
    active:{
      type:Boolean,
      default:true,  
    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Profile'
    },
    courses:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'courseProgress',
    }]
      
})

module.exports = mongoose.model("User",userSchema);