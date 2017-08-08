const listOfServices = [
    {
        "id": "service:1",
        "service": "Full Set - Natural",
        "price": 50
    },
    {
        "id": "service:2",
        "service": "Full Set - Dense",
        "price": 60
    },
    {
        "id": "service:3",
        "service": "Touch Up - Natural",
        "price": 20
    },
    {
        "id": "service:4",
        "service": "Touch Up - Dense",
        "price": 25
    },
    {
        "id": "service:5",
        "service": "Removal",
        "price": 10
    },
    {
        "id": "service:6",
        "service": "Radiance Facial",
        "price": 50
    },
    {
        "id": "service:7",
        "service": "Brazilian Waxing",
        "price": 40
    },
    {
        "id": "service:8",
        "service": "Full Leg Waxing",
        "price": 35
    },
    {
        "id": "service:9",
        "service": "Half Leg Waxing",
        "price": 20
    },
    {
        "id": "service:10",
        "service": "Full Arm Waxing",
        "price": 25
    },
    {
        "id": "service:11",
        "service": "Half Arm Waxing",
        "price": 15
    },
    {
        "id": "service:12",
        "service": "Under Arm Waxing",
        "price": 15
    },
    {
        "id": "service:13",
        "service": "Full Face Waxing",
        "price": 30
    },
    {
        "id": "service:14",
        "service": "Upper Lip Waxing",
        "price": 6
    },
    {
        "id": "service:15",
        "service": "Lower Lip Waxing",
        "price": 4
    },
    {
        "id": "service:16",
        "service": "Eyebrow Threading",
        "price": 5
    },
    {
        "id": "service:17",
        "service": "Lower Lip Threading",
        "price": 3
    },
    {
        "id": "service:18",
        "service": "Upper Lip Threading",
        "price": 2
    },
    {
        "id": "service:19",
        "service": "Eye Mask",
        "price": 5
    },
    {
        "id": "service:20",
        "service": "Brush",
        "price": 1
    },
    {
        "id": "service:21",
        "service": "Others",
        "price": 0
    }
]

const mapOfServices = { 'service:1': { id: 'service:1', service: 'Full Set - Natural', price: 50 },
  'service:2': { id: 'service:2', service: 'Full Set - Dense', price: 60 },
  'service:3': { id: 'service:3', service: 'Touch Up - Natural', price: 20 },
  'service:4': { id: 'service:4', service: 'Touch Up - Dense', price: 25 },
  'service:5': { id: 'service:5', service: 'Removal', price: 10 },
  'service:6': { id: 'service:6', service: 'Radiance Facial', price: 50 },
  'service:7': { id: 'service:7', service: 'Brazilian Waxing', price: 40 },
  'service:8': { id: 'service:8', service: 'Full Leg Waxing', price: 35 },
  'service:9': { id: 'service:9', service: 'Half Leg Waxing', price: 20 },
  'service:10': { id: 'service:10', service: 'Full Arm Waxing', price: 25 },
  'service:11': { id: 'service:11', service: 'Half Arm Waxing', price: 15 },
  'service:12': { id: 'service:12', service: 'Under Arm Waxing', price: 15 },
  'service:13': { id: 'service:13', service: 'Full Face Waxing', price: 30 },
  'service:14': { id: 'service:14', service: 'Upper Lip Waxing', price: 6 },
  'service:15': { id: 'service:15', service: 'Lower Lip Waxing', price: 4 },
  'service:16': { id: 'service:16', service: 'Eyebrow Threading', price: 5 },
  'service:17': { id: 'service:17', service: 'Lower Lip Threading', price: 3 },
  'service:18': { id: 'service:18', service: 'Upper Lip Threading', price: 2 },
  'service:19': { id: 'service:19', service: 'Eye Mask', price: 5 },
  'service:20': { id: 'service:20', service: 'Brush', price: 1 },
  'service:21': { id: 'service:21', service: 'Others', price: 0 } }

export {listOfServices, mapOfServices};
export default {
    mapOfServices,
    listOfServices
}