import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";

import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeContainer from "./Containers/HomeContainer";
import SurveyContainer from "./Containers/SurveyContainer";

import { LogBox } from "react-native";
import { clearAll } from "./Containers/ProfileContainer";

// LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notification

const Stack = createNativeStackNavigator();
export const UserContext = React.createContext({
  location: null,
  travelMode: null,
  groupSize: null,
  activityLevel: null,
  priceRange: null,
  setLocation: () => {},
  setTravelMode: () => {},
  setGroupSize: () => {},
  setActivityLevel: () => {},
  setPriceRange: () => {},
});

const theme = {
  ...DefaultTheme,
  dark: false, // disable automatic dark theme
};

export default function App() {
  const [location, setLocation] = useState(null);
  const [travelMode, setTravelMode] = useState(null);
  const [groupSize, setGroupSize] = useState(null);
  const [activityLevel, setActivityLevel] = useState(null);
  const [priceRange, setPriceRange] = useState(null);

  const value = {
    location,
    travelMode,
    groupSize,
    activityLevel,
    priceRange,
    setLocation,
    setTravelMode,
    setGroupSize,
    setActivityLevel,
    setPriceRange,
  };

  // clearAll();

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <UserContext.Provider value={value}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Me"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Home" component={HomeContainer} />
              <Stack.Screen name="Survey" component={SurveyContainer} />
              {/* <Stack.Screen name="Settings" component={} /> */}
            </Stack.Navigator>
            <StatusBar style="dark" />
          </NavigationContainer>
        </UserContext.Provider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
