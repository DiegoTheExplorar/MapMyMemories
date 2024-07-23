import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import L from 'leaflet';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase-config';
import HamburgerMenu from '../HamburgerMenu/Hamburger';
import './MyMap.css';
import SearchBar from './SearchBar';

const photoIcon = new L.Icon({
  iconUrl: './camera.png',
  iconSize: [20, 20], // Size of the icon
  iconAnchor: [20, 20], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
});

const MyMap = () => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);
  const [location, setLocation] = useState({ lat: null, long: null });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocation = () => {
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

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocations = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const querySnapshot = await getDocs(locationsRef);
      const fetchedMarkers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        lat: doc.data().latitude,
        lng: doc.data().longitude,
        images: doc.data().images
      }));
      setMarkers(fetchedMarkers);
    }
  };

  const getCountry = async (lat, long) => {
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C${long}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`);
      const results = response.data.results; // Access the results array
      if (results.length > 0) {
        const country = results[0].components.country; // Access the country field
        return country;
      }
      return null; // Return null if no results are found
    } catch (error) {
      console.error('Error fetching country:', error);
      return null; // Return null in case of an error
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to upload images.");
      return;
    }
    const userId = user.uid;
    acceptedFiles.forEach(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('https://travelphoto-4c6a27f33f4a.herokuapp.com/upload', formData);
      const { latitude, longitude } = response.data;
      const storage = getStorage();
      const storageRef = ref(storage, `images/${userId}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const locQuery = query(locationsRef, where("latitude", "==", latitude), where("longitude", "==", longitude));
      const locQuerySnapshot = await getDocs(locQuery);
      const country = await getCountry(latitude, longitude); // Await the country value here
      if (!locQuerySnapshot.empty) {
        const locDoc = locQuerySnapshot.docs[0];
        await updateDoc(doc(locationsRef, locDoc.id), {
          images: arrayUnion(downloadURL)
        });
      } else {
        await addDoc(locationsRef, {
          latitude,
          longitude,
          images: [downloadURL],
          timestamp: new Date().getTime(),
          country // Use the awaited country value here
        });
      }
      alert('Image successfully added!');
      fetchLocations(); // Refresh markers
    });
  }, []);

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
