import * as Location from "expo-location";
import Geocoder from "react-native-geocoding";

export const getCurrentLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted")
    return { error: "Permission to access location was denied" };

  let location = await Location.getCurrentPositionAsync({});
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
  //   "timestamp": 1668314455999.9976
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
