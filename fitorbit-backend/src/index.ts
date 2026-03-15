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

// =======================
// SETTINGS ENDPOINTS
// =======================
app.get('/api/settings/profile', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const gymRes = await query(`
      SELECT id, name, owner_name as "ownerName", location, currency, timezone 
      FROM gyms 
      WHERE id = $1
    `, [gymId]);

    if (gymRes.rows.length === 0) return res.status(404).json({ message: "Gym not found" });

    res.json({ gym: gymRes.rows[0] });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

app.put('/api/settings/profile', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { name, ownerName, location, currency, timezone } = req.body;

    const updateRes = await query(`
      UPDATE gyms 
      SET name = $1, owner_name = $2, location = $3, currency = $4, timezone = $5, updated_at = NOW()
      WHERE id = $6 
      RETURNING id, name, owner_name as "ownerName", location, currency, timezone
    `, [name, ownerName, location, currency, timezone, gymId]);

    if (updateRes.rows.length === 0) return res.status(404).json({ message: "Gym not found" });

    res.json({ message: 'Settings correctly saved', gym: updateRes.rows[0] });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

app.put('/api/settings/security', authMiddleware, async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    const userRes = await query(`SELECT password FROM users WHERE id = $1`, [userId]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, userRes.rows[0].password);
    if (!isValid) return res.status(401).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

// =======================
// TRAINERS ENDPOINTS
// =======================
app.get('/api/trainers', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const trainersRes = await query(`
      SELECT u.id, u.email, u.first_name as "firstName", u.last_name as "lastName", u.profile_image as "profileImage",
             tp.specialization, tp.phone,
             (SELECT COUNT(*) FROM member_profiles mp WHERE mp.trainer_id = tp.id) as "assignedMembers"
      FROM users u
      LEFT JOIN trainer_profiles tp ON u.id = tp.user_id
      WHERE u.gym_id = $1 AND u.role = 'TRAINER'
    `, [gymId]);

    const formatted = trainersRes.rows.map(t => ({
      id: t.id,
      email: t.email,
      firstName: t.firstName,
      lastName: t.lastName,
      profileImage: t.profileImage,
      trainerProfile: {
        specialization: t.specialization,
        phone: t.phone
      },
      assignedMembers: parseInt(t.assignedMembers || '0')
    }));

    res.json({ trainers: formatted });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

app.post('/api/trainers', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { email, password, firstName, lastName, profileImage, phone, specialization } = req.body;

    if (!email) return res.status(400).json({ message: 'Email required' });

    const checkUser = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (checkUser.rows.length > 0) return res.status(409).json({ message: 'User exists' });

    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO users (email, password, role, gym_id, first_name, last_name, profile_image) VALUES ($1, $2, 'TRAINER', $3, $4, $5, $6) RETURNING id`,
        [email, hashedPassword, gymId, firstName, lastName, profileImage]
      );
      const userId = userRes.rows[0].id;

      await client.query(
        `INSERT INTO trainer_profiles (user_id, phone, specialization) VALUES ($1, $2, $3)`,
        [userId, phone, specialization]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: 'Trainer created successfully!' });
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

app.get('/api/trainers/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { id } = req.params;
    const trainerRes = await query(`
      SELECT u.id, u.email, u.first_name as "firstName", u.last_name as "lastName", u.profile_image as "profileImage",
             tp.specialization, tp.phone
      FROM users u
      LEFT JOIN trainer_profiles tp ON u.id = tp.user_id
      WHERE u.gym_id = $1 AND u.id = $2 AND u.role = 'TRAINER'
    `, [gymId, id]);

    if (trainerRes.rows.length === 0) return res.status(404).json({ message: "Trainer not found" });

    const t = trainerRes.rows[0];
    const formatted = {
      id: t.id,
      email: t.email,
      firstName: t.firstName,
      lastName: t.lastName,
      profileImage: t.profileImage,
      trainerProfile: {
        specialization: t.specialization,
        phone: t.phone
      }
    };

    res.json({ trainer: formatted });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

app.put('/api/trainers/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { id } = req.params;
    const { email, firstName, lastName, profileImage, phone, specialization } = req.body;

    const checkRes = await query(`SELECT id FROM users WHERE id = $1 AND gym_id = $2 AND role = 'TRAINER'`, [id, gymId]);
    if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Trainer not found' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE users SET email=$1, first_name=$2, last_name=$3, profile_image=$4 WHERE id=$5`,
        [email, firstName, lastName, profileImage, id]
      );

      await client.query(
        `UPDATE trainer_profiles SET phone=$1, specialization=$2 WHERE user_id=$3`,
        [phone, specialization, id]
      );

      await client.query('COMMIT');
      res.json({ message: 'Trainer updated successfully' });
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

app.delete('/api/trainers/:id', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { id } = req.params;

    const checkRes = await query(`SELECT id FROM users WHERE id = $1 AND gym_id = $2 AND role = 'TRAINER'`, [id, gymId]);
    if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Trainer not found' });

    // Due to ON DELETE CASCADE on PostgreSQL we just have to delete the user
    await query(`DELETE FROM users WHERE id = $1`, [id]);
    res.json({ message: "Trainer deleted successfully" });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

// =======================
// PAYMENTS ENDPOINTS
// =======================
app.get('/api/payments', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;

    const [collectedRes, pendingRes, mrrRes, paymentsRes] = await Promise.all([
      query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE gym_id = $1 AND status = 'COMPLETED' AND date_trunc('month', payment_date) = date_trunc('month', CURRENT_DATE)
      `, [gymId]),
      query(`
        SELECT COALESCE(SUM(mp.price), 0) as total
        FROM member_profiles m
        JOIN membership_plans mp ON m.plan_id = mp.id
        JOIN users u ON m.user_id = u.id
        WHERE u.gym_id = $1 AND (m.expiry_date IS NOT NULL AND m.expiry_date < CURRENT_DATE + INTERVAL '7 days')
      `, [gymId]), 
       query(`
        SELECT COALESCE(SUM(mp.price), 0) as total
        FROM member_profiles m
        JOIN membership_plans mp ON m.plan_id = mp.id
        JOIN users u ON m.user_id = u.id
        WHERE u.gym_id = $1 AND (m.expiry_date IS NULL OR m.expiry_date >= CURRENT_DATE)
      `, [gymId]), 
      query(`
        SELECT p.id, u.first_name || ' ' || u.last_name as member, p.payment_date as date, p.amount, p.payment_method as method, p.status 
        FROM payments p
        JOIN member_profiles m ON p.member_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE p.gym_id = $1
        ORDER BY p.payment_date DESC
      `, [gymId])
    ]);

    const formattedTransactions = paymentsRes.rows.map(p => ({
      id: '#' + p.id.split('-')[0].toUpperCase(),
      rawId: p.id,
      member: p.member,
      date: new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: parseFloat(p.amount),
      method: p.method,
      status: p.status
    }));

    res.json({
      stats: {
        collectedThisMonth: parseFloat(collectedRes.rows[0].total),
        pendingRenewals: parseFloat(pendingRes.rows[0].total),
        currentMRR: parseFloat(mrrRes.rows[0].total)
      },
      transactions: formattedTransactions
    });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

app.post('/api/payments', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;
    const { userId, amount, paymentMethod, status } = req.body; // Using userId (user_id) from form

    const profileRes = await query(`SELECT id FROM member_profiles WHERE user_id = $1`, [userId]);
    if (profileRes.rows.length === 0) return res.status(404).json({ message: 'Member profile not found' });
    const memberProfileId = profileRes.rows[0].id;

    const insertRes = await query(
      `INSERT INTO payments (gym_id, member_id, amount, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [gymId, memberProfileId, amount, paymentMethod, status || 'COMPLETED']
    );

    res.json({ message: 'Payment recorded', id: insertRes.rows[0].id });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

// =======================
// DASHBOARD ENDPOINTS
// =======================
app.get('/api/dashboard/stats', authMiddleware, async (req: any, res: any) => {
  try {
    const { gymId } = req.user;

    // Run queries in parallel for performance
    const [membersCount, activeMembersRes, revenueRes, todayCheckinsRes, recentActivityRes, revenueChartRes] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM users WHERE gym_id = $1 AND role = 'MEMBER'`, [gymId]),
      query(`
        SELECT COUNT(*) as active 
        FROM member_profiles mp
        JOIN users u ON mp.user_id = u.id
        WHERE u.gym_id = $1 AND (mp.expiry_date IS NULL OR mp.expiry_date > NOW())
      `, [gymId]),
      query(`
        SELECT COALESCE(SUM(amount), 0) as revenue 
        FROM payments 
        WHERE gym_id = $1 AND date_trunc('month', payment_date) = date_trunc('month', CURRENT_DATE) AND status = 'COMPLETED'
      `, [gymId]),
      query(`
        SELECT COUNT(*) as checkins 
        FROM attendance 
        WHERE gym_id = $1 AND date = CURRENT_DATE
      `, [gymId]),
      // Get 5 most recent activities
      query(`
        SELECT p.id, u.first_name || ' ' || u.last_name as name, 'Paid Subscription' as action, p.payment_date as time, 'success' as type, p.amount
        FROM payments p
        JOIN member_profiles m ON p.member_id = m.id
        JOIN users u ON m.user_id = u.id
        WHERE p.gym_id = $1 AND p.status = 'COMPLETED'
        ORDER BY p.payment_date DESC
        LIMIT 5
      `, [gymId]),
      // 6-Month Revenue History
      query(`
        WITH months AS (
          SELECT generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
          ) as m
        )
        SELECT 
          to_char(m.m, 'Mon') as label,
          COALESCE(SUM(p.amount), 0) as value
        FROM months m
        LEFT JOIN payments p ON date_trunc('month', p.payment_date) = m.m AND p.gym_id = $1 AND p.status = 'COMPLETED'
        GROUP BY 1, m.m
        ORDER BY m.m ASC
      `, [gymId])
    ]);

    res.json({
      stats: {
        totalMembers: parseInt(membersCount.rows[0].total),
        activeMembers: parseInt(activeMembersRes.rows[0].active),
        monthlyRevenue: parseFloat(revenueRes.rows[0].revenue),
        todayCheckins: parseInt(todayCheckinsRes.rows[0].checkins),
      },
      revenueChart: revenueChartRes.rows.map(r => ({
        label: r.label,
        value: parseFloat(r.value)
      })),
      recentActivity: recentActivityRes.rows
    });
  } catch (e: any) {
    res.status(500).json({ message: 'Internal error', error: e.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ FitOrbit Backend (Node.JS + Postgres) listening on port ${PORT}`));
