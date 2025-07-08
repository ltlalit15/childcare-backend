import cloudinary from '../config/cloudinary.js';
import  pool  from '../config/db.js';

export const addCourse = async (req, res) => {
  const {
    user_id, course_name, completion_date, expiration_date
  } = req.body;

  let certificate_file = null;
  if (req.file) {
    const uploaded = await cloudinary.uploader.upload(req.file.path);
    certificate_file = uploaded.secure_url;
  }

  await pool.query(
    `INSERT INTO courses (user_id, course_name, completion_date, expiration_date, certificate_file)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, course_name, completion_date, expiration_date, certificate_file]
  );

  res.status(201).json({ message: "Course added." });
};

export const getCoursesByUser = async (req, res) => {
  const { user_id } = req.params;

  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE user_id = ?`,
    [user_id]
  );

  res.json(rows);
};
