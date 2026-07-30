import express from "express";

// Controller
import { ctrlGetSettings, ctrlUpdateSettings } from "./settings.controller";

const router  = express.Router();

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
router.get('/', ctrlGetSettings);

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
router.post('/', ctrlUpdateSettings);

export { router as settingsRouter };