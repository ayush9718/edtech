const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const mailSender =require("../utility/mailSender");
const {passwordUpdated} = require("../mail/template/passwordUpdated"); //templates
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
require("dotenv").config();
//send otp

exprots.SendOtp=async (req,res)=>{
    try{
        const {email}= req.body;
        const isexist = await User.findOne({email});

        if(isexist){
            return res.status(401).json({
                success:false,
                message:"already a registed memeber"
            });
        }
        var newotp = otpGenerator.generate(6,{
            upperCaseAlphabets:true,
            lowerCaseAlphabets:false,
            specialChars:false,
            digits:true,
        })

        let checkotp = await OTP.findOne({newotp});
        while(checkotp){
            newotp = otpGenerator.generate(6,{
                upperCaseAlphabets:true,
                lowerCaseAlphabets:false,
                specialChars:false,
                digits:true,
            });
            checkotp = await OTP.findOne({newotp});
        }
        const otpPayload = {email,newotp};

        const otpBody = await OTP.create(otpPayload);
        res.status(200).json({
            success:true,
            message:"otp is sent successfully",
            otpbody,
        })
    }
    catch(error){
        console.log("error while sending otp");
        console.error(error);
        return res.status(500).json({
            success:false,
            messaage:error.messaage,
        })
    }
}
// sign up

exports.signUp = async (req,res)=>{

    try{
        const{fisrstName,lastName,email, password , confirmPassword,accountType, otp, contactNumber}=req.body;

        if( !fisrstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp || !contactNumber){
            return res.status(403).json({
                success:false,
                messgae:"All fileds are required",
            })
        }
        const emailExist = await User.findOne({email});
        if(emailExist){
            return res.status(401).json({
                success:false,
                message:"user already exist",
            })
        }

        if(confirmPassword!==password){
            return res.staus(400).json({
                success:false,
                messgae:"confirm password dont match",
            });
        }

        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		console.log(response);
		if (response.length === 0) {
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} 
        else if (otp !== response[0].otp) {
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

        const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
		});
		const user = await User.create({
			firstName,
			lastName,
			email,
			contactNumber,
			password: hashedPassword,
			accountType: accountType,
			approved: approved,
			additionalDetails: profileDetails._id,
			image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
		});

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}

}

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

        if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: `Please Fill up All the Required Fields`,
			});
		}

		const user = await User.findOne({ email }).populate("additionalDetails");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: `User is not Registered with Us Please SignUp to Continue`,
			});
		}

		if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign(
				{ email: user.email, id: user._id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			user.token = token;
			user.password = undefined;

			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect`,
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: `Login Failure Please Try Again`,
		});
	}
};

exports.changePassword = async (req, res) => {
	try {
		const userDetails = await User.findById(req.user.id);

		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if(oldPassword === newPassword){
			return res.status(400).json({
				success: false,
				message: "New Password cannot be same as Old Password",
			});
		}
		
		if (!isPasswordMatch) {

            return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}


        if (newPassword !== confirmNewPassword) {

            return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);


        try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"Study Notion - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {

            console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

        return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {

        console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};