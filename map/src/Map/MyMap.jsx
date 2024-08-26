import L from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import * as firebaseOperations from '../Firebase/firebasehelper';
import SearchBar from './SearchBar';

const photoIcon = new L.Icon({
  iconUrl: './markercam.png',
  iconSize: [30, 30],
  iconAnchor: [20, 20],
  popupAnchor: [0, -40]
});

const MyMap = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);
  const [location, setLocation] = useState({ lat: null, long: null });
  const [error, setError] = useState('');

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude
          });
        },
        (error) => {
          setError("Unable to retrieve your location. Please enable location permissions.");
          console.error(error);
          setLocation({
            lat: 1.359167,
            long: 103.989441
          });
        }
      );
    } else {
      setLocation({
        lat: 1.359167,
        long: 103.989441
      });
    }
  };

  const fetchLocations = useCallback(async () => {
    const fetchedMarkers = await firebaseOperations.fetchLocations();
    setMarkers(fetchedMarkers);
  }, []);

  useEffect(() => {
    fetchCurrentLocation();
    fetchLocations();
  }, [fetchLocations]);

  const onDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.forEach(async (file) => {
      await firebaseOperations.uploadImageAndFetchLocations(file, firebaseOperations.getCountry, fetchLocations);
    });
  }, [fetchLocations]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const tileLayerUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-black dark:text-white">
      <div {...getRootProps()} className="p-5 text-center my-5 cursor-pointer bg-white dark:bg-gray-700 dark:text-white rounded-lg shadow-md transition-colors duration-200 w-[91%] hover:bg-gray-200 dark:hover:bg-gray-600">
        <input {...getInputProps()} />
        <p>Drag 'n' drop images here, or click to select images</p>
      </div>
      {location.lat && location.long && (
        <MapContainer center={[location.lat, location.long]} zoom={13} className="h-[80vh] w-[90vw] my-5">
          <TileLayer url={tileLayerUrl} />
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.lat, marker.lng]}
              icon={photoIcon}
              eventHandlers={{
                click: () => {
                  sessionStorage.setItem('lat', marker.lat);
                  sessionStorage.setItem('lng', marker.lng);
                  navigate('/memories');
                },
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                }
              }}
            >
              <Popup>Click the marker to see all images.</Popup>
            </Marker>
          ))}
          <SearchBar />
        </MapContainer>
      )}
    </div>
  );
};

export default MyMap;
