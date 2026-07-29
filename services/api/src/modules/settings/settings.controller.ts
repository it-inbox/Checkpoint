// Libraries
import { Request, Response } from "express";

// Config
import { isMongoConnected, MongoSettings, getDb, saveDb } from "../../config/database"

// Zod Schemas
import { SettingsSchema } from "./settings.validator";

export async function getSettings(req: Request, res: Response) {
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
}

export async function updateSettings(req: Request, res: Response) {
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
}