import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { pool, query } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 profile images
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'fitorbit-super-secret-key-change-me-in-prod';

// Auth Middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.cookies?.fitorbit_token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// =======================
// AUTH ENDPOINTS
// =======================

app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const { email, password, firstName, lastName, gymName } = req.body;
    if (!email || !password || !firstName || !lastName || !gymName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const checkUser = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (checkUser.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const gymRes = await client.query(
        `INSERT INTO gyms (name, owner_name) VALUES ($1, $2) RETURNING *`,
        [gymName, `${firstName} ${lastName}`]
      );
      const newGym = gymRes.rows[0];

      const userRes = await client.query(
        `INSERT INTO users (email, password, role, gym_id, first_name, last_name) VALUES ($1, $2, 'ADMIN', $3, $4, $5) RETURNING id, email, role, gym_id, first_name, last_name`,
        [email, hashedPassword, newGym.id, firstName, lastName]
      );
      const newUser = userRes.rows[0];

      await client.query('COMMIT');
      res.status(201).json({ message: 'Gym and Admin info created!', user: newUser, gym: newGym });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (e: any) {
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const userRes = await query(`
      SELECT u.*, g.name as gym_name, g.id as gym_id 
      FROM users u 
      LEFT JOIN gyms g ON u.gym_id = g.id 
      WHERE u.email = $1
    `, [email]);

    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, gymId: user.gym_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('fitorbit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    const userWithoutPwd = {
      id: user.id, email: user.email, role: user.role, 
      firstName: user.first_name, lastName: user.last_name, 
      profileImage: user.profile_image
    };

    const gym = { id: user.gym_id, name: user.gym_name };

    res.json({ token, user: userWithoutPwd, gym });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

// =======================
// PLANS ENDPOINTS
// =======================
app.get('/api/plans', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const plansRes = await query(`SELECT * FROM membership_plans WHERE gym_id = $1 ORDER BY price ASC`, [gymId]);
    res.json({ plans: plansRes.rows });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

// =======================
// MEMBERS ENDPOINTS
// =======================
app.get('/api/members', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const membersRes = await query(`
      SELECT u.id, u.email, u.first_name as "firstName", u.last_name as "lastName", u.profile_image as "profileImage",
      mp.phone, mp.gender, mp.date_of_birth as "dateOfBirth", mp.address, mp.start_date as "startDate", mp.expiry_date as "expiryDate",
      mp.plan_id as "planId"
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      WHERE u.gym_id = $1 AND u.role = 'MEMBER'
    `, [gymId]);

    // Format like Prisma would so we don't need to rebuild frontend initially 
    const formatted = membersRes.rows.map(m => ({
      id: m.id,
      email: m.email,
      firstName: m.firstName,
      lastName: m.lastName,
      profileImage: m.profileImage,
      memberProfile: {
        phone: m.phone,
        gender: m.gender,
        dateOfBirth: m.dateOfBirth,
        address: m.address,
        startDate: m.startDate,
        expiryDate: m.expiryDate,
        planId: m.planId
      }
    }));

    res.json({ members: formatted });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

app.post('/api/members', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { email, password, firstName, lastName, profileImage, phone, gender, address, dateOfBirth, amount, planId } = req.body;

    if (!email) return res.status(400).json({ message: 'Email required' });

    const checkUser = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (checkUser.rows.length > 0) return res.status(409).json({ message: 'User exists' });

    const hashedPassword = await bcrypt.hash(password || "123456", 10);
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO users (email, password, role, gym_id, first_name, last_name, profile_image) VALUES ($1, $2, 'MEMBER', $3, $4, $5, $6) RETURNING id`,
        [email, hashedPassword, gymId, firstName, lastName, profileImage]
      );
      const userId = userRes.rows[0].id;

      const profileRes = await client.query(
        `INSERT INTO member_profiles (user_id, phone, gender, address, date_of_birth, plan_id, start_date, expiry_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [userId, phone, gender, address, dateOfBirth || null, planId || null, startDate, expiryDate]
      );

      await client.query(
        `INSERT INTO payments (gym_id, member_id, amount, payment_method, status) VALUES ($1, $2, $3, 'CASH', 'COMPLETED')`,
        [gymId, profileRes.rows[0].id, amount || 0]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: 'Member created successfully!' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

app.get('/api/members/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { id } = req.params;
    const memberRes = await query(`
      SELECT u.id, u.email, u.first_name as "firstName", u.last_name as "lastName", u.profile_image as "profileImage",
      mp.phone, mp.gender, mp.date_of_birth as "dateOfBirth", mp.address, mp.start_date as "startDate", mp.expiry_date as "expiryDate",
      mp.plan_id as "planId"
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      WHERE u.gym_id = $1 AND u.id = $2 AND u.role = 'MEMBER'
    `, [gymId, id]);

    if (memberRes.rows.length === 0) return res.status(404).json({ message: "Member not found" });

    const m = memberRes.rows[0];
    const formatted = {
      id: m.id,
      email: m.email,
      firstName: m.firstName,
      lastName: m.lastName,
      profileImage: m.profileImage,
      memberProfile: {
        phone: m.phone,
        gender: m.gender,
        dateOfBirth: m.dateOfBirth,
        address: m.address,
        startDate: m.startDate,
        expiryDate: m.expiryDate,
        planId: m.planId
      }
    };

    res.json({ member: formatted });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

app.put('/api/members/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { id } = req.params;
    const { email, firstName, lastName, profileImage, phone, gender, address, dateOfBirth } = req.body;

    const checkRes = await query(`SELECT id FROM users WHERE id = $1 AND gym_id = $2`, [id, gymId]);
    if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Member not found' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE users SET email=$1, first_name=$2, last_name=$3, profile_image=$4 WHERE id=$5`,
        [email, firstName, lastName, profileImage, id]
      );

      await client.query(
        `UPDATE member_profiles SET phone=$1, gender=$2, address=$3, date_of_birth=$4 WHERE user_id=$5`,
        [phone, gender, address, dateOfBirth || null, id]
      );

      await client.query('COMMIT');
      res.json({ message: 'Member updated successfully' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

app.delete('/api/members/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { id } = req.params;

    const checkRes = await query(`SELECT id FROM users WHERE id = $1 AND gym_id = $2`, [id, gymId]);
    if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Member not found' });

    // Due to ON DELETE CASCADE on PostgreSQL we just have to delete the user
    await query(`DELETE FROM users WHERE id = $1`, [id]);
    res.json({ message: "Member deleted successfully" });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ FitOrbit Backend (Node.JS + Postgres) listening on port ${PORT}`));
