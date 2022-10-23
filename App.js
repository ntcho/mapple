import * as React from "react";
import { Text, View, StyleSheet, TextInput } from "react-native";
import Constants from "expo-constants";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const GOOGLE_PLACES_API_KEY = "AIzaSyDkFVLOa9p3e2w3fzn1MfEBJxeUbYcz6hQ";
const App = () => {
  return (
    <View>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{
          width: "100%",
          height: "100%",
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <View style={styles.container}>
          <GooglePlacesAutocomplete
            placeholder="Search"
            query={{
              key: GOOGLE_PLACES_API_KEY,
              language: "en", // language of the results
            }}
            onPress={(data, details = null) => console.log(data)}
            onFail={(error) => console.error(error)}
          />
        </View>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: Constants.statusBarHeight + 10,
    backgroundColor: "transparent",
  },
});

export default App;
