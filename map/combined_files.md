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
const PrivateRoute = ({ element, toggleDarkMode, isDarkMode }) => {
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

  return user ? React.cloneElement(element, { toggleDarkMode, isDarkMode }) : <Navigate to="/signin" />;
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Router>
        <RouterAwareComponent />
        <Routes>
          {routes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={React.cloneElement(element, { toggleDarkMode, isDarkMode })}
            />
          ))}
        </Routes>
      </Router>
    </div>
  );
};

export default App;

```

### src\CountryPhotos\CountryGallery.jsx
```jsx
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
      <div className='flex justify-center items-center my-8 text-lg text-gray-800'>
        <label className='mr-4 text-azure'>Choose a country:</label>
        <select id="dropdown" value={selectedOption} onChange={handleChange} className="w-64 p-2 rounded-md border-2 border-blue-500 bg-white cursor-pointer shadow transition-colors duration-300 focus:border-blue-700 focus:shadow-lg">
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

```

### src\DetailsPage\DetailsPage.jsx
```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchImagesByLocation } from '../Firebase/firebasehelper';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5">
      <h1 className="text-3xl mb-4">{`Images at ${address}`}</h1>
      {images.length > 0 ? (
        <div className="relative">
          <img src={images[currentImage]} alt="Slideshow" className="w-full h-80 object-cover rounded-lg shadow-lg" />
          {images.length > 1 && (
            <div className="flex mt-2">
              <button onClick={prevImage} className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Previous</button>
              <button onClick={nextImage} className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Next</button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-80">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;

```

### src\HamburgerMenu\Hamburger.jsx
```jsx
import { faGlobe, faImage, faMap, faMoon, faSignOutAlt, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HamburgerMenu = ({ toggleDarkMode, isDarkMode }) => {
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
      <div className={`text-2xl cursor-pointer fixed top-4 right-4 transition-colors duration-300 z-[9999] ${isOpen ? 'text-white' : 'text-black dark:text-white'}`} onClick={toggleMenu}>
        &#9776;
      </div>
      <div className={`fixed top-0 right-0 h-full bg-gray-900 transition-width duration-500 flex flex-col justify-start pt-16 z-[9998] ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <button onClick={() => { navigate('/map'); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faMap} /> Map
        </button>
        <button onClick={() => { navigate('/gallery'); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faImage} /> View Gallery
        </button>
        <button onClick={() => { navigate('/country'); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faGlobe} /> View Images by Country
        </button>
        <button onClick={() => { handleSignOut(); closeMenu(); }} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign Out
        </button>
        <button onClick={toggleDarkMode} className="text-gray-400 p-4 text-left hover:text-white hover:bg-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} /> {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {profilePicUrl && (
          <div className="absolute bottom-8 w-full flex flex-col items-center text-gray-400">
            <img src={profilePicUrl} alt="Profile" className="w-16 h-16 rounded-full mb-2" />
            <span className="text-lg">{username}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {images.length > 0 ? (
                images.map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                        <img src={image} alt={`Item ${index}`} className="w-full h-auto transition-transform duration-300 hover:scale-110" />
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

const MainLayout = ({ children, toggleDarkMode, isDarkMode }) => {
  return (
    <>
      <HamburgerMenu toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white">{children}</div>
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
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <div {...getRootProps()} className="border-2 border-blue-500 p-5 text-center my-5 cursor-pointer bg-white rounded-lg text-blue-500 transition-colors duration-200 w-3/4 hover:bg-gray-200">
        <input {...getInputProps()} />
        <p>Drag 'n' drop images here, or click to select images</p>
      </div>
      {location.lat && location.long && (
        <MapContainer center={[location.lat, location.long]} zoom={13} className="h-[80vh] w-[90vw] my-5">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
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
import classNames from 'classnames';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const imageCredits = {
  photo1: (
    <>
      <a href="https://stocksnap.io/photo/sunrise-sunset-XSTO5645BM">Photo</a> by <a href="https://stocksnap.io/author/653">Jordan McQueen</a> on <a href="https://stocksnap.io">StockSnap</a>
    </>
  ),
  photo2: (
    <>
      <a href="https://www.freepik.com/free-photo/medium-shot-contemplative-man-seaside_47696347.htm">Image by freepik</a>
    </>
  ),
  photo3: (
    <>
      <a href="https://www.freepik.com/free-photo/beautiful-girl-standing-boat-looking-mountains-ratchaprapha-dam-khao-sok-national-park-surat-thani-province-thailand_13180933.htm#fromView=search&page=1&position=21&uuid=8dcae0bb-3af0-45e2-9386-99741de8513d">Image by tawatchai07 on Freepik</a>
    </>
  ),
};

const SignInPage = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState('photo1');

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

  useEffect(() => {
    const cycleImages = () => {
      const current = currentImage === 'photo1' ? 'photo2' : currentImage === 'photo2' ? 'photo3' : 'photo1';
      setCurrentImage(current);
    };
    const interval = setInterval(cycleImages, 5000);
    return () => clearInterval(interval);
  }, [currentImage]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen font-sans">
      <div className={classNames("flex-1 bg-cover bg-center relative transition-all duration-1000", {
        'bg-[url("/photo1.jpg")]': currentImage === 'photo1',
        'bg-[url("/photo2.jpg")]': currentImage === 'photo2',
        'bg-[url("/photo3.jpg")]': currentImage === 'photo3',
      })}>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 bg-opacity-90 p-6">
        <div className="text-center mb-4 text-white text-lg">
          <p>Welcome to MapMyMemories!</p>
          <p>Discover and remember your favorite places with ease.</p>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-2 rounded-full transition duration-300 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700"
        >
          Sign in with Google
        </button>
      </div>
      <div className="absolute bottom-2 left-2 text-white text-xs">
        {imageCredits[currentImage]}
      </div>
    </div>
  );
};

export default SignInPage;

```

## CSS Files

### src\index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;



```
