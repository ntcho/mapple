import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import tw from "twrnc";
import MapView from "../Components/MapView";
import { getCurrentLocation } from "../Services/locationServices";
import { getNearbyRecommendations } from "../Services/placesServices";
import { SwipeableContainer } from "./SwipeableContainer";

export const MapContainer = ({
  params = {
    activityLevel: 1,
    groupSize: "alone",
    priceRange: 1,
    travelMode: "walking",
  },
}) => {
  // keeps track of current device location
  const [currentLocation, setCurrentLocation] = useState({});

  // keeps track of region currently being displayed on the map
  // * only updated by the `onMapRegionChange` callback
  const currentMapRegion = useRef({
    latitude: 40.74843500584747,
    longitude: -73.98566235185115, // Empire State Building Coordinates
    latitudeDelta: 0.0922, // width of visible region
    longitudeDelta: 0.0421, // height of visible region
  });

  // used to move the map to a new location
  const [newMapRegion, setNewMapRegion] = useState(currentMapRegion.current);

  // keeps track of nearby place search result in Google Maps API `results` format
  const nearbyPlaceResults = useRef([]);

  // keeps track of recommendations shown as markers and cards
  const [recommendations, setRecommendations] = useState([]);

  // keeps track of current visible recommendation place
  const recommendationsIndex = useRef(0);

  // only run once before render
  useEffect(() => {
    // update map location to current location
    updateCurrentLocation();

    // console.log("params", params);
  }, []);

  const updateCurrentLocation = () => {
    getCurrentLocation().then((location) => {
      console.log("getCurrentLocation", location);

      // update currentLocation for future reference
      setCurrentLocation(location);

      // center map to current location
      setNewMapRegion({
        latitudeDelta: 0.0922, // width of visible region
        longitudeDelta: 0.0421, // height of visible region
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // get nearby places recommendations
      getNearbyRecommendations(
        location,
        params.travelMode,
        params.groupSize,
        params.activityLevel,
        params.priceRange
      ).then((places) => {
        // console.log("places", JSON.stringify(places, null, 2));
        nearbyPlaceResults.current = places;
        setRecommendations(places.slice(0, 20).reverse());

        // set center to first place recommendation
        setNewMapRegionWithPlace(places[0]);
      });
    });
  };

  const setNewMapRegionWithPlace = (place) => {
    try {
      let nextLocation = place.geometry.location;
      setNewMapRegion({
        ...currentMapRegion.current,
        latitude: nextLocation.lat,
        longitude: nextLocation.lng,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // only runs when nearbyPlaces are updated, process recommendations into places
  // useEffect(
  //   (places) => {
  //     setRecommendations(places);
  //   },
  //   [nearbyPlaceResults]
  // );

  const getCoordsFromName = (coords) => {
    // center map to new coords
    setNewMapRegion({
      ...currentMapRegion.current,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };

  const onMapRegionChange = (newRegion) => {
    currentMapRegion.current = newRegion; // update state without re-render
  };

  return (
    <View style={tw`flex flex-col justify-end items-center w-full h-full`}>
      {/* <MapInput notifyChange={(loc) => this.getCoordsFromName(loc)} /> */}

      <MapView
        region={newMapRegion}
        onRegionChange={(newRegion) => onMapRegionChange(newRegion)}
        markers={recommendations}
        isCardsVisible={true}
      />

      <SwipeableContainer
        places={recommendations}
        onCardLeftScreen={(placeId) => {
          recommendationsIndex.current += 1;
          if (recommendationsIndex.current < recommendations.length) {
            // console.log("NEXT:", recommendations[recommendationsIndex.current]);
            setNewMapRegionWithPlace(
              recommendations[recommendationsIndex.current]
            );
          }
        }}
      />
    </View>
  );
};

export default MapContainer;
