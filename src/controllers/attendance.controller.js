import pool from '../config/db.js';
import moment from "moment";
export const getUserAttendance = async (req, res) => {
    try {
        // ✅ Get userId from params and dates from query
        const userId = req.params.user_id;
        const { from, to } = req.query;

        if (!userId) {
            return res.status(400).json({ msg: "User ID is required." });
        }
        if (!from || !to) {
            return res.status(400).json({ msg: "From and To dates are required." });
        }

        // ✅ Step 1: Generate all dates between from and to
        const startDate = moment(from);
        const endDate = moment(to);
        const dateArray = [];

        while (startDate <= endDate) {
            dateArray.push(startDate.format("YYYY-MM-DD"));
            startDate.add(1, "days");
        }

        // ✅ Step 2: Get all sign-in dates for user
        const [rows] = await pool.query(
            `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS sign_in_date
             FROM sign_in_entries 
             WHERE user_id = ? AND DATE(date) BETWEEN ? AND ?`,
            [userId, from, to]
        );

        const signedInDates = rows.map((row) => row.sign_in_date);

        // ✅ Step 3: Map dates with Present/Absent
        const attendance = dateArray.map((date) => ({
            date,
            status: signedInDates.includes(date) ? "Present" : "Absent",
        }));

        // ✅ Step 4: Calculate totals
        const totalDays = attendance.length;
        const totalPresent = attendance.filter((entry) => entry.status === "Present").length;
        const totalAbsent = totalDays - totalPresent;

        // ✅ Send response
        res.status(200).json({
            msg: "Attendance status fetched successfully.",
            totalDays,
            totalPresent,
            totalAbsent,
            attendance,
        });
    } catch (error) {
        console.error("Error fetching attendance:", error.message);
        res.status(500).json({ msg: "Internal server error." });
    }
};
