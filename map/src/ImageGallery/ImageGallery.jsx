import React, { useEffect, useState } from 'react';
import { fetchUserImages } from '../Firebase/firebasehelper';
import './ImageGallery.css';

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
        <div className="gallery-container">
            {images.length > 0 ? (
                images.map((image, index) => (
                    <div key={index} className="image-item">
                        <img src={image} alt={`Item ${index}`} />
                    </div>
                ))
            ) : (
                <div>No images available.</div>
            )}
        </div>
    );
};

export default ImageGallery;
