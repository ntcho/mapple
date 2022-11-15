import * as Location from "expo-location";
import Geocoder from "react-native-geocoding";
import { setSavedUserLocation } from "./storageServices";

export const getOffset = (zoomLevel, offsetScale = 0.1) => {
  const scale = {
    20: 1128.49722,
    19: 2256.99444,
    18: 4513.98888,
    17: 9027.977761,
    16: 18055.95552,
    15: 36111.91104,
    14: 72223.82209,
    13: 144447.6442,
    12: 288895.2884,
    11: 577790.5767,
    10: 1155581.153,
    9: 2311162.307,
    8: 4622324.614,
    7: 9244649.227,
    6: 18489298.45,
    5: 36978596.91,
    4: 73957193.82,
    3: 147914387.6,
    2: 295828775.3,
    1: 591657550.5,
  };

  return scale[zoomLevel] * 0.000001 * offsetScale;
};

export const getZoomLevel = (travelMode) =>
  travelMode && ["walking", "transit", "driving"].includes(travelMode)
    ? {
        walking: 15, // log2 scale
        transit: 14,
        driving: 13,
      }[travelMode]
    : 16;

export const getCurrentLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted")
    return {
      coords: {
        accuracy: 9.874467499002057,
        altitude: 43.966915130615234,
        altitudeAccuracy: 12,
        heading: 69.609375,
        latitude: 40.74843500584747,
        longitude: -73.98566235185115, // Empire State Building
        speed: 0,
      },
      timestamp: 1468314455999.9976,
      error: "Permission to access location was denied",
    };

  let location = await Location.getCurrentPositionAsync({});

  setSavedUserLocation(location);

  return location;

  // Will return the following:
  // {
  //   "coords": {
  //     "accuracy": 9.874467499002057,
  //     "altitude": 43.966915130615234,
  //     "altitudeAccuracy": 12,
  //     "heading": 69.609375,
  //     "latitude": 42.02832346786003,
  //     "longitude": -73.90763908631531,
  //     "speed": 0
  //   },
  //   "timestamp": 1468314455999.9976
  // }
};

export const geocodeLocationByName = (locationName) => {
  return new Promise((resolve, reject) => {
    Geocoder.from(locationName)
      .then((json) => {
        const addressComponent = json.results[0].address_components[0];
        resolve(addressComponent);
      })
      .catch((error) => reject(error));
  });
};

export const geocodeLocationByCoords = (lat, long) => {
  return new Promise((resolve, reject) => {
    Geocoder.from(lat, long)
      .then((json) => {
        const addressComponent = json.results[0].address_components[0];
        resolve(addressComponent);
      })
      .catch((error) => reject(error));
  });
};
