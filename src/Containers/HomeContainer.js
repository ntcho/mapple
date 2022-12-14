import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import ProfileContainer from "../Containers/ProfileContainer";
import MapContainer from "./MapContainer";

const Tab = createBottomTabNavigator();

const HomeContainer = () => {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = {
            Map: ["map-marker-radius", "map-marker-radius-outline"],
            // Find: ["lightning-bolt", "lightning-bolt-outline"],
            Saved: ["heart", "heart-outline"],
          };

          return (
            <MaterialCommunityIcons
              name={iconName[route.name][focused ? 0 : 1]}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Map" component={MapContainer} />
      <Tab.Screen name="Saved" component={ProfileContainer} />
    </Tab.Navigator>
  );
};

export default HomeContainer;

// Below is using react-native-paper but doesn't work =(
// from: https://callstack.github.io/react-native-paper/bottom-navigation.html
//   const [index, setIndex] = React.useState(0);
//   const [routes] = React.useState([
//     {
//       key: "home",
//       title: "Home",
//       focusedIcon: "home",
//       unfocusedIcon: "home-outline",
//     },
//     {
//       key: "profile",
//       title: "Me",
//       focusedIcon: "account-circle",
//       unfocusedIcon: "account-circle-outline",
//     },
//   ]);

//   const renderScene = BottomNavigation.SceneMap({
//     home: MapContainer,
//     profile: Demo,
//   });

//   return (
//     <BottomNavigation
//       navigationState={{ index, routes }}
//       onIndexChange={setIndex}
//       renderScene={renderScene}
//     />
//   );
