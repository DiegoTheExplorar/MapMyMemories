import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchImagesByLocation } from '../Firebase/firebasehelper';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <h1 className="text-3xl mb-4">{`Images at ${address}`}</h1>
      {images.length > 0 ? (
        <div className="relative">
          <img src={images[currentImage]} alt="Slideshow" className="w-full h-80 object-cover rounded-lg shadow-lg" />
          {images.length > 1 && (
            <div className="flex mt-2">
              <button onClick={prevImage} className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Previous</button>
              <button onClick={nextImage} className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Next</button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-80">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;
