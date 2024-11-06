const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");

exprots.profileSchema= new mongoose.Schema({
    gender:{
        type:String,
    },
    dateOfBirth:{
        type:String,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumber:{
        type:Number,
    }
})

module.exports = mongoose.model("Profile",profileSchema);