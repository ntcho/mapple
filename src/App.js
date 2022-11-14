import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeContainer from "./Containers/HomeContainer";
import SurveyContainer from "./Containers/SurveyContainer";

import { LogBox } from "react-native";

// LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notification

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  dark: false, // disable automatic dark theme
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Survey"
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
