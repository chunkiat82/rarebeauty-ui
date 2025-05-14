const AutoSortingArray = require('auto-sorting-array').default;

// Test with some sample data
const listOfServices = [
  { id: 'service:1-2024', name: 'Full Lash Service 1', followUp: 'service:4-2024', price: 100 },
  { id: 'service:2-2024', name: 'Full Lash Service 2', followUp: 'service:5-2024', price: 120 },
  { id: 'service:3-2024', name: 'Full Lash Service 3', followUp: 'service:6-2024', price: 150 },
  { id: 'service:4-2024', name: 'Lash Touch Up 1', price: 60 },
  { id: 'service:5-2024', name: 'Lash Touch Up 2', price: 70 },
  { id: 'service:6-2024', name: 'Lash Touch Up 3', price: 80 }
];

try {
  console.log('Creating AutoSortingArray instance...');
  const services = new AutoSortingArray(listOfServices, 'id');
  console.log('AutoSortingArray instance created successfully');
  
  // Test lookups
  console.log('Looking up service:1-2024...');
  const service = services.peekByKey('service:1-2024');
  console.log('Service found:', service);
  
  console.log('Looking up followUp service...');
  const followUpService = services.peekByKey(service.followUp);
  console.log('Follow up service found:', followUpService);
  
  console.log('All tests passed!');
} catch (error) {
  console.error('Error testing AutoSortingArray:', error);
} 