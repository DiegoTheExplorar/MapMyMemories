import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase-config';


export const fetchEntriesByCountry = async (country) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const q = query(locationsRef, where("country", "==", country));
      const querySnapshot = await getDocs(q);
      const allImages = querySnapshot.docs.flatMap(doc => doc.data().images);
      return allImages;
    } else {
      console.log("User not signed in");
      return [];
    }
  };

  export const fetchUniqueCountries = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const locationsRef = collection(db, `users/${userId}/locations`);
      const querySnapshot = await getDocs(locationsRef);
      const allCountries = querySnapshot.docs.map(doc => doc.data().country);
      const uniqueCountries = [...new Set(allCountries)]; // Ensure uniqueness
      return uniqueCountries;
    } else {
      console.log("User not signed in");
      return [];
    }
  };
  
