// Config
import { isMongoConnected, MongoSettings, getDb, saveDb } from "../../config/database"

// Types
import { SettingsInput, SettingsResponse } from './settings.types';

export async function svcGetSettings() {
  if (isMongoConnected) {
    try {
      const settings = await MongoSettings.findOne({});
      if (settings) return settings;
    } 
    catch (err) { console.error('Mongo get settings error:', err) }
  }
  const db = getDb();

  return db.settings;
}

export async function svcUpdateSettings(data: SettingsInput): Promise<SettingsResponse>  {
  if (isMongoConnected) {
    try {
      let settings = await MongoSettings.findOne({});
      if (!settings) { settings = new MongoSettings(data) }
      else { Object.assign(settings, data) }

      await settings.save();
      return settings;
    }
    catch (err) {
      console.error('Mongo save settings error:', err);
      throw err;
    }
  }

  const db = getDb();
  db.settings = { ...db.settings, ...data, };
  saveDb(db);

  return db.settings;
}