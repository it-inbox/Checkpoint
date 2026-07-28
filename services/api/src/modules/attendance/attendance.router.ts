import express from "express";
const router  = express.Router();

// Middlewares
import { upload } from '../../shared/utils/mutler';

// Controller
import {
  getAttendance,
  getUserAttendance,
  getEmployeeMetrics,
  getAdminMetrics,
  checkIn,
  checkOut,
} from "./attendance.controller";

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AttendanceRecord'
 */
router.get('/api/attendance', getAttendance);

/**
 * @swagger
 * /api/attendance/my/{employeeId}:
 *   get:
 *     summary: Get attendance records for a specific employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Attendance records retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AttendanceRecord'
 */
router.get('/api/attendance/my/:employeeId', getUserAttendance);

/**
 * @swagger
 * /api/attendance/my/{employeeId}/metrics:
 *   get:
 *     summary: Get attendance metrics for a specific employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayAttendance:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *                 totalPresent:
 *                   type: number
 *                 totalLate:
 *                   type: number
 *                 totalWorkingHours:
 *                   type: number
 *                 attendanceRate:
 *                   type: number
 *                 recentAttendance:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 */
router.get('/api/attendance/my/:employeeId/metrics', getEmployeeMetrics);

/**
 * @swagger
 * /api/attendance/admin/metrics:
 *   get:
 *     summary: Get admin dashboard metrics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsResponse'
 */
router.get('/api/attendance/admin/metrics', getAdminMetrics);

/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     summary: Check-in with face verification
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - employeeName
 *               - selfies
 *             properties:
 *               employeeId:
 *                 type: string
 *               employeeName:
 *                 type: string
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *               accuracy:
 *                 type: string
 *               angle:
 *                 type: string
 *               selfies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Selfie images (1 or more for burst)
 *     responses:
 *       201:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/attendance/check-in', upload.array('selfies'), checkIn);

/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     summary: Check-out
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckOutRequest'
 *     responses:
 *       200:
 *         description: Check-out successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: No check-in found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/attendance/check-out', checkOut);

export { router as attendanceRouter };