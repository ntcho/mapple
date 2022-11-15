import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import PlaceCard from "../Components/PlaceCard";
import { getSavedPlaceIds } from "../Services/storageServices";

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
