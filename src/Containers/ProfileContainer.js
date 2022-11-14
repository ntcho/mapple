import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import PlaceCard from "../Components/PlaceCard";

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    // clear error
  }

  console.log("Done.");
};

const setSavedPlaceIds = async (object) => {
  try {
    const jsonValue = JSON.stringify(object);
    await AsyncStorage.setItem("saved", jsonValue);
  } catch (e) {
    // saving error
  }
};

export const getSavedPlaceIds = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("saved");
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // error reading value
  }
};

export const addSavedPlaceIds = async (savedId) => {
  let placeIds = await getSavedPlaceIds();

  // console.log("got", placeIds, savedId);
  if (!placeIds.includes(savedId)) {
    placeIds.push(savedId);

    setSavedPlaceIds(placeIds);
  }
};

const ProfileContainer = () => {
  const [savedPlaceIds, setSavedPlaceIds] = useState(null);

  useEffect(() => {
    getSavedPlaceIds().then((placeIds) => setSavedPlaceIds(placeIds));
  });

  return savedPlaceIds ? (
    <SafeAreaView>
      <ScrollView style={tw`flex flex-col min-w-full min-h-full px-6 pt-4`}>
        {savedPlaceIds.map((placeId, index) => {
          return (
            <View style={tw`relative w-full mb-4`} key={index}>
              <PlaceCard placeId={placeId} />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  ) : (
    <View></View>
  );
};

export default ProfileContainer;