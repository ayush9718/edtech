const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = ()=>{
    mongoose.connect(process.env.MONGODB_URL).then(()=>{
        console.log("db connection succesful")
    }).catch((err)=>{
        console.log("error in db connection:::",err)
    });
}