import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlaceCard from "../Components/PlaceCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { useEffect } from "react";
import tw from "twrnc";

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

const getSavedPlaceIds = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("saved");
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // error reading value
  }
};

export const addSavedPlaceIds = async (savedId) => {
  let placeIds = await getSavedPlaceIds();

  console.log("got", placeIds, savedId);
  placeIds.push(savedId);

  setSavedPlaceIds(placeIds);
};

const ProfileContainer = () => {
  const [savedPlaceIds, setSavedPlaceIds] = useState(null);

  useEffect(() => {
    getSavedPlaceIds().then((placeIds) => setSavedPlaceIds(placeIds));
  });

  return savedPlaceIds ? (
    <SafeAreaView>
      <ScrollView style={tw`flex flex-col min-w-full min-h-full`}>
        {savedPlaceIds.map((placeId, index) => {
          return (
            <View style={tw`w-full h-68`}>
              <PlaceCard placeId={placeId} key={index} />
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
