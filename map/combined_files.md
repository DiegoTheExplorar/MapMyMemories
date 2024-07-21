# Combined JSX and CSS Files

## JSX Files

### src\App.jsx
```jsx
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import DetailsPage from './DetailsPage';
import MyMap from './MyMap';
import SignInPage from './SignInPage';

const PrivateRoute = ({ element }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? element : <Navigate to="/signin" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/signin" />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/map" element={<PrivateRoute element={<MyMap />} />} />
        <Route path="/details/:lat/:lng" element={<PrivateRoute element={<DetailsPage />} />} />
      </Routes>
    </Router>
  );
}

export default App;

```

### src\DetailsPage.jsx
```jsx
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase-config';

const DetailsPage = () => {
  const { lat, lng } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      const locationsRef = collection(db, "users/userId/locations"); // Update path as needed
      const q = query(locationsRef, where("latitude", "==", parseFloat(lat)), where("longitude", "==", parseFloat(lng)));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const allImages = querySnapshot.docs.flatMap(doc => doc.data().images);
        setImages(allImages);
      }
    };
    fetchImages();
  }, [lat, lng]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div>
      <h1>Images at Latitude: {lat}, Longitude: {lng}</h1>
      {images.length > 0 ? (
        <div>
          <img src={images[currentImage]} alt="Slideshow image" style={{ maxWidth: "100%", height: "auto" }} />
          <button onClick={prevImage}>Previous</button>
          <button onClick={nextImage}>Next</button>
        </div>
      ) : (
        <p>No images available.</p>
      )}
    </div>
  );
};

export default DetailsPage;

```

### src\main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

```

### src\MyMap.jsx
```jsx
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
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: true,
      showPopup: false,
      marker: {
        icon: new L.Icon.Default(),
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
      const response = await axios.post('http://127.0.0.1:5000/upload', formData);
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
          <Marker key={index} position={[marker.lat, marker.lng]} eventHandlers={{
            click: () => navigate(`/details/${marker.lat}/${marker.lng}`)
          }}>
            <Popup>A view of your images at this location. Click marker to see all.</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MyMap;
```

### src\SearchBar.jsx
```jsx
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const SearchBar = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider(); // or any other provider like BingMapProvider, EsriProvider, etc.
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      autoComplete: true, // optional: true|false  - default true
      autoCompleteDelay: 250, // optional: number      - default 250
      showMarker: true, // optional: true|false  - default true
      showPopup: false, // optional: true|false  - default false
      marker: { // optional: L.Marker    - default L.Icon.Default
        icon: new L.Icon.Default(),
        draggable: false,
      },
      maxMarkers: 1, // optional: number      - default 1
      retainZoomLevel: false, // optional: true|false  - default false
      animateZoom: true, // optional: true|false  - default true
      autoClose: true, // optional: true|false  - default false
      searchLabel: 'Enter address', // optional: string      - default 'Enter address'
      keepResult: true // optional: true|false  - default false
    });

    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

export default SearchBar;

```

### src\SignInPage.jsx
```jsx
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      await signInWithPopup(auth, provider);
      navigate('/map');  // Redirects to the map page after successful login
    } catch (error) {
      alert('Failed to sign in with Google: ' + error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="signin-card">
        <h2>Sign In</h2>
        <button onClick={handleGoogleSignIn} className="signin-button">Sign In with Google</button>
      </div>
    </div>
  );
};

export default SignInPage;

```

### src\TestPage.jsx
```jsx
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

```

## CSS Files

### src\App.css
```css
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  background: #f0f2f5;
}

.map-container {
  height: 75vh;
  width: 100%;
  margin-top: 20px;
}

.dropzone {
  border: 2px dashed #007bff;
  padding: 20px;
  text-align: center;
  margin: 20px auto;
  cursor: pointer;
  background-color: #ffffff;
  border-radius: 5px;
  color: #007bff;
  transition: background-color 0.2s;
  width: 95%;
}

.dropzone:hover {
  background-color: #e2e6ea;
}

.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.signin-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.signin-button, .signout-button {
  padding: 10px 20px;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.signin-button:hover, .signout-button:hover {
  background-color: #0056b3;
}

.back-button, .signout-button {
  padding: 10px 20px;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 10px;
}


.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}


.back-button:hover, .signout-button:hover {
  background-color: #0056b3;
}

@media (max-width: 600px) {
  .map-container {
    height: 50vh;
  }

  .signin-card, .dropzone {
    width: 90%;
  }
}

```

### src\index.css
```css
html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'Arial', sans-serif;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
```
