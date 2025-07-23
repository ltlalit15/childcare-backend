
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './config/db.js';
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



dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
// app.use('/api/auth')
app.use('/api/users', userRoutes);

app.use('/api/children', childRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dc', dcRoutes)
app.use('/api/safety', safetyRoutes);
app.use('/api/teachers', teacherRoutes);
// app.use('/api/payrolls', payrollRoutes);
// app.use('/api/transactions', transactionRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/courses', courseRoutes);
import dashboardRoutes from './routes/dashboard.routes.js';

// app.use('/api/emergency-contacts', emergencyContactRoutes);
// app.use('/api/medical-records', medicalRecordRoutes);
// app.use('/api/sign-in-logs', signInLogRoutes);
// app.use('/api/location-logs', locationLogRoutes);
// app.use('/api/requirements', requirementRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/sign-in', entryRoutes);

app.use('/api/payroll', payroll);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/accounting', accounting);
app.use('/api/reports', reports);
app.use('/api/outstanding-requirements', outReq);
app.use('/api/call-center', callCenter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
