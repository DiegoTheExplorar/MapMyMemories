import React, { useEffect, useState } from 'react';
import { fetchUserImages } from '../Firebase/firebasehelper';

const ImageGallery = () => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            const allImages = await fetchUserImages();
            setImages(allImages);
        };

        fetchImages();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {images.length > 0 ? (
                images.map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <img src={image} alt={`Item ${index}`} className="w-full h-auto transition-transform duration-300 hover:scale-110" />
                    </div>
                ))
            ) : (
                <div>No images available.</div>
            )}
        </div>
    );
};

export default ImageGallery;

