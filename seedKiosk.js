// seedKiosks.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { faker } from '@faker-js/faker';

// --- 1. Your Web SDK Firebase config ---

// --- 2. Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedKiosks() {
  // --- 3. Fetch existing campaigns ---
  const campaignsSnap = await getDocs(collection(db, 'campaigns'));
  if (campaignsSnap.empty) {
    console.log('No campaigns found in Firestore.');
    return;
  }
  const campaignIds = campaignsSnap.docs.map(doc => doc.id);

  // --- 4. Create kiosks ---
  for (let i = 0; i < 10; i++) {
    const assignedCampaigns = faker.helpers.arrayElements(campaignIds, faker.number.int({ min: 1, max: 5 }));
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

    await addDoc(collection(db, 'kiosks'), kiosk);
    console.log(`✅ Added kiosk: ${kiosk.name}`);
  }

  console.log('🎯 All kiosks added successfully.');
}

seedKiosks();
