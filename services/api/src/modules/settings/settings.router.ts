// Libraries
import express from "express";
import { z } from "zod";

// Config
import { isMongoConnected, MongoSettings, getDb, saveDb } from "../../config/database"

// Zod Schemas
const SettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  officeName: z.string().min(1, 'Office name is required'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  radius: z.number().positive('Radius must be positive'),
  officeStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  officeEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
});

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
router.get('/', async (req, res) => {
  if (isMongoConnected) {
    try {
      const settings = await MongoSettings.findOne({});
      if (settings) {
        return res.json(settings);
      }
    } catch (err) {
      console.error('Mongo get settings error:', err);
    }
  }
  const db = getDb();
  res.json(db.settings);
});

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
router.post('/', async (req, res) => {
  const result = SettingsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const settingsData = result.data;

  if (isMongoConnected) {
    try {
      let settings = await MongoSettings.findOne({});
      if (!settings) {
        settings = new MongoSettings(settingsData);
      } else {
        Object.assign(settings, settingsData);
      }
      await settings.save();
      return res.json(settings);
    } catch (err) {
      console.error('Mongo save settings error:', err);
    }
  }
  const db = getDb();
  db.settings = {
    ...db.settings,
    ...settingsData,
  };
  saveDb(db);
  res.json(db.settings);
});

export { router as settingsRouter };