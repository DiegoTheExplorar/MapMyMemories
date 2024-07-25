import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchImagesByLocation } from '../Firebase/firebasehelper';
import './DetailsPage.css';

const DetailsPage = () => {
  const { lat, lng } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [address, setAddress] = useState('Address not found');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      const { allImages, address } = await fetchImagesByLocation(lat, lng);
      setImages(allImages);
      setAddress(address);
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
