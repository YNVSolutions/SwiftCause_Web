// seedKiosks.js
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { faker } from '@faker-js/faker';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' }; // Path to your Firebase Admin SDK key

// --- 1. Initialize Firebase Admin SDK ---
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

async function seedKiosks() {
  try {
    // --- 2. Fetch campaign IDs ---
    const campaignsSnap = await db.collection('campaigns').get();
    if (campaignsSnap.empty) {
      console.log('No campaigns found. Add campaigns before running this script.');
      return;
    }
    const campaignIds = campaignsSnap.docs.map(doc => doc.id);

    // --- 3. Generate kiosks ---
    const kiosks = [];
    for (let i = 0; i < 10; i++) { // create 10 kiosks
      const assignedCount = faker.number.int({ min: 1, max: 5 });
      const assignedCampaigns = faker.helpers.arrayElements(campaignIds, assignedCount);
      const defaultCampaign = faker.helpers.arrayElement(assignedCampaigns);

      const kiosk = {
        id: faker.string.uuid(),
        name: `Kiosk ${faker.location.city()}-${faker.number.int({ min: 1, max: 99 })}`,
        location: faker.location.streetAddress({ useFullAddress: true }),
        status: faker.helpers.arrayElement(['online', 'offline', 'maintenance']),
        lastActive: faker.date.recent({ days: 10 }).toISOString(),
        totalDonations: faker.number.int({ min: 0, max: 500 }),
        totalRaised: faker.number.float({ min: 0, max: 5000, precision: 0.01 }),
        accessCode: faker.string.alphanumeric({ length: 6, casing: 'upper' }),
        qrCode: faker.image.dataUri({ width: 200, height: 200 }),

        assignedCampaigns,
        defaultCampaign,

        settings: {
          displayMode: faker.helpers.arrayElement(['grid', 'list', 'carousel']),
          showAllCampaigns: faker.datatype.boolean(),
          maxCampaignsDisplay: faker.number.int({ min: 1, max: 10 }),
          autoRotateCampaigns: faker.datatype.boolean(),
          rotationInterval: faker.number.int({ min: 5, max: 60 }),
        },

        deviceInfo: {
          model: faker.commerce.productName(),
          os: faker.helpers.arrayElement(['Android', 'Windows', 'Linux']),
          screenSize: `${faker.number.int({ min: 10, max: 20 })}"`,
          touchCapable: faker.datatype.boolean(),
        },

        operatingHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '10:00', close: '16:00' },
          sunday: { open: 'Closed', close: 'Closed' },
        },
      };

      kiosks.push(kiosk);
    }

    // --- 4. Insert into Firestore ---
    const batch = db.batch();
    kiosks.forEach(kiosk => {
      const ref = db.collection('kiosks').doc(kiosk.id);
      batch.set(ref, kiosk);
    });
    await batch.commit();

    console.log(`✅ Successfully added ${kiosks.length} kiosks`);
  } catch (error) {
    console.error('Error seeding kiosks:', error);
  }
}

seedKiosks();
