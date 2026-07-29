import express from 'express';

// Routes
import { attendanceRouter } from '../modules/attendance/attendance.router';
import { authRouter       } from '../modules/auth/auth.router';
import { systemRouter     } from '../modules/system/system.router';
import { settingsRouter   } from '../modules/settings/settings.router';
import { userRouter       } from '../modules/user/user.router';

const router = express.Router();

router.use('/attendance', attendanceRouter)
router.use('/auth',       authRouter)
router.use('/settings',   settingsRouter)
router.use('/system',     systemRouter)
router.use('/users',      userRouter)

export { router }