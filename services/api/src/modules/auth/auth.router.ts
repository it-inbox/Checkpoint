// Libraries
import express from "express";
import { z } from "zod";

// Config
import { isMongoConnected, MongoUser, getDb } from '../../config/database';

// Zod Schema
const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const router  = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { email } = result.data;

  const normalizedEmail = email.trim().toLowerCase();
  let user: any = null;

  if (isMongoConnected) {
    try {
      user = await MongoUser.findOne({ email: new RegExp(`^${normalizedEmail}$`, 'i') });
    } catch (err) {
      console.error('Mongo login error:', err);
    }
  }

  if (!isMongoConnected || !user) {
    const db = getDb();
    user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password. Recommended: sarah.connor@checkpoint.io (Admin) or john.miller@checkpoint.io (Employee)' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ error: 'This user account is currently deactivated.' });
  }

  res.json({
    user,
    token: `mock-jwt-token-for-${user.id}`,
  });
});

export { router as authRouter };