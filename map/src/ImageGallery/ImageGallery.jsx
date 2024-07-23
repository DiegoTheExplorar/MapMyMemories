import { getAuth } from 'firebase/auth';
import { collection, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import './ImageGallery.css';
const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const auth = getAuth();

    useEffect(() => {
        const fetchImages = async () => {
            const user = auth.currentUser;
            if (user) {
                const userId = user.uid;
                const userDocRef = collection(db, `users/${userId}/locations`);
                const q = query(userDocRef);
                const querySnapshot = await getDocs(q);
                const allImages = querySnapshot.docs.flatMap(doc => doc.data().images);
                setImages(allImages);
            }
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
