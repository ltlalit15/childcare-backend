import { pool } from "../config/db.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt";

export const addChild = async (req, res) => {
  const { user, child, emergency_contacts } = req.body;
  const file = req.file;

  try {
    // 1. Get role_id for 'Child'
    const [roleRows] = await pool.query(
      "SELECT role_id FROM roles WHERE name = 'Child'"
    );
    const role_id = roleRows[0].role_id;

    // 2. Create user
    const hashedPassword = await bcrypt.hash("defaultpass123", 10); // optional
    const [userResult] = await pool.query(
      `INSERT INTO users (role_id, first_name, last_name, dob, email, phone, address, emergency_contact, status, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        role_id,
        user.first_name,
        user.last_name,
        user.dob,
        user.email,
        user.phone,
        user.address,
        user.emergency_contact,
        user.status || "approved",
        hashedPassword
      ]
    );

    const user_id = userResult.insertId;


    const files = req.files;

const docTypes = {
  auth_affirmation_form: 'auth_affirmation_form',
  immunization_record: 'immunization_record',
  medical_form: 'medical_form'
};

for (const key in docTypes) {
  if (files[key]) {
    const uploaded = await uploadToCloudinary(files[key][0].path);
    await pool.query(
      `
       
       
        INSERT INTO documents 
        (document_title, document_url, upload_for_user_id, upload_for_name, expiry_date, submitted_by_user_id)
      VALUES ('key', ?, 'user', ?, ?, 'user')`,
      [req.user.user_id, user_id, docTypes[key], uploaded.secure_url]
    );
  }
}


    // 3. Upload photo if file present
    let photo_url = null;
    if (file) {
      const upload = await uploadToCloudinary(file.path);
      photo_url = upload.secure_url;
    }

    // 4. Insert into children table
    await pool.query(
      `INSERT INTO children (
        user_id, dob_hebrew, enrollment_date, assigned_teacher_id,
        mother_name, father_name, mother_phone, father_phone, mother_workplace,
        father_workplace, email, address, notes, medical_notes,
        nap_time_instructions, voucher_status, photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        child.dob_hebrew,
        child.enrollment_date,
        child.assigned_teacher_id,
        child.mother_name,
        child.father_name,
        child.mother_phone,
        child.father_phone,
        child.mother_workplace || null,
        child.father_workplace || null,
        user.email,
        user.address,
        child.notes || null,
        child.medical_notes || null,
        child.nap_time_instructions || null,
        child.voucher_status,
        photo_url
      ]
    );

    // 5. Insert emergency contacts
    for (const contact of emergency_contacts) {
      await pool.query(
        `INSERT INTO emergency_contacts (child_id, name, phone, address, relationship_to_child)
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, contact.name, contact.phone, contact.address, contact.relationship_to_child]
      );
    }

    res.status(201).json({
      message: "Child and emergency contacts added successfully.",
      child_id: user_id
    });
  } catch (error) {
    console.error("Add child failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


