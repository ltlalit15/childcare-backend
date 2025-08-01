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


//import { send } from "process";
import pool from "../config/db.js"
import { sendError, sendResponse } from "../utils/response.js";
//import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";

// 🛠️ Cloudinary config using your credentials (directly in code as requested)
cloudinary.config({
  cloud_name: "dflse5uml",
  api_key: "968877372139259",
  api_secret: "LdDm3phJvG3ZkRKUU6FkJA87BLo",
});

// ✅ Upload utility
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "children_uploads",
      resource_type: "auto",
    });

    // Optional: delete local file after upload (if stored temporarily)
    fs.unlink(filePath, () => {});
    return result.secure_url;
  } catch (err) {
    throw new Error("Cloudinary upload failed: " + err.message);
  }
};

// export const addChild = async (req, res) => {
//   const { child, emergency_contacts } = req.body;
//   const files = req.files;

//   try {
//     // Start transaction
//     await pool.query('START TRANSACTION');

//     // 1. Get role_id for 'Child' from roles table
//     const [roleRows] = await pool.query(
//       "SELECT role_id FROM roles WHERE name = 'Child'"
//     );

//     if (roleRows.length === 0) {
//       throw new Error("Child role not found in roles table");
//     }

//     const role_id = roleRows[0].role_id; // Should be 4 according to your requirement

//     // 2. Create user with child role
//     const hashedPassword = await bcrypt.hash("defaultpass123", 10);
//     const [userResult] = await pool.query(
//       `INSERT INTO users (
//         role_id, first_name, last_name, email, phone, 
//         dob, address, status, password
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         role_id,
//         child.full_name?.split(' ')[0] || child.first_name, // First name
//         child.full_name?.split(' ').slice(1).join(' ') || child.last_name, // Last name
//         child.email,
//         child.home_phone || child.phone,
//         child.dob_english,
//         child.address,
//         "approved", // Default status
//         hashedPassword
//       ]
//     );

//     const user_id = userResult.insertId;

//     // 3. Upload documents and photo if present
//     let photo_url = null;
//     let auth_affirmation_form_url = null;
//     let immunization_record_url = null;
//     let medical_form_url = null;

//     if (files?.photo?.[0]) {
//       photo_url = await uploadToCloudinary(files.photo[0].path);
//     }
//     if (files?.auth_affirmation_form?.[0]) {
//       auth_affirmation_form_url = await uploadToCloudinary(files.auth_affirmation_form[0].path);
//     }
//     if (files?.immunization_record?.[0]) {
//       immunization_record_url = await uploadToCloudinary(files.immunization_record[0].path);
//     }
//     if (files?.medical_form?.[0]) {
//       medical_form_url = await uploadToCloudinary(files.medical_form[0].path);
//     }

//     // 4. Insert into children table (child_id = user_id)
//     await pool.query(
//       `INSERT INTO children (
//         child_id, user_id, full_name, nickname_english, nickname_hebrew,
//         gender, dob_english, dob_hebrew, enrollment_date, assigned_teacher_id,
//         mother_name, father_name, home_phone, mother_cell, father_cell,
//         mother_workplace, father_workplace, number_of_children_in_family,
//         email, address, photo_url, auth_affirmation_form_url, 
//         immunization_record_url, medical_form_url, assigned_classroom
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         user_id, // child_id is same as user_id
//         user_id, // user_id foreign key
//         child.full_name,
//         child.nickname_english,
//         child.nickname_hebrew,
//         child.gender,
//         child.dob_english,
//         child.dob_hebrew,
//         child.enrollment_date,
//         child.assigned_teacher_id,
//         child.mother_name,
//         child.father_name,
//         child.home_phone,
//         child.mother_cell,
//         child.father_cell,
//         child.mother_workplace,
//         child.father_workplace,
//         child.number_of_children_in_family,
//         child.email,
//         child.address,
//         photo_url,
//         auth_affirmation_form_url,
//         immunization_record_url,
//         medical_form_url,
//         child.assigned_classroom
//       ]
//     );

// //     // 5. Insert emergency contacts
// //     if (emergency_contacts && emergency_contacts.length > 0) {

// //       let contacts = [];
// // if (typeof emergency_contacts === "string") {
// //   try {
// //     contacts = JSON.parse(emergency_contacts);
// //   } catch (e) {
// //     contacts = [];
// //   }
// // } else if (Array.isArray(emergency_contacts)) {
// //   contacts = emergency_contacts;
// // }



// // for (const contact of contacts) {
// //           await pool.query(
// //           `INSERT INTO emergency_contacts (
// //             child_id, name, phone, address, relationship_to_child
// //           ) VALUES (?, ?, ?, ?, ?)`,
// //           [
// //             user_id, // child_id = user_id
// //             contact.name,
// //             contact.phone,
// //             contact.address,
// //             contact.relationship_to_child
// //           ]
// //         );
// //       }
// //     }

//     // Commit transaction


//      let contacts = [];
//     if (typeof emergency_contacts === "string") {
//       try {
//         contacts = JSON.parse(emergency_contacts);
//       } catch (e) {
//         contacts = [];
//       }
//     } else if (Array.isArray(emergency_contacts)) {
//       contacts = emergency_contacts;
//     }

//     for (const contact of contacts) {
//       await pool.query(
//         `INSERT INTO emergency_contacts (
//           child_id, name, phone, address, relationship_to_child
//         ) VALUES (?, ?, ?, ?, ?)`,
//         [
//           user_id,
//           contact.name,
//           contact.phone,
//           contact.address,
//           contact.relationship_to_child
//         ]
//       );
//     }

//     await pool.query('COMMIT');

//     return sendResponse(res, 201, "Child  added successfully.",{
//       child_id: user_id,
//       user_id: user_id,

//     })



//   } catch (error) {

//     await pool.query('ROLLBACK');
//     console.error("Add child failed:", error);
//     res.status(500).json({ 
//       message: "Failed to add child",
//       error: error.message,
//       success: false
//     });
//   }
// };



// export const addChild = async (req, res) => {
//   const { child, emergency_contacts, medical_info } = req.body;
//   const files = req.files;

//   try {
//     await pool.query('START TRANSACTION');

//     // 1. Get Child role ID
//     const [roleRows] = await pool.query("SELECT role_id FROM roles WHERE name = 'Child'");
//     if (roleRows.length === 0) throw new Error("Child role not found");
//     const role_id = roleRows[0].role_id;

//     // 2. Create User
//     const hashedPassword = await bcrypt.hash("defaultpass123", 10);
//     const [userResult] = await pool.query(`
//       INSERT INTO users (
//         role_id, first_name, last_name, email, phone,
//         dob, address, status, password
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `, [
//       role_id,
//       child.full_name.split(' ')[0],
//       child.full_name.split(' ').slice(1).join(' '),
//       child.email,
//       child.home_phone,
//       child.dob_english,
//       child.address,
//       'approved',
//       hashedPassword
//     ]);

//     const user_id = userResult.insertId;

//     // 3. Upload Files
//     const uploadFile = async (file) => file ? await uploadToCloudinary(file.path) : null;



//     const photo_url = await uploadFile(files?.photo?.[0]);
//     const auth_affirmation_form_url = await uploadFile(files?.auth_affirmation_form?.[0]);
//     const immunization_record_url = await uploadFile(files?.immunization_record?.[0]);
//     const medical_form_url = await uploadFile(files?.medical_form?.[0]);
//     const lunch_form_url = await uploadFile(files?.lunch_form?.[0]);
//     const agreement_docs_url = await uploadFile(files?.agreement_docs?.[0]);
//     const special_needs_app_url = await uploadFile(files?.special_needs_app?.[0]);

//     // 4. Insert into children
//     await pool.query(`
//       INSERT INTO children (
//         child_id, user_id, full_name, nickname_english, nickname_hebrew,
//         gender, dob_english, dob_hebrew, enrollment_date, assigned_teacher_id,
//         mother_name, father_name, home_phone, mother_cell, father_cell,
//         mother_workplace, father_workplace, number_of_children_in_family,
//         email, address, photo_url, auth_affirmation_form_url,
//         immunization_record_url, medical_form_url, assigned_classroom,
//         notes, nap_time_instructions
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `, [
//       user_id, user_id, child.full_name, child.nickname_english, child.nickname_hebrew,
//       child.gender, child.dob_english, child.dob_hebrew, child.enrollment_date,
//       child.assigned_teacher_id, child.mother_name, child.father_name,
//       child.home_phone, child.mother_cell, child.father_cell,
//       child.mother_workplace, child.father_workplace,
//       child.number_of_children_in_family, child.email, child.address,
//       photo_url, auth_affirmation_form_url, immunization_record_url,
//       medical_form_url, child.assigned_classroom,
//       child.notes, child.nap_time_instructions
//     ]);

//     // 5. Emergency Contacts
//     let contacts = [];
//     if (typeof emergency_contacts === 'string') {
//       try { contacts = JSON.parse(emergency_contacts); } catch (e) { }
//     } else if (Array.isArray(emergency_contacts)) {
//       contacts = emergency_contacts;
//     }

//     for (const contact of contacts) {
//       await pool.query(`
//         INSERT INTO emergency_contacts (
//           child_id, name, phone, address, relationship_to_child, could_release
//         ) VALUES (?, ?, ?, ?, ?, ?)
//       `, [
//         user_id, contact.name, contact.phone,
//         contact.address, contact.relationship_to_child,
//         contact.could_release || false
//       ]);
//     }

//     // 6. Medical Info
//     await pool.query(`
//       INSERT INTO medical_info (
//         child_id, physician_name, physician_phone, allergies, vaccine_info,
//         medical_form_url, early_intervention_services, special_needs_app_url, medical_notes
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `, [
//       user_id,
//       medical_info?.physician_name,
//       medical_info?.physician_phone,
//       medical_info?.allergies === 'Yes',
//       medical_info?.vaccine_info,
//       medical_form_url,
//       medical_info?.early_intervention_services === 'Yes',
//       special_needs_app_url,
//       medical_info?.medical_notes
//     ]);

//     // 7. Documents
//     await pool.query(`
//       INSERT INTO documents (
//         child_id, medical_form_url, immunization_record_url, lunch_form_url, agreement_docs_url
//       ) VALUES (?, ?, ?, ?, ?)
//     `, [
//       user_id, medical_form_url, immunization_record_url, lunch_form_url, agreement_docs_url
//     ]);

//     await pool.query('COMMIT');

//     return sendResponse(res, 201, 'Child added successfully', {
//       child_id: user_id,
//       user_id
//     });
//   } catch (err) {
//     await pool.query('ROLLBACK');
//     console.error('Add child failed:', err);
//     return res.status(500).json({ message: 'Add child failed', error: err.message });
//   }
// };


export const addChild = async (req, res) => {
  const { child, emergency_contacts, medical_info } = req.body;
  const files = req.files;

  try {
    await pool.query("START TRANSACTION");

    const [roleRows] = await pool.query(
      "SELECT role_id FROM roles WHERE name = 'Child'"
    );
    if (roleRows.length === 0) throw new Error("Child role not found");
    const role_id = roleRows[0].role_id;

    const hashedPassword = await bcrypt.hash("defaultpass123", 10);
    const [userResult] = await pool.query(
      `
            INSERT INTO users (
                role_id, first_name, last_name, email, phone,
                dob, address, status, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        role_id,
        child.full_name.split(" ")[0],
        child.full_name.split(" ").slice(1).join(" "),
        child.email,
        child.home_phone,
        child.dob_english,
        child.address,
        "approved",
        hashedPassword,
      ]
    );

    const user_id = userResult.insertId;

    const uploadFile = async (file) =>
      file ? await uploadToCloudinary(file.path) : null;
    const uploadMultipleFiles = async (filesArray) =>
      filesArray?.length
        ? await Promise.all(filesArray.map((file) => uploadFile(file)))
        : [];

    const photo_url = await uploadFile(files?.photo?.[0]);
    const auth_affirmation_form_url = await uploadFile(
      files?.auth_affirmation_form?.[0]
    );
    const immunization_record_url = await uploadFile(
      files?.immunization_record?.[0]
    );
    const medical_form_url = await uploadFile(files?.medical_form?.[0]);
    const special_needs_app_url = await uploadFile(
      files?.special_needs_app?.[0]
    );

    const lunch_form_urls = await uploadMultipleFiles(files?.lunch_form);
    const agreement_docs_urls = await uploadMultipleFiles(
      files?.agreement_docs
    );

    await pool.query(
      `
            INSERT INTO children (
                child_id, user_id, full_name, first_name, last_name, nickname_english, nickname_hebrew,
                gender, dob_english, dob_hebrew, enrollment_date, assigned_teacher_id,
                mother_name, father_name, home_phone, mother_cell, father_cell,
                mother_workplace, father_workplace, number_of_children_in_family,
                email, address, photo_url, auth_affirmation_form_url,
                immunization_record_url, medical_form_url, assigned_classroom,
                notes, nap_time_instructions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        user_id,
        user_id,
        child.full_name,
        child.first_name,
        child.last_name,
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
        child.assigned_classroom,
        child.notes,
        child.nap_time_instructions,
      ]
    );

    let contacts = [];
    if (typeof emergency_contacts === "string") {
      try {
        contacts = JSON.parse(emergency_contacts);
      } catch (e) {}
    } else if (Array.isArray(emergency_contacts)) {
      contacts = emergency_contacts;
    }

    for (const contact of contacts) {
      await pool.query(
        `
                INSERT INTO emergency_contacts (
                    child_id, name, phone, address, relationship_to_child, could_release
                ) VALUES (?, ?, ?, ?, ?, ?)
            `,
        [
          user_id,
          contact.name,
          contact.phone,
          contact.address,
          contact.relationship_to_child,
          contact.could_release || false,
        ]
      );
    }

    await pool.query(
      `
            INSERT INTO medical_info (
                child_id, physician_name, physician_phone, allergies, vaccine_info,
                medical_form_url, early_intervention_services, special_needs_app_url, medical_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        user_id,
        medical_info?.physician_name,
        medical_info?.physician_phone,
        medical_info?.allergies === "Yes",
        medical_info?.vaccine_info,
        medical_form_url,
        medical_info?.early_intervention_services === "Yes",
        special_needs_app_url,
        medical_info?.medical_notes,
      ]
    );

    await pool.query(
      `
            INSERT INTO documents (
                child_id, medical_form_url, immunization_record_url, lunch_form_url, agreement_docs_url
            ) VALUES (?, ?, ?, ?, ?)
        `,
      [
        user_id,
        medical_form_url,
        immunization_record_url,
        JSON.stringify(lunch_form_urls),
        JSON.stringify(agreement_docs_urls),
      ]
    );

    await pool.query("COMMIT");

    return sendResponse(res, 201, "Child added successfully", {
      child_id: user_id,
      user_id,
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Add child failed:", err);
    return res
      .status(500)
      .json({ message: "Add child failed", error: err.message });
  }
};

export const getChild = async (req, res) => {
    const { child_id } = req.params;

    try {
        // 1️⃣ Get Child, User, Role
        const [childRows] = await pool.query(
            `SELECT 
                c.*, 
                u.first_name, u.last_name, u.email AS user_email, 
                u.phone AS user_phone, u.status AS user_status,
                r.name AS role_name
            FROM children c
            JOIN users u ON c.user_id = u.user_id
            JOIN roles r ON u.role_id = r.role_id
            WHERE c.child_id = ?`,
            [child_id]
        );

        if (childRows.length === 0) {
            return res.status(404).json({ message: "Child not found" });
        }

        const child = childRows[0];

        // 2️⃣ Get Emergency Contacts
        const [emergencyContacts] = await pool.query(
            `SELECT * FROM emergency_contacts WHERE child_id = ?`,
            [child_id]
        );

        // 3️⃣ Get Medical Info
        const [medicalInfoRows] = await pool.query(
            `SELECT * FROM medical_info WHERE child_id = ?`,
            [child_id]
        );
        const medical_info = medicalInfoRows[0] || {};

        // 4️⃣ Get Documents
        const [documentsRows] = await pool.query(
            `SELECT * FROM documents WHERE child_id = ?`,
            [child_id]
        );

        const documents = documentsRows[0] || {};

        // 5️⃣ Safely parse JSON fields for multi-upload
        const safeJsonParse = (value) => {
            try {
                return JSON.parse(value || '[]');
            } catch {
                return [];
            }
        };

        const lunch_form_urls = safeJsonParse(documents.lunch_form_url);
        const agreement_docs_urls = safeJsonParse(documents.agreement_docs_url);

        // 6️⃣ Final Response
        return res.status(200).json({
            child,
            emergency_contacts: emergencyContacts,
            medical_info,
            documents: {
                ...documents,
                lunch_form_urls,
                agreement_docs_urls
            },
            success: true
        });

    } catch (error) {
        console.error("Get child failed:", error);
        return res.status(500).json({
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
                u.first_name, u.last_name, u.email AS user_email, 
                u.phone AS user_phone, u.status AS user_status,
                r.name AS role_name
            FROM children c
            JOIN users u ON c.user_id = u.user_id
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY c.enrollment_date DESC`
        );

        return sendResponse(res, 200, "Children retrieved successfully.", rows);
    } catch (error) {
        console.error("Get all children failed:", error);
        return sendError(res, 500, "Failed to retrieve children", error.message);
    }
};



// Optional: Update child
export const updateChild = async (req, res) => {
    const { child_id } = req.params;
    const { child, emergency_contacts, medical_info } = req.body;
    const files = req.files;

    try {
        await pool.query('START TRANSACTION');

        const [existingChild] = await pool.query(
            'SELECT * FROM children WHERE child_id = ?',
            [child_id]
        );

        if (existingChild.length === 0) {
            return res.status(404).json({ message: "Child not found" });
        }

        const user_id = existingChild[0].user_id;

        // 1️⃣ Update user table
        await pool.query(
            `UPDATE users SET 
                first_name = ?, last_name = ?, email = ?, 
                phone = ?, dob = ?, address = ?
             WHERE user_id = ?`,
            [
                child?.child.first_name,
                child?.child.last_name,
                child.email,
                child.home_phone || child.phone,
                child.dob_english,
                child.address,
                user_id
            ]
        );

        // 2️⃣ Handle file uploads
        const uploadFile = async (file) => file ? await uploadToCloudinary(file.path) : null;

        const photo_url = await uploadFile(files?.photo?.[0]);
        const auth_affirmation_form_url = await uploadFile(files?.auth_affirmation_form?.[0]);
        const immunization_record_url = await uploadFile(files?.immunization_record?.[0]);
        const medical_form_url = await uploadFile(files?.medical_form?.[0]);
        const special_needs_app_url = await uploadFile(files?.special_needs_app?.[0]);

        const lunch_form_urls = files?.lunch_form
            ? JSON.stringify(await Promise.all(files.lunch_form.map(f => uploadToCloudinary(f.path))))
            : null;

        const agreement_docs_urls = files?.agreement_docs
            ? JSON.stringify(await Promise.all(files.agreement_docs.map(f => uploadToCloudinary(f.path))))
            : null;

        // 3️⃣ Update children table
        let updateFields = [];
        let updateValues = [];

        if (photo_url) updateFields.push("photo_url = ?"), updateValues.push(photo_url);
        if (auth_affirmation_form_url) updateFields.push("auth_affirmation_form_url = ?"), updateValues.push(auth_affirmation_form_url);
        if (immunization_record_url) updateFields.push("immunization_record_url = ?"), updateValues.push(immunization_record_url);
        if (medical_form_url) updateFields.push("medical_form_url = ?"), updateValues.push(medical_form_url);
        if (special_needs_app_url) updateFields.push("special_needs_app_url = ?"), updateValues.push(special_needs_app_url);
        if (lunch_form_urls) updateFields.push("lunch_form_url = ?"), updateValues.push(lunch_form_urls);
        if (agreement_docs_urls) updateFields.push("agreement_docs_url = ?"), updateValues.push(agreement_docs_urls);

        await pool.query(`
            UPDATE children SET 
                full_name = ?, nickname_english = ?, nickname_hebrew = ?,
                gender = ?, dob_english = ?, dob_hebrew = ?, enrollment_date = ?,
                assigned_teacher_id = ?, mother_name = ?, father_name = ?,
                home_phone = ?, mother_cell = ?, father_cell = ?,
                mother_workplace = ?, father_workplace = ?, number_of_children_in_family = ?,
                email = ?, address = ?, assigned_classroom = ?
                ${updateFields.length > 0 ? ', ' + updateFields.join(', ') : ''}
            WHERE child_id = ?`,
            [
                child.full_name, child.nickname_english, child.nickname_hebrew,
                child.gender, child.dob_english, child.dob_hebrew, child.enrollment_date,
                child.assigned_teacher_id, child.mother_name, child.father_name,
                child.home_phone, child.mother_cell, child.father_cell,
                child.mother_workplace, child.father_workplace, child.number_of_children_in_family,
                child.email, child.address, child.assigned_classroom,
                ...updateValues,
                child_id
            ]
        );

        // 4️⃣ Emergency contacts
        let contacts = [];
        if (typeof emergency_contacts === "string") {
            try { contacts = JSON.parse(emergency_contacts); } catch (e) {}
        } else if (Array.isArray(emergency_contacts)) {
            contacts = emergency_contacts;
        }

        if (contacts.length > 0) {
            await pool.query('DELETE FROM emergency_contacts WHERE child_id = ?', [child_id]);
            for (const contact of contacts) {
                await pool.query(`
                    INSERT INTO emergency_contacts (
                        child_id, name, phone, address, relationship_to_child, could_release
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        child_id,
                        contact.name,
                        contact.phone,
                        contact.address,
                        contact.relationship_to_child,
                        contact.could_release ?? false
                    ]
                );
            }
        }

        // 5️⃣ Medical Info (UPSERT pattern)
        const [existingMedical] = await pool.query(
            `SELECT child_id FROM medical_info WHERE child_id = ?`,
            [child_id]
        );

        if (existingMedical.length > 0) {
            await pool.query(
                `UPDATE medical_info SET 
                    physician_name = ?, physician_phone = ?, allergies = ?,
                    vaccine_info = ?, medical_form_url = ?, early_intervention_services = ?,
                    special_needs_app_url = ?, medical_notes = ?
                 WHERE child_id = ?`,
                [
                    medical_info?.physician_name,
                    medical_info?.physician_phone,
                    medical_info?.allergies === 'Yes',
                    medical_info?.vaccine_info,
                    medical_form_url,
                    medical_info?.early_intervention_services === 'Yes',
                    special_needs_app_url,
                    medical_info?.medical_notes,
                    child_id
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO medical_info (
                    child_id, physician_name, physician_phone, allergies, vaccine_info,
                    medical_form_url, early_intervention_services, special_needs_app_url, medical_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    child_id,
                    medical_info?.physician_name,
                    medical_info?.physician_phone,
                    medical_info?.allergies === 'Yes',
                    medical_info?.vaccine_info,
                    medical_form_url,
                    medical_info?.early_intervention_services === 'Yes',
                    special_needs_app_url,
                    medical_info?.medical_notes
                ]
            );
        }

        // 6️⃣ Documents (UPSERT pattern)
        const [existingDocs] = await pool.query(
            `SELECT child_id FROM documents WHERE child_id = ?`,
            [child_id]
        );

        if (existingDocs.length > 0) {
            await pool.query(`
                UPDATE documents SET 
                    medical_form_url = ?, immunization_record_url = ?,
                    lunch_form_url = ?, agreement_docs_url = ?
                WHERE child_id = ?`,
                [
                    medical_form_url,
                    immunization_record_url,
                    lunch_form_urls,
                    agreement_docs_urls,
                    child_id
                ]
            );
        } else {
            await pool.query(`
                INSERT INTO documents (
                    child_id, medical_form_url, immunization_record_url,
                    lunch_form_url, agreement_docs_url
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    child_id,
                    medical_form_url,
                    immunization_record_url,
                    lunch_form_urls,
                    agreement_docs_urls
                ]
            );
        }

        await pool.query('COMMIT');

        res.status(200).json({
            message: "Child updated successfully.",
            child_id,
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
  const { child_id } = req.params;

  try {
    await pool.query('START TRANSACTION');

    // Check if child exists and not already deleted
    const [rows] = await pool.query(
      `SELECT * FROM children WHERE child_id = ? AND is_deleted = 0`,
      [child_id]
    );

    if (rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        message: "Child not found or already deleted",
        child_id,
        success: false
      });
    }

    // Soft delete: mark is_deleted = 1
    await pool.query(
      `UPDATE children SET is_deleted = 1 WHERE child_id = ?`,
      [child_id]
    );

    await pool.query('COMMIT');

    return res.status(200).json({
      message: "Child soft deleted successfully.",
      child_id,
      success: true
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Delete child failed:", error);
    return res.status(500).json({
      message: "Failed to delete child",
      error: error.message,
      success: false
    });
  }
};


