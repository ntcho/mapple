import Constants from "expo-constants";

export const getPlaceDetails = async (placeId) => {
  // TODO: remove on production
  // return mockPlaceDetail;

  try {
    let response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${Constants.manifest.extra.googleMapsApiKey}`
    );
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

export const getNearbyPlaces = async (
  location,
  radius = 16000,
  keyword = null,
  type = null // available types: https://developers.google.com/maps/documentation/places/web-service/supported_types
) => {
  // TODO: remove on production
  // return mockNearbyPlaces;

  try {
    let request =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${location.coords.latitude}%2C${location.coords.longitude}` +
      (radius ? `&radius=${radius}` : "&radius=16000") +
      (keyword ? `&keyword=${keyword}` : "") +
      (type ? `&type=${type}` : "") +
      `&key=${Constants.manifest.extra.googleMapsApiKey}`;
    console.log(request);
    let response = await fetch(request);
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

export const getNearbyRecommendations = async (
  currentLocation,
  travelMode,
  groupSize,
  activityLevel,
  priceRange
) => {
  console.log("getNearbyRecommendations");

  const groupSizeScoreArray = Object.entries(groupSizeScore);
  const activityLevelScoreArray = Object.entries(activityLevelScore);

  // 1. find top 5 types
  let groupSizeScores = groupSizeScoreArray.map(([type, scores]) => {
    if (groupSize == null) return [type, 5]; // return defeult value

    return [
      type,
      [0, 3, 7, 10][scores[{ alone: 0, partner: 1, group: 2 }[groupSize]]],
    ]; // will be ["group", score]
  });

  let typeScores = activityLevelScoreArray
    .map(([type, score], index) => {
      let groupSizeScore = groupSizeScores[index][1];

      if (activityLevel == null) return [type, 5 + groupSizeScore]; // return defeult value

      let activityLevelScore = (2 - Math.abs(score - activityLevel)) * 5; // higher the difference, lower the score

      // console.log(
      //   "getNearbyRecommendations::typeScores",
      //   type,
      //   activityLevelScore,
      //   groupSizeScore
      // );

      return [type, activityLevelScore + groupSizeScore];
    })
    .sort((a, b) => b[1] > a[1]); // sorted by scores

  let topTypes = typeScores.slice(0, 10);

  // console.log("getNearbyRecommendations::topTypes", topTypes);

  // 2. search places for each types and aggregate the results into 1 array
  let placeResults = await Promise.all(
    topTypes.map(async ([type, score]) => {
      let places = await getNearbyPlaces(currentLocation, null, null, type);

      return places.results.map((place) => {
        // 2.1. score with travel mode
        let travelModeScore = 0;

        let deltaLng =
          place.geometry.location.lng - currentLocation.coords.longitude;
        let deltaLat =
          place.geometry.location.lat - currentLocation.coords.latitude;

        // distance in meters
        let distance =
          Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111139;

        // console.log("distance:", distance);

        if (travelMode == null) {
          travelModeScore = 5;
        } else if (distance < 1600) {
          travelModeScore = 10;
        } else if (distance < 1600 * 5) {
          travelModeScore = { walking: 5, transit: 10, driving: 10 }[
            travelMode
          ];
        } else if (1600 * 5 < distance) {
          travelModeScore = { walking: 0, transit: 5, driving: 10 }[travelMode];
        }

        // 2.2. score with price range
        let priceRangeScore = 0;

        if (priceRange == null || "price_level" in place == false) {
          priceRangeScore = 5; // price data not available
        } else if (place.price_level <= 1) {
          // price_level is 0 ~ 1
          priceRangeScore = { 1: 10, 2: 10, 3: 10 }[priceRange];
        } else if (place.price_level <= 2) {
          // price_level is 2
          priceRangeScore = { 1: 5, 2: 10, 3: 10 }[priceRange];
        } else if (place.price_level <= 4) {
          // price_level is 3 ~ 4
          priceRangeScore = { 1: 0, 2: 5, 3: 10 }[priceRange];
        }

        // console.log(
        //   "PLACE:",
        //   place.name,
        //   type,
        //   score,
        //   travelModeScore,
        //   priceRangeScore
        // );

        return {
          ...place,
          place_type: type, // add extra properties to place object
          place_score: score + travelModeScore + priceRangeScore,
        };
      });
    })
  );

  // console.log("", JSON.stringify(...placeResults, null, 2));

  // 3. score and sort the results
  let result = [];

  placeResults.forEach((element) => {
    result = result.concat(element);
  });

  return result.sort((a, b) => b.place_score > a.place_score);
};

const groupSizeScore = {
  amusement_park: [1, 3, 3],
  aquarium: [1, 3, 3],
  art_gallery: [0, 2, 3],
  bakery: [3, 1, 0],
  bar: [3, 3, 3],
  beauty_salon: [3, 2, 1],
  bowling_alley: [1, 2, 3],
  cafe: [2, 2, 1],
  campground: [0, 1, 3],
  casino: [3, 1, 0],
  cemetery: [1, 1, 1],
  church: [1, 1, 1],
  convenience_store: [2, 2, 1],
  department_store: [2, 2, 1],
  drugstore: [1, 1, 1],
  furniture_store: [1, 2, 2],
  hindu_temple: [2, 2, 2],
  liquor_store: [1, 1, 1],
  mosque: [2, 3, 3],
  movie_rental: [1, 2, 2],
  movie_theater: [2, 3, 3],
  night_club: [3, 3, 3],
  park: [2, 3, 3],
  pet_store: [0, 2, 2],
  restaurant: [2, 2, 3],
  shopping_mall: [3, 3, 3],
  supermarket: [2, 2, 2],
  zoo: [2, 2, 2],
};

const activityLevelScore = {
  amusement_park: 2,
  aquarium: 1,
  art_gallery: 1,
  bakery: 1,
  bar: 3,
  beauty_salon: 1,
  bowling_alley: 2,
  cafe: 1,
  campground: 3,
  casino: 2,
  cemetery: 1,
  church: 1,
  convenience_store: 1,
  department_store: 1,
  drugstore: 1,
  furniture_store: 1,
  hindu_temple: 1,
  liquor_store: 1,
  mosque: 2,
  movie_rental: 1,
  movie_theater: 1,
  night_club: 3,
  park: 3,
  pet_store: 1,
  restaurant: 1,
  shopping_mall: 2,
  supermarket: 2,
  zoo: 2,
};

export const getRoutes = async (location, destinationId, mode = "walking") => {
  try {
    let request =
      `https://maps.googleapis.com/maps/api/directions/json` +
      `?origin=${location.coords.latitude},${location.coords.longitude}` +
      `&destination=place_id:${destinationId}` +
      (mode ? `&mode=${mode}` : "") +
      `&key=${Constants.manifest.extra.googleMapsApiKey}`;
    console.log(request);
    let response = await fetch(request);
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const mockPlaceDetail = {
  html_attributions: [],
  result: {
    address_components: [
      { long_name: "48", short_name: "48", types: ["street_number"] },
      {
        long_name: "Pirrama Road",
        short_name: "Pirrama Rd",
        types: ["route"],
      },
      {
        long_name: "Pyrmont",
        short_name: "Pyrmont",
        types: ["locality", "political"],
      },
      {
        long_name: "City of Sydney",
        short_name: "City of Sydney",
        types: ["administrative_area_level_2", "political"],
      },
      {
        long_name: "New South Wales",
        short_name: "NSW",
        types: ["administrative_area_level_1", "political"],
      },
      {
        long_name: "Australia",
        short_name: "AU",
        types: ["country", "political"],
      },
      {
        long_name: "2009",
        short_name: "2009",
        types: ["postal_code"],
      },
    ],
    adr_address:
      '<span class="street-address">48 Pirrama Rd</span>, <span class="locality">Pyrmont</span> <span class="region">NSW</span> <span class="postal-code">2009</span>, <span class="country-name">Australia</span>',
    business_status: "OPERATIONAL",
    formatted_address: "48 Pirrama Rd, Pyrmont NSW 2009, Australia",
    formatted_phone_number: "(02) 9374 4000",
    geometry: {
      location: { lat: -33.866489, lng: 151.1958561 },
      viewport: {
        northeast: { lat: -33.8655112697085, lng: 151.1971156302915 },
        southwest: { lat: -33.86820923029149, lng: 151.1944176697085 },
      },
    },
    icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
    icon_background_color: "#7B9EB0",
    icon_mask_base_uri:
      "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
    international_phone_number: "+61 2 9374 4000",
    name: "Google Workplace 6",
    opening_hours: {
      open_now: false,
      periods: [
        {
          close: { day: 1, time: "1700" },
          open: { day: 1, time: "0900" },
        },
        {
          close: { day: 2, time: "1700" },
          open: { day: 2, time: "0900" },
        },
        {
          close: { day: 3, time: "1700" },
          open: { day: 3, time: "0900" },
        },
        {
          close: { day: 4, time: "1700" },
          open: { day: 4, time: "0900" },
        },
        {
          close: { day: 5, time: "1700" },
          open: { day: 5, time: "0900" },
        },
      ],
      weekday_text: [
        "Monday: 9:00 AM – 5:00 PM",
        "Tuesday: 9:00 AM – 5:00 PM",
        "Wednesday: 9:00 AM – 5:00 PM",
        "Thursday: 9:00 AM – 5:00 PM",
        "Friday: 9:00 AM – 5:00 PM",
        "Saturday: Closed",
        "Sunday: Closed",
      ],
    },
    photos: [
      {
        height: 3024,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/117600448889234589608">Cynthia Wei</a>',
        ],
        photo_reference:
          "Aap_uEC6jqtpflLS8GxQqPHBjlcwBf2sri0ZErk9q1ciHGZ6Zx5HBiiiEsPEO3emtB1PGyWbBQhgPL2r9CshoVlJEG4xzB71QMhGBTqqeaCNk1quO3vTTiP50aM1kmOaBQ-DF1ER7zpu6BQOEtnusKMul0m4KA45wfE3h6Xh2IxjLNzx-IiX",
        width: 4032,
      },
      {
        height: 3264,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/102493344958625549078">Heyang Li</a>',
        ],
        photo_reference:
          "Aap_uECyRjHhOQgGaKTW6Z3ZfTEaDhNc44m0F6GrNSFIMffixwI5xqD35QhecdzVY-FUuDtVE1huu8-2HkxgI9Gwvy6W18fU-_E3UUkdSFBQqGK8_slKlT8BZZc66sTX53IEcTDrZfT-E5_YUBYBOm13yxOTOfWfEDABhaxCGC5Hu_XYh0fI",
        width: 4912,
      },
      {
        height: 3036,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/104829437842034782235">Anna Linetsky</a>',
        ],
        photo_reference:
          "Aap_uEAumTzSdhRHDutPAj6wVPSZZmBV-brI6TPFwI0tcQlbSR74z44mUPr4aXMQKck_AzHaKmbfR3P2c1qsu45i1RQPHrcpIXxrA78FmDjCdWYYZWUnFozdcmEj9OQ_V0G08adpKivMKZyeaQ1NuwRy9GhSopeKpzkzkFZG5vXMYPPSgpa1",
        width: 4048,
      },
      {
        height: 4016,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/107755640736541028674">Jonah Dell</a>',
        ],
        photo_reference:
          "Aap_uECC7cSbDkh-TdmXr6m5d5pgVXJmvXg8dF2jzhL0b0Ko4CtnVll6-tIvdz7vhbCsd3hl2u9EgZ4Y30FBxKmFcimfeYUgW2XJyv8JY5IYGuXsKkCLqpV3QH9dIGwoUv2uX0eosDsUsTN2DOlyOasUgVxcYqzIzEmrL5ofIssThQWZeozD",
        width: 6016,
      },
      {
        height: 3024,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/115886271727815775491">Anthony Huynh</a>',
        ],
        photo_reference:
          "Aap_uEDTdw58CglFmZZAR9iZ05x3y2oK9r5_dRqKWnbZKSS9gs6gp9AeBa1QDvBL6dzZyQAZfN8H2Eppu6y4NBaPOp-GkulZYiKRM7Yww8sUEv-8dmcq35Tx38pe4LEX2wIicFkQHedRgMc0FfV9aFtgosQ5ps5-HCjJSApg8eLGyuxxqPm9",
        width: 4032,
      },
      {
        height: 3024,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/102939237947063969663">Jasen Baker</a>',
        ],
        photo_reference:
          "Aap_uEAGqslqZPhZUk0T2Y6l7mkCYnY7JN9li4g5NkZsE0N4Cdy7_cZ-fZWyV02VhpQR4Ph4fLUL6_WTXrlGMXXzUJXUcSmSTs2d_Dzf3Q_A1y07Dm-vtv7pS3JXsWyrWETGIoT1pIj81PPdUc1vlR2i3GFMWAbx9rCC472ZJclY8JlvMg-x",
        width: 4032,
      },
      {
        height: 3024,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/100678816592586275978">Jeremy Hsiao</a>',
        ],
        photo_reference:
          "Aap_uEBaGxeN90YFjD-AUjxZqM44kpMcICKKBBhb0RQQS7DHHFaay8RRAwjWsAt8GEmmB5QnxrbQWHU3TwhVXXHP0m-YNp9Ds3ihpiFan0moNv4QB7kern5cfjWhhrWe8B0dz_vYvmPssJE24P-24YfWWHubOo0L2MjQyueZfDv57N_RvDZk",
        width: 4032,
      },
      {
        height: 1515,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/112343109286948028063">Andrew W</a>',
        ],
        photo_reference:
          "Aap_uEBDzJlmTeNUreMop6_hkC1HKTCRLyPs5fikJi58qCejtkWp5PIM6vzNN3HErkSWUwnamTr_WLyT7jXMAIdByR-hx8dG-OHjj5JxzmcPvuT_VeVLmdSbNPeIlpmp6EUcPOhaVrhEKojSd44QXkl0za29eZ0oj1KDOnAsGxmhanDFW7lI",
        width: 2048,
      },
      {
        height: 3024,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/100678816592586275978">Jeremy Hsiao</a>',
        ],
        photo_reference:
          "Aap_uEBvYFpzCDQzvQ0kdBxxB70lTkLbTM0yH3xF-BCHsb7DQ63cuWnutvwv8oVLDSbA14_kns3WVlEInTyy2elvmH5lzQteb6zzRu3exkwE65_55TgJqdLO7RYYiPFliWk4ocszn9nn5ELv5uP2BQmqr9QET5vwgxR-0eshyVmcdM42jb39",
        width: 4032,
      },
      {
        height: 4032,
        html_attributions: [
          '<a href="https://maps.google.com/maps/contrib/100678816592586275978">Jeremy Hsiao</a>',
        ],
        photo_reference:
          "Aap_uECQynuD_EnSnbz8sJQ6-B6uR-j2tuu4Z1tuGUjq8xnxFDk-W8OdeLzWBX8suNKTCsPlkzTqC22BXf_hX33XclGPL4SS9xnPmHcMrLoUl0H_xHYevFvT17Hgw5DZpSyVmLvDvxzzJ1rsZTh55QwopmAty083a1r1ZIfL32iXh_q8FUas",
        width: 3024,
      },
    ],
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    plus_code: {
      compound_code: "45MW+C8 Pyrmont NSW, Australia",
      global_code: "4RRH45MW+C8",
    },
    rating: 4,
    reference: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    reviews: [
      {
        author_name: "Luke Archibald",
        author_url:
          "https://www.google.com/maps/contrib/113389359827989670652/reviews",
        language: "en",
        profile_photo_url:
          "https://lh3.googleusercontent.com/a-/AOh14GhGGmTmvtD34HiRgwHdXVJUTzVbxpsk5_JnNKM5MA=s128-c0x00000000-cc-rp-mo",
        rating: 1,
        relative_time_description: "a week ago",
        text: "Called regarding paid advertising google pages to the top of its site of a scam furniture website misleading and taking peoples money without ever sending a product - explained the situation,  explained I'd spoken to an ombudsman regarding it.  Listed ticket numbers etc.\n\nThey left the advertisement running.",
        time: 1652286798,
      },
      {
        author_name: "Tevita Taufoou",
        author_url:
          "https://www.google.com/maps/contrib/105937236918123663309/reviews",
        language: "en",
        profile_photo_url:
          "https://lh3.googleusercontent.com/a/AATXAJwZANdRSSg96QeZG--6BazG5uv_BJMIvpZGqwSz=s128-c0x00000000-cc-rp-mo",
        rating: 1,
        relative_time_description: "6 months ago",
        text: "I need help.  Google Australia is taking my money. Money I don't have any I am having trouble sorting this issue out",
        time: 1637215605,
      },
      {
        author_name: "Jordy Baker",
        author_url:
          "https://www.google.com/maps/contrib/102582237417399865640/reviews",
        language: "en",
        profile_photo_url:
          "https://lh3.googleusercontent.com/a/AATXAJwgg1tM4aVA4nJCMjlfJtHtFZuxF475Vb6tT74S=s128-c0x00000000-cc-rp-mo",
        rating: 1,
        relative_time_description: "4 months ago",
        text: "I have literally never been here in my life, I am 17 and they are taking money I don't have for no reason.\n\nThis is not ok. I have rent to pay and my own expenses to deal with and now this.",
        time: 1641389490,
      },
      {
        author_name: "Prem Rathod",
        author_url:
          "https://www.google.com/maps/contrib/115981614018592114142/reviews",
        language: "en",
        profile_photo_url:
          "https://lh3.googleusercontent.com/a/AATXAJyEQpqs4YvPPzMPG2dnnRTFPC4jxJfn8YXnm2gz=s128-c0x00000000-cc-rp-mo",
        rating: 1,
        relative_time_description: "4 months ago",
        text: "Terrible service. all reviews are fake and irrelevant. This is about reviewing google as business not the building/staff etc.",
        time: 1640159655,
      },
      {
        author_name: "Husuni Hamza",
        author_url:
          "https://www.google.com/maps/contrib/102167316656574288776/reviews",
        language: "en",
        profile_photo_url:
          "https://lh3.googleusercontent.com/a/AATXAJwRkyvoSlgd06ahkF9XI9D39o6Zc_Oycm5EKuRg=s128-c0x00000000-cc-rp-mo",
        rating: 5,
        relative_time_description: "7 months ago",
        text: "Nice site. Please I want to work with you. Am Alhassan Haruna, from Ghana. Contact me +233553851616",
        time: 1633197305,
      },
    ],
    types: ["point_of_interest", "establishment"],
    url: "https://maps.google.com/?cid=10281119596374313554",
    user_ratings_total: 939,
    utc_offset: 600,
    vicinity: "48 Pirrama Road, Pyrmont",
    website: "http://google.com/",
  },
  status: "OK",
};

const mockNearbyPlaces = {
  html_attributions: [],
  next_page_token:
    "AW30NDyo3M0MX1-o6wdG_zBi6ZoF3obb6v0HK4B-b6AneimxWwR1yxlS643So_O_Pblq5apaJFbrdLZdF07jyro_8sq5uzM4oJSNUNbpHfQV2RHLemUzDDDGVKd2h_IKisM0oaKEXUhcTkyQF57464fTSB0tFE7zploHxIzzcnsqA5urfoAkT8ccKel1fHfcntp29hJ9QlWtrKSyRIV6qtnFYQwXC4yJKC2flJGZJc2lBLhZjdT8jIXPSGuoKfCyBBhLCkwrT-Qf5IK-SGDu-oorZfcaGSuwOxhw2pOSUGOTLerqKwc9VWGtt7QiZlUe4c9DfRL5D2_J_JpqdZfWUhj0lsOs0GEhbaUrrUZnzbSOqJ_E0GbML6X8zyG27V6FzwlmVyY0faIWCC5md1f4uFd1cZxxkuNMSJImmjU8jfbNZp_s",
  results: [
    {
      geometry: {
        location: {
          lat: 41.9950919,
          lng: -73.87541139999999,
        },
        viewport: {
          northeast: {
            lat: 42.0063859677039,
            lng: -73.86523095187597,
          },
          southwest: {
            lat: 41.98617400112891,
            lng: -73.88757603300563,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Red Hook",
      photos: [
        {
          height: 3456,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/111897328728228005296">Allan “Keep Life Simple” Sensenich</a>',
          ],
          photo_reference:
            "AW30NDzkI5OrajmilHqJv-JgxiQghUNRuykaCZd7C7qO6tv6kylSkr_p7pjfS6HBnmVX4VWDmRL2MFIfF0v49EFA_H7clhKlw8UUBZA4IrGNY0Po5fsgDGxkznMBMLBl7JgkSOO29ZKf2fAXaVbc0d4lw6wV1CHnue3RZ8UWOdtcD-L_rhtF",
          width: 4608,
        },
      ],
      place_id: "ChIJyTutr4QK3YkRsMcZlp-UDKk",
      reference: "ChIJyTutr4QK3YkRsMcZlp-UDKk",
      scope: "GOOGLE",
      types: ["locality", "political"],
      vicinity: "Red Hook",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0193866,
          lng: -73.9076429,
        },
        viewport: {
          northeast: {
            lat: 42.0207485302915,
            lng: -73.9064295697085,
          },
          southwest: {
            lat: 42.0180505697085,
            lng: -73.90912753029151,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/school-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/school_pinlet",
      name: "Bard College",
      opening_hours: {
        open_now: true,
      },
      photos: [
        {
          height: 3456,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/116748833185406180155">Anastasiia Iun</a>',
          ],
          photo_reference:
            "AW30NDz5twTBeBNS1239Q8hlLhE1F6RC6bBPzs7reo1tgNvArcthiWWcXvsvKe-yefqhHFBnday1d-nFVGLG3Fji06syw5h_M1AA29BjCngS9w2wZwAZIaDyIXbOTlS9j2wu8f3oklky53a-HMrJy1YDx_IWK_NTx5gGaWxQpMwv-EgS5WR3",
          width: 4608,
        },
      ],
      place_id: "ChIJq-mVpW0K3YkRHnPxQtEGusM",
      plus_code: {
        compound_code: "239R+QW Annandale-on-Hudson, NY, USA",
        global_code: "87J8239R+QW",
      },
      rating: 4.4,
      reference: "ChIJq-mVpW0K3YkRHnPxQtEGusM",
      scope: "GOOGLE",
      types: ["university", "school", "point_of_interest", "establishment"],
      user_ratings_total: 123,
      vicinity: "30 Campus Road, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.02947590000001,
          lng: -73.90256169999999,
        },
        viewport: {
          northeast: {
            lat: 42.0308248802915,
            lng: -73.90121271970848,
          },
          southwest: {
            lat: 42.02812691970851,
            lng: -73.9039106802915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Olafur Eliasson: The Parliament of Reality",
      photos: [
        {
          height: 2160,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/111857151388078836544">Dave</a>',
          ],
          photo_reference:
            "AW30NDz4fiduf_LbASuirthwwSrc2MxcngM2sDSzGg4lfnJ_bbJKh4bOxWQaJh0RkjNMB9XfYkeFkPyq5TD43U1mYg5nH8l-2XTRAtRFCpmSLxamgd-b_vQeujS3n4asYmO8WsbOBzp3012Qtz7bO1mF9rFBhTcQJkLYqcAO2DPbyaqdlkVH",
          width: 3840,
        },
      ],
      place_id: "ChIJednpEncK3YkRdBu64ahKkeU",
      plus_code: {
        compound_code: "23HW+QX Annandale-on-Hudson, NY, USA",
        global_code: "87J823HW+QX",
      },
      rating: 4.5,
      reference: "ChIJednpEncK3YkRdBu64ahKkeU",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 6,
      vicinity: "Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.03131260000001,
          lng: -73.9025563,
        },
        viewport: {
          northeast: {
            lat: 42.0325404802915,
            lng: -73.9017455197085,
          },
          southwest: {
            lat: 42.0298425197085,
            lng: -73.9044434802915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#13B5C7",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Fisher Center at Bard",
      opening_hours: {
        open_now: false,
      },
      photos: [
        {
          height: 740,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/117933789783324872538">Fisher Center at Bard</a>',
          ],
          photo_reference:
            "AW30NDxWD6i0B55Y_npfHvBGGgRQMFyiSLqupio5HikBur0_X-zyfe31CfzflVu-1e8SX5GLb9a__xJrpcjPDwBNstQGQE7GpX9LGYGMnRPyEgyKAG0GwIQ8dS3iIaDUv8kSdIkiG28v1u9a2Je5lArbCeFfKAuoS6H4rfHwMiG1VlB5rDsz",
          width: 1600,
        },
      ],
      place_id: "ChIJJbqitG0K3YkRIcwTnKYM8hU",
      plus_code: {
        compound_code: "23JW+GX Annandale-on-Hudson, NY, USA",
        global_code: "87J823JW+GX",
      },
      rating: 4.8,
      reference: "ChIJJbqitG0K3YkRIcwTnKYM8hU",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 202,
      vicinity: "Manor Avenue, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.01165669999999,
          lng: -73.9120342,
        },
        viewport: {
          northeast: {
            lat: 42.01295408029149,
            lng: -73.90908954999999,
          },
          southwest: {
            lat: 42.0102561197085,
            lng: -73.91301575,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Montgomery Place Orchards",
      opening_hours: {
        open_now: false,
      },
      photos: [
        {
          height: 4608,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/115988265676094296027">Cassia Paiva</a>',
          ],
          photo_reference:
            "AW30NDywnrNgw9gICz2FGqxsvGU3h3mvZ5_xx4m6P9dGoEfiFjnyxHaZk-Ak1-rlcVUUpO-y8syg3knIhqXIDZruQf48epVmuHNpUoGp2eXvOrT52lQXHub3aPfCy8POgF0MIl26YUYLJyJKPEhCXCWRD_Yelf80UMPmcBVeE_1KJ8E6N_6Z",
          width: 3456,
        },
      ],
      place_id: "ChIJmbF-SkcK3YkRQqkb7Rna3Lg",
      plus_code: {
        compound_code: "236Q+M5 Red Hook, NY, USA",
        global_code: "87J8236Q+M5",
      },
      rating: 5,
      reference: "ChIJmbF-SkcK3YkRQqkb7Rna3Lg",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 9,
      vicinity: "8 Davis Way, Red Hook",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0557899,
          lng: -73.9164428,
        },
        viewport: {
          northeast: {
            lat: 42.05709813029151,
            lng: -73.9152717697085,
          },
          southwest: {
            lat: 42.05440016970851,
            lng: -73.9179697302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#13B5C7",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Kaatsbaan Cultural Park",
      photos: [
        {
          height: 287,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/112155714157613851352">Kaatsbaan Cultural Park</a>',
          ],
          photo_reference:
            "AW30NDzmc_NiXDCexvl6gQLH1PPQ2yLTrq63zc1kGEx86HFRSjL_aL7wgLbb5H_-jlpuGGTubzVNmF51cm3SanjqYn8dFVoWTgHwAmK7gNzAy48Z-tZAAlg3zrPvdkh9XoyuN7jjKYMdkYUElFAiAFZQDhpoLlFdAFkWBPSidCaOfJFMQotg",
          width: 350,
        },
      ],
      place_id: "ChIJ99rpWMCg3YkRAAeZ_ZIOq04",
      plus_code: {
        compound_code: "334M+8C Tivoli, NY, USA",
        global_code: "87J8334M+8C",
      },
      rating: 4.6,
      reference: "ChIJ99rpWMCg3YkRAAeZ_ZIOq04",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 33,
      vicinity: "120 Broadway, Tivoli",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0585853,
          lng: -73.9095622,
        },
        viewport: {
          northeast: {
            lat: 42.05999068029151,
            lng: -73.90823116970849,
          },
          southwest: {
            lat: 42.05729271970851,
            lng: -73.9109291302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/shopping-71.png",
      icon_background_color: "#4B96F3",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/shopping_pinlet",
      name: "Fabulous Yarn",
      opening_hours: {
        open_now: false,
      },
      photos: [
        {
          height: 1836,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/109817299549333239382">Lara Powers</a>',
          ],
          photo_reference:
            "AW30NDwbY8SvZ3A4ADlAhrZC6wJmAujW1IOi2owONmlIp0u4yZu-qunlwnTzp7lrjhZEcxh2ACCgpckrq20uKw2sOH3HOD0XhYuol37QWsZljq9d3e1XB270jijkkTBBvicK4yekGVqDSCkCQBQswgqvdDgbgTW2f1lqHXiIRrFzY5G7FhTZ",
          width: 3264,
        },
      ],
      place_id: "ChIJI8Fweemg3YkRZ0zmsEMrv48",
      plus_code: {
        compound_code: "335R+C5 Tivoli, NY, USA",
        global_code: "87J8335R+C5",
      },
      rating: 4.5,
      reference: "ChIJI8Fweemg3YkRZ0zmsEMrv48",
      scope: "GOOGLE",
      types: ["point_of_interest", "store", "establishment"],
      user_ratings_total: 111,
      vicinity: "60 Broadway, Tivoli",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 41.9951022,
          lng: -73.8754051,
        },
        viewport: {
          northeast: {
            lat: 41.9964093302915,
            lng: -73.87405721970849,
          },
          southwest: {
            lat: 41.99371136970851,
            lng: -73.8767551802915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Trends Research Institute",
      place_id: "ChIJ9zF2YeMK3YkRSZ4fwBVN1bU",
      plus_code: {
        compound_code: "X4WF+2R Red Hook, NY, USA",
        global_code: "87H8X4WF+2R",
      },
      reference: "ChIJ9zF2YeMK3YkRSZ4fwBVN1bU",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      vicinity: "Red Hook",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 41.9956006,
          lng: -73.8756511,
        },
        viewport: {
          northeast: {
            lat: 41.99688698029149,
            lng: -73.87413416970848,
          },
          southwest: {
            lat: 41.99418901970849,
            lng: -73.8768321302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Advanced Health & Wellness",
      opening_hours: {
        open_now: false,
      },
      place_id: "ChIJ5R9rQ-MK3YkR8FLxyw-6Zz0",
      plus_code: {
        compound_code: "X4WF+6P Red Hook, NY, USA",
        global_code: "87H8X4WF+6P",
      },
      rating: 5,
      reference: "ChIJ5R9rQ-MK3YkR8FLxyw-6Zz0",
      scope: "GOOGLE",
      types: ["point_of_interest", "health", "establishment"],
      user_ratings_total: 3,
      vicinity: "7509 North Broadway #3, Red Hook",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.05847259999999,
          lng: -73.90928749999999,
        },
        viewport: {
          northeast: {
            lat: 42.0598256802915,
            lng: -73.9079544697085,
          },
          southwest: {
            lat: 42.0571277197085,
            lng: -73.9106524302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Four Seasons Sotheby's International Realty [Formerly Gary DiMauro Real Estate]",
      opening_hours: {
        open_now: false,
      },
      photos: [
        {
          height: 3491,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/109660021826564150754">Four Seasons Sotheby&#39;s International Realty</a>',
          ],
          photo_reference:
            "AW30NDyOdpxW5C7X3TkjnDipnI6XpQiP9EEUdo0GguMcoENUWTPkt6Gx77yhDFJZ08vn6G93caRkNFr5qfM22Y-UkSdk4dcRc780VghWEZkxE4NcLpRFH4Dgi_MOoY9bEa3l2oysgu0tyK3DuSCl-woTEVtThBIA3mnj4VXWT_9flwPLWfEl",
          width: 5328,
        },
      ],
      place_id: "ChIJjdYieemg3YkR4WkwK0pdkuA",
      plus_code: {
        compound_code: "335R+97 Tivoli, NY, USA",
        global_code: "87J8335R+97",
      },
      rating: 1,
      reference: "ChIJjdYieemg3YkR4WkwK0pdkuA",
      scope: "GOOGLE",
      types: ["real_estate_agency", "point_of_interest", "establishment"],
      user_ratings_total: 2,
      vicinity: "58 Broadway, Tivoli",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 41.99808780000001,
          lng: -73.872918,
        },
        viewport: {
          northeast: {
            lat: 41.9995824802915,
            lng: -73.87190581970849,
          },
          southwest: {
            lat: 41.9968845197085,
            lng: -73.87460378029151,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/civic_building-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/civic-bldg_pinlet",
      name: "Assemblyman Marcus J Molinaro",
      place_id: "ChIJQ6-ow-UK3YkR1LOzRh7f1Yw",
      plus_code: {
        compound_code: "X4XG+6R Red Hook, NY, USA",
        global_code: "87H8X4XG+6R",
      },
      reference: "ChIJQ6-ow-UK3YkR1LOzRh7f1Yw",
      scope: "GOOGLE",
      types: ["local_government_office", "point_of_interest", "establishment"],
      vicinity: "7578 North Broadway #11, Red Hook",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0205157,
          lng: -73.9104795,
        },
        viewport: {
          northeast: {
            lat: 42.0219309302915,
            lng: -73.9090192197085,
          },
          southwest: {
            lat: 42.0192329697085,
            lng: -73.9117171802915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/shopping-71.png",
      icon_background_color: "#4B96F3",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/shopping_pinlet",
      name: "Bard College Bookstore",
      opening_hours: {
        open_now: false,
      },
      photos: [
        {
          height: 3936,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/101182033246139855503">Joe Fitz</a>',
          ],
          photo_reference:
            "AW30NDz9CoePopykIEbFzgC7kguqupMocnrY0WPVi1vMRMf3kJj84d_jRQBQN84dQhZSY88pQeArKYQzG_H84edcGwAmxHWhW73cy7zSVl48LE3Ze9KOxZHe54LFyXTcR3jJi4FvVGuM5DCqCRyO6775kjsRCefH3MDRav9oVraLLimtUhFn",
          width: 5248,
        },
      ],
      place_id: "ChIJq-TWk2wK3YkRl8LQeTgt_4E",
      plus_code: {
        compound_code: "23CQ+6R Annandale-on-Hudson, NY, USA",
        global_code: "87J823CQ+6R",
      },
      rating: 3.6,
      reference: "ChIJq-TWk2wK3YkRl8LQeTgt_4E",
      scope: "GOOGLE",
      types: ["book_store", "point_of_interest", "store", "establishment"],
      user_ratings_total: 17,
      vicinity: "Campus Center/Ravine Road, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0236201,
          lng: -73.9047825,
        },
        viewport: {
          northeast: {
            lat: 42.02494218029149,
            lng: -73.9029653697085,
          },
          southwest: {
            lat: 42.02224421970849,
            lng: -73.9056633302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/cemetery_grave-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/cemetery_pinlet",
      name: "Bard College Cemetery",
      photos: [
        {
          height: 2736,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/118312280627434633741">Steven Devol</a>',
          ],
          photo_reference:
            "AW30NDyK2uNqvjrAFiiX6Ony8NyD5MKpvna9ETgk9rSlgpSEefZk80_B16orYbHXvnwG0t6pJOLhtm1AhHg5AKKRvSwVXONV0a0uiYWrz1zrM909dAM44qdIfpDt0h1PItucxqghvlggSRQo1PIRaapgKxcNgGM5QJwYIiN-GchU29BR7HmW",
          width: 3648,
        },
      ],
      place_id: "ChIJrfBW33EK3YkR1lLUHuHaME0",
      plus_code: {
        compound_code: "23FW+C3 Annandale-on-Hudson, NY, USA",
        global_code: "87J823FW+C3",
      },
      rating: 4,
      reference: "ChIJrfBW33EK3YkR1lLUHuHaME0",
      scope: "GOOGLE",
      types: ["cemetery", "point_of_interest", "establishment"],
      user_ratings_total: 4,
      vicinity: "101 Campus Road, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0219708,
          lng: -73.9078928,
        },
        viewport: {
          northeast: {
            lat: 42.0233840302915,
            lng: -73.9066190697085,
          },
          southwest: {
            lat: 42.0206860697085,
            lng: -73.9093170302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Kline Commons",
      opening_hours: {
        open_now: true,
      },
      photos: [
        {
          height: 3936,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/101182033246139855503">Joe Fitz</a>',
          ],
          photo_reference:
            "AW30NDx62foxFW5yE3QQeqMCXEt-wTpQNJTI38UuVNGCbZKlhog-ad2V44t3zQPnJtfi-ycWhgYFqcCEidQIyQf-RlkvjsV31AZgMCiMyT7xeKMZ76Nbqj1mXUm0hb9lt4q8gSqs5zcPnlFH5Wf4n57LaW2r5FwntHuG7U4KUUVntbYAz7qs",
          width: 5248,
        },
      ],
      place_id: "ChIJjby0zm0K3YkRqe9z7B7pJu4",
      plus_code: {
        compound_code: "23CR+QR Annandale-on-Hudson, NY, USA",
        global_code: "87J823CR+QR",
      },
      rating: 3.6,
      reference: "ChIJjby0zm0K3YkRqe9z7B7pJu4",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 49,
      vicinity: "1400 Annandale Road, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.01999559999999,
          lng: -73.9079744,
        },
        viewport: {
          northeast: {
            lat: 42.02114638029149,
            lng: -73.9065087197085,
          },
          southwest: {
            lat: 42.01844841970849,
            lng: -73.9092066802915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/school-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/school_pinlet",
      name: "Reem-Kayden Center for Science and Computation",
      photos: [
        {
          height: 1192,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/101182033246139855503">Joe Fitz</a>',
          ],
          photo_reference:
            "AW30NDyw1juF2-Q8dJIlhGRc09IlBuby0dtMQJ24xS5-V0kXk0c30mGNNwSQ2lc84Uidj4pnlSjqRojHJcCsGgJWHIFkuQjhjN-4Y9E2FJ3JnjE-sMi1gE3cyCFbBd76c-9YWHU452Z0UpNOAbyej2E_8SZvkRpl5l5q5MOmViGVl5GoDuxS",
          width: 1192,
        },
      ],
      place_id: "ChIJQXAgE2wK3YkRg82Thig4EwY",
      plus_code: {
        compound_code: "239R+XR Annandale-on-Hudson, NY, USA",
        global_code: "87J8239R+XR",
      },
      rating: 4.5,
      reference: "ChIJQXAgE2wK3YkRg82Thig4EwY",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 4,
      vicinity:
        "Reem-Kayden Center for Science and Computation, 31 Campus Road, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0227018,
          lng: -73.90943949999999,
        },
        viewport: {
          northeast: {
            lat: 42.0241021802915,
            lng: -73.9080490197085,
          },
          southwest: {
            lat: 42.02140421970851,
            lng: -73.9107469802915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Brook House",
      opening_hours: {
        open_now: false,
      },
      photos: [
        {
          height: 3936,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/101182033246139855503">Joe Fitz</a>',
          ],
          photo_reference:
            "AW30NDyvJmVf3IYmmtPodfVgIBEdoxvtnQu4q0SQQWsAmX89cbnGiwxPgJw1HMGdgqIn45o4s2vl86MRyo8jk2bBve0_rAi4lttQD7evFw5GtjhlzIBvFCaVROKUaZmVzRyXjSNAlXWTlSiNjbOg38-KD8bqGCAWnaIrru1jQfpdU_YS0yUV",
          width: 5248,
        },
      ],
      place_id: "ChIJzRggCm0K3YkR7e185ZpYbr4",
      plus_code: {
        compound_code: "23FR+36 Annandale-on-Hudson, NY, USA",
        global_code: "87J823FR+36",
      },
      rating: 4.7,
      reference: "ChIJzRggCm0K3YkR7e185ZpYbr4",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 3,
      vicinity: "11 Woods Avenue, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.0184991,
          lng: -73.9092672,
        },
        viewport: {
          northeast: {
            lat: 42.0199153302915,
            lng: -73.90791796970849,
          },
          southwest: {
            lat: 42.0172173697085,
            lng: -73.9106159302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/school-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/school_pinlet",
      name: "Bard Institute for International Liberal Education",
      photos: [
        {
          height: 300,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/101182033246139855503">Joe Fitz</a>',
          ],
          photo_reference:
            "AW30NDxAbgmGnXqvC3QoSEAGjRqq1wxnVCHjCNEO8UfoiRl_qRcfaAmeihWSmv3VQ6linJodFXPjxRclolKVR0Olxw5acz9tsAhNjipSTFCjKaEB41zdK_StvOHUV6fYnkziPHhUUlv_0nGQpZzyp7CsM-XgT2OHqqdAyhf0LsVmTdpibro9",
          width: 500,
        },
      ],
      place_id: "ChIJhTGZnmsK3YkR4o9NY5c7tf8",
      plus_code: {
        compound_code: "239R+97 Annandale-on-Hudson, NY, USA",
        global_code: "87J8239R+97",
      },
      reference: "ChIJhTGZnmsK3YkR4o9NY5c7tf8",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      vicinity:
        "Jim and Mary Ottaway Gatehouse, 1 Blithewood Avenue, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.02526259999999,
          lng: -73.90635449999999,
        },
        viewport: {
          northeast: {
            lat: 42.0266224302915,
            lng: -73.90518086970849,
          },
          southwest: {
            lat: 42.0239244697085,
            lng: -73.9078788302915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Bard Center for Civic Engagement (Barringer House)",
      photos: [
        {
          height: 4000,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/104362704008725360434">jim catalfamo</a>',
          ],
          photo_reference:
            "AW30NDwIP13ZMU2Kx9G5rsVsPb2e-obj_66J8dt6XFd9VBjRrkXhmYTiY4Rxy8VpC-LSGtFJagQ3rmSh6TFCJ1ir7BDkZ7zc46ItyjKrAfWMGu2EL9ZGTCIaJNu0AcJTQaKLS3XJQ1UIAvIAa76WNmkAEmDVE2XYjq7JjvtpXe23LwQQQUz7",
          width: 6000,
        },
      ],
      place_id: "ChIJ52XMi3EK3YkR6GkZj5CDj0w",
      plus_code: {
        compound_code: "23GV+4F Annandale-on-Hudson, NY, USA",
        global_code: "87J823GV+4F",
      },
      rating: 5,
      reference: "ChIJ52XMi3EK3YkR6GkZj5CDj0w",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 2,
      vicinity: "1442 Annandale Road, Annandale-on-Hudson",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: {
          lat: 42.02131149999999,
          lng: -73.9055796,
        },
        viewport: {
          northeast: {
            lat: 42.02260263029149,
            lng: -73.90425751970848,
          },
          southwest: {
            lat: 42.0199046697085,
            lng: -73.9069554802915,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Old Gym Theatre",
      opening_hours: {
        open_now: true,
      },
      photos: [
        {
          height: 3936,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/101182033246139855503">Joe Fitz</a>',
          ],
          photo_reference:
            "AW30NDxqbO4FHiIXXRLUsVE0Ai_VRMW0ThmpYu5WmS8WVz51CPVNOFi2_khhYkq0cDyaiBrsXbrTIqz4oD-R7CfQP93EkB85E_ErTYt5zUu6HpD1i4orYagoTg1rzm3uLoL-A2u9_tIXcN9OtjWgEYlz7reBV3C4iydxQSe2Pw6CVW8-4Rav",
          width: 5248,
        },
      ],
      place_id: "ChIJYU_UiW4K3YkRGet_4XBcqUw",
      plus_code: {
        compound_code: "23CV+GQ Annandale-on-Hudson, NY, USA",
        global_code: "87J823CV+GQ",
      },
      rating: 5,
      reference: "ChIJYU_UiW4K3YkRGet_4XBcqUw",
      scope: "GOOGLE",
      types: ["point_of_interest", "establishment"],
      user_ratings_total: 3,
      vicinity: "39 Henderson Circle Drive, Annandale-on-Hudson",
    },
    {
      geometry: {
        location: {
          lat: 42.0775906,
          lng: -73.95291259999999,
        },
        viewport: {
          northeast: {
            lat: 42.08895393562506,
            lng: -73.92618607618684,
          },
          southwest: {
            lat: 42.06338404751401,
            lng: -73.97131382202872,
          },
        },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png",
      icon_background_color: "#7B9EB0",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet",
      name: "Saugerties",
      photos: [
        {
          height: 2268,
          html_attributions: [
            '<a href="https://maps.google.com/maps/contrib/105292135151555668116">Kalina Nikolova</a>',
          ],
          photo_reference:
            "AW30NDxSe-3sow4hDj8cgxykGh6bKQG8eAl2PzNIVYDENe8Uf0DUE4h3b577Gjb_u_LTgBI_4r08wEOS5kamchTZc5UBVq_jMk2crVmv8a9ZkOXzXdtCnbbbCz19JgecWe-8lcVMmmuc47ZWg8LLGvsqvCuGGzW1UEK1vYhNzy5B2xk0yBmj",
          width: 4032,
        },
      ],
      place_id: "ChIJu9HgefMI3YkR1jphgp8t5dc",
      reference: "ChIJu9HgefMI3YkR1jphgp8t5dc",
      scope: "GOOGLE",
      types: ["locality", "political"],
      vicinity: "Saugerties",
    },
  ],
  status: "OK",
};
