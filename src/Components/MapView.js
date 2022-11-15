import React, { useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import tw from "twrnc";
import { getOffset } from "../Services/locationServices";

const MyMapView = ({
  camera,
  initialRegion = {
    latitude: 40.74843500584747,
    longitude: -73.98566235185115, // Empire State Building Coordinates
    latitudeDelta: 0.0922, // width of visible region
    longitudeDelta: 0.0421, // height of visible region
  },
  markers,
  isCardsVisible = false,
  onRegionChange,
}) => {
  const map = useRef(null);

  // useEffect(
  //   () => ,
  //   [camera]
  // );

  (async () => {
    if (map.current != null && camera != null) {
      let newCenter = {
        latitude: isCardsVisible
          ? camera.latitude + getOffset(camera.zoom, -0.1)
          : camera.latitude,
        longitude: camera.longitude,
      };

      let { center } = await map.current.getCamera();

      // console.log("MAP:", map.current);
      console.log(
        "actualCenter=\t",
        newCenter.latitude,
        "\t",
        newCenter.longitude,
        "\t",
        camera.zoom
      );

      if (
        // check distance between two points
        Math.abs(center.latitude - newCenter.latitude) > 0.1 ||
        Math.abs(center.longitude - newCenter.longitude) > 0.1
      ) {
        // points are too far, skip animation
        map.current.setCamera(
          {
            center: newCenter,
            zoom: camera.zoom,
          },
          { duration: 0 }
        );
      } else {
        // close enough, animate to new coords
        map.current.animateCamera(
          {
            center: newCenter,
            zoom: camera.zoom,
          },
          { duration: 250 }
        );
      }
    }
  })();

  // console.log(
  //   "MapView::markers",
  //   JSON.stringify(markers[0].geometry.location, null, 2)
  // );

  return (
    <MapView
      ref={(ref) => {
        map.current = ref;
      }}
      provider={PROVIDER_GOOGLE}
      style={tw`absolute top-0 left-0 w-full h-full`}
      initialRegion={
        isCardsVisible
          ? {
              ...initialRegion,
              // move the map 10% downwards so the marker is visible with the cards
              latitude:
                initialRegion.latitude + initialRegion.latitudeDelta * -0.1,
            }
          : initialRegion
      }
      showsUserLocation={true}
      onRegionChange={onRegionChange && ((region) => onRegionChange(region))}
      // followsUserLocation={true}
    >
      {markers &&
        markers.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            // title={marker.title}
            // description={marker.description}
          />
        ))}
    </MapView>
  );
};

export default MyMapView;
