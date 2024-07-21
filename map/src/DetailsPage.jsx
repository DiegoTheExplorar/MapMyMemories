import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from './firebase-config';
const DetailsPage = () => {
  const { lat, lng } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchImages = async () => {
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
          setImages(allImages);
        } else {
          console.log("No images found at this location.");
        }
      }
    };

    fetchImages();
  }, [lat, lng]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const toMap = async () => {
    navigate('/map');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1>Images at Latitude: {lat}, Longitude: {lng}</h1>
      {images.length > 0 ? (
        <div>
          <img src={images[currentImage]} alt="Slideshow image" style={{ maxWidth: "20%", height: 'auto', display: 'block', margin: 'auto' }} />
          <div style={{ marginTop: '10px' }}>
            <button onClick={prevImage} style={{ marginRight: '5px' }}>Previous</button>
            <button onClick={nextImage}>Next</button>
          </div>
        </div>
      ) : (
        <p>No images available for this location.</p>
      )}
      <button onClick={toMap} style={{ marginTop: '10px' }}>Back to Map</button>
    </div>
  );
};

export default DetailsPage;
