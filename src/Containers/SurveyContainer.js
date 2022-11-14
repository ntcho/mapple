import React, { useEffect, useRef, useState } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import HomeContainer from "./HomeContainer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export const Survey1 = ({ navigation }) => {
  return (
    <View style={tw`flex items-center justify-center w-full h-full p-8 `}>
      <Text style={tw`text-3xl m-4 font-extrabold text-center`}>
        Question 1:
      </Text>
      <Text style={tw`text-xl  font-bold text-center`}>
        How are you traveling now ?
      </Text>
      <Text style={tw`text-base m-4  font-semibold text-center`}>
        Your mode of transportation for today. Chooose all options that apply.
      </Text>
      <View style={tw`flex flex-row`}>
        <View style={tw`flex`}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey2", {
                travelMode: "walking",
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/walking.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> By Foot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey2", {
                travelMode: "transit",
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/subway.png")} />
            <Text style={tw`text-xl m-4 font-bold text-center`}>
              Public{"\n"}
              Transporation
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex `}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey2", {
                travelMode: "driving",
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/driving.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> Driving</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-8 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey2", {
                travelMode: null,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/unsure.png")} />
            <Text style={tw`text-xl m-7 font-bold`}> Unsure</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const Survey2 = ({ route, navigation }) => {
  const { travelMode } = route.params;

  return (
    <View style={tw`flex items-center justify-center w-full h-full p-8 `}>
      <Text style={tw`text-3xl m-4 font-extrabold text-center`}>
        Question 2:
      </Text>
      <Text style={tw`text-xl  font-bold text-center`}>
        Who are you traveling with?
      </Text>
      <Text style={tw`text-base m-4  font-semibold text-center`}>
        Size of the group you are traveling with. Chooose all options that
        apply.
      </Text>
      <View style={tw`flex flex-row`}>
        <View style={tw`flex`}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey3", {
                travelMode: travelMode,
                groupSize: "alone",
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/alone.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> Alone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey3", {
                travelMode: travelMode,
                groupSize: "group",
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/group.png")} />
            <Text style={tw`text-xl m-7 font-bold text-center`}>
              As a Group
            </Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex `}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey3", {
                travelMode: travelMode,
                groupSize: "partner",
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/partner.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> Partner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-8 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey3", {
                travelMode: travelMode,
                groupSize: null,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/unsure.png")} />
            <Text style={tw`text-xl m-7 font-bold`}> Unsure</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const Survey3 = ({ route, navigation }) => {
  const { travelMode } = route.params;
  const { groupSize } = route.params;

  return (
    <View style={tw`flex items-center justify-center w-full h-full p-8 `}>
      <Text style={tw`text-3xl m-4 font-extrabold text-center`}>
        Question 3:
      </Text>
      <Text style={tw`text-xl  font-bold text-center`}>
        How active will you be?
      </Text>
      <Text style={tw`text-base m-4  font-semibold text-center`}>
        Level of activity for your travel. Chooose all options that apply.
      </Text>
      <View style={tw`flex flex-row`}>
        <View style={tw`flex`}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey4", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: 1,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/low.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> Low</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey4", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: 3,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/high.png")} />
            <Text style={tw`text-xl m-7 font-bold text-center`}>High</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex `}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey4", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: 2,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/Moderate.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> Moderate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-8 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Survey4", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: null,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/unsure.png")} />
            <Text style={tw`text-xl m-7 font-bold`}> Unsure</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const Survey4 = ({ route, navigation }) => {
  const { travelMode } = route.params;
  const { groupSize } = route.params;
  const { activityLevel } = route.params;

  return (
    <View style={tw`flex items-center justify-center w-full h-full p-8 `}>
      <Text style={tw`text-3xl m-4 font-extrabold text-center`}>
        Question 4:
      </Text>
      <Text style={tw`text-xl  font-bold text-center`}>
        How much will you spend?{" "}
      </Text>
      <Text style={tw`text-base m-4  font-semibold text-center`}>
        Budget for your travel. Chooose all options that apply.
      </Text>
      <View style={tw`flex flex-row`}>
        <View style={tw`flex`}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Home", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: activityLevel,
                prizeRange: 1,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/pricelow.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> $</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Home", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: activityLevel,
                priceRange: 3,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/pricehigh.png")} />
            <Text style={tw`text-xl m-7 font-bold text-center`}>$$$</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex `}>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-5 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Home", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: activityLevel,
                priceRange: 2,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/pricemoderate.png")} />
            <Text style={tw`text-xl m-4 font-bold`}> $$</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-white m-2 items-center pt-8 rounded-4 shadow-lg`}
            onPress={() =>
              navigation.navigate("Home", {
                travelMode: travelMode,
                groupSize: groupSize,
                activityLevel: activityLevel,
                priceRange: null,
              })
            }
            activeOpacity={0.7}
          >
            <Image source={require("../../assets/images/unsure.png")} />
            <Text style={tw`text-xl m-7 font-bold`}> Unsure</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const SurveyContainer = () => {
  return (
    <Stack.Navigator
      initialRouteName="Survey1"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Survey1" component={Survey1} />
      <Stack.Screen name="Survey2" component={Survey2} />
      <Stack.Screen name="Survey3" component={Survey3} />
      <Stack.Screen name="Survey4" component={Survey4} />
      <Stack.Screen name="Home" component={HomeContainer} />
    </Stack.Navigator>
  );
};

export default SurveyContainer;
