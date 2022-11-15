import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";

import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeContainer from "./Containers/HomeContainer";
import SurveyContainer from "./Containers/SurveyContainer";
import { setSurveyResults } from "./Services/storageServices";

// import { LogBox } from "react-native";
// LogBox.ignoreAllLogs(); //Ignore all log notification

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  dark: false, // disable automatic dark theme
};

// const DEBUG = false;
const DEBUG = true;

export default function App() {
  // clearAll();

  useEffect(
    () => async () =>
      setSurveyResults({
        travelMode: "walking",
        groupSize: "alone",
        activityLevel: 1,
        priceRange: 2,
      }),
    []
  );

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Home" component={HomeContainer} />
            <Stack.Screen name="Survey" component={SurveyContainer} />
            {/* <Stack.Screen name="Settings" component={} /> */}
          </Stack.Navigator>
          <StatusBar style="dark" />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
