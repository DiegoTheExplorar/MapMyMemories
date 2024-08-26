import axios from 'axios';
import imageCompression from 'browser-image-compression';
import exifr from 'exifr';
import { getAuth } from 'firebase/auth';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { db } from './firebase-config';

export const fetchImagesByLocation = async (lat, lng) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userId = user.uid;
    const userDocRef = collection(db, `users/${userId}/locations`);
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const q = query(userDocRef, where("latitude", "==", latNum), where("longitude", "==", lngNum));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const allImages = querySnapshot.docs.flatMap(doc => doc.data().images);
      const address = querySnapshot.docs[0].data().address || 'Address not found';
      return { allImages, address };
    } else {
      console.log("No images found at this location.");
      return { allImages: [], address: 'Address not found' };
    }
  } else {
    return { allImages: [], address: 'Address not found' };
  }
};

export const uploadImageAndFetchLocations = async (file, getCountry, fetchLocations) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to upload images.");
    return;
  }
  const userId = user.uid;

  try {
    const gpsData = await exifr.gps(file);
    if (!gpsData || !gpsData.latitude || !gpsData.longitude) {
      console.error('Could not extract GPS coordinates from the image.');
      alert('Could not extract GPS coordinates from the image.');
      return;
    }
    const { latitude, longitude } = gpsData;
    console.log('Got coords', latitude, longitude);

    const options = {
      maxSizeMB: 1, // Maximum file size in MB
      maxWidthOrHeight: 1920, // Max width/height the image should be resized to
      useWebWorker: true, // Use a web worker for faster processing
      fileType: 'image/webp' // Convert to WebP format
    };
    const compressedFile = await imageCompression(file, options);
    console.log('Compressed the image');
    const storage = getStorage();
    const storageRef = ref(storage, `images/${userId}/${compressedFile.name}`);
    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Got the image URL and uploaded to storage');

    const userDocRef = doc(db, "users", userId);
    const locationsRef = collection(userDocRef, "locations");
    const locQuery = query(locationsRef, where("latitude", "==", latitude), where("longitude", "==", longitude));
    const locQuerySnapshot = await getDocs(locQuery);

    if (!locQuerySnapshot.empty) {
      const locDoc = locQuerySnapshot.docs[0];
      await updateDoc(doc(locationsRef, locDoc.id), {
        images: arrayUnion(downloadURL)
      });
    } else {
      const { country, address } = await getCountry(latitude, longitude);
      console.log(country, address);
      await addDoc(locationsRef, {
        latitude,
        longitude,
        images: [downloadURL],
        timestamp: new Date().getTime(),
        country,
        address
      });
    }

    alert('Image successfully added!');
    fetchLocations();
  } catch (error) {
    console.error('Error uploading image and fetching locations:', error);
  }
};

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

export const fetchLocations = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const userDocRef = doc(db, "users", userId);
    const locationsRef = collection(userDocRef, "locations");
    const querySnapshot = await getDocs(locationsRef);
    const fetchedMarkers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      lat: doc.data().latitude,
      lng: doc.data().longitude,
      images: doc.data().images
    }));
    return fetchedMarkers;
  } else {
    console.log("User not signed in");
    return [];
  }
};

export const getCountry = async (lat, long) => {
  try {
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C${long}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`);
    const results = response.data.results;
    if (results.length > 0) {
      const country = results[0].components.country;
      const address = results[0].formatted;
      return { country, address };
    }
    return null;
  } catch (error) {
    console.error('Error fetching country:', error);
    return null;
  }
};

export const fetchUserImages = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const userDocRef = collection(db, `users/${userId}/locations`);
    const q = query(userDocRef);
    const querySnapshot = await getDocs(q);
    const allImages = querySnapshot.docs.flatMap(doc => doc.data().images);
    return allImages;
  } else {
    return [];
  }
};

export const deleteImage = async (imageUrl) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
      alert("Please sign in to delete images.");
      return;
  }
  const userId = user.uid;

  try {
      // Get the reference to the image in Firebase Storage using its URL
      const storage = getStorage();
      const imageRef = ref(storage, imageUrl);

      // Delete the image from Firebase Storage
      await deleteObject(imageRef);
      console.log('Image deleted from storage');

      // Remove the image URL from Firestore
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const locationDocs = await getDocs(locationsRef);

      for (const docSnapshot of locationDocs.docs) {
          const data = docSnapshot.data();
          if (data.images && data.images.includes(imageUrl)) {
              const locationDocRef = doc(locationsRef, docSnapshot.id);
              await updateDoc(locationDocRef, {
                  images: arrayRemove(imageUrl)
              });
              console.log(`Image URL removed from Firestore in document: ${docSnapshot.id}`);

              // If the images array is empty after removal, delete the document
              const updatedDoc = await getDoc(locationDocRef);
              const updatedImages = updatedDoc.data().images;
              if (updatedImages.length === 0) {
                  await deleteDoc(locationDocRef);
                  console.log(`Document ${docSnapshot.id} deleted because images array is empty`);
              }
          }
      }

      alert('Image successfully deleted!');
  } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete the image. Please try again.');
  }
};