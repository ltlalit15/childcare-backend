import cloudinary from '../config/cloudinary.js';
import pool from '../config/db.js';
import { sendError, sendResponse } from '../utils/response.js';

export const addCourse = async (req, res) => {
  const {
    user_id,
    course_name,
    completion_date,
    expiration_date,
  } = req.body;

  let certificate_file = null;

  try {
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      certificate_file = uploaded.secure_url;
    }

    // Insert new course
    const [result] = await pool.query(
      `INSERT INTO courses (user_id, course_name, completion_date, expiration_date, certificate_file)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, course_name, completion_date, expiration_date, certificate_file]
    );

    const insertedId = result.insertId;

    // Fetch the newly inserted course
    const [rows] = await pool.query(
      `SELECT * FROM courses WHERE course_id = ?`,
      [insertedId]
    );

    if (rows.length === 0) {
      return sendError(res, 404, "Failed to retrieve newly added course");
    }

    return sendResponse(res, 201, "Course added successfully", rows[0]);

  } catch (error) {
    console.error("Error adding course:", error);
    return sendError(res, 500, "Failed to add course");
  }
};


export const getCourses = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM courses");
    return sendResponse(res, 200, "cousre Fetchd succesfully", rows);
  } catch (error) {
    return sendError(res, 500, "Error fetching courses");
  }
}


// export const updateCourse = async (req, res) => {
//    const course_id = req.params.course_id;
//     const {
//   user_id,
//   course_name,
//   completion_date,
//   expiration_date,
// } = req.body;

//   try{

//     const [rows] = await pool.query("SELECT * FROM courses WHERE course_id = ?", [course_id]);
//   if (rows.length === 0) {
//     return res.status(404).json({ message: "course  not found" });
//   }
//   const [row] = await pool.query(`
//     UPDATE courses SET user_id = ?, course_name = ?, completion_date = ?, expiration_date = ? WHERE course_id = ?`,
//     [user_id, course_name, completion_date, expiration_date, course_id]

//   )
//    return sendResponse(res, 201, "Course added successfully", row[0]);

//   }catch(error){
//     console.error("Error updating course:", error);
//     return sendError(res, 500, "Failed to update course");
//   }
// }


export const updateCourse = async (req, res) => {
  const { course_id } = req.params;
  const {
    user_id,
    course_name,
    completion_date,
    expiration_date,
  } = req.body;

  let new_certificate_file = null;
  let new_certificate_public_id = null;

  try {
    // 1. Get existing course
    const [existingCourses] = await pool.query(
      "SELECT * FROM courses WHERE course_id = ?",
      [course_id]
    );

    if (existingCourses.length === 0) {
      return sendError(res, 404, "Course not found");
    }

    const existing = existingCourses[0];

    // 2. If new file, upload to Cloudinary and delete old
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      new_certificate_file = uploaded.secure_url;
      new_certificate_public_id = uploaded.public_id;

      // Delete old certificate from Cloudinary (if exists)
      if (existing.certificate_public_id) {
        await cloudinary.uploader.destroy(existing.certificate_public_id);
      }
    }

    // 3. Prepare fields to update
    const updateFields = [
      "user_id = ?",
      "course_name = ?",
      "completion_date = ?",
      "expiration_date = ?"
    ];
    const values = [
      user_id,
      course_name,
      completion_date,
      expiration_date
    ];

    if (new_certificate_file) {
      updateFields.push("certificate_file = ?", "certificate_public_id = ?");
      values.push(new_certificate_file, new_certificate_public_id);
    }

    values.push(course_id); // for WHERE clause

    // 4. Update query
    await pool.query(
      `UPDATE courses SET ${updateFields.join(", ")} WHERE course_id = ?`,
      values
    );

    // 5. Return updated course
    const [updatedRows] = await pool.query(
      "SELECT * FROM courses WHERE course_id = ?",
      [course_id]
    );

    return sendResponse(res, 200, "Course updated successfully", updatedRows[0]);

  } catch (error) {
    console.error("Error updating course:", error);
    return sendError(res, 500, "Failed to update course");
  }
};





export const getCoursesByUser = async (req, res) => {
  const { user_id } = req.params;

  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE user_id = ?`,
    [user_id]
  );

  res.json(rows);
};

export const deleteCourse = async (req, res) => {
  const { course_id } = req.params;
  try {
    const [rows] = await pool.query(
      `DELETE FROM courses WHERE course_id = ?`,
      [course_id]
    );
    sendResponse(res, 200, "Course deleted successfully", { deletedId: course_id });
  } catch (error) {
    return sendError(res, 500, "Error deleting course");
  }
}