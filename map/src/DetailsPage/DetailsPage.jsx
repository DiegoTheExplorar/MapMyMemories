import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { fetchImagesByLocation } from '../Firebase/firebasehelper';

const DetailsPage = () => {
  const [images, setImages] = useState([]);
  const [address, setAddress] = useState('Address not found');

  useEffect(() => {
    const fetchImages = async () => {
      // Retrieve lat and lng from session storage or another state management solution
      const lat = sessionStorage.getItem('lat');
      const lng = sessionStorage.getItem('lng');

      if (lat && lng) {
        const { allImages, address } = await fetchImagesByLocation(lat, lng);
        setImages(allImages);
        setAddress(address);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-5">
      <h1 className="text-2xl md:text-3xl mb-2 md:mb-4 text-gray-800 dark:text-gray-200 text-center">View your memories at</h1>
      <h2 className="text-xl md:text-2xl mb-4 text-gray-800 dark:text-gray-200 text-center break-words max-w-xs sm:max-w-lg">{address}</h2>
      {images.length > 0 ? (
        <div className="w-full max-w-3xl md:max-w-5xl">
          <Carousel showThumbs={false} infiniteLoop useKeyboardArrows>
            {images.map((image, index) => (
              <div key={index} className="flex items-center justify-center">
                <img src={image} alt={`Slide ${index}`} className="w-full h-[300px] md:h-[500px] object-contain rounded-lg shadow-lg" />
              </div>
            ))}
          </Carousel>
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
