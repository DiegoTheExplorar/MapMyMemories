import React, { useEffect, useState } from 'react';
import { fetchEntriesByCountry, fetchUniqueCountries } from '../Firebase/firebasehelper';

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
      <div className='flex justify-center items-center my-8 text-lg'>
        <label className='mr-4'>Choose a country:</label>
        <select
          id="dropdown"
          value={selectedOption}
          onChange={handleChange}
          className="w-64 p-2 rounded-md border-2 border-blue-500 bg-white dark:bg-gray-700 dark:text-white cursor-pointer shadow transition-colors duration-300 focus:border-blue-700 focus:shadow-lg"
        >
          <option value="" disabled>Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <img src={image} alt={`Item ${index}`} className="w-full h-auto transition-transform duration-300 hover:scale-110" />
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
