import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http'; // for socket.io
import { Server } from 'socket.io';
import pool from './config/db.js'; // ⬅️ pool needed for socket DB

// Load environment
dotenv.config();

const app = express();
const server = http.createServer(app); // wrap express with http for socket.io

const io = new Server(server, {
    cors: {
        origin: '*', // set to frontend URL in prod
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// All routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import roleRoutes from './routes/role.routes.js';
import documentRoutes from './routes/document.routes.js';
import dcRoutes from './routes/dc.routes.js';
import safetyRoutes from './routes/safety.routes.js';
import childRoutes from './routes/child.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import classroomRoutes from './routes/classrooms.routes.js';
import courseRoutes from './routes/course.router.js';
import entryRoutes from './routes/sign-in.routes.js';
import payroll from './routes/payroll.routes.js';
import accounting from './routes/accounting.routes.js';
import reports from './routes/reports.routes.js';
import outReq from './routes/outstandingRequirement.routes.js';
import callCenter from './routes/callCentre.routes.js';
import lunchformRoutes from './routes/lunch.routes.js';
import specialNeedRoutes from "./routes/specialneeds.router.js";
import medicalFormRoutes from './routes/medicalForm.routes.js';
import attendance from './routes/attendance.routes.js';
import forgetPassword from './routes/forgetPassword.routes.js';
import my_notes from './routes/myNotes.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import childCallCentre from './routes/childCallCentre.routes.js';

// Use routes
import plaid from './routes/plaid.routes.js';



dotenv.config();

app.use(cors({
    origin: ['http://localhost:5173', 'https://coruscating-cactus-a9e89d.netlify.app'],  // ✅ Only allow localhost:5173
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // ✅ Allow selected HTTP methods
   // allowedHeaders: ['Content-Type', 'Authorization']  // ✅ Allow these headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dc', dcRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/lunch-form', lunchformRoutes);
app.use('/api/specialneeds', specialNeedRoutes);
app.use('/api/medical-forms', medicalFormRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/sign-in', entryRoutes);
app.use('/api/payroll', payroll);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/accounting', accounting);
app.use('/api/reports', reports);
app.use('/api/outstanding-requirements', outReq);
app.use('/api/call-center', callCenter);
app.use('/api/attendance', attendance);
app.use('/api/notes', my_notes);
app.use('/api/password', forgetPassword);
app.use('/api/child-callCentre', childCallCentre);
app.use('/api/plaid', plaid);

// ✅ Socket.IO handlers
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", ({ childId, teacherId }) => {
        const room = `chat_${childId}_${teacherId}`;
        socket.join(room);
    });

    socket.on("send_message", async ({ childId, teacherId, sender, message }) => {
        const room = `chat_${childId}_${teacherId}`;

        // Save message to DB
        await pool.query(
            "INSERT INTO child_callcentre (child_id, teacher_id, sender, message) VALUES (?, ?, ?, ?)",
            [childId, teacherId, sender, message]
        );

        // Broadcast message
        io.to(room).emit("receive_message", {
            childId,
            teacherId,
            sender,
            message,
            created_at: new Date(),
        });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running with Socket.IO on port ${PORT}`);
});
