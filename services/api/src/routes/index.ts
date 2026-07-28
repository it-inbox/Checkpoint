// Libraries
import express from 'express';
const router  = express.Router();

import { dbStatusRouter   } from '../modules/dbStatus/dbStatus.router';
import { authRouter       } from '../modules/auth/auth.router'
import { userRouter       } from '../modules/user/user.router'
import { settingsRouter   } from '../modules/settings/settings.router'
import { attendanceRouter } from '../modules/attendance/attendance.router'

router.use('/db-status',  dbStatusRouter)
router.use('/auth',       authRouter)
router.use('/user',       userRouter)
router.use('/settings',   settingsRouter)
router.use('/attendance', attendanceRouter)

export { router }