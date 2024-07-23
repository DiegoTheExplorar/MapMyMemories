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