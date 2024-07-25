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
import SignInPage from './SigninPage/SignInPage';

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

```

### src\DetailsPage\DetailsPage.jsx
```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchImagesByLocation } from '../Firebase/firebasehelper';
import './DetailsPage.css';

const DetailsPage = () => {
  const { lat, lng } = useParams();
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [address, setAddress] = useState('Address not found');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      const { allImages, address } = await fetchImagesByLocation(lat, lng);
      setImages(allImages);
      setAddress(address);
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
import { faGlobe, faImage, faMap, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
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
import React, { useEffect, useState } from 'react';
import { fetchUserImages } from '../Firebase/firebasehelper';
import './ImageGallery.css';

const ImageGallery = () => {
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            const allImages = await fetchUserImages();
            setImages(allImages);
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

### src\SigninPage\SignInPage.jsx
```jsx
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignInPage.module.css';

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
    <div className={styles.container}>
      <div className={styles.imageSection}></div>
      <div className={styles.formSection}>
        <div className={styles.message}>
          <p>Welcome to MapMyMemories!</p>
          <p>Discover and remember your favorite places with ease.</p>
        </div>
        <button onClick={handleGoogleSignIn} className={styles.signin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default SignInPage;

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
  max-width: 20%;
  height: auto;
  display: block;
  margin: auto; 
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
.option-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 20px;
  font-size: 16px;
  color: #333;
}

.option-box select {
  width: 250px;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid #007BFF; 
  background-color: white;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.option-box select:hover,
.option-box select:focus {
  border-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.label{
  color: azure;
}

.gallery-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 15px;
  padding: 20px;
}

.image-item {
  overflow: hidden; 
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.image-item:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.image-item img {
  width: 100%;
  height: auto;
  transition: transform 0.3s ease-in-out;
}

.image-item img:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .option-box select {
    width: 100%;
  }
  
  .gallery-container {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
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
  position: relative; 
}

img {
  max-width: 100%;
  height: 303px; 
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  object-fit: cover;
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
    margin-bottom: 20%;
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
    background-color: rgb(65, 65, 65)
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
  min-height: 100vh; 
  color: white; 
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

### src\SigninPage\SignInPage.module.css
```css
.container {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.imageSection {
  flex: 2;
  animation: backgroundCycle 10s infinite alternate;
  background-size: cover;
  background-position: center;
}

@keyframes backgroundCycle {
  0%, 100% {
    background-image: url('/photo1.jpg');
  }
  50% {
    background-image: url('/photo2.jpg');
  }
}

.formSection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(8, 10, 51, 0.85);
  padding: 20px;
}

.message {
  text-align: center;
  margin-bottom: 20px;
  color: #f1f1f1;
  font-size: larger;
  font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.signin {
  background-color: #272726;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.signin:hover {
  background-color: #2d2d2d;
}

```
