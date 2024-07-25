# MapMyMemories

MapMyMemories is a web application that allows users to upload images, view images by location on a map, and explore galleries of images by country. This application integrates with Firebase for authentication and data storage.

## Features

- **User Authentication**: Sign in with Google using Firebase Authentication.
- **Image Upload**: Upload images and geotag them to specific locations on the map.
- **Map View**: Interactive map displaying uploaded images as markers.
- **Image Gallery**: View uploaded images in a gallery format.
- **Country Gallery**: Explore images by selecting a country.
- **Responsive Design**: Mobile-friendly interface.

## Technologies Used

- **React**: Frontend framework.
- **Firebase**: Authentication and Firestore database.
- **Leaflet**: Interactive map.
- **React Router**: Navigation and routing.
- **CSS Modules**: Styling components.

## File Structure

```
src/
├── App.css
├── App.jsx
├── CountryPhotos/
│   ├── CountryGallery.css
│   └── CountryGallery.jsx
├── DetailsPage/
│   ├── DetailsPage.css
│   └── DetailsPage.jsx
├── Firebase/
│   └── firebasehelper.js
├── HamburgerMenu/
│   ├── Hamburger.css
│   └── Hamburger.jsx
├── ImageGallery/
│   ├── ImageGallery.css
│   └── ImageGallery.jsx
├── Map/
│   ├── MyMap.css
│   ├── MyMap.jsx
│   ├── SearchBar.jsx
│   └── camera.png
├── SigninPage/
│   ├── SignInPage.module.css
│   └── SignInPage.jsx
├── MainLayout.jsx
├── index.css
├── main.jsx
```

## Installation

1. Clone the repository:

```sh
git clone https://github.com/your-username/MapMyMemories.git
cd MapMyMemories
```

2. Install dependencies:

```sh
npm install
```

3. Set up Firebase:

- Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
- Add a web app to your Firebase project.
- Copy the Firebase configuration and replace the config object in `src/Firebase/firebasehelper.js`.

4. Start the development server:

```sh
npm start
```

## Usage

1. **Sign In**: On the SignIn page, click the "Sign in with Google" button.
2. **Upload Images**: Drag and drop images onto the map or click to select images.
3. **View Images on Map**: Uploaded images will appear as markers on the map. Click a marker to view images from that location.
4. **Explore Galleries**: Use the navigation menu to view image galleries or images by country.

## Components

### App.jsx

Handles the routing of the application and user authentication state.

### CountryGallery.jsx

Displays a dropdown to select a country and view images from that country.

### DetailsPage.jsx

Shows a carousel of images from a specific location.

### Hamburger.jsx

Provides a navigation menu with options to view the map, galleries, and sign out.

### ImageGallery.jsx

Displays a gallery of images uploaded by the user.

### MyMap.jsx

Main map component where users can upload images and view geotagged images.

### SearchBar.jsx

Search bar component for the map, allowing users to search for locations.

### SignInPage.jsx

Sign-in page allowing users to authenticate with Google.

## Styles

CSS files are used to style each component, ensuring a consistent and responsive design. 

- **App.css**: General styles for buttons and container elements.
- **CountryGallery.css**: Styles for the country gallery dropdown and images.
- **DetailsPage.css**: Styles for the image carousel on the details page.
- **Hamburger.css**: Styles for the hamburger menu.
- **ImageGallery.css**: Styles for the image gallery.
- **MyMap.css**: Styles for the map and dropzone.
- **SignInPage.module.css**: Styles for the sign-in page.

## Credits

- Images by [Jordan McQueen](https://stocksnap.io/photo/sunrise-sunset-XSTO5645BM) on [StockSnap](https://stocksnap.io)
- Images by [freepik](https://www.freepik.com)
- Images by [tawatchai07](https://www.freepik.com/free-photo/beautiful-girl-standing-boat-looking-mountains-ratchaprapha-dam-khao-sok-national-park-surat-thani-province-thailand_13180933.htm#fromView=search&page=1&position=21&uuid=8dcae0bb-3af0-45e2-9386-99741de8513d)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
