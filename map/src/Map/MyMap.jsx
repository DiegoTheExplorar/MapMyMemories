import L from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import * as firebaseOperations from '../Firebase/firebasehelper';
import HamburgerMenu from '../HamburgerMenu/Hamburger';
import './MyMap.css';
import SearchBar from './SearchBar';

const photoIcon = new L.Icon({
  iconUrl: './camera.png',
  iconSize: [20, 20],
  iconAnchor: [20, 20],
  popupAnchor: [0, -40]
});

const MyMap = () => {
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

  return (
    <div className="app-container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag 'n' drop images here, or click to select images</p>
      </div>
      {location.lat && location.long && (
        <MapContainer center={[location.lat, location.long]} zoom={13} className="map-container">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.lat, marker.lng]}
              icon={photoIcon}
              eventHandlers={{
                click: () => navigate(`/details/${marker.lat}/${marker.lng}`),
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
      <HamburgerMenu />
    </div>
  );
};

export default MyMap;
