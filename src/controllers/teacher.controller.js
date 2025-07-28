import pool from '../config/db.js';
import { sendResponse } from '../utils/response.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import bcrypt from 'bcryptjs';


export const addTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      first_name,
      last_name,
      dob,
      ssn,
      gender,
      phone,
      cell,
      address,
      email,
      password,
      emergency_contact,
      status,
      dc_id,
      cbc_status,
      notes,
      classroom_id,
      teacher_name,
      department,
      training_type,
      last_completed,
      due_date
    } = req.body;

    const requiredFields = [
      { field: first_name, name: 'First Name' },
      { field: last_name, name: 'Last Name' },
      { field: dob, name: 'Date of Birth' },
      { field: address, name: 'Address' },
      { field: email, name: 'Email' },
      { field: emergency_contact, name: 'Emergency Contact' },
      { field: cbc_status, name: 'CBC Status' },
      { field: dc_id, name: 'DC ID' },
      { field: classroom_id, name: 'Classroom' }
    ];
    for (const item of requiredFields) {
      if (!item.field) {
        return res.status(400).json({ message: `${item.name} is required` });
      }
    }

    const filesMap = {};
    for (const file of req.files) {
      if (!filesMap[file.fieldname]) {
        filesMap[file.fieldname] = [];
      }
      filesMap[file.fieldname].push(file);
    }

    const requiredFiles = [
      { key: 'medical_form', label: 'Medical Form' },
      { key: 'credentials', label: 'Credentials' },
      { key: 'cbc_worksheet', label: 'CBC Worksheet' },
      { key: 'auth_affirmation_form', label: 'Authorization & Affirmation Form' },
    ];
    for (const file of requiredFiles) {
      if (!filesMap?.[file.key]?.[0]) {
        return res.status(400).json({ message: `${file.label} is required` });
      }
    }

    await connection.beginTransaction();

    const [roles] = await connection.query("SELECT role_id FROM roles WHERE name = ?", ['Teacher']);
    if (!roles.length) throw new Error("Role 'Teacher' not found");
    const role_id = roles[0].role_id;

    const hashedPassword = await bcrypt.hash(password?.trim() || "defaultpass123", 10);

    const [userResult] = await connection.query(
      `INSERT INTO users (role_id, first_name, last_name, dob, ssn, gender, phone, cell, address, email, emergency_contact, status, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [role_id, first_name, last_name, dob, ssn, gender, phone, cell, address, email, emergency_contact, status, hashedPassword]
    );
    const user_id = userResult.insertId;

    const uploadOrNull = async (key) =>
      filesMap?.[key]?.[0] ? await uploadToCloudinary(filesMap[key][0].path) : null;

    const photo = await uploadOrNull('photo');
    const medical_form = await uploadOrNull('medical_form');
    const credentials = await uploadOrNull('credentials');
    const cbc_worksheet = await uploadOrNull('cbc_worksheet');
    const auth_affirmation_form = await uploadOrNull('auth_affirmation_form');
    const mandated_reporter_cert = await uploadOrNull('mandated_reporter_cert');
    const preventing_sids_cert = await uploadOrNull('preventing_sids_cert');

    await connection.query(
      `INSERT INTO teachers (
        user_id, cbc_status, dc_id, notes,
        photo, medical_form, credentials, cbc_worksheet,
        auth_affirmation_form, mandated_reporter_cert, preventing_sids_cert, classroom_id,
        teacher_name, department, training_type, last_completed, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        cbc_status,
        dc_id,
        notes || null,
        photo,
        medical_form,
        credentials,
        cbc_worksheet,
        auth_affirmation_form,
        mandated_reporter_cert,
        preventing_sids_cert,
        classroom_id,
        teacher_name,
        department,
        training_type,
        last_completed,
        due_date
      ]
    );

    // Parse courses from fields
    const courses = [];
    for (const key in req.body) {
      const match = key.match(/^courses\[(\d+)]\[(course_id|completion_date|expiration_date)]$/);
      if (match) {
        const index = Number(match[1]);
        const field = match[2];
        if (!courses[index]) courses[index] = {};
        courses[index][field] = req.body[key];
      }
    }

    // Match course certificate files
    for (const file of req.files) {
      const match = file.fieldname.match(/^courses\[(\d+)]\[certificate]$/);
      if (match) {
        const index = Number(match[1]);
        const uploaded = await uploadToCloudinary(file.path);
        if (!courses[index]) courses[index] = {};
        courses[index].certificate = uploaded?.secure_url;
      }
    }

    // Insert into staff_courses
    for (const course of courses) {
      const { course_id, completion_date, expiration_date, certificate } = course;
      if (course_id && completion_date && expiration_date) {
        await connection.query(
          `INSERT INTO staff_courses (staff_id, course_id, completion_date, expiration_date, certificate_url)
           VALUES (?, ?, ?, ?, ?)`,
          [user_id, course_id, completion_date, expiration_date, certificate || null]
        );
      }
    }

    await connection.commit();

    const [rows] = await connection.query(
      `SELECT u.*, t.* 
       FROM users u
       JOIN teachers t ON u.user_id = t.user_id
       WHERE u.user_id = ?`,
      [user_id]
    );

    const [coursesResult] = await connection.query(
      `SELECT sc.*, c.name as course_name
       FROM staff_courses sc
       JOIN courses c ON sc.course_id = c.course_id
       WHERE sc.staff_id = ?`,
      [user_id]
    );

    return sendResponse(res, 201, "Teacher added successfully.", {
      ...rows[0],
      courses: coursesResult
    });

  } catch (error) {
    await connection.rollback();
    console.error("Add teacher error:", error);
    res.status(500).json({ message: "Failed to add teacher", error: error.message });
  } finally {
    connection.release();
  }
};


export const getTeachers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, t.* 
       FROM users u
       JOIN teachers t ON u.user_id = t.user_id
       WHERE u.role_id = (SELECT role_id FROM roles WHERE name = 'Teacher')`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff", error: error.message });
  }
};

// Get teacher by ID
export const getTeacherById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT u.*, t.* 
       FROM users u
       JOIN teachers t ON u.user_id = t.user_id
       WHERE u.user_id = ? AND u.role_id = (SELECT role_id FROM roles WHERE name = 'Teacher')`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: "Staff not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff", error: error.message });
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      first_name, last_name, dob, ssn, gender, phone, cell, address, email, emergency_contact, status,
      mandated_course_id, mandated_completion_date, mandated_expiration_date,
      sids_course_id, sids_completion_date, sids_expiration_date,
      cbc_status, dc_id, notes
    } = req.body;

    await connection.beginTransaction();

    // Update users table
    await connection.query(
      `UPDATE users SET first_name=?, last_name=?, dob=?, ssn=?, gender=?, phone=?, cell=?, address=?, email=?, emergency_contact=?, status=?
       WHERE user_id=?`,
      [first_name, last_name, dob, ssn, gender, phone, cell, address, email, emergency_contact, status, id]
    );

    // Handle file uploads if present
    const files = req.files;
    let photo, medical_form, credentials, cbc_worksheet, auth_affirmation_form, mandated_reporter_cert, preventing_sids_cert;

    if (files?.photo?.[0]) photo = await uploadToCloudinary(files.photo[0].path);
    if (files?.medical_form?.[0]) medical_form = await uploadToCloudinary(files.medical_form[0].path);
    if (files?.credentials?.[0]) credentials = await uploadToCloudinary(files.credentials[0].path);
    if (files?.cbc_worksheet?.[0]) cbc_worksheet = await uploadToCloudinary(files.cbc_worksheet[0].path);
    if (files?.auth_affirmation_form?.[0]) auth_affirmation_form = await uploadToCloudinary(files.auth_affirmation_form[0].path);
    if (files?.mandated_reporter_cert?.[0]) mandated_reporter_cert = await uploadToCloudinary(files.mandated_reporter_cert[0].path);
    if (files?.preventing_sids_cert?.[0]) preventing_sids_cert = await uploadToCloudinary(files.preventing_sids_cert[0].path);

    // Update teachers table
    await connection.query(
      `UPDATE teachers SET 
        cbc_status=?, dc_id=?, notes=?,
        photo=COALESCE(?, photo),
        medical_form=COALESCE(?, medical_form),
        credentials=COALESCE(?, credentials),
        cbc_worksheet=COALESCE(?, cbc_worksheet),
        auth_affirmation_form=COALESCE(?, auth_affirmation_form),
        mandated_reporter_cert=COALESCE(?, mandated_reporter_cert),
        preventing_sids_cert=COALESCE(?, preventing_sids_cert)
       WHERE user_id=?`,
      [
        cbc_status, dc_id, notes || null,
        photo, medical_form, credentials, cbc_worksheet, auth_affirmation_form, mandated_reporter_cert, preventing_sids_cert,
        id
      ]
    );

    // Optionally update staff_courses (not shown here for brevity)

    await connection.commit();

    const [rows] = await connection.query(
      `SELECT u.*, t.* 
       FROM users u
       JOIN teachers t ON u.user_id = t.user_id
       WHERE u.user_id = ?`,
      [id]
    );


    sendResponse(res, 200, "Teacher updated successfully", rows[0]);




  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Failed to update teacher", error: error.message });
  } finally {
    connection.release();
  }
};


export const updateSSN = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { ssn } = req.body;

    if (!ssn) {
      return res.status(400).json({ message: "SSN is required" });
    }

    const [result] = await connection.query(
      `UPDATE users SET ssn = ? WHERE user_id = ?`,
      [ssn, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "SSN updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to update SSN", error: error.message });
  } finally {
    connection.release();
  }
};


// Delete teacher
export const deleteTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    // Delete dependent records first
    await connection.query(`DELETE FROM staff_courses WHERE staff_id = ?`, [id]);
    // await connection.query(`DELETE FROM classrooms WHERE staff_id = ?`, [id]); // if exists

    // Then delete from teachers
    await connection.query(`DELETE FROM teachers WHERE user_id = ?`, [id]);

    // Then delete the user
    await connection.query(`DELETE FROM users WHERE user_id = ?`, [id]);

    await connection.commit();
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Failed to delete teacher", error: error.message });
  } finally {
    connection.release();
  }
};
