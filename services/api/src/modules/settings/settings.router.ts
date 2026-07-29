import express from "express";
const router  = express.Router();

// Controller
import { getSettings, updateSettings } from "./settings.controller";

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get organization settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationSettings'
 */
router.get('/', getSettings);

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Update organization settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationSettings'
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationSettings'
 */
router.post('/', updateSettings);

export { router as settingsRouter };