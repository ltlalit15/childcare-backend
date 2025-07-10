// import pool from "../config/db.js"
// import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
// import bcrypt from "bcrypt";

// export const addChild = async (req, res) => {
//   const { user, child, emergency_contacts } = req.body;
//   const files = req.files;

//   try {
//     // 1. Get role_id for 'Child'
//     const [roleRows] = await pool.query(
//       "SELECT role_id FROM roles WHERE name = 'Child'"
//     );
//     const role_id =   4|| roleRows[0].role_id;

//     // 2. Create user
//     const hashedPassword = await bcrypt.hash("defaultpass123", 10);
//     const [userResult] = await pool.query(
//       `INSERT INTO users (role_id, first_name, last_name, dob, email, phone, address, emergency_contact, status, password)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         role_id,
//         user.first_name,
//         user.last_name,
//         user.dob,
//         user.email,
//         user.phone,
//         user.address,
//         user.emergency_contact,
//         user.status || "approved",
//         hashedPassword
//       ]
//     );

//     const user_id = userResult.insertId;

//     // 3. Upload documents and photo if present
//     let photo_url = null;
//     let auth_affirmation_form_url = null;
//     let immunization_record_url = null;
//     let medical_form_url = null;

//     if (files && files.photo) {
//       const upload = await uploadToCloudinary(files.photo[0].path);
//       photo_url = upload;
//     }
//     if (files && files.auth_affirmation_form) {
//       const upload = await uploadToCloudinary(files.auth_affirmation_form[0].path);
//       auth_affirmation_form_url = upload;
//     }
//     if (files && files.immunization_record) {
//       const upload = await uploadToCloudinary(files.immunization_record[0].path);
//       immunization_record_url = upload;
//     }
//     if (files && files.medical_form) {
//       const upload = await uploadToCloudinary(files.medical_form[0].path);
//       medical_form_url = upload;
//     }

//     // 4. Insert into children table
//     await pool.query(
//       `INSERT INTO children (
//         user_id, dob_hebrew, enrollment_date, assigned_teacher_id,
//         mother_name, father_name, mother_phone, father_phone, mother_workplace,
//         father_workplace, email, address, notes, medical_notes,
//         nap_time_instructions, voucher_status, photo_url,
//         auth_affirmation_form_url, immunization_record_url, medical_form_url
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         user_id,
//         child.dob_hebrew,
//         child.enrollment_date,
//         child.assigned_teacher_id,
//         child.mother_name,
//         child.father_name,
//         child.mother_phone,
//         child.father_phone,
//         child.mother_workplace || null,
//         child.father_workplace || null,
//         user.email,
//         user.address,
//         child.notes || null,
//         child.medical_notes || null,
//         child.nap_time_instructions || null,
//         child.voucher_status,
//         photo_url,
//         auth_affirmation_form_url,
//         immunization_record_url,
//         medical_form_url
//       ]
//     );

//     // 5. Insert emergency contacts
//     for (const contact of emergency_contacts) {
//       await pool.query(
//         `INSERT INTO emergency_contacts (child_id, name, phone, address, relationship_to_child)
//          VALUES (?, ?, ?, ?, ?)`,
//         [user_id, contact.name, contact.phone, contact.address, contact.relationship_to_child]
//       );
//     }

//     res.status(201).json({
//       message: "Child and emergency contacts added successfully.",
//       child_id: user_id
//     });
//   } catch (error) {
//     console.error("Add child failed:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


import { send } from "process";
import pool from "../config/db.js"
import { sendError, sendResponse } from "../utils/response.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import bcrypt from "bcrypt";

export const addChild = async (req, res) => {
  const { child, emergency_contacts } = req.body;
  const files = req.files;

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // 1. Get role_id for 'Child' from roles table
    const [roleRows] = await pool.query(
      "SELECT role_id FROM roles WHERE name = 'Child'"
    );
    
    if (roleRows.length === 0) {
      throw new Error("Child role not found in roles table");
    }
    
    const role_id = roleRows[0].role_id; // Should be 4 according to your requirement

    // 2. Create user with child role
    const hashedPassword = await bcrypt.hash("defaultpass123", 10);
    const [userResult] = await pool.query(
      `INSERT INTO users (
        role_id, first_name, last_name, email, phone, 
        dob, address, status, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        role_id,
        child.full_name?.split(' ')[0] || child.first_name, // First name
        child.full_name?.split(' ').slice(1).join(' ') || child.last_name, // Last name
        child.email,
        child.home_phone || child.phone,
        child.dob_english,
        child.address,
        "approved", // Default status
        hashedPassword
      ]
    );

    const user_id = userResult.insertId;

    // 3. Upload documents and photo if present
    let photo_url = null;
    let auth_affirmation_form_url = null;
    let immunization_record_url = null;
    let medical_form_url = null;

    if (files?.photo?.[0]) {
      photo_url = await uploadToCloudinary(files.photo[0].path);
    }
    if (files?.auth_affirmation_form?.[0]) {
      auth_affirmation_form_url = await uploadToCloudinary(files.auth_affirmation_form[0].path);
    }
    if (files?.immunization_record?.[0]) {
      immunization_record_url = await uploadToCloudinary(files.immunization_record[0].path);
    }
    if (files?.medical_form?.[0]) {
      medical_form_url = await uploadToCloudinary(files.medical_form[0].path);
    }

    // 4. Insert into children table (child_id = user_id)
    await pool.query(
      `INSERT INTO children (
        child_id, user_id, full_name, nickname_english, nickname_hebrew,
        gender, dob_english, dob_hebrew, enrollment_date, assigned_teacher_id,
        mother_name, father_name, home_phone, mother_cell, father_cell,
        mother_workplace, father_workplace, number_of_children_in_family,
        email, address, photo_url, auth_affirmation_form_url, 
        immunization_record_url, medical_form_url, assigned_classroom
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, // child_id is same as user_id
        user_id, // user_id foreign key
        child.full_name,
        child.nickname_english,
        child.nickname_hebrew,
        child.gender,
        child.dob_english,
        child.dob_hebrew,
        child.enrollment_date,
        child.assigned_teacher_id,
        child.mother_name,
        child.father_name,
        child.home_phone,
        child.mother_cell,
        child.father_cell,
        child.mother_workplace,
        child.father_workplace,
        child.number_of_children_in_family,
        child.email,
        child.address,
        photo_url,
        auth_affirmation_form_url,
        immunization_record_url,
        medical_form_url,
        child.assigned_classroom
      ]
    );

//     // 5. Insert emergency contacts
//     if (emergency_contacts && emergency_contacts.length > 0) {
    
//       let contacts = [];
// if (typeof emergency_contacts === "string") {
//   try {
//     contacts = JSON.parse(emergency_contacts);
//   } catch (e) {
//     contacts = [];
//   }
// } else if (Array.isArray(emergency_contacts)) {
//   contacts = emergency_contacts;
// }



// for (const contact of contacts) {
//           await pool.query(
//           `INSERT INTO emergency_contacts (
//             child_id, name, phone, address, relationship_to_child
//           ) VALUES (?, ?, ?, ?, ?)`,
//           [
//             user_id, // child_id = user_id
//             contact.name,
//             contact.phone,
//             contact.address,
//             contact.relationship_to_child
//           ]
//         );
//       }
//     }

    // Commit transaction


     let contacts = [];
    if (typeof emergency_contacts === "string") {
      try {
        contacts = JSON.parse(emergency_contacts);
      } catch (e) {
        contacts = [];
      }
    } else if (Array.isArray(emergency_contacts)) {
      contacts = emergency_contacts;
    }

    for (const contact of contacts) {
      await pool.query(
        `INSERT INTO emergency_contacts (
          child_id, name, phone, address, relationship_to_child
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          user_id,
          contact.name,
          contact.phone,
          contact.address,
          contact.relationship_to_child
        ]
      );
    }

    await pool.query('COMMIT');

    return sendResponse(res, 201, "Child  added successfully.",{
      child_id: user_id,
      user_id: user_id,
   
    })

   

  } catch (error) {
  
    await pool.query('ROLLBACK');
    console.error("Add child failed:", error);
    res.status(500).json({ 
      message: "Failed to add child",
      error: error.message,
      success: false
    });
  }
};


export const getChild = async (req, res) => {
  const { child_id } = req.params;

  try {
    const [childRows] = await pool.query(
      `SELECT 
        c.*, 
        u.first_name, u.last_name, u.email as user_email, 
        u.phone as user_phone, u.status as user_status,
        r.role_name as role_name
      FROM children c
      JOIN users u ON c.user_id = u.user_id
      JOIN roles r ON u.role_id = r.role_id
      WHERE  c.child_id = ?`,
      [child_id]
    );

    if (childRows.length === 0) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Get emergency contacts
    const [emergencyContacts] = await pool.query(
      `SELECT * FROM emergency_contacts WHERE child_id = ?`,
      [child_id]
    );

    res.status(200).json({
      child: childRows[0],
      emergency_contacts: emergencyContacts,
      success: true
    });

  } catch (error) {
    console.error("Get child failed:", error);
    res.status(500).json({ 
      message: "Failed to retrieve child",
      error: error.message,
      success: false
    });
  }
};


export const getAllChildren = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        c.*, 
        u.first_name, u.last_name, u.email as user_email, 
        u.phone as user_phone, u.status as user_status,
        r.role_name as role_name
      FROM children c
      JOIN users u ON c.user_id = u.user_id
      JOIN roles r ON u.role_id = r.role_id
      ORDER BY c.enrollment_date DESC`
    );

    return sendResponse(res, 200, "Children retrieved successfully.",rows)


    
  } catch (error) {
    console.error("Get all children failed:", error);
    return sendError(res, 500, "Failed to retrieve children", error.message);
    
  }
};


// Optional: Update child
export const updateChild = async (req, res) => {
  const { child_id } = req.params;
  const { child, emergency_contacts } = req.body;
  const files = req.files;

  try {
    await pool.query('START TRANSACTION');

    // Check if child exists
    const [existingChild] = await pool.query(
      'SELECT * FROM children WHERE child_id = ?',
      [child_id]
    );

    if (existingChild.length === 0) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Update user table
    await pool.query(
      `UPDATE users SET 
        first_name = ?, last_name = ?, email = ?, 
        phone = ?, dob = ?, address = ?
      WHERE user_id = ?`,
      [
        child.full_name?.split(' ')[0] || child.first_name,
        child.full_name?.split(' ').slice(1).join(' ') || child.last_name,
        child.email,
        child.home_phone || child.phone,
        child.dob_english,
        child.address,
        child_id
      ]
    );

    // Handle file uploads if new files are provided
    let updateFields = [];
    let updateValues = [];

    if (files?.photo?.[0]) {
      const photo_url = await uploadToCloudinary(files.photo[0].path);
      updateFields.push('photo_url = ?');
      updateValues.push(photo_url);
    }

    if (files?.auth_affirmation_form?.[0]) {
      const auth_url = await uploadToCloudinary(files.auth_affirmation_form[0].path);
      updateFields.push('auth_affirmation_form_url = ?');
      updateValues.push(auth_url);
    }

    if (files?.immunization_record?.[0]) {
      const immunization_url = await uploadToCloudinary(files.immunization_record[0].path);
      updateFields.push('immunization_record_url = ?');
      updateValues.push(immunization_url);
    }

    if (files?.medical_form?.[0]) {
      const medical_url = await uploadToCloudinary(files.medical_form[0].path);
      updateFields.push('medical_form_url = ?');
      updateValues.push(medical_url);
    }

    // Update children table
    const childUpdateQuery = `
      UPDATE children SET 
        full_name = ?, nickname_english = ?, nickname_hebrew = ?,
        gender = ?, dob_english = ?, dob_hebrew = ?, enrollment_date = ?,
        assigned_teacher_id = ?, mother_name = ?, father_name = ?,
        home_phone = ?, mother_cell = ?, father_cell = ?,
        mother_workplace = ?, father_workplace = ?, number_of_children_in_family = ?,
        email = ?, address = ?, assigned_classroom = ?
        ${updateFields.length > 0 ? ', ' + updateFields.join(', ') : ''}
      WHERE child_id = ?
    `;

    const childUpdateValues = [
      child.full_name, child.nickname_english, child.nickname_hebrew,
      child.gender, child.dob_english, child.dob_hebrew, child.enrollment_date,
      child.assigned_teacher_id, child.mother_name, child.father_name,
      child.home_phone, child.mother_cell, child.father_cell,
      child.mother_workplace, child.father_workplace, child.number_of_children_in_family,
      child.email, child.address, child.assigned_classroom,
      ...updateValues,
      child_id
    ];

    await pool.query(childUpdateQuery, childUpdateValues);

    // Update emergency contacts
    if (emergency_contacts && emergency_contacts.length > 0) {
      // Delete existing contacts
      await pool.query('DELETE FROM emergency_contacts WHERE child_id = ?', [child_id]);
      
      // Insert new contacts
      for (const contact of emergency_contacts) {
        await pool.query(
          `INSERT INTO emergency_contacts (child_id, name, phone, address, relationship_to_child)
           VALUES (?, ?, ?, ?, ?)`,
          [child_id, contact.name, contact.phone, contact.address, contact.relationship_to_child]
        );
      }
    }

    await pool.query('COMMIT');

    res.status(200).json({
      message: "Child updated successfully.",
      child_id: child_id,
      success: true
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Update child failed:", error);
    res.status(500).json({ 
      message: "Failed to update child",
      error: error.message,
      success: false
    });
  }
};



export const deleteChild = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM Children WHERE child_id = ? AND is_deleted = 0', [id]);
    if (rows.length === 0) {
     
      return sendError( res, 404, "Child not found or already deleted", { message: 'Child not found or already deleted'})
    }

    await pool.query('UPDATE Children SET is_deleted = 1 WHERE child_id = ?', [id]);

    return sendResponse(res, 200, "Child deleted successfully", { deletedId: id });
  } catch (err) {
    console.error('Soft delete error:', err);
    return sendError(res, 500, "Internal Server Error", err.message);
  }
};
