import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { AnimatedFAB } from "react-native-paper";
import tw from "twrnc";

import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import MapView from "../Components/MapView";
import { getCurrentLocation, getZoomLevel } from "../Services/locationServices";
import { getNearbyRecommendations } from "../Services/placesServices";
import {
  addSavedPlaceIds,
  getSurveyResults,
} from "../Services/storageServices";
import { SwipeableContainer } from "./SwipeableContainer";

export const MapContainer = ({ route, navigation }) => {
  // keeps track of current device location
  const [currentLocation, setCurrentLocation] = useState({});

  // keeps track of region currently being displayed on the map
  // * only updated by the `onMapRegionChange` callback
  const currentMapCamera = useRef({
    latitude: 40.74843500584747,
    longitude: -73.98566235185115, // Empire State Building Coordinates
    latitudeDelta: 0.0922, // width of visible region
    longitudeDelta: 0.0421, // height of visible region
    zoom: 14,
  });

  // used to move the map to a new location
  const [mapCamera, setMapCamera] = useState(currentMapCamera.current);

  // keeps track of nearby place search result in Google Maps API `results` format
  const nearbyPlaceResults = useRef([]);

  // keeps track of recommendations shown as markers and cards
  const [recommendations, setRecommendations] = useState([]);

  // keeps track of current visible recommendation place
  const recommendationsIndex = useRef(null);

  // survey results for recommendations
  const [surveyResults, setSurveyResults] = useState(null);

  const [isBlurVisible, setBlurVisible] = useState(false);

  // get survey results on focus
  useFocusEffect(
    useCallback(() => {
      getSurveyResults().then((r) => {
        setSurveyResults(r);
        console.log("useFocusEffect::results", r);
      });
    }, [])
  );

  // only run when surveyResults is updated
  useEffect(() => {
    // only run when surveyResults is loaded
    if (surveyResults != null) {
      // update map location to current location
      updateCurrentLocation();
    }
  }, [surveyResults]);

  const updateCurrentLocation = () => {
    getCurrentLocation().then((location) => {
      // console.log("getCurrentLocation", location);

      // update currentLocation for future reference
      setCurrentLocation(location);

      // center map to current location
      setMapCamera({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        zoom: 14,
      });

      // get nearby places recommendations
      getNearbyRecommendations(location, surveyResults).then((places) => {
        const LENGTH = 20;

        // console.log("places", JSON.stringify(places[0], null, 2));

        nearbyPlaceResults.current = places;
        recommendationsIndex.current = LENGTH - 1;

        setRecommendations(places.slice(0, LENGTH).reverse());

        // set center to first place recommendation
        console.log("newCenter firstSet");
        setMapCameraWithPlace(places[0]);

        setIsCardVisible(true);
      });
    });
  };

  const setMapCameraWithPlace = (place) => {
    try {
      console.log(
        "newCenter =\t",
        place.geometry.location.lat,
        "\t\t",
        place.geometry.location.lng,
        "\t",
        getZoomLevel(surveyResults.travelMode),
        place.name
      );
      setMapCamera({
        zoom: getZoomLevel(surveyResults.travelMode),
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onMapRegionChange = (newRegion) => {
    currentMapCamera.current = {
      ...currentMapCamera,
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    }; // update state without re-render
  };

  const showBlur = () => {
    console.log("showblur");
    setBlurVisible(true);
    setTimeout(() => {
      setBlurVisible(false);
    }, 1000);
  };

  // TODO: make FAB responsive
  const [isCardVisible, setIsCardVisible] = useState(false);

  return (
    <View style={tw`flex flex-col justify-end items-center w-full h-full`}>
      {/* <MapInput notifyChange={(loc) => this.getCoordsFromName(loc)} /> */}

      <MapView
        camera={mapCamera}
        onRegionChange={(newRegion) => onMapRegionChange(newRegion)}
        markers={recommendations}
        isCardsVisible={isCardVisible}
      />

      <AnimatedFAB
        icon={"lightning-bolt"}
        label={"Find new match"}
        extended={true}
        onPress={() => navigation.navigate("Survey")}
        visible={true}
        animateFrom={"right"}
        iconMode={"static"}
        style={tw`bottom-78 right-4 absolute rounded-4 bg-orange-600`}
      />

      <SwipeableContainer
        places={recommendations} // TODO: fix not being re-drawn with update
        onSwipe={(dir, placeId) => {
          if (dir == "right") {
            showBlur();
            addSavedPlaceIds(placeId);
          }
        }}
        onCardLeftScreen={(placeId) => {
          if (recommendationsIndex.current > 0) {
            // move camera to next recommended place
            console.log("newCenter swipeSet");
            setMapCameraWithPlace(
              recommendations[recommendationsIndex.current - 1]
            );

            recommendationsIndex.current = recommendationsIndex.current - 1;
          } else {
            // return to current location
            setMapCamera({
              ...currentMapCamera.current,
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            });
            setIsCardVisible(false);
          }
        }}
      />

      {isBlurVisible && (
        <BlurView
          style={tw`absolute top-0 left-0 w-full h-full`}
          BlurTint="light"
          intensity={10}
        >
          <View style={tw`flex w-full h-full justify-center items-center`}>
            <Text style={tw`text-3xl m-4 font-extrabold text-center`}>
              Saved!
            </Text>
          </View>
        </BlurView>
      )}
    </View>
  );
};

export default MapContainer;
