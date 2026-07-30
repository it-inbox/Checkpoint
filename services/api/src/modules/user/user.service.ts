import fs from 'fs';

// Zod Schemas
import { UserSchema } from "./user.validator";

// Config
import { isMongoConnected, MongoUser, getDb, saveDb } from '../../config/database';

// Types
import { User } from "../../shared/types/User";

export async function svcGetAllUsers() {

  if (isMongoConnected) {
    try {
      return await MongoUser.find({});
    }
    catch (err) {
      console.error('Mongo get users error:', err);
      throw err;
    }
  }
  const db = getDb();
  return db.users;
}

export async function svcGetUser(employeeId: string) {

  if (isMongoConnected) {
    try {
      return await MongoUser.findOne({ employeeId });
    }
    catch (err) {
      console.error('Mongo get user error:', err);
      throw err;
    }
  }

  const db = getDb();
  return db.users.find(u => u.id === employeeId);
}

export async function svcCreateEmployee(employeeData: any, file: Express.Multer.File | undefined) {

  const result = UserSchema.safeParse(employeeData);
  if (!result.success) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error(result.error.issues[0].message);
  }
  
  const validatedData = result.data;

  if (!file) throw new Error('Profile picture upload is mandatory for biometric face registration.');

  const avatarUrl = `/uploads/${file.filename}`;

  if (isMongoConnected) {
    try {
      const emailExists = await MongoUser.findOne({ email: new RegExp(`^${employeeData.email.trim()}$`, 'i') });
      if (emailExists) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw new Error('An employee with this email already exists.');
      }

      const totalUsersCount = await MongoUser.countDocuments();
      const newId = `u${Date.now()}`;
      const newEmpId = `EMP-${String(totalUsersCount + 1).padStart(3, '0')}`;
      const joinedDate = new Date().toISOString().split('T')[0];

      const newEmployee = new MongoUser({
        ...validatedData,
        id: newId,
        employeeId: newEmpId,
        joinedDate,
        avatarUrl,
      });

      await newEmployee.save();
      return newEmployee;
    } 
    catch (err) {
      console.error('Mongo create user error:', err);
      throw err;
    }
  }

  const db = getDb();
  if (db.users.some(u => u.email.toLowerCase() === employeeData.email.trim().toLowerCase())) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error('An employee with this email already exists.');
  }

  const newId = `u${Date.now()}`;
  const newEmpId = `EMP-${String(db.users.length + 1).padStart(3, '0')}`;
  const joinedDate = new Date().toISOString().split('T')[0];

  const newEmployee: User = {
    ...validatedData,
    id: newId,
    employeeId: newEmpId,
    joinedDate,
    avatarUrl,
  };

  db.users.push(newEmployee);
  saveDb(db);
  return newEmployee;
}

export async function svcUpdateEmployee(id: string, employeeData: any, file: Express.Multer.File | undefined) {

  const result = UserSchema.partial().safeParse(employeeData);
  if (!result.success) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error(result.error.issues[0].message);
  }

  const validatedData = result.data;

  if (isMongoConnected) {
    try {
      const user = await MongoUser.findOne({ id });
      if (!user) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw new Error('Employee not found.');
      }

      if (validatedData.email) {
        const emailConflict = await MongoUser.findOne({ id: { $ne: id }, email: new RegExp(`^${validatedData.email.trim()}$`, 'i') });
        if (emailConflict) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          throw new Error('An employee with this email already exists.');
        }
      }

      const updatedAvatarUrl = file ? `/uploads/${file.filename}` : user.avatarUrl;
      if (!updatedAvatarUrl) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw new Error('Profile picture is mandatory.');
      }

      const updatedUser = await MongoUser.findOneAndUpdate(
        { id },
        { ...employeeData, avatarUrl: updatedAvatarUrl },
        { new: true }
      );
      return updatedUser;
    }
    catch (err) {
      console.error('Mongo update user error:', err);
      throw err;
    }
  }

  const db = getDb();
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error('Employee not found.');
  }

  if (employeeData.email) {
    const emailConflict = db.users.some(u => u.id !== id && u.email.toLowerCase() === validatedData.email!.toLowerCase());
    if (emailConflict) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new Error('An employee with this email already exists.');
    }
  }

  const updatedAvatarUrl = file ? `/uploads/${file.filename}` : db.users[index].avatarUrl;

  if (!updatedAvatarUrl) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new Error('Profile picture is mandatory.');
  }

  db.users[index] = {
    ...db.users[index],
    ...validatedData,
    avatarUrl: updatedAvatarUrl,
  };

  saveDb(db);
  return db.users[index];
}

export async function svcDeleteEmployee(id: string) {

  if (isMongoConnected) {
    try {
      const user = await MongoUser.findOne({ id });

      if (!user) throw new Error('Employee not found.');

      if (user.role === 'admin') throw new Error('Cannot delete administrative user.');

      await MongoUser.deleteOne({ id });
      throw new Error('Employee deleted successfully.');
    }
    catch (err) {
      console.error('Mongo delete user error:', err);
    }
  }

  const db = getDb();
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) throw new Error('Employee not found.');

  if (db.users[index].role === 'admin') throw new Error('Cannot delete administrative user.');

  db.users.splice(index, 1);
  saveDb(db);
  return { success: true, message: 'Employee deleted successfully.'};
}