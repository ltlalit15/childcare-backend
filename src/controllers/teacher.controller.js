import pool from '../config/db.js';
import { sendResponse } from '../utils/response.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

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
      emergency_contact,
      status,

      mandated_course_id,
      mandated_completion_date,
      mandated_expiration_date,

      sids_course_id,
      sids_completion_date,
      sids_expiration_date,

      cbc_status,
      dc_id,
      notes
    } = req.body;

    await connection.beginTransaction();

    // Get Teacher role_id
    const [roles] = await connection.query("SELECT role_id FROM roles WHERE name = ?", ['Teacher']);
    if (!roles.length) throw new Error("Role 'Teacher' not found");
    const role_id = roles[0].role_id;

     const hashedPassword = await bcrypt.hash("defaultpass123", 10);
    // Insert into users
    const [userResult] = await connection.query(
      `INSERT INTO users (role_id, first_name, last_name, dob, ssn, gender, phone, cell, address, email, emergency_contact, status, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [role_id, first_name, last_name, dob, ssn, gender, phone, cell, address, email, emergency_contact, status, hashedPassword]
    );
    const user_id = userResult.insertId;


     const files = req.files;
    
    let  photo= null;
     let medical_form=  null;
     let credentials= null;
    let  cbc_worksheet=null;
     let auth_affirmation_form = null;
     let mandated_reporter_cert =  null;
    let  preventing_sids_cert=  null;

    //   let photo = null;
    // let auth_affirmation_form = null;
    // let immunization_record_url = null;
    // let medical_form = null;


    if (files?.photo?.[0]) {
      photo = await uploadToCloudinary(files.photo[0].path);
    }
    if (files?.auth_affirmation_form?.[0]) {
      auth_affirmation_form = await uploadToCloudinary(files.auth_affirmation_form[0].path);
    }
    if (files?.immunization_record?.[0]) {
      immunization_record_url = await uploadToCloudinary(files.immunization_record[0].path);
    }
    if (files?.medical_form?.[0]) {
      medical_form = await uploadToCloudinary(files.medical_form[0].path);
    }

    if(files?.credentials?.[0]){
      credentials = await uploadToCloudinary(files.credentials[0].path);
    }

    if(files?.cbc_worksheet?.[0]){
      cbc_worksheet = await uploadToCloudinary(files.cbc_worksheet[0].path);
    }
    if(files?.mandated_reporter_cert?.[0]){
      mandated_reporter_cert = await uploadToCloudinary(files.mandated_reporter_cert[0].path);
    }

    if(files?.preventing_sids_cert?.[0]){
    preventing_sids_cert = await uploadToCloudinary(files.preventing_sids_cert[0].path);
    }


       





    // Insert into teachers table (teacher-specific details)
    await connection.query(
      `INSERT INTO teachers (user_id, cbc_status, dc_id, notes, photo, medical_form, credentials, cbc_worksheet, auth_affirmation_form, mandated_reporter_cert, preventing_sids_cert)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, cbc_status, dc_id, notes || null, photo, medical_form,credentials, cbc_worksheet, auth_affirmation_form, mandated_reporter_cert, preventing_sids_cert ]
    );

    // Upload documents
   
    // const docTypes = {
    //   photo: 'profile_photo',
    //   medical_form: 'medical_form',
    //   credentials: 'credentials',
    //   cbc_worksheet: 'cbc_worksheet',
    //   auth_affirmation_form: 'auth_affirmation_form',
    //   mandated_reporter_cert: 'mandated_reporter_cert',
    //   preventing_sids_cert: 'preventing_sids_cert'
    // };




    // for (const key in docTypes) {
    //   if (files[key]) {
    //     const uploaded = await uploadToCloudinary(files[key][0].path);
    //     await connection.query(
    //       `INSERT INTO documents (submitted_by_user_id, upload_for_user_id, doc_type, doc_url)
    //        VALUES (?, ?, ?, ?, ?)`,
    //       [user_id, user_id, docTypes[key], uploaded.secure_url]
    //     );
    //   }
    // }

    // Add staff_courses entries
    if (mandated_course_id) {
      await connection.query(
        `INSERT INTO staff_courses (staff_id, course_id, completion_date, expiration_date)
         VALUES (?, ?, ?, ?)`,
        [user_id, mandated_course_id, mandated_completion_date, mandated_expiration_date]
      );
    }

    if (sids_course_id) {
      await connection.query(
        `INSERT INTO staff_courses (staff_id, course_id, completion_date, expiration_date)
         VALUES (?, ?, ?, ?)`,
        [user_id, sids_course_id, sids_completion_date, sids_expiration_date]
      );
    }

    await connection.commit();

    const [rows] = await connection.query(
      `SELECT u.*, t.* 
       FROM users u
       JOIN teachers t ON u.user_id = t.user_id
       WHERE u.user_id = ?`,
      [user_id]
    );

     return sendResponse( res ,201, "Teacher added successfully.", rows[0])
    // res.status(201).json({ message: "Teacher added successfully", user_id });
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
    res.status(500).json({ message: "Failed to fetch teachers", error: error.message });
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
    if (!rows.length) return res.status(404).json({ message: "Teacher not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teacher", error: error.message });
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

// Delete teacher
export const deleteTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    // Delete from teachers table
    await connection.query(`DELETE FROM teachers WHERE user_id = ?`, [id]);
    // Delete from users table
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