import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';


const fetchEntriesByCountry = async (country) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const q = query(locationsRef, where("country", "==", country));
      const querySnapshot = await getDocs(q);
      console.log("Entries with country", country, ":", querySnapshot.docs.map(doc => doc.data()));
    } else {
      console.log("User not signed in");
    }
  };

export default fetchEntriesByCountry;