const mapOfServices = {
    'service:1': { id: 'service:1', service: 'Full Set - Natural', price: 50, duration: 70 },
    'service:2': { id: 'service:2', service: 'Full Set - Dense', price: 60, duration: 70 },
    'service:3': { id: 'service:3', service: 'Touch Up - Natural', price: 20, duration: 25 },
    'service:4': { id: 'service:4', service: 'Touch Up - Dense', price: 25, duration: 25 },
    'service:5': { id: 'service:5', service: 'Eye Mask', price: 5, duration: 0 },
    'service:6': { id: 'service:6', service: 'Removal', price: 10, duration: 25 },
    'service:7': { id: 'service:7', service: 'Radiance Facial', price: 50, duration: 60 },
    'service:8': { id: 'service:8', service: 'Brazilian Waxing', price: 40, duration: 30 },
    'service:9': { id: 'service:9', service: 'Full Leg Waxing', price: 35, duration: 20 },
    'service:10': { id: 'service:10', service: 'Half Leg Waxing', price: 20, duration: 15 },
    'service:11': { id: 'service:11', service: 'Full Arm Waxing', price: 25, duration: 20 },
    'service:12': { id: 'service:12', service: 'Half Arm Waxing', price: 15, duration: 15 },
    'service:13': { id: 'service:13', service: 'Under Arm Waxing', price: 15, duration: 15 },
    'service:14': { id: 'service:14', service: 'Full Face Waxing', price: 30, duration: 20 },
    'service:15': { id: 'service:15', service: 'Upper Lip Waxing', price: 6, duration: 5 },
    'service:16': { id: 'service:16', service: 'Lower Lip Waxing', price: 4, duration: 5 },
    'service:17': { id: 'service:17', service: 'Eyebrow Threading', price: 5, duration: 5 },
    'service:18': { id: 'service:18', service: 'Full Face Threading', price: 20, duration: 30 },
    'service:19': { id: 'service:19', service: 'Upper Lip Threading', price: 3, duration: 5 },
    'service:20': { id: 'service:20', service: 'Lower Lip Threading', price: 2, duration: 5 },
    'service:21': { id: 'service:21', service: 'Eye Mask', price: 5, duration: 0 },
    'service:22': { id: 'service:22', service: 'Others', price: 0, duration: 0 }
}

const listOfServices = [];
Object.keys(mapOfServices).map(item => {
    listOfServices[listOfServices.length] = mapOfServices[item];
})
// console.log(JSON.stringify(arrays, null, 2));

export { listOfServices, mapOfServices };
export default {
    mapOfServices,
    listOfServices
}