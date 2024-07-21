import React from 'react';
import { useParams } from 'react-router-dom';

const TestPage = () => {
  const { lat, lng } = useParams();

  return (
    <div>
      <h1>Test Page</h1>
      <p>Latitude: {lat}</p>
      <p>Longitude: {lng}</p>
    </div>
  );
};

export default TestPage;
