import { Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      />
      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Mapple demo</Text>
      </View>
    </View>
  );
}
