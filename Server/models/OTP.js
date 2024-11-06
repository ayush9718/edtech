const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

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
async function sendVerificationEmail(email, otp) {
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp),
		);
		console.log("Email sent successfully: ", mailResponse);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
	}
}
    OTPSchema.pre("save", async function (next) {
        console.log("New document saved to database");
        
        if (this.isNew) {
            await sendVerificationEmail(this.email, this.otp);
        }
        next();
    });



module.exports = mongoose.model("OTP",otpSchema);