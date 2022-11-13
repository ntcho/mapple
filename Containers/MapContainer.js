import React from "react";
import { View } from "react-native";
import MapInput from "../Component/MapInput";
import MyMapView from "../Component/MapView";
import { getCurrentLocation } from "../Services/locationServices";

class MapContainer extends React.Component {
  state = {
    currentLocation: {}, // stores current user location
    // Will follow the format of:
    // {
    //   "coords": {
    //     "accuracy": 9.874467499002057,
    //     "altitude": 43.966915130615234,
    //     "altitudeAccuracy": 12,
    //     "heading": 69.609375,
    //     "latitude": 42.02832346786003,
    //     "longitude": -73.90763908631531,
    //     "speed": 0
    //   },
    //   "timestamp": 1668314455999.9976
    // }
    mapRegion: {
      latitude: 40.74843500584747,
      longitude: -73.98566235185115, // Empire State Building Coordinates
      latitudeDelta: 0.0922, // width of visible region
      longitudeDelta: 0.0421, // height of visible region
    },
  };

  componentDidMount() {
    // update map location to current location
    this.updateCurrentLocation();
  }

  updateCurrentLocation() {
    getCurrentLocation().then((location) => {
      console.log(location);
      this.setState({
        currentLocation: location,
        mapRegion: {
          // center map to current location
          ...this.state.mapRegion,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
    });
  }

  getCoordsFromName(loc) {
    this.setState({
      currentLocation: {
        coords: {
          latitude: loc.lat,
          longitude: loc.lng,
        },
      },
    });
  }

  onMapRegionChange(newRegion) {
    this.state.mapRegion = newRegion; // update state without re-render
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        {/* <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <MapInput notifyChange={(loc) => this.getCoordsFromName(loc)} />
        </View> */}

        <View style={{ flex: 1 }}>
          <MyMapView
            region={this.state.mapRegion}
            onRegionChange={(newRegion) => this.onMapRegionChange(newRegion)}
          />
        </View>
      </View>
    );
  }
}

export default MapContainer;
