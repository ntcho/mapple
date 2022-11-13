import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Text } from "react-native";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import HomeContainer from "./Containers/HomeContainer";

function Demo() {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "space-between", alignItems: "center" }}
    >
      <Text>This is top text.</Text>
      <Text>This is bottom text.</Text>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  dark: false,
  // colors: {
  //   ...DefaultTheme.colors,
  //   primary: "#FFFCFB",
  //   // secondary: '#f1c40f',
  //   // tertiary: '#a1b2c3',
  // },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Home" component={HomeContainer} />
            <Stack.Screen name="Settings" component={Demo} />
          </Stack.Navigator>
          <StatusBar style="dark" />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
