# Combined JSX and CSS Files

## JSX Files

### src\App.jsx
```jsx
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import CountryGallery from './CountryPhotos/CountryGallery';
import DetailsPage from './DetailsPage/DetailsPage';
import ImageGallery from './ImageGallery/ImageGallery';
import MainLayout from './MainLayout';
import MyMap from './Map/MyMap';
import SignInPage from './SignInPage';

function RouterAwareComponent() {
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('lastLocation', location.pathname);
  }, [location]);

  return null;
}

// Component for protected routes
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

const routes = [
  { path: "/", element: <Navigate replace to="/signin" /> },
  { path: "/signin", element: <SignInPage /> },
  { path: "/map", element: <PrivateRoute element={<MainLayout><MyMap /></MainLayout>} /> },
  { path: "/details/:lat/:lng", element: <PrivateRoute element={<MainLayout><DetailsPage /></MainLayout>} /> },
  { path: "/gallery", element: <PrivateRoute element={<MainLayout><ImageGallery /></MainLayout>} /> },
  { path: "/country", element: <PrivateRoute element={<MainLayout><CountryGallery /></MainLayout>} /> },
];

const App = () => {
  return (
    <Router>
      <RouterAwareComponent />
      <Routes>
        {routes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={element}
          />
        ))}
      </Routes>
    </Router>
  );
};

export default App;

```

### src\CountryPhotos\CountryGallery.jsx
```jsx
import React, { useEffect, useState } from 'react';
import { fetchEntriesByCountry, fetchUniqueCountries } from '../firebasehelper';
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
        <label>Choose a country:</label>
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

```

### src\DetailsPage\DetailsPage.jsx
```jsx
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase-config';
import './DetailsPage.css';

const DetailsPage = () => {
  const { lat, lng } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [address, setAddress] = useState('Address not found');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const userDocRef = collection(db, `users/${userId}/locations`);
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const q = query(userDocRef, where("latitude", "==", latNum), where("longitude", "==", lngNum));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const allImages = querySnapshot.docs.flatMap(doc => doc.data().images);
          setImages(allImages);
          setAddress(querySnapshot.docs[0].data().address || 'Address not found');
        } else {
          console.log("No images found at this location.");
        }
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
    <div className="container">
      <h1 className="header">Images at {address}</h1>
      {images.length > 0 ? (
        <div className="image-carousel">
          <img src={images[currentImage]} alt="Slideshow" />
          {images.length > 1 && (
            <div className="carousel-controls">
              <button onClick={prevImage}>Previous</button>
              <button onClick={nextImage}>Next</button>
            </div>
          )}
        </div>
      ) : (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;

```

### src\HamburgerMenu\Hamburger.jsx
```jsx
import { faGlobe, faHome, faImage, faMap, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Hamburger.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [username, setUsername] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setProfilePicUrl(user.photoURL);
        setUsername(user.displayName);
      } else {
        setProfilePicUrl(null);
        setUsername(null);
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/');
    }).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <div className={`menu-icon ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        &#9776;
      </div>
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        <button onClick={() => { navigate('/map'); closeMenu(); }}>
          <FontAwesomeIcon icon={faHome} /> Home
        </button>
        <button onClick={() => { navigate('/map'); closeMenu(); }}>
          <FontAwesomeIcon icon={faMap} /> Map
        </button>
        <button className="sign-out-button" onClick={() => { handleSignOut(); closeMenu(); }}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
        </button>
        <button onClick={() => { navigate('/gallery'); closeMenu(); }}>
          <FontAwesomeIcon icon={faImage} /> View Gallery
        </button>
        <button onClick={() => { navigate('/country'); closeMenu(); }}>
          <FontAwesomeIcon icon={faGlobe} /> View Images by Country
        </button>
        {profilePicUrl && (
          <div className="profile-container">
            <img src={profilePicUrl} alt="Profile" className="profile-pic" />
            <span className="username">{username}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HamburgerMenu;
```

### src\ImageGallery\ImageGallery.jsx
```jsx
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

### src\MainLayout.jsx
```jsx
import React from 'react';
import HamburgerMenu from './HamburgerMenu/Hamburger';
const MainLayout = ({ children }) => {
  return (
    <>
      <HamburgerMenu />
      <div>{children}</div>
    </>
  );
};

export default MainLayout;
```

### src\Map\MyMap.jsx
```jsx
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
      const results = response.data.results; 
      if (results.length > 0) {
        const country = results[0].components.country; 
        const address = results[0].formatted;
        return {country,address}; // Return the country and address
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
      console.log('Got coords')
      const storage = getStorage();
      const storageRef = ref(storage, `images/${userId}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Got the image URL and uploaded to storage')
      const userDocRef = doc(db, "users", userId);
      const locationsRef = collection(userDocRef, "locations");
      const locQuery = query(locationsRef, where("latitude", "==", latitude), where("longitude", "==", longitude));
      const locQuerySnapshot = await getDocs(locQuery);
      const {country,address} = await getCountry(latitude, longitude);
      console.log(country) // Await the country value here
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
          country,
          address
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

```

### src\Map\SearchBar.jsx
```jsx
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const SearchBar = () => {
  const map = useMap();

  useEffect(() => {
    // Define a red marker icon
    const redIcon = new L.Icon({
      iconUrl: './redmarker.png', // URL to your custom icon image
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

export default SearchBar;
```

### src\SignInPage.jsx
```jsx
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();
  

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      await signInWithPopup(auth, provider);
      navigate('/map');
    } catch (error) {
      alert('Failed to sign in with Google: ' + error.message);
    }
  };

  return (
      <button 
        onClick={handleGoogleSignIn} 
        className={`login-button`}
      >
        Login
      </button>
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
.details-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.details-image {
  max-width: 20%; /* Smaller image size */
  height: auto;
  display: block;
  margin: auto; /* Ensures centering */
}

.details-nav {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}



.back-button:hover, .signout-button:hover {
  background-color: #0056b3;
}


```

### src\CountryPhotos\CountryGallery.css
```css
/* CountryGallery.css */

.option-box {
    display: flex;
    justify-content: center;
    margin: 20px;
  }
  
  .option-box select {
    width: 200px;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  
  
  .gallery-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 10px;
    padding: 20px;
}

.image-item img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    transition: transform 0.3s ease-in-out;
}
```

### src\DetailsPage\DetailsPage.css
```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f4f4;
  padding: 20px;
}

.image-carousel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative; /* Needed for positioning controls */
}

img {
  max-width: 100%; /* Ensure the image is responsive and does not exceed its parent's width */
  height: 303px; /* Set the height to roughly 8cm on a typical screen */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  object-fit: cover; /* Ensures the image covers the set height and width, may crop if necessary */
}

.carousel-controls {
  display: flex;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  margin: 0 5px;
  border: none;
  background-color: #007BFF;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px; 
}

.spinner {
  border: 8px solid #f3f3f3; 
  border-top: 8px solid #007BFF; 
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Header styles */
.header {
  position: absolute; 
  top: 10px;
  width: 100%;
  text-align: center;
  margin-bottom: 20px; 
  font-size: 2.5em;
}

```

### src\HamburgerMenu\Hamburger.css
```css
body {
    font-family: Arial, sans-serif;
  }
  
  .menu-icon {
    font-size: 30px;
    cursor: pointer;
    position: fixed;
    top: 15px;
    right: 15px;
    color: black;
    transition: color 0.3s;
    z-index: 1001;
  }
  
  .menu-icon.open {
    color: white;
  }
  
  .menu {
    height: 100%;
    width: 0;
    position: fixed;
    top: 0;
    right: 0;
    background-color: #111;
    overflow-x: hidden;
    transition: width 0.5s;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 60px;
    z-index: 1000; 
  }
  
  .menu button {
    padding: 15px 20px;
    text-decoration: none;
    font-size: 18px;
    color: #818181;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s, color 0.3s;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }
  
  .menu button:hover {
    color: #f1f1f1;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .menu.open {
    width: 250px;
  }
  
  .profile-container {
    position: absolute;
    bottom: 30px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px;
  }
  
  .profile-pic {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 10px;
  }
  
  .username {
    font-size: 20px;
    color: #818181;
  }
  
  @media (max-width: 768px) {
    .menu {
      padding-top: 20px;
    }
  
    .menu button {
      font-size: 16px;
      padding: 12px 15px;
    }
  
    .profile-pic {
      width: 50px;
      height: 50px;
    }
  
    .username {
      font-size: 18px;
    }
  }
  
  @media (max-width: 480px) {
    .menu-icon {
      font-size: 24px;
      top: 10px;
      right: 10px;
    }
  
    .menu.open {
      width: 200px;
    }
  
    .menu button {
      font-size: 14px;
      padding: 10px 10px;
    }
  
    .profile-pic {
      width: 40px;
      height: 40px;
    }
  
    .username {
      font-size: 16px;
    }
  }
```

### src\ImageGallery\ImageGallery.css
```css
.gallery-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 10px;
    padding: 20px;
}

.image-item img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    transition: transform 0.3s ease-in-out;
}

.image-item img:hover {
    transform: scale(1.1);
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

  h1{
    text-align: center;
    margin-top: 20px;
    font-size: 1em;
  }
  
```

### src\Map\MyMap.css
```css
.app-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    background: white;
  }
  
  .map-container {
    height: 75vh;
    width: 80%;
    margin-top: 20px;
    margin-bottom: 20px;
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
    width: 70%;
  }
  
  .dropzone:hover {
    background-color: #e2e6ea;
  }
  @media (max-width: 600px) {
    .map-container {
      height: 50vh;
    }
}
  
```

### src\SignInPage.css
```css
.login-button {
  padding: 10px 20px;
  background-color: #007bff;
  border-radius: 5px;
  position: absolute; 
  top: 10px; 
  right: 10px; 
  width: auto; 
}

```
