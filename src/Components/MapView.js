import React, { useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import tw from "twrnc";

const MyMapView = ({
  region,
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

  if (map.current != null && region != null) {
    let newCenter = {
      latitude: isCardsVisible
        ? region.latitude + region.latitudeDelta * -0.1
        : region.latitude,
      longitude: region.longitude,
    };

    map.current.getCamera().then(({ center }) => {
      if (
        // check distance between two points
        Math.abs(center.latitude - newCenter.latitude) > 0.1 ||
        Math.abs(center.longitude - newCenter.longitude) > 0.1
      ) {
        // points are too far, skip animation
        map.current.setCamera({
          center: newCenter,
        });
      } else {
        // close enough, animate to new coords
        map.current.animateCamera({
          center: newCenter,
        });
      }
    });
  }

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
        markers.slice(0, 9).map((place, index) => (
          <Marker
            key={place.place_id}
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
