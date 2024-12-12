const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const {otpTemplate} = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp:{
        type:String,
    },
    createdAt:{
        type:Date,
        default: Date.now(),
        expires: 5*60,
    }

});
async function sendVerificationEmail(email, otp) {
	try {
        const otpbody = otpTemplate(otp);
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			otpbody,
		);
		console.log("Email sent successfully: ", mailResponse);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
	}
}
    otpSchema.pre("save", async function (next) {
        console.log("New document saved to database");
        
        if (this.isNew) {
            await sendVerificationEmail(this.email, this.otp);
        }
        next();
    });



module.exports = mongoose.model("OTP",otpSchema);