const mongoose = require("mongoose");

exprots.otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default: Date.now(),
        expires: 5*60,
    }

});
// otp verification ke liye pre call hoga


module.exprot = mongoose.model("OTP",otpSchema);