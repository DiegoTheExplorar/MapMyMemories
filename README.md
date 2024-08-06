# MapMyMemories

MapMyMemories is a web application that allows users to upload and view their photos on a map. Users can sign in using Google authentication, view photos by country, browse their image gallery, and explore photos at specific locations. The app also supports dark mode and features a responsive design.

## Features

- **User Authentication**: Sign in using Google authentication.
- **Photo Upload**: Upload photos and view them on the map.
- **Country Gallery**: Browse photos by country.
- **Details Page**: View detailed images at specific locations.
- **Image Gallery**: View all uploaded images in a gallery format.
- **Dark Mode**: Toggle between light and dark mode.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Search Locations**: Search for locations using the search bar on the map.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase Authentication, Firestore
- **Map**: Leaflet, React-Leaflet, Leaflet-Geosearch
- **Image Carousel**: React-Responsive-Carousel
- **Deployment**: Vercel

## Project Structure

```
src/
│
├── App.jsx                 # Main application component handling routing and dark mode toggle
├── CountryPhotos/
│   └── CountryGallery.jsx  # Component to display photos by selected country
├── DetailsPage/
│   └── DetailsPage.jsx     # Component to display detailed images for a specific location
├── Firebase/
│   └── firebasehelper.js   # Helper functions for Firebase operations (fetch, upload, etc.)
├── HamburgerMenu/
│   └── Hamburger.jsx       # Component for the hamburger menu with navigation links and dark mode toggle
├── ImageGallery/
│   └── ImageGallery.jsx    # Component to display user's images in a gallery format
├── Map/
│   ├── MyMap.jsx           # Main map component for displaying and interacting with photo markers
│   └── SearchBar.jsx       # Search bar component for finding locations on the map
├── SigninPage/
│   └── SignInPage.jsx      # Component for the Google sign-in page with image carousel
├── main.jsx                # Entry point for the React application
├── MainLayout.jsx          # Layout component that includes the hamburger menu
└── index.css               # Global CSS styles and Tailwind CSS imports
```

## Installation

### Prerequisites

- Node.js
- Firebase project setup

### Steps

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-username/mapmymemories.git
   cd mapmymemories
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Setup Firebase**:
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Google authentication in the Authentication section.
   - Create a Firestore database.
   - Add your Firebase configuration to `src/Firebase/firebasehelper.js`.

4. **Run the development server**:
   ```sh
   npm run dev
   ```

5. **Open the application**:
   - The application will be running at `http://localhost:5173`.

## Usage

1. **Sign In**:
   - Open the application and sign in using Google authentication.

2. **Upload Photos**:
   - Drag and drop images on the map to upload them.

3. **View Photos on the Map**:
   - Click on the markers on the map to view photos at specific locations.

4. **Browse by Country**:
   - Go to the "View Images by Country" section and select a country to browse photos.

5. **Image Gallery**:
   - View all uploaded images in the gallery section.

6. **Dark Mode**:
   - Toggle dark mode using the switch in the hamburger menu.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or enhancements.

## License

This project is licensed under the MIT License.

## Acknowledgements

- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Firebase**: A platform developed by Google for creating mobile and web applications.
- **Leaflet**: An open-source JavaScript library for mobile-friendly interactive maps.
- **React-Leaflet**: React components for Leaflet maps.
- **React-Responsive-Carousel**: A carousel component for React.

## Deployment
https://map-my-memories-three.vercel.app/signin

Feel free to adjust the details, especially the Firebase setup and contact information, to match your specific project and preferences.