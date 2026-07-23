# Biometric & Geofenced Attendance Management System
## System Architecture & Backend Flow Documentation

This document describes the comprehensive system architecture, data models, business workflows, and API specifications for the Geofenced Attendance Management System. It also provides a clear technical roadmap for migrating from the current lightweight JSON-based storage engine to **MongoDB Atlas**.

---

## 1. System Architecture Overview

The system utilizes a modern, cohesive **Full-Stack (Client-Server) Architecture** optimized for security, real-time geofencing validation, and biometric verification.

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT-SIDE (React)                  │
├────────────────────────────────────────────────────────┤
│  - React 19 + TypeScript + Vite                        │
│  - Material UI (MUI) Responsive Design Componentry      │
│  - React-Webcam (Biometric Selfie Captures)            │
│  - Geolocation API (Browser Geocoordinates Retrieval)  │
│  - React Query (Server State Synchronization)          │
└───────────┬────────────────────────────────────────────┘
            │ HTTPS / Multi-part Form Data
            ▼
┌────────────────────────────────────────────────────────┐
│                  SERVER-SIDE (Express)                 │
├────────────────────────────────────────────────────────┤
│  - Express 4 Router (API Endpoints Gateways)           │
│  - Multer middleware (Validated Local File Storage)    │
│  - Haversine Geofencing Verification Engine            │
│  - Biometric Similarity Match Service (Simulation)     │
└───────────┬────────────────────────────────────────────┘
            │ Read/Write File IO
            ▼
┌────────────────────────────────────────────────────────┐
│                    DATABASE ENGINE                     │
├────────────────────────────────────────────────────────┤
│  Current: Local JSON File DB (`db.json` via FS)        │
│  Target: MongoDB Atlas (Document Store Database)       │
└────────────────────────────────────────────────────────┘
```

### Key Architectural Constraints
1. **Security**: Biometric raw images and corporate credentials are kept strictly server-side. Local file system storage (`/uploads`) registers physical file paths inside a secure workspace, protected from direct client injection.
2. **Static Ingress**: External web requests route through an NGINX proxy to port `3000`. The Express server acts as a single point of entry, serving both API routes and static production client builds.

---

## 2. Core Operational Workflows

### Workflow A: Employee Biometric Registration & Onboarding
This flow enforces that every employee has a mandatory, valid face profile registered before they can check in.

1. **HR/Administrator Initiates Creation**: The Administrator navigates to the *Create Employee* panel.
2. **Mandatory Profile Image Upload**: The admin fills in personal info and is **required** to select a corporate profile photo file (JPG/PNG).
3. **Client-Side Form Packaging**: Form values are validated using Zod, packed into a `FormData` envelope, and uploaded as `multipart/form-data`.
4. **Backend Processing**:
   - `multer` intercepts the stream, validates the file extension, generates a unique filename (`avatar-[timestamp].jpg`), and saves it to the `/uploads` disk path.
   - The backend checks for duplicate emails.
   - If successful, it creates a new Employee entry, binding the saved file's web URL (`/uploads/avatar-...`) as the user's permanent biometric reference image (`avatarUrl`).

---

### Workflow B: Check-In Attendance Verification Flow
The check-in process requires two key validations: **Face Matching** and **Geofencing Accuracy**.

```
  [Employee clicks Check-In]
             │
             ▼
   Is Location Access Granted? ──(No)──> Warn User (Optional Remote Status)
             │ (Yes)
             ▼
   Open Camera Selfie Dialog
             │
             ▼
   [Employee Captures Photo / Uses Simulator]
             │
             ▼
   Upload Selfie to Server (/api/attendance/check-in)
             │
             ▼
   Fetch Employee's Registered Profile Photo (avatarUrl)
             │
    Does Avatar Exist? ──(No)──> Block Check-In (Admin Registration Required)
             │ (Yes)
             ▼
┌───────────────────────────────────────────────────────────┐
│       EXTERNAL FACE RECOGNITION MATCHING SERVICE          │
├───────────────────────────────────────────────────────────┤
│ Server compares the Captured Selfie with Registered Avatar│
│ - Simulates matching model calculations                   │
│ - Evaluates facial features, landmarks, and lighting      │
│ - Returns Similarity Confidence Score                      │
└─────────────────────────────┬─────────────────────────────┘
                              │
                    Is Similarity >= 90%?
                    ├──(No)──> Reject Check-In (Mismatched face alert)
                    └──(Yes)──> Proceed
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   Validate Geofence Range             Determine Check-In Status
   - Calc Haversine distance           - Compare system time with
     against office coordinates.         configured office start time.
   - Inside? Mark "Within Geofence"    - Late? Set status to 'late'.
   - Outside? Mark "Remote Check-In"   - Ontime? Set status to 'present'.
             │                                 │
             └────────────────┬────────────────┘
                              ▼
                Save Verified Record to DB
```

---

## 3. Backend API Directory

### Auth Endpoints
* **`POST /api/auth/login`**
  * *Purpose*: Validates user login credentials.
  * *Payload*: `{ email, password }`
  * *Response (200)*: `{ id, name, email, role, employeeId, avatarUrl }`

### Employee Management Endpoints
* **`GET /api/users`**
  * *Purpose*: Retrieves all employee profiles.
  * *Response (200)*: Array of `User` objects.

* **`POST /api/users`** (Multipart/Form-Data)
  * *Purpose*: Creates a new employee with a mandatory profile picture.
  * *Body fields*: `name`, `email`, `phone`, `designation`, `department`, `role`, `status`
  * *Files*: `avatar` (File stream, mandatory)
  * *Response (201)*: `{ id, name, ..., avatarUrl }`

* **`PUT /api/users/:id`** (Multipart/Form-Data)
  * *Purpose*: Updates an employee's record, with optional profile image replacement.
  * *Body fields*: `name`, `email`, `phone`, `designation`, `department`, `role`, `status`
  * *Files*: `avatar` (File stream, optional)
  * *Response (200)*: Updated `User` object.

* **`DELETE /api/users/:id`**
  * *Purpose*: Removes an employee and cleans up associated uploaded files.

### Attendance Endpoints
* **`GET /api/attendance`**
  * *Purpose*: Fetch all logs. Optionally filter by `employeeId`.

* **`POST /api/attendance/check-in`** (Multipart/Form-Data)
  * *Purpose*: Validates face match and geofencing to complete check-in.
  * *Body fields*: `employeeId`, `employeeName`, `latitude`, `longitude`, `accuracy`
  * *Files*: `selfie` (File stream, mandatory)
  * *Response (200)*: Saved `AttendanceRecord` including `selfieUrl` and confidence remarks.

---

## 4. Current JSON Database Architecture (`db.json`)

Currently, data is managed as a flat-file JSON structure structured inside `/db.json` with three main collection objects:

```json
{
  "users": [
    {
      "id": "1",
      "name": "Jane Doe",
      "email": "jane@company.com",
      "role": "admin",
      "employeeId": "EMP-001",
      "avatarUrl": "/uploads/avatar-171583.jpg",
      "phone": "+1234567890",
      "designation": "HR Manager",
      "department": "Human Resources",
      "status": "active",
      "joinedDate": "2024-01-15"
    }
  ],
  "settings": {
    "officeName": "Headquarters",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 150,
    "officeStartTime": "09:00",
    "officeEndTime": "17:00"
  },
  "attendance": [
    {
      "id": "att_EMP-001_2026-07-15",
      "employeeId": "EMP-001",
      "employeeName": "Jane Doe",
      "date": "2026-07-15",
      "checkIn": "08:52:14",
      "checkOut": null,
      "status": "present",
      "workingHours": 0,
      "selfieUrl": "/uploads/selfie-171584.jpg",
      "latitude": 37.7748,
      "longitude": -122.4193,
      "notes": "[Face Verified: 97.4% Similarity] Checked in within geofence range"
    }
  ]
}
```

---

## 5. MongoDB Atlas Integration Roadmap

To transition this application to a highly scalable, persistent database environment using **MongoDB Atlas**, follow this structural blueprint.

### Step 1: Install MongoDB Drivers
In your workspace, install `mongoose` to manage MongoDB schema validation and connections:
```bash
npm install mongoose
npm install --save-dev @types/mongoose
```

### Step 2: Configure Environment Variables
Create or update `.env` to hold the secure MongoDB Connection string:
```env
# .env Configuration
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/attendance_db?retryWrites=true&w=majority
```

### Step 3: Define Database Schemas (Mongoose)
Create `/server/models.ts` to represent the database structure cleanly:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  role: 'admin' | 'employee';
  employeeId: string;
  avatarUrl: string;
  phone?: string;
  designation?: string;
  department?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  employeeId: { type: String, required: true, unique: true },
  avatarUrl: { type: String, required: true },
  phone: { type: String },
  designation: { type: String },
  department: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinedDate: { type: String, required: true }
});

// Settings Schema
export interface ISettings extends Document {
  officeName: string;
  latitude: number;
  longitude: number;
  radius: number;
  officeStartTime: string;
  officeEndTime: string;
}

const SettingsSchema: Schema = new Schema({
  officeName: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radius: { type: Number, required: true, default: 150 },
  officeStartTime: { type: String, required: true, default: "09:00" },
  officeEndTime: { type: String, required: true, default: "17:00" }
});

// Attendance Record Schema
export interface IAttendance extends Document {
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent';
  workingHours: number;
  selfieUrl: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

const AttendanceSchema: Schema = new Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  date: { type: String, required: true }, // Format YYYY-MM-DD
  checkIn: { type: String, required: true },
  checkOut: { type: String },
  status: { type: String, enum: ['present', 'late', 'absent'], required: true },
  workingHours: { type: Number, default: 0 },
  selfieUrl: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  notes: { type: String }
});

// Compound index to guarantee only one check-in per user per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
```

### Step 4: Refactor Database Connections in `server.ts`
Replace the local FS helper routines with standard asynchronous MongoDB database connections:

```typescript
import mongoose from 'mongoose';
import { User, Settings, Attendance } from './server/models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("CRITICAL ERROR: MONGODB_URI environment variable is not defined!");
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas.'))
  .catch((err) => console.error('MongoDB connection error:', err));
```

### Step 5: Replace Controller Logic
Refactor endpoints to execute asynchronous database transactions:

* **Example check-in transition**:
```typescript
app.post('/api/attendance/check-in', upload.single('selfie'), async (req, res) => {
  const { employeeId, employeeName, latitude, longitude } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Attendance selfie image is mandatory for face verification.' });
  }

  try {
    const todayStr = dayjs().format('YYYY-MM-DD');

    // 1. Check duplicate check-ins via index
    const alreadyExists = await Attendance.findOne({ employeeId, date: todayStr });
    if (alreadyExists) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'You have already checked in today.' });
    }

    // 2. Fetch the user's mandatory profile picture for biometrics
    const employee = await User.findOne({ employeeId });
    if (!employee) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Employee record not found.' });
    }

    // [Execute Similarity / Geofencing calculations as usual]
    const similarityConfidence = 96.4; // Face Recognition model response
    const selfieUrl = `/uploads/${file.filename}`;

    const newRecord = new Attendance({
      employeeId,
      employeeName,
      date: todayStr,
      checkIn: dayjs().format('HH:mm:ss'),
      status: 'present',
      selfieUrl,
      latitude,
      longitude,
      notes: `[Face Verified: ${similarityConfidence}%] Checked in successfully.`
    });

    await newRecord.save();
    res.status(201).json(newRecord);

  } catch (error) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ error: 'Database transaction failed.' });
  }
});
```
