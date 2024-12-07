const Section = require("../models/Section");
const Course = require("../models/Courses");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}
		
		const ifcourse= await Course.findById(courseId);
		if (!ifcourse) {
			return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		).populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		return res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	} catch (error) {
		// Handle errors
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		console.log(sectionName, sectionId);
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);
		const updatedCourse = await Course.findById(courseId).populate({ 
            path: "courseContent", populate: { path: "subSection" } 
        }).exec();
		return res.status(200).json({
			success: true,
			message: "Section updated successfully",
			updatedCourse,

		});
	} catch (error) {
		console.error("Error updating section:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })
    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } })

    await Section.findByIdAndDelete(sectionId)

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    })
  } catch (error) {
    console.error("Error deleting section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}