import React from "react";
import { View } from "react-native";
import TinderCard from "react-tinder-card";
import tw from "twrnc";
import PlaceCard from "../Components/PlaceCard";

export const SwipeableContainer = ({
  placeIds = null,
  // placeIds = [
  //   "ChIJ52XMi3EK3YkR6GkZj5CDj0w",
  //   "ChIJJbqitG0K3YkRIcwTnKYM8hU",
  //   "ChIJq-TWk2wK3YkRl8LQeTgt_4E",
  // ],
  places = null,
  onSwipe = null,
  onCardLeftScreen = null,
}) => {
  // const [lastDirection, setLastDirection] = useState();

  // const swiped = (direction, nameToDelete) => {
  //   console.log("removing: " + nameToDelete);
  //   setLastDirection(direction);
  // };

  // const outOfFrame = (name) => {
  //   console.log(name + " left the screen!");
  // };

  return (
    <View style={tw`w-full h-78 p-4`}>
      {places &&
        places.map((place, index) => (
          <TinderCard
            key={index}
            onSwipe={(dir) => onSwipe && onSwipe(dir, place.place_id)}
            onCardLeftScreen={() =>
              onCardLeftScreen && onCardLeftScreen(place.place_id)
            }
          >
            <View style={tw`absolute`}>
              <PlaceCard place={place} />
            </View>
          </TinderCard>
        ))}
      {placeIds &&
        placeIds.map((place_id, index) => (
          <TinderCard
            key={index}
            onSwipe={(dir) => onSwipe && onSwipe(dir, place_id)}
            onCardLeftScreen={() =>
              onCardLeftScreen && onCardLeftScreen(place_id)
            }
          >
            <View style={tw`absolute`}>
              <PlaceCard placeId={place_id} />
            </View>
          </TinderCard>
        ))}
    </View>
  );
};

export default SwipeableContainer;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>React Native Tinder Card</Text>
//       <View style={styles.cardContainer}>
//         {characters.map((character) => (
//           <TinderCard
//             key={character.name}
//             onSwipe={(dir) => swiped(dir, character.name)}
//             onCardLeftScreen={() => outOfFrame(character.name)}
//           >
//             <View style={styles.card}>
//               <ImageBackground
//                 style={styles.cardImage}
//                 source={{ uri: "https://via.placeholder.com/150" }}
//               >
//                 <Text style={styles.cardTitle}>{character.name}</Text>
//               </ImageBackground>
//             </View>
//           </TinderCard>
//         ))}
//       </View>
//       {lastDirection ? (
//         <Text style={styles.infoText}>You swiped {lastDirection}</Text>
//       ) : (
//         <Text style={styles.infoText} />
//       )}
//     </View>
//   );
