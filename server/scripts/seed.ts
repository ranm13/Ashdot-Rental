import { PrismaClient } from '@prisma/client';
import { BD, AD, STU, BIZ } from '../../src/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.residentApartment.deleteMany({});
  await prisma.studentApartment.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.building.deleteMany({});

  console.log('Seeding Buildings...');
  // BD.b contains buildings, BD.p contains map coordinates
  for (const b of BD.b) {
    const coords = (BD.p as any)[b.h];
    const x = coords ? (coords[0] !== undefined ? coords[0] : coords.x) : 0;
    const y = coords ? (coords[1] !== undefined ? coords[1] : coords.y) : 0;
    
    await prisma.building.create({
      data: {
        id: String(b.h),
        house_number: b.h,
        map_x: Number(x),
        map_y: Number(y),
        units_per_building: b.u || 4
      }
    });
  }

  console.log('Seeding Resident Apartments...');
  for (const bId of Object.keys(AD)) {
    const apts = AD[bId as keyof typeof AD] as any[];
    for (const apt of apts) {
      await prisma.residentApartment.create({
        data: {
          building_id: String(bId),
          apartment_name: apt.n || '',
          floor: apt.f || '',
          tenant_name: apt.t || '',
          owner_name: apt.o || '',
          rent: apt.r ? Number(apt.r) : null,
          arnona_id: apt.ar || '',
          water_id: apt.w || '',
          contract_end: apt.contract_end || '',
          is_linked: Boolean(apt.linked),
          phone: apt.ph || '',
          email: apt.em || '',
          payment_dest: '',
          maintenance_log: '',
          is_active: true
        }
      });
    }
  }

  console.log('Seeding Student Apartments...');
  for (const s of STU) {
    // Ensure building exists
    const bExists = await prisma.building.findUnique({ where: { id: String(s.b) } });
    if (!bExists) {
      await prisma.building.create({
        data: {
          id: String(s.b),
          house_number: Number(s.b),
          map_x: 0,
          map_y: 0,
          units_per_building: 1
        }
      });
    }

    await prisma.studentApartment.create({
      data: {
        building_id: String(s.b),
        apartment_num: Number(s.d) || 1,
        tenant_name: s.tenant || '',
        rent: s.rent ? Number(s.rent) : null,
        arnona_id: s.ar || '',
        water_id: s.w || '',
        contract_end: s.contract_end || '',
        phone: s.ph || '',
        email: s.em || '',
        payment_dest: '',
        maintenance_log: '',
        is_active: true
      }
    });
  }

  console.log('Seeding Businesses...');
  for (const b of BIZ) {
    await prisma.business.create({
      data: {
        business_name: b.name || '',
        owner_name: b.owner || '',
        location: b.loc || '',
        parcel_id: Number(b.parcel) || 0,
        rent: b.rent ? Number(b.rent) : null,
        arnona_id: b.ar || '',
        water_id: b.w || '',
        contract_end: b.contract_end || '',
        phone: b.ph || '',
        email: b.em || '',
        status: b.status || 'לא התקבל דו"ח מרמ"י',
        maintenance_log: '',
        is_active: true
      }
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
