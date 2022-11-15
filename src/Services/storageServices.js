import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentLocation } from "./locationServices";

const getKeyFromPlaceId = (placeId) => "@mapple_cache_placeId=" + placeId;

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    // clear error
    console.error(e);
  }
};

export const setSavedPlaceIds = async (object) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem("@mapple_saved", jsonValue);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

export const getSavedPlaceIds = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("@mapple_saved");
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // error reading value
    console.error(e);
  }
};

export const setSavedUserLocation = async (object) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem("@mapple_saved_user_location", jsonValue);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

export const getSavedUserLocation = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("@mapple_saved_user_location");

    if (jsonValue == null) {
      return await getCurrentLocation();
    } else {
      return JSON.parse(jsonValue);
    }
  } catch (e) {
    // error reading value
    console.error(e);
  }
};

export const addSavedPlaceIds = async (savedId) => {
  try {
    let placeIds = await getSavedPlaceIds();

    if (!placeIds.includes(savedId)) {
      // only add when it doesn't already exist
      placeIds.push(savedId);

      setSavedPlaceIds(placeIds);
    }
  } catch (e) {
    console.error(e);
  }
};

export const cachePlaceDetail = async (placeDetail) => {
  try {
    let key = getKeyFromPlaceId(placeDetail.place_id);
    let keys = await AsyncStorage.getAllKeys();

    if (keys.includes(key)) {
      // exists, merge to existing
      return await AsyncStorage.mergeItem(key, JSON.stringify(placeDetail));
    } else {
      // doest't exist, add new
      return await AsyncStorage.setItem(key, JSON.stringify(placeDetail));
    }
  } catch (e) {
    // saving error
    console.error(e);
  }
};

export const getCachedPlaceDetail = async (placeId) => {
  try {
    let key = getKeyFromPlaceId(placeId);

    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // error reading value
    console.error(e);
  }
};

export const getSurveyResults = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("@mapple_user_survey");
    return jsonValue != null
      ? JSON.parse(jsonValue)
      : {
          travelMode: null,
          groupSize: null,
          activityLevel: null,
          priceRange: null,
        };
  } catch (e) {
    // error reading value
    console.error(e);
  }
};

export const setSurveyResults = async (object) => {
  try {
    let keys = await AsyncStorage.getAllKeys();

    if (keys.includes("@mapple_user_survey")) {
      return await AsyncStorage.mergeItem(
        "@mapple_user_survey",
        JSON.stringify(object)
      );
    } else {
      return await AsyncStorage.setItem(
        "@mapple_user_survey",
        JSON.stringify(object)
      );
    }
  } catch (e) {
    // saving error
    console.error(e);
  }
};
