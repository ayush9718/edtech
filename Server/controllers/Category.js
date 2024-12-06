const Category = require("../models/Category");
const Courses = require("../models/Courses");

exports.createCategory = async (req, res) => {
    try{
        const {name, description} = req.body;

        if(!name){
            return res.status(400).json({
                success:false,
                message: "please enter category name",
            });
        }

        const categoryDetails = await Category.create({name, description});
        return res.status(200).json({
            success:true,
            data:categoryDetails,
            message:"category created successfully",
        });
    }
    catch(error){
        console.log("error while creating category :::", error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
}

const ShowAllCategory = async (req, res) => {
    try{
        const allcategory = await Category.find({},{name:1,description:1});
        res.status(200).json({
            success:true, 
            message:"All category", 
            allcategory
        });
    }
    catch(error){
        console.log("error while showing all category :::", error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
