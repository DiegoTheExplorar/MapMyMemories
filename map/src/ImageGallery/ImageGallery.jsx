import React, { useEffect, useRef, useState } from 'react';
import { deleteImage, fetchUserImages } from '../Firebase/firebasehelper';

const ImageGallery = () => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null); // To track the image being interacted with
    const longPressTimeout = useRef(null); // Use useRef to store the timeout ID

    useEffect(() => {
        const fetchImages = async () => {
            const allImages = await fetchUserImages();
            setImages(allImages);
        };

        fetchImages();
    }, []);

    const handleLongPress = (image) => {
        setSelectedImage(image);
    };

    const handleRightClick = (event, image) => {
        event.preventDefault(); // Prevent the default right-click context menu
        setSelectedImage((prevImage) => (prevImage === image ? null : image)); // Toggle selection
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this image?');
        if (confirmed) {
            await deleteImage(selectedImage); // Delete the image
            setImages(images.filter((img) => img !== selectedImage)); // Remove the image from state
            setSelectedImage(null); // Reset the selected image
        }
    };

    const handleTouchStart = (image) => {
        longPressTimeout.current = setTimeout(() => handleLongPress(image), 800); // 800ms for long press
    };

    const handleTouchEnd = () => {
        clearTimeout(longPressTimeout.current);
    };

    const handleUnselect = (event) => {
        // Deselect the image if the user clicks outside the selected image
        if (selectedImage && !event.target.closest('.image-item')) {
            setSelectedImage(null);
        }
    };

    useEffect(() => {
        if (selectedImage) {
            document.addEventListener('click', handleUnselect);
        } else {
            document.removeEventListener('click', handleUnselect);
        }

        return () => {
            document.removeEventListener('click', handleUnselect);
        };
    }, [selectedImage]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {images.length > 0 ? (
                images.map((image, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl image-item"
                        onTouchStart={() => handleTouchStart(image)}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={() => handleTouchStart(image)}
                        onMouseUp={handleTouchEnd}
                        onContextMenu={(event) => handleRightClick(event, image)} // Handle right-click
                    >
                        <img src={image} alt={`Item ${index}`} className="w-full h-auto transition-transform duration-300 hover:scale-110" />
                        {selectedImage === image && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                    Delete Image
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div>No images available.</div>
            )}
        </div>
    );
};

export default ImageGallery;
