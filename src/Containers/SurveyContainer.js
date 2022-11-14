import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import { UserContext } from "../App";

const Stack = createNativeStackNavigator();

const images = {
  activity_high: require("../../assets/images/survey_activity_high.png"),
  activity_low: require("../../assets/images/survey_activity_low.png"),
  activity_moderate: require("../../assets/images/survey_activity_moderate.png"),
  group_alone: require("../../assets/images/survey_group_alone.png"),
  group_group: require("../../assets/images/survey_group_group.png"),
  group_partner: require("../../assets/images/survey_group_partner.png"),
  price_high: require("../../assets/images/survey_price_high.png"),
  price_low: require("../../assets/images/survey_price_low.png"),
  price_moderate: require("../../assets/images/survey_price_moderate.png"),
  travel_driving: require("../../assets/images/survey_travel_driving.png"),
  travel_subway: require("../../assets/images/survey_travel_subway.png"),
  travel_walking: require("../../assets/images/survey_travel_walking.png"),
  unsure: require("../../assets/images/survey_unsure.png"),
};

const SurveyButton = ({ image, text, onPress }) => (
  <View style={tw`w-1/2 p-2 h-64`}>
    <TouchableOpacity
      style={tw`flex flex-col py-4 w-full h-full bg-white items-center justify-center rounded-4 shadow-sm`}
      onPress={() => {
        onPress && onPress();
      }}
      activeOpacity={0.7}
    >
      <Image
        style={{
          flex: 1,
          width: "100%",
          resizeMode: "contain",
        }}
        source={image}
      />
      <Text style={tw`text-xl font-bold text-center`}>{text}</Text>
    </TouchableOpacity>
  </View>
);

const SurveyScreen = ({
  title,
  options = [
    {
      image: null,
      text: null,
      onPress: null,
    },
  ],
  navigation,
  nextScreen,
}) => {
  return (
    <View style={tw`flex items-center justify-center w-full h-full p-8`}>
      <Text style={tw`text-2xl font-bold text-center mb-4`}>{title}</Text>
      <View style={tw`flex flex-col w-full`}>
        {[
          [0, 1],
          [2, 3],
        ].map((row) => (
          <View style={tw`flex flex-row w-full`} key={row[0]}>
            {row.map((index) => (
              <SurveyButton
                key={index}
                text={options[index].text}
                image={options[index].image}
                onPress={() => {
                  options[index].onPress && options[index].onPress();
                  navigation.navigate(nextScreen);
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const TravelModeSurvey = ({ navigation }) => {
  const { setTravelMode } = useContext(UserContext);

  return (
    <SurveyScreen
      title="How are you traveling today?"
      options={[
        {
          image: images.travel_walking,
          text: "Walk",
          onPress: () => setTravelMode("walking"),
        },
        {
          image: images.travel_subway,
          text: "Transit",
          onPress: () => setTravelMode("transit"),
        },
        {
          image: images.travel_driving,
          text: "Drive",
          onPress: () => setTravelMode("driving"),
        },
        {
          image: images.unsure,
          text: "Unsure",
          onPress: () => setTravelMode("walking"),
        },
      ]}
      nextScreen="Survey2"
      navigation={navigation}
    />
  );
};

const GroupSizeSurvey = ({ navigation }) => {
  const { setGroupSize } = useContext(UserContext);

  return (
    <SurveyScreen
      title="Who are you traveling with?"
      options={[
        {
          image: images.group_alone,
          text: "By myself",
          onPress: () => setGroupSize("alone"),
        },
        {
          image: images.group_partner,
          text: "With partner",
          onPress: () => setGroupSize("partner"),
        },
        {
          image: images.group_group,
          text: "With group",
          onPress: () => setGroupSize("group"),
        },
        {
          image: images.unsure,
          text: "Unsure",
          onPress: () => setGroupSize(null),
        },
      ]}
      nextScreen="Survey3"
      navigation={navigation}
    />
  );
};

const ActivityLevelSurvey = ({ navigation }) => {
  const { setActivityLevel } = useContext(UserContext);

  return (
    <SurveyScreen
      title={`How active do you\nwant to be?`}
      options={[
        {
          image: images.activity_low,
          text: "Low",
          onPress: () => setActivityLevel(1),
        },
        {
          image: images.activity_moderate,
          text: "Moderate",
          onPress: () => setActivityLevel(2),
        },
        {
          image: images.activity_high,
          text: "High",
          onPress: () => setActivityLevel(3),
        },
        {
          image: images.unsure,
          text: "Unsure",
          onPress: () => setActivityLevel(null),
        },
      ]}
      nextScreen="Survey4"
      navigation={navigation}
    />
  );
};

const PriceRangeSurvey = ({ navigation }) => {
  const { setPriceRange } = useContext(UserContext);

  return (
    <SurveyScreen
      title={`How much are you\nwilling to spend?`}
      options={[
        {
          image: images.price_low,
          text: "Low",
          onPress: () => setPriceRange(1),
        },
        {
          image: images.price_moderate,
          text: "Moderate",
          onPress: () => setPriceRange(2),
        },
        {
          image: images.price_high,
          text: "High",
          onPress: () => setPriceRange(3),
        },
        {
          image: images.unsure,
          text: "Unsure",
          onPress: () => setPriceRange(null),
        },
      ]}
      nextScreen="Home"
      navigation={navigation}
    />
  );
};

export const SurveyContainer = () => {
  return (
    <Stack.Navigator
      initialRouteName="Survey1"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Survey1" component={TravelModeSurvey} />
      <Stack.Screen name="Survey2" component={GroupSizeSurvey} />
      <Stack.Screen name="Survey3" component={ActivityLevelSurvey} />
      <Stack.Screen name="Survey4" component={PriceRangeSurvey} />
    </Stack.Navigator>
  );
};

export default SurveyContainer;
