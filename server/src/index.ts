import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'ashdot-super-secret-key-987654321';

// Hash password with a deterministic SHA512 salt PBKDF2 method
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'salt-ashdot-kibutz-project-1234', 1000, 64, 'sha512').toString('hex');
}

// Generate an RFC-compliant signed stateless JWT token using Node.js crypto
export function generateToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payloadStr}`).digest('base64url');
  return `${header}.${payloadStr}.${signature}`;
}

// Verify and decode a JWT token, return decoded payload or null
export function verifyToken(token: string): any | null {
  try {
    const [header, payloadStr, signature] = token.split('.');
    if (!header || !payloadStr || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payloadStr}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    return payload;
  } catch {
    return null;
  }
}

import nodemailer from 'nodemailer';

// Configure SMTP transport using environment variables or fallback to a mock logger
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendInvitationEmail(email: string, token: string, role: string) {
  const registerUrl = `http://localhost:8080/register?token=${token}`;
  const roleText = role === 'ADMIN' ? 'מנהל מערכת (Admin)' : 'צופה בלבד (Read-Only)';
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"מערכת אשדות" <noreply@ashdot.co.il>',
    to: email,
    subject: 'הזמנה להצטרפות למערכת אשדות',
    html: `
      <div style="direction: rtl; text-align: right; font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb;">הוזמנת להצטרף למערכת אשדות!</h2>
        <p>שלום,</p>
        <p>מנהל המערכת הזמין אותך להירשם למערכת אשדות בתפקיד: <strong>${roleText}</strong>.</p>
        <p>כתובת האימייל המאושרת להרשמה היא: <strong>${email}</strong>.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${registerUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">לחץ כאן להשלמת ההרשמה</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">קישור זה בתוקף ל-24 שעות הקרובות בלבד והוא מיועד לשימוש חד-פעמי.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 11px; color: #94a3b8;">אם הקישור אינו עובד, ניתן להעתיק את הכתובת הבאה לדפדפן: <br/> ${registerUrl}</p>
      </div>
    `,
  };

  // If SMTP_HOST is provided, attempt to send real email. Otherwise mock to console
  if (process.env.SMTP_HOST) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Real email sent successfully to ${email}`);
    } catch (err: any) {
      console.error(`❌ Failed to send email to ${email}:`, err.message);
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`✉️ MOCK EMAIL LOG (SMTP_HOST is not configured)`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Invitation Role: ${role}`);
    console.log(`Registration URL: ${registerUrl}`);
    console.log(`======================================================\n`);
  }
}

// Global Auth Middleware
function authMiddleware(req: any, res: any, next: any) {
  // 1. Bypass authorization for static assets (non-api routes)
  if (!req.path.startsWith('/api')) {
    return next();
  }

  // 2. Bypass authorization for public authentication/registration endpoints
  if (
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/register' ||
    req.path.startsWith('/api/auth/invitation/')
  ) {
    return next();
  }

  // 3. Extract and verify token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  req.user = decoded;

  // 4. Role Authorization Rule
  // If the request tries to modify resources (POST, PUT, DELETE) and the role is not ADMIN, block it
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && decoded.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required for modifications' });
  }

  next();
}

app.use(authMiddleware);

// --- AUTHENTICATION ENDPOINTS ---

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get invitation details (check validity)
app.get('/api/auth/invitation/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const invite = await prisma.invitation.findUnique({ where: { token } });
    if (!invite || invite.used || new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, error: 'Invitation link is invalid or has expired' });
    }
    res.json({ valid: true, role: invite.role, email: invite.email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Register endpoint using invitation token
app.post('/api/auth/register', async (req, res) => {
  const { token, username, password } = req.body;
  if (!token || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 1. Verify invitation token
    const invite = await prisma.invitation.findUnique({ where: { token } });
    if (!invite || invite.used || new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Invitation link is invalid or has expired' });
    }

    // 2. Check if username exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // 3. Check if email is already registered
    const existingEmail = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'כתובת אימייל זו כבר רשומה במערכת' });
    }

    // 4. Create user and mark invitation as used in transaction
    const newUser = await prisma.$transaction([
      prisma.user.create({
        data: {
          username,
          email: invite.email,
          password_hash: hashPassword(password),
          role: invite.role
        }
      }),
      prisma.invitation.update({
        where: { id: invite.id },
        data: { used: true }
      })
    ]);

    res.json({ success: true, user: { username: newUser[0].username, email: newUser[0].email, role: newUser[0].role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin generate registration invitation link and send email
app.post('/api/auth/invitation', async (req, res) => {
  const { role, email } = req.body;
  if (!role || !['ADMIN', 'READ_ONLY'].includes(role)) {
    return res.status(400).json({ error: 'Invalid or missing role' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'כתובת אימייל לא תקינה או חסרה' });
  }

  try {
    // Check if a user with this email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'משתמש עם כתובת אימייל זו כבר רשום במערכת' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

    const invite = await prisma.invitation.create({
      data: {
        token,
        email,
        role,
        expiresAt
      }
    });

    // Send the email
    await sendInvitationEmail(email, token, role);

    res.json(invite);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin view all users
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true }
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin delete a user (Admins cannot delete themselves)
app.delete('/api/auth/users/:id', async (req, res) => {
  const { id } = req.params;
  const loggedInUserId = req.user.id;

  if (id === loggedInUserId) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin view all invitations
app.get('/api/auth/invitations', async (req, res) => {
  try {
    const invites = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(invites);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin revoke/delete an invitation
app.delete('/api/auth/invitations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.invitation.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function seedDefaultAdmin() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Seeding initial default admin user...');
      await prisma.user.create({
        data: {
          username: 'admin',
          password_hash: hashPassword('admin'),
          role: 'ADMIN'
        }
      });
      console.log('Seeded default admin successfully! (admin / admin)');
    }
  } catch (err) {
    console.error('Error seeding default admin:', err);
  }
}


// Serve static assets from 'public' directory
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// --- RESIDENTS ---
app.get('/api/residents', async (req, res) => {
  const data = await prisma.residentApartment.findMany({
    where: { is_active: true },
    include: { building: true }
  });
  res.json(data);
});

app.post('/api/residents', async (req, res) => {
  const { building_number, units_per_building, rent, square_meters, ...rest } = req.body;
  const hNum = Number(building_number);
  
  let building = await prisma.building.findUnique({ where: { house_number: hNum } });
  if (!building) {
    building = await prisma.building.create({
      data: {
        id: String(hNum),
        house_number: hNum,
        map_x: 0,
        map_y: 0,
        units_per_building: units_per_building ? Number(units_per_building) : 1
      }
    });
  } else if (units_per_building) {
    building = await prisma.building.update({
      where: { id: building.id },
      data: { units_per_building: Number(units_per_building) }
    });
  }

  const newApt = await prisma.residentApartment.create({
    data: {
      ...rest,
      building_id: building.id,
      rent: rent ? Number(rent) : null,
      square_meters: square_meters ? Number(square_meters) : 0,
      is_active: true
    },
    include: { building: true }
  });
  res.json(newApt);
});

app.put('/api/residents/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.residentApartment.update({
    where: { id },
    data: req.body,
    include: { building: true }
  });
  res.json(data);
});

app.delete('/api/residents/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.residentApartment.update({
    where: { id },
    data: { is_active: false },
    include: { building: true }
  });
  res.json(data);
});

app.put('/api/residents/batch', async (req, res) => {
  const apartments = req.body;
  if (!Array.isArray(apartments)) return res.status(400).json({ error: 'Body must be an array' });

  try {
    const results = await Promise.all(
      apartments.map(apt => {
        const { id, building_id, building, ...rest } = apt;
        const updateData = { ...rest };
        if (updateData.rent !== undefined) updateData.rent = updateData.rent === null ? null : Number(updateData.rent);
        if (updateData.square_meters !== undefined) updateData.square_meters = updateData.square_meters === null ? null : Number(updateData.square_meters);
        return prisma.residentApartment.update({
          where: { id },
          data: updateData,
          include: { building: true }
        });
      })
    );
    res.json(results);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/residents/:id/split', async (req, res) => {
  const { id } = req.params;
  const target = await prisma.residentApartment.findUnique({ where: { id } });
  if (!target) return res.status(404).json({ error: 'Not found' });

  const newApt = await prisma.residentApartment.create({
    data: {
      building_id: target.building_id,
      apartment_name: `${target.apartment_name} - B`,
      floor: target.floor,
      tenant_name: target.tenant_name,
      owner_name: target.owner_name,
      rent: target.rent,
      arnona_id: target.arnona_id,
      water_id: target.water_id,
      contract_end: target.contract_end,
      is_linked: true,
      phone: target.phone,
      email: target.email,
      payment_dest: target.payment_dest,
      owner_type: target.owner_type,
      allocation_status: target.allocation_status,
      maintenance_log: target.maintenance_log,
      is_active: true
    },
    include: { building: true }
  });
  res.json(newApt);
});

// --- STUDENTS ---
app.put('/api/students/batch', async (req, res) => {
  const apartments = req.body;
  if (!Array.isArray(apartments)) return res.status(400).json({ error: 'Body must be an array' });

  try {
    const results = await Promise.all(
      apartments.map(apt => {
        const { id, building_id, building, ...rest } = apt;
        const updateData = { ...rest };
        if (updateData.rent !== undefined) updateData.rent = updateData.rent === null ? null : Number(updateData.rent);
        if (updateData.apartment_num !== undefined) updateData.apartment_num = Number(updateData.apartment_num);
        return prisma.studentApartment.update({
          where: { id },
          data: updateData,
          include: { building: true }
        });
      })
    );
    res.json(results);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students', async (req, res) => {
  const data = await prisma.studentApartment.findMany({
    where: { is_active: true },
    include: { building: true }
  });
  res.json(data);
});

app.post('/api/students', async (req, res) => {
  const { building_number, units_per_building, rent, apartment_num, ...rest } = req.body;
  const hNum = Number(building_number);

  let building = await prisma.building.findUnique({ where: { house_number: hNum } });
  if (!building) {
    building = await prisma.building.create({
      data: {
        id: String(hNum),
        house_number: hNum,
        map_x: 0,
        map_y: 0,
        units_per_building: units_per_building ? Number(units_per_building) : 1
      }
    });
  } else if (units_per_building) {
    building = await prisma.building.update({
      where: { id: building.id },
      data: { units_per_building: Number(units_per_building) }
    });
  }

  const newApt = await prisma.studentApartment.create({
    data: {
      ...rest,
      building_id: building.id,
      apartment_num: Number(apartment_num) || 1,
      rent: rent ? Number(rent) : null,
      is_active: true
    },
    include: { building: true }
  });
  res.json(newApt);
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.studentApartment.update({
    where: { id },
    data: req.body,
    include: { building: true }
  });
  res.json(data);
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.studentApartment.update({
    where: { id },
    data: { is_active: false },
    include: { building: true }
  });
  res.json(data);
});

// --- BUSINESSES ---
app.get('/api/businesses', async (req, res) => {
  const data = await prisma.business.findMany({ where: { is_active: true } });
  res.json(data);
});

app.post('/api/businesses', async (req, res) => {
  const { rent, square_meters, parcel_id, ...rest } = req.body;
  const newBiz = await prisma.business.create({
    data: {
      ...rest,
      rent: rent ? Number(rent) : null,
      square_meters: square_meters ? Number(square_meters) : null,
      parcel_id: Number(parcel_id) || 0,
      is_active: true
    }
  });
  res.json(newBiz);
});

app.put('/api/businesses/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.business.update({
    where: { id },
    data: req.body
  });
  res.json(data);
});

app.delete('/api/businesses/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.business.update({
    where: { id },
    data: { is_active: false }
  });
  res.json(data);
});

// --- EMPLOYEES ---
app.get('/api/employees', async (req, res) => {
  const data = await prisma.employee.findMany({ where: { is_active: true } });
  res.json(data);
});

app.post('/api/employees', async (req, res) => {
  const data = await prisma.employee.create({ data: req.body });
  res.json(data);
});

app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.employee.update({
    where: { id },
    data: req.body
  });
  res.json(data);
});

app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.employee.update({
    where: { id },
    data: { is_active: false }
  });
  res.json(data);
});

// --- EXPENSES ---
app.get('/api/expenses', async (req, res) => {
  const data = await prisma.expense.findMany({ where: { is_active: true } });
  res.json(data);
});

app.post('/api/expenses', async (req, res) => {
  const data = await prisma.expense.create({ data: req.body });
  res.json(data);
});

app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.expense.update({
    where: { id },
    data: req.body
  });
  res.json(data);
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.expense.update({
    where: { id },
    data: { is_active: false }
  });
  res.json(data);
});

// --- BUILDINGS / MAP ---
app.get('/api/buildings', async (req, res) => {
  const data = await prisma.building.findMany();
  res.json(data);
});

app.post('/api/buildings', async (req, res) => {
  const { house_number, map_x, map_y } = req.body;
  const hNum = Number(house_number);
  const building = await prisma.building.upsert({
    where: { house_number: hNum },
    update: { map_x: Number(map_x), map_y: Number(map_y) },
    create: {
      id: String(hNum),
      house_number: hNum,
      map_x: Number(map_x),
      map_y: Number(map_y),
      units_per_building: 1
    }
  });
  res.json(building);
});

app.put('/api/buildings/:id', async (req, res) => {
  const { id } = req.params;
  const { units_per_building } = req.body;
  const data = await prisma.building.update({
    where: { id },
    data: { units_per_building: Number(units_per_building) }
  });
  res.json(data);
});

// --- MAINTENANCE ---
app.get('/api/maintenance', async (req, res) => {
  const data = await prisma.maintenanceIssue.findMany({ where: { is_active: true } });
  res.json(data);
});

app.post('/api/maintenance', async (req, res) => {
  const payload = req.body;
  if (payload.cost !== undefined) payload.cost = Number(payload.cost);
  const data = await prisma.maintenanceIssue.create({ data: payload });
  res.json(data);
});

app.delete('/api/maintenance/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.maintenanceIssue.update({
    where: { id },
    data: { is_active: false }
  });
  res.json(data);
});

// --- EXPORT ---
app.get('/api/export/:type', async (req, res) => {
  const { type } = req.params;
  let data: any[] = [];
  if (type === 'Resident') data = await prisma.residentApartment.findMany({ where: { is_active: true } });
  else if (type === 'Student') data = await prisma.studentApartment.findMany({ where: { is_active: true } });
  else if (type === 'Business') data = await prisma.business.findMany({ where: { is_active: true } });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(type);
  
  if (data.length > 0) {
    sheet.columns = Object.keys(data[0]).map(key => ({ header: key, key: key }));
    data.forEach(row => sheet.addRow(row));
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${type}_Export.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
});

// Seed default expenses if database is empty
async function seedDefaultExpenses() {
  try {
    const count = await prisma.expense.count();
    if (count === 0) {
      console.log('Seeding initial system expenses...');
      await prisma.expense.createMany({
        data: [
          {
            category: 'עו"ד',
            description: 'ריטיינר ליווי משפטי שוטף',
            amount: 15000,
            frequency: 'חודשי',
            date: new Date()
          },
          {
            category: 'בינוי ואחזקה',
            description: 'שיפוץ מועדון לחבר ותשתיות מים',
            amount: 45000,
            frequency: 'חד פעמי',
            date: new Date()
          },
          {
            category: 'הוצאות מחשוב ותוכנות',
            description: 'רשיונות תוכנת ניהול קיבוץ ושרתים',
            amount: 8200,
            frequency: 'שנתי',
            date: new Date()
          }
        ]
      });
      console.log('Seeding completed successfully!');
    }
  } catch (err) {
    console.error('Error seeding default expenses:', err);
  }
}

// Wildcard route to serve index.html for frontend routing (Vite SPA)
app.get('*splat', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  await seedDefaultAdmin();
  await seedDefaultExpenses();
});
