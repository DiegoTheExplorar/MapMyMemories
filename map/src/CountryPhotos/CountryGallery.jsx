import React, { useEffect, useState } from 'react';
import { fetchEntriesByCountry, fetchUniqueCountries } from '../Firebase/firebasehelper';
import './CountryGallery.css';
const CountryGallery = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [options, setOptions] = useState([]);
  const [images, setImages] = useState([]);

  const handleChange = async (event) => {
    const country = event.target.value;
    setSelectedOption(country);
    const fetchedImages = await fetchEntriesByCountry(country);
    setImages(fetchedImages);
  };

  useEffect(() => {
    const getCountries = async () => {
      const countries = await fetchUniqueCountries();
      setOptions(countries);
    };

    getCountries();
  }, []);

  return (
    <div>
      <div className='option-box'>
        <label className='label'>Choose a country:</label>
        <select id="dropdown" value={selectedOption} onChange={handleChange}>
          <option value="" disabled>Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="gallery-container">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="image-item">
              <img src={image} alt={`Item ${index}`} />
            </div>
          ))
        ) : (
          selectedOption !== '' && <div>No images available.</div>
        )}
      </div>
    </div>
  );
};

export default CountryGallery;
