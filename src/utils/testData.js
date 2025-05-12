const db = require('./db');

const services = {
  services: [
    {
      id: 'service1',
      service: 'Haircut',
      price: 50.00,
      duration: 30,
      enabled: true
    },
    {
      id: 'service2',
      service: 'Color',
      price: 120.00,
      duration: 120,
      enabled: true
    },
    {
      id: 'service3',
      service: 'Style',
      price: 40.00,
      duration: 45,
      enabled: true
    }
  ]
};

const appointments = [
  {
    id: 'appt:1',
    name: 'John Doe',
    mobile: '+6591234567',
    start: '2024-05-12T10:00:00Z',
    end: '2024-05-12T11:00:00Z',
    services: [services.services[0]],
    status: 'confirmed',
    resourceName: 'Stylist A',
    totalAmount: 50.00,
    deposit: 10.00,
    createdAt: '2024-05-11T15:00:00Z'
  },
  {
    id: 'appt:2',
    name: 'Jane Smith',
    mobile: '+6591234568',
    start: '2024-05-12T14:00:00Z',
    end: '2024-05-12T16:00:00Z',
    services: [services.services[1]],
    status: 'confirmed',
    resourceName: 'Stylist B',
    totalAmount: 120.00,
    deposit: 30.00,
    createdAt: '2024-05-11T16:00:00Z'
  }
];

async function initializeTestData() {
  try {
    // Initialize services
    await db.upsert('config:services', services);
    
    // Initialize appointments
    for (const appointment of appointments) {
      await db.upsert(appointment.id, appointment);
    }
    
    console.info('Test data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize test data:', error);
    throw error;
  }
}

module.exports = {
  initializeTestData,
  services,
  appointments
}; 