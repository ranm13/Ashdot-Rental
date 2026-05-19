import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import 'dotenv/config';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// --- RESIDENTS ---
app.get('/api/residents', async (req, res) => {
  const data = await prisma.residentApartment.findMany({ where: { is_active: true } });
  res.json(data);
});

app.put('/api/residents/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.residentApartment.update({
    where: { id },
    data: req.body
  });
  res.json(data);
});

app.delete('/api/residents/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.residentApartment.update({
    where: { id },
    data: { is_active: false }
  });
  res.json(data);
});

app.put('/api/residents/batch', async (req, res) => {
  const apartments = req.body;
  if (!Array.isArray(apartments)) return res.status(400).json({ error: 'Body must be an array' });

  try {
    const results = await Promise.all(
      apartments.map(apt => {
        const { id, building_id, ...rest } = apt;
        const updateData = { ...rest };
        if (updateData.rent !== undefined) updateData.rent = updateData.rent === null ? null : Number(updateData.rent);
        if (updateData.square_meters !== undefined) updateData.square_meters = updateData.square_meters === null ? null : Number(updateData.square_meters);
        return prisma.residentApartment.update({
          where: { id },
          data: updateData
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
      maintenance_log: target.maintenance_log,
      is_active: true
    }
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
        const { id, building_id, ...rest } = apt;
        const updateData = { ...rest };
        if (updateData.rent !== undefined) updateData.rent = updateData.rent === null ? null : Number(updateData.rent);
        if (updateData.apartment_num !== undefined) updateData.apartment_num = Number(updateData.apartment_num);
        return prisma.studentApartment.update({
          where: { id },
          data: updateData
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
  const data = await prisma.studentApartment.findMany({ where: { is_active: true } });
  res.json(data);
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.studentApartment.update({
    where: { id },
    data: req.body
  });
  res.json(data);
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const data = await prisma.studentApartment.update({
    where: { id },
    data: { is_active: false }
  });
  res.json(data);
});

// --- BUSINESSES ---
app.get('/api/businesses', async (req, res) => {
  const data = await prisma.business.findMany({ where: { is_active: true } });
  res.json(data);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  await seedDefaultExpenses();
});
