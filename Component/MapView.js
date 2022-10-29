import React from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";

const MyMapView = (props) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      region={props.region}
      showsUserLocation={true}
      onRegionChange={(reg) => props.onRegionChange(reg)}
      followsUserLocation={true}
    >
      <Marker coordinate={props.region} />
    </MapView>
  );
};
export default MyMapView;
