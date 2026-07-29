import { Request, Response } from "express";
import fs from 'fs';

// Config
import { isMongoConnected, MongoUser, getDb, saveDb } from '../../config/database';

// Zod Schemas
import { UserSchema } from "./user.validator";

// Types
import { User } from "../../shared/types/User";

export async function getAllUsers(req: Request, res: Response) {
  if (isMongoConnected) {
    try {
      const users = await MongoUser.find({});
      return res.json(users);
    } catch (err) {
      console.error('Mongo get users error:', err);
    }
  }
  const db = getDb();
  res.json(db.users);
}

export async function getUser(req: Request, res: Response) {
  if (isMongoConnected) {
    try {
      const user = await MongoUser.findOne({ id: req.params.id });
      if (user) {
        return res.json(user);
      }
    } catch (err) {
      console.error('Mongo get user error:', err);
    }
  }
  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Employee not found.' });
  }
  res.json(user);
}

export async function createEmployee(req: Request, res: Response) {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const employeeData = result.data;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Profile picture upload is mandatory for biometric face registration.' });
  }

  const avatarUrl = `/uploads/${file.filename}`;

  if (isMongoConnected) {
    try {
      const emailExists = await MongoUser.findOne({ email: new RegExp(`^${employeeData.email.trim()}$`, 'i') });
      if (emailExists) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'An employee with this email already exists.' });
      }

      const totalUsersCount = await MongoUser.countDocuments();
      const newId = `u${Date.now()}`;
      const newEmpId = `EMP-${String(totalUsersCount + 1).padStart(3, '0')}`;
      const joinedDate = new Date().toISOString().split('T')[0];

      const newEmployee = new MongoUser({
        ...employeeData,
        id: newId,
        employeeId: newEmpId,
        joinedDate,
        avatarUrl,
      });

      await newEmployee.save();
      return res.status(201).json(newEmployee);
    } catch (err) {
      console.error('Mongo create user error:', err);
    }
  }

  const db = getDb();
  if (db.users.some(u => u.email.toLowerCase() === employeeData.email.trim().toLowerCase())) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'An employee with this email already exists.' });
  }

  const newId = `u${Date.now()}`;
  const newEmpId = `EMP-${String(db.users.length + 1).padStart(3, '0')}`;
  const joinedDate = new Date().toISOString().split('T')[0];

  const newEmployee: User = {
    ...employeeData,
    id: newId,
    employeeId: newEmpId,
    joinedDate,
    avatarUrl,
  };

  db.users.push(newEmployee);
  saveDb(db);
  res.status(201).json(newEmployee);
}

export async function updateEmployee(req: Request, res: Response) {
  const { id } = req.params;
  const result = UserSchema.partial().safeParse(req.body);
  if (!result.success) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const employeeData = result.data;
  const file = req.file;

  if (isMongoConnected) {
    try {
      const user = await MongoUser.findOne({ id });
      if (!user) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(404).json({ error: 'Employee not found.' });
      }

      if (employeeData.email) {
        const emailConflict = await MongoUser.findOne({ id: { $ne: id }, email: new RegExp(`^${employeeData.email.trim()}$`, 'i') });
        if (emailConflict) {
          if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
          return res.status(400).json({ error: 'An employee with this email already exists.' });
        }
      }

      const updatedAvatarUrl = file ? `/uploads/${file.filename}` : user.avatarUrl;
      if (!updatedAvatarUrl) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Profile picture is mandatory.' });
      }

      const updatedUser = await MongoUser.findOneAndUpdate(
        { id },
        { ...employeeData, avatarUrl: updatedAvatarUrl },
        { new: true }
      );
      return res.json(updatedUser);
    } catch (err) {
      console.error('Mongo update user error:', err);
    }
  }

  const db = getDb();
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(404).json({ error: 'Employee not found.' });
  }

  if (employeeData.email) {
    const emailConflict = db.users.some(u => u.id !== id && u.email.toLowerCase() === employeeData.email!.toLowerCase());
    if (emailConflict) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'An employee with this email already exists.' });
    }
  }

  const updatedAvatarUrl = file ? `/uploads/${file.filename}` : db.users[index].avatarUrl;

  if (!updatedAvatarUrl) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({ error: 'Profile picture is mandatory.' });
  }

  db.users[index] = {
    ...db.users[index],
    ...employeeData,
    avatarUrl: updatedAvatarUrl,
  };

  saveDb(db);
  res.json(db.users[index]);
}

export async function deleteEmployee(req: Request, res: Response) {
  const { id } = req.params;
  if (isMongoConnected) {
    try {
      const user = await MongoUser.findOne({ id });
      if (!user) {
        return res.status(404).json({ error: 'Employee not found.' });
      }
      if (user.role === 'admin') {
        return res.status(400).json({ error: 'Cannot delete administrative user.' });
      }
      await MongoUser.deleteOne({ id });
      return res.json({ success: true, message: 'Employee deleted successfully.' });
    } catch (err) {
      console.error('Mongo delete user error:', err);
    }
  }

  const db = getDb();
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  if (db.users[index].role === 'admin') {
    return res.status(400).json({ error: 'Cannot delete administrative user.' });
  }

  db.users.splice(index, 1);
  saveDb(db);
  res.json({ success: true, message: 'Employee deleted successfully.' });
}