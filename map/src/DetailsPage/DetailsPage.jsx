import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase-config';
import './DetailsPage.css';

const DetailsPage = () => {
  const { lat, lng } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [address, setAddress] = useState('Address not found');
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
          setAddress(querySnapshot.docs[0].data().address || 'Address not found');
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

  return (
    <div className="container">
      <h1 className="header">Images at {address}</h1>
      {images.length > 0 ? (
        <div className="image-carousel">
          <img src={images[currentImage]} alt="Slideshow" />
          {images.length > 1 && (
            <div className="carousel-controls">
              <button onClick={prevImage}>Previous</button>
              <button onClick={nextImage}>Next</button>
            </div>
          )}
        </div>
      ) : (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;
