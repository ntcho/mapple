import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const MyMapView = (props) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      region={props.region}
      showsUserLocation={true}
      onRegionChange={
        props.onRegionChange && ((newRegion) => props.onRegionChange(newRegion))
      }
      followsUserLocation={true}
    >
      <Marker coordinate={props.region} />
    </MapView>
  );
};
export default MyMapView;
