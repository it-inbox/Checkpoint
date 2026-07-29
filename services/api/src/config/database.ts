import mongoose, { Schema }     from 'mongoose';
import path                     from 'path';
import fs                       from 'fs';
import dayjs                    from 'dayjs';

// Config
import { env }                  from './environment';

// Types
import { User                 } from '../shared/types/User';
import { AttendanceRecord     } from '../shared/types/AttendanceRecord';
import { OrganizationSettings } from '../shared/types/OrganizationSettings';
import { DB                   } from '../shared/types/DB';

// Database File Path
const DB_PATH = path.join(process.cwd(), 'db.json');

// Connection state
export let isMongoConnected = false;
export let mongoConnectionError: string | null = null;
export const MONGODB_URI = env.MONGODB_URI;

// Initial Database State
const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    employeeId: 'EMP-001',
    name: 'Sarah Connor',
    email: 'sarah.connor@checkpoint.io',
    phone: '+1 (555) 019-2834',
    role: 'admin',
    status: 'active',
    designation: 'HR Director',
    department: 'Human Resources',
    joinedDate: '2024-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'u2',
    employeeId: 'EMP-002',
    name: 'John Miller',
    email: 'john.miller@checkpoint.io',
    phone: '+1 (555) 014-9982',
    role: 'employee',
    status: 'active',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    joinedDate: '2024-03-10',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'u3',
    employeeId: 'EMP-003',
    name: 'Emily Davis',
    email: 'emily.davis@checkpoint.io',
    phone: '+1 (555) 012-4431',
    role: 'employee',
    status: 'active',
    designation: 'Product Designer',
    department: 'Product',
    joinedDate: '2024-06-01',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  },
  {
    id: 'u4',
    employeeId: 'EMP-004',
    name: 'David Chen',
    email: 'david.chen@checkpoint.io',
    phone: '+1 (555) 017-3390',
    role: 'employee',
    status: 'active',
    designation: 'Marketing Lead',
    department: 'Marketing',
    joinedDate: '2024-05-18',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'u5',
    employeeId: 'EMP-005',
    name: 'Marcus Vance',
    email: 'marcus.vance@checkpoint.io',
    phone: '+1 (555) 011-8822',
    role: 'employee',
    status: 'inactive',
    designation: 'Sales Executive',
    department: 'Sales',
    joinedDate: '2024-02-20',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
  }
];

export const INITIAL_SETTINGS: OrganizationSettings = {
  companyName: 'CheckPoint Technologies Inc.',
  officeName: 'HQ Silicon Valley',
  latitude: 37.774929,
  longitude: -122.419416,
  radius: 100,
  officeStartTime: '09:00',
  officeEndTime: '18:00',
};

// Generate historical attendance data for the past 14 days
const generateHistoricalAttendance = (users: User[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = dayjs();
  const activeEmployees = users.filter(u => u.role === 'employee');

  for (let i = 14; i >= 1; i--) {
    const currentDate = today.subtract(i, 'day');
    const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;

    if (isWeekend) continue;

    const dateStr = currentDate.format('YYYY-MM-DD');

    activeEmployees.forEach(emp => {
      const isAbsent = Math.random() < 0.1;
      if (isAbsent) {
        records.push({
          id: `att_${emp.id}_${dateStr}`,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          date: dateStr,
          checkIn: null,
          checkOut: null,
          status: 'absent',
          workingHours: 0,
        });
        return;
      }

      const checkInHour = Math.random() < 0.3 ? 9 : 8;
      const checkInMin = Math.floor(Math.random() * 60);
      const checkInTime = dayjs(`${dateStr} ${checkInHour}:${checkInMin}`, 'YYYY-MM-DD HH:mm');

      const officeStart = dayjs(`${dateStr} 09:00`, 'YYYY-MM-DD HH:mm');
      const isLate = checkInTime.isAfter(officeStart);

      const isAutoClosed = Math.random() < 0.05;

      let checkOutStr: string | null = null;
      let workingHours = 0;
      let status: AttendanceRecord['status'] = isLate ? 'late' : 'present';

      if (isAutoClosed) {
        status = 'auto_closed';
        workingHours = 8.0;
      } else {
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMin = Math.floor(Math.random() * 60);
        const checkOutTime = dayjs(`${dateStr} ${checkOutHour}:${checkOutMin}`, 'YYYY-MM-DD HH:mm');
        checkOutStr = checkOutTime.format('HH:mm:ss');
        workingHours = parseFloat(checkOutTime.diff(checkInTime, 'hour', true).toFixed(2));
      }

      records.push({
        id: `att_${emp.id}_${dateStr}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        date: dateStr,
        checkIn: checkInTime.format('HH:mm:ss'),
        checkOut: checkOutStr,
        status,
        workingHours,
      });
    });
  }

  return records;
};

// Mongoose Schemas
const MongoUserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  joinedDate: { type: String, required: true },
  avatarUrl: { type: String },
});

const MongoSettingsSchema = new Schema({
  companyName: { type: String, required: true },
  officeName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radius: { type: Number, required: true },
  officeStartTime: { type: String, required: true },
  officeEndTime: { type: String, required: true },
});

const MongoAttendanceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null },
  status: { type: String, enum: ['present', 'absent', 'late', 'half_day', 'auto_closed'], required: true },
  workingHours: { type: Number, default: 0 },
  notes: { type: String },
});

MongoAttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const MongoUser = mongoose.model('User', MongoUserSchema);
export const MongoSettings = mongoose.model('Settings', MongoSettingsSchema);
export const MongoAttendance = mongoose.model('Attendance', MongoAttendanceSchema);

// Load database helper
export const getDb = (): DB => {
  if (!fs.existsSync(DB_PATH)) {
    const defaultDb: DB = {
      users: INITIAL_USERS,
      settings: INITIAL_SETTINGS,
      attendance: generateHistoricalAttendance(INITIAL_USERS),
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

// Save database helper
export const saveDb = (db: DB) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

// Migration function
async function migrateDataFromDbJsonToMongo() {
  try {
    console.log('[Migration] Checking and migrating data from db.json to MongoDB Atlas...');
    const db = getDb();

    let migratedUsersCount = 0;
    if (db.users && Array.isArray(db.users)) {
      for (const user of db.users) {
        const result = await MongoUser.updateOne(
          { id: user.id },
          { $set: user },
          { upsert: true }
        );
        if (result.upsertedCount > 0) migratedUsersCount++;
      }
    }
    if (migratedUsersCount > 0) {
      console.log(`[Migration] Successfully migrated ${migratedUsersCount} new users from db.json to MongoDB Atlas.`);
    } else {
      console.log('[Migration] All users are already up to date in MongoDB Atlas.');
    }

    if (db.settings) {
      await MongoSettings.updateOne(
        {},
        { $set: db.settings },
        { upsert: true }
      );
      console.log('[Migration] Successfully synchronized organization settings from db.json to MongoDB Atlas.');
    }

    let migratedAttendanceCount = 0;
    if (db.attendance && Array.isArray(db.attendance)) {
      for (const att of db.attendance) {
        const { selfieUrl, ...mongoRecord } = att as any;
        const result = await MongoAttendance.updateOne(
          { id: att.id },
          { $set: mongoRecord },
          { upsert: true }
        );
        if (result.upsertedCount > 0) migratedAttendanceCount++;
      }
    }
    if (migratedAttendanceCount > 0) {
      console.log(`[Migration] Successfully migrated ${migratedAttendanceCount} historical attendance logs from db.json to MongoDB Atlas.`);
    } else {
      console.log('[Migration] All historical attendance logs are already synchronized in MongoDB Atlas.');
    }

  } catch (err) {
    console.error('[Migration] Critical error during db.json migration to MongoDB Atlas:', err);
  }
}

// Connect to database
export const connectDatabase = () => {
  const isValidMongoUri = MONGODB_URI &&
    MONGODB_URI.trim() !== '' &&
    !MONGODB_URI.includes('localhost') &&
    !MONGODB_URI.includes('127.0.0.1') &&
    MONGODB_URI !== 'undefined';

  if (isValidMongoUri) {
    console.log('Connecting to MongoDB Atlas with a 5-second timeout limit...');
    try {
      mongoose.connect(MONGODB_URI!, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
        .then(() => {
          console.log('Successfully connected to MongoDB Atlas.');
          isMongoConnected = true;
          mongoConnectionError = null;
          migrateDataFromDbJsonToMongo();
        })
        .catch((err) => {
          console.error('Failed to connect to MongoDB Atlas connection pool:', err);
          mongoConnectionError = err.message || String(err);
        });
    } catch (err: any) {
      console.error('Synchronous exception caught during mongoose connection setup:', err);
      mongoConnectionError = err.message || String(err);
    }
  } else {
    console.log('MONGODB_URI is not configured or points to localhost. Running in lightweight local JSON database (db.json) mode.');
    mongoConnectionError = 'MONGODB_URI is not configured or points to localhost';
  }
};