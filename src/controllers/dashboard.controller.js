// dashboard.controller.js
import pool from "../config/db.js";





export const getChildrenStats = async (req, res) => {
  try {
    const [totalChildrenRows] = await pool.query(
      `SELECT COUNT(*) as total FROM children`
    );

    const [genderRows] = await pool.query(
      `SELECT gender, COUNT(*) as count FROM children GROUP BY gender`
    );

    const [ageGroupRows] = await pool.query(
      `SELECT 
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, dob_hebrew, CURDATE()) BETWEEN 0 AND 2 THEN 1 ELSE 0 END) as age_0_2,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, dob_hebrew, CURDATE()) BETWEEN 2 AND 4 THEN 1 ELSE 0 END) as age_2_4,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, dob_hebrew, CURDATE()) BETWEEN 4 AND 6 THEN 1 ELSE 0 END) as age_4_6
      FROM children`
    );

    const genderDistribution = {
      boys: genderRows.find(g => g.gender === 'Male')?.count || 0,
      girls: genderRows.find(g => g.gender === 'Female')?.count || 0,
    };

    const response = {
      totalChildren: totalChildrenRows[0].total,
      genderDistribution,
      ageGroups: {
        "0-2": ageGroupRows[0].age_0_2,
        "2-4": ageGroupRows[0].age_2_4,
        "4-6": ageGroupRows[0].age_4_6,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getChildrenStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const getTeacherStats = async (req, res) => {
  try {
    // 1. 🎂 Upcoming birthdays (within next 7 days)
    const [birthdays] = await pool.query(
      `SELECT user_id, name, dob 
       FROM users 
       INNER JOIN roles ON users.role_id = roles.role_id 
       WHERE roles.name = 'Teacher' 
       AND DATE_FORMAT(dob, '%m-%d') BETWEEN DATE_FORMAT(CURDATE(), '%m-%d') 
       AND DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 7 DAY), '%m-%d')`
    );

    // 2. 👩‍🏫 Gender-wise count
    const [genderStats] = await pool.query(
      `SELECT gender, COUNT(*) AS count 
       FROM users 
       INNER JOIN roles ON users.role_id = roles.role_id 
       WHERE roles.name = 'Teacher' 
       GROUP BY gender`
    );

    // 3. 👶 Age group count
    const [ageGroupStats] = await pool.query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 20 AND 29 THEN '20-29'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 30 AND 39 THEN '30-39'
          WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) >= 40 THEN '40+'
          ELSE 'Unknown'
        END AS age_group,
        COUNT(*) AS count
      FROM users 
      INNER JOIN roles ON users.role_id = roles.role_id 
      WHERE roles.name = 'Teacher'
      GROUP BY age_group
    `);

    // 4. 🧑‍🏫 All Teachers list
    const [allTeachers] = await pool.query(`
      SELECT user_id, gender, dob 
      FROM users 
      INNER JOIN roles ON users.role_id = roles.role_id 
      WHERE roles.name = 'Teacher'
    `);

    res.json({
      message: "Teacher demographics fetched successfully",
      data: {
        upcomingBirthdays: birthdays,
        genderStats,
        ageGroupStats,
        allTeachers
      }
    });
  } catch (error) {
    console.error("Teacher demographics fetch error:", error);
    res.status(500).json({ message: "Failed to fetch teacher demographics", error });
  }
};



// ✅ Add new activity
export const addActivity = async (req, res) => {
  const { time, activity, type } = req.body;

  if (!time || !activity || !type) {
    return res.status(400).json({ message: "Time, activity and type are required" });
  }

  try {
    await pool.query(
      `INSERT INTO activities (time, activity, type) VALUES (?, ?, ?)`,
      [time, activity, type]
    );

    res.status(201).json({ message: "Activity added successfully" });
  } catch (error) {
    console.error("Error adding activity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all recent activities
export const getAllActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM activities ORDER BY time DESC LIMIT 10`
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activities", error: error.message });
  }
};
// ✅ Get single activity by ID
export const getActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(`SELECT * FROM activities WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Failed to fetch activity", error: error.message });
  }
};


export const updateActivity = async (req, res) => {
  const { id } = req.params;
  const { time, activity, type } = req.body;

  if (!time || !activity || !type) {
    return res.status(400).json({
      message: "Time, activity, and type are required.",
      success: false,
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE activities 
       SET time = ?, activity = ?, type = ? 
       WHERE id = ?`,
      [time, activity, type, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Activity not found.",
        success: false,
      });
    }

    res.status(200).json({
      message: "Activity updated successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Update activity failed:", error);
    res.status(500).json({
      message: "Failed to update activity.",
      error: error.message,
      success: false,
    });
  }
};



// ✅ Delete activity by ID
export const deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(`DELETE FROM activities WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Failed to delete activity", error: error.message });
  }
};