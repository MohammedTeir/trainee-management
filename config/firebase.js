// Import the functions you need from the SDKs you need
const {initializeApp} = require('firebase/app');
const  {getStorage, ref , getDownloadURL   , getMetadata , deleteObject  , uploadBytesResumable} = require('firebase/storage');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const serviceAccount = require('../keys/it-training-management-firebase-adminsdk-5hecb-1e105be5cc.json');


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYR37THhWTNtewwZIxeDo88pwzBmNC5kI",
  authDomain: "it-training-management.firebaseapp.com",
  projectId: "it-training-management",
  storageBucket: "it-training-management.appspot.com",
  messagingSenderId: "912323373508",
  appId: "1:912323373508:web:24b51e5d43a031e941dc91",
  measurementId: "G-6FDM5MX16T",
  databaseURL:"https://it-training-management-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

//   const App = initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: firebaseConfig.databaseURL,
//   storageBucket: firebaseConfig.storageBucket
// });

// Get the initialized Firebase Admin SDK services


// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);


module.exports = {
  storage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
  getMetadata,
  };