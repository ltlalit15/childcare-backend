import pool from "../config/db.js";

export const getTeacherTrainingRequirements = async (req, res) => {
    try {
        const query = `
  SELECT 
    teacher_name, 
    department, 
    training_type, 
    DATE_FORMAT(last_completed, '%Y-%m-%d') AS last_completed,   
    DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
    status
  FROM teachers
 
`;


        const [rows] = await pool.query(query);
        res.json({ data: rows });

    } catch (error) {
        console.error('Error fetching teacher training data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



export const updateTeacherTrainingRequirement = async (req, res) => {
    try {
        const {
            teacher_name,
            department,
            training_type,
            last_completed,
            due_date,
            status,
        } = req.body;

        // Validation
        if (!teacher_name) {
            return res.status(400).json({ message: "teacher_name is required" });
        }

        const query = `
      UPDATE teachers
      SET 
        department = ?,
        training_type = ?,
        last_completed = ?,
        due_date = ?,
        status = ?
      WHERE teacher_name = ?
    `;

        const [result] = await pool.query(query, [
            department,
            training_type,
            last_completed,
            due_date,
            status,
            teacher_name,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json({ message: "Teacher training info updated successfully" });

    } catch (error) {
        console.error("Error updating teacher training data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export const getChildrenImmunizationRequirements = async (req, res) => {
    try {
        const query = `
      SELECT 
        c.child_id,
        c.full_name AS child_name,
        DATE_FORMAT(c.dob_english, '%Y-%m-%d') AS dob,
        YEAR(CURDATE()) - YEAR(c.dob_english) AS age_years,
        mi.vaccine_info AS missed_vaccine,
        DATE_FORMAT(mi.due_date, '%Y-%m-%d') AS due_date,
        COALESCE(c.mother_name, c.father_name) AS guardian_name,
        COALESCE(c.mother_cell, c.father_cell) AS guardian_phone,
        mi.status
      FROM children c
      JOIN medical_info mi ON c.child_id = mi.child_id
      WHERE mi.vaccine_info IS NOT NULL
      ORDER BY mi.due_date ASC
    `;

        const [rows] = await pool.query(query);

        // Format age as "4 years"
        const result = rows.map(child => ({
            ...child,
            age: `${child.age_years} years`,
            child_id_formatted: `#CH-${new Date().getFullYear()}-${String(child.child_id).padStart(3, '0')}`
        }));

        return res.status(200).json({ data: result });

    } catch (error) {
        console.error("Error fetching child immunization requirements:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const updateImmunizationRequirement = async (req, res) => {
    const { child_id } = req.params;
    const { vaccine_info, due_date, status } = req.body;

    try {
        // Check if medical_info already exists for child
        const [check] = await pool.query(
            `SELECT * FROM medical_info WHERE child_id = ?`,
            [child_id]
        );

        if (check.length === 0) {
            return res.status(404).json({ message: "Medical info not found for child" });
        }

        // Update medical_info
        await pool.query(
            `UPDATE medical_info
       SET vaccine_info = ?, due_date = ?, status = ?
       WHERE child_id = ?`,
            [vaccine_info, due_date, status, child_id]
        );

        return res.status(200).json({ message: "Immunization requirement updated successfully" });

    } catch (error) {
        console.error("Error updating immunization requirement:", error);
        return res.status(500).json({ error: "Failed to update immunization requirement" });
    }
};



//Location Maintenance Requirements//

export const getAllMaintenanceLogs = async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM maintenance_logs ORDER BY date_reported DESC");
        res.status(200).json({
            success: true,
            maintenanceLogs: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance logs",
            error: error.message
        });
    }
};


export const updateMaintenanceLog = async (req, res) => {
    const { id } = req.params;
    const {
        location,
        request_title,
        issue_type,
        description,
        date_reported,
        assigned_to,
        priority,
        status
    } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE maintenance_logs SET 
        location = ?, 
        request_title = ?, 
        issue_type = ?, 
        description = ?, 
        date_reported = ?, 
        assigned_to = ?, 
        priority = ?, 
        status = ? 
      WHERE id = ?`,
            [location, request_title, issue_type, description, date_reported, assigned_to, priority, status, id]
        );

        res.status(200).json({
            success: true,
            message: "Maintenance log updated successfully",
            affectedRows: result.affectedRows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update maintenance log",
            error: error.message
        });
    }
};







//Date Range Filter for Teachers, Children and Maintenance Requirements
// Route: GET /api/requirements/filter
export const filterRequirements = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            status,
            department,
            location,
            page = 1,
            limit = 10,
        } = req.query;

        const parsedPage = parseInt(page) || 1;
        const parsedLimit = parseInt(limit) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        // Base queries
        let teacherQuery = `SELECT * FROM teachers WHERE 1=1`;
        let childQuery = `SELECT * FROM children WHERE 1=1`;
        let maintenanceQuery = `SELECT * FROM maintenance_logs WHERE 1=1`;

        const teacherParams = [];
        const childParams = [];
        const maintenanceParams = [];

        // Date filters
        if (startDate && endDate) {
            teacherQuery += ` AND (due_date BETWEEN ? AND ? OR last_completed BETWEEN ? AND ?)`;
            teacherParams.push(startDate, endDate, startDate, endDate);

            childQuery += ` AND enrollment_date BETWEEN ? AND ?`;
            childParams.push(startDate, endDate);

            maintenanceQuery += ` AND date_reported BETWEEN ? AND ?`;
            maintenanceParams.push(startDate, endDate);
        }

        // Status filter
        if (status && status !== 'All') {
            teacherQuery += ` AND status = ?`;
            childQuery += ` AND status = ?`;
            maintenanceQuery += ` AND status = ?`;

            teacherParams.push(status);
            childParams.push(status);
            maintenanceParams.push(status);
        }

        // Department filter
        if (department && department !== 'All') {
            teacherQuery += ` AND department = ?`;
            teacherParams.push(department);
        }

        // Location filter
        if (location && location !== 'All') {
            maintenanceQuery += ` AND location = ?`;
            maintenanceParams.push(location);
        }

        // Total count queries
        const [[{ countTeachers }]] = await pool.query(
            `SELECT COUNT(*) AS countTeachers FROM (${teacherQuery}) AS temp`,
            teacherParams
        );
        const [[{ countChildren }]] = await pool.query(
            `SELECT COUNT(*) AS countChildren FROM (${childQuery}) AS temp`,
            childParams
        );
        const [[{ countMaintenance }]] = await pool.query(
            `SELECT COUNT(*) AS countMaintenance FROM (${maintenanceQuery}) AS temp`,
            maintenanceParams
        );

        // Append pagination
        teacherQuery += ` LIMIT ? OFFSET ?`;
        teacherParams.push(parsedLimit, offset);

        childQuery += ` LIMIT ? OFFSET ?`;
        childParams.push(parsedLimit, offset);

        maintenanceQuery += ` LIMIT ? OFFSET ?`;
        maintenanceParams.push(parsedLimit, offset);

        // Execute data queries
        const [teachers] = await pool.query(teacherQuery, teacherParams);
        const [children] = await pool.query(childQuery, childParams);
        const [maintenanceRequirements] = await pool.query(maintenanceQuery, maintenanceParams);

        res.status(200).json({
            success: true,
            message: "Filtered data fetched",
            page: parsedPage,
            limit: parsedLimit,
            teachers: {
                data: teachers,
                total: countTeachers,
                totalPages: Math.ceil(countTeachers / parsedLimit),
            },
            children: {
                data: children,
                total: countChildren,
                totalPages: Math.ceil(countChildren / parsedLimit),
            },
            maintenanceRequirements: {
                data: maintenanceRequirements,
                total: countMaintenance,
                totalPages: Math.ceil(countMaintenance / parsedLimit),
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching data",
            error: error.message,
        });
    }
};
