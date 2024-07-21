import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { db } from './firebase-config';

const SearchBar = () => {
  const map = useMap();

  useEffect(() => {
    // Define a red marker icon
    const redIcon = new L.DivIcon({
      className: 'custom-icon', // Custom class for styling
      html: '<div style="background-color: red; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white;"></div>', // HTML and CSS for red icon
      iconSize: [32, 32], // Size of the icon
      iconAnchor: [16, 32], // Anchor point of the icon
      popupAnchor: [0, -32] // Popup anchor relative to the iconAnchor
    });

    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: true,
      showPopup: false,
      marker: {
        icon: redIcon, // Use the red marker icon here
        draggable: false,
      },
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Enter address',
      keepResult: true
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

const photoIcon = new L.Icon({
  iconUrl: '/vite.svg',
  iconSize: [40, 40], // Size of the icon
  iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
});

const MyMap = () => {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetchLocations();
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
          timestamp: new Date()
        });
      }
      alert('Image successfully added!');
      fetchLocations(); // Refresh markers
    });
  }, []);

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/signin');
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="app-container">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag 'n' drop images here, or click to select images</p>
      </div>
      <button onClick={handleSignOut} className="signout-button">Sign Out</button>
      <MapContainer center={[51.505, -0.09]} zoom={13} className="map-container">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]} icon={photoIcon} eventHandlers={{
            click: () => navigate(`/details/${marker.lat}/${marker.lng}`)
          }}>
            <Popup>A view of your images at this location. Click marker to see all.</Popup>
          </Marker>
        ))}
        <SearchBar />
      </MapContainer>
    </div>
  );
};

export default MyMap;