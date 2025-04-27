const axios = require('axios');
const config = require('../config');

const getCoordinatesForLocation = async (location) => {
  // Add more cities with their coordinates
  const cityCoordinates = {
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'madurai': { lat: 9.9252, lng: 78.1198 }, // Added Madurai coordinates
    'kochi': { lat: 9.9312, lng: 76.2673 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 }
  };

  const cityKey = location.toLowerCase().split(',')[0].trim();
  if (cityCoordinates[cityKey]) {
    console.log(`Using hardcoded coordinates for ${location}: ${JSON.stringify(cityCoordinates[cityKey])}`);
    return cityCoordinates[cityKey];
  }

  console.log(`No hardcoded coordinates found for ${location}, using Google Geocoding API`);
  const searchLocation = location.toLowerCase().includes('india') ?
    location : `${location}, India`;

  try {
    if (!config.google.placesApiKey) {
      console.error('Google Places API key is missing');
      throw new Error('Google Places API key is missing');
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocation)}&key=${config.google.placesApiKey}`;
    console.log(`Geocoding ${searchLocation}`);
    const response = await axios.get(geocodeUrl);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      console.log(`Geocoding successful for ${location}: ${lat}, ${lng}`);
      return { lat, lng };
    }

    console.error(`Geocoding failed for ${location}: ${response.data.status}`);
    // Fallback to a default location in India if geocoding fails
    console.log('Using fallback coordinates for India');
    return { lat: 20.5937, lng: 78.9629 }; // Center of India as fallback
  } catch (error) {
    console.error(`Error geocoding location ${location}: ${error.message}`);
    // Fallback to a default location in India if geocoding fails
    console.log('Using fallback coordinates for India due to error');
    return { lat: 20.5937, lng: 78.9629 }; // Center of India as fallback
  }
};

const mapSectorToPlacesType = (sector) => {
  const typeMap = {
    'Grocery': 'grocery_or_supermarket',
    'Electronics': 'electronics_store',
    'Fashion': 'clothing_store',
    'Home Decor': 'home_goods_store',
    'Restaurant': 'restaurant',
    'Retail': 'store'
  };

  return typeMap[sector] || 'store';
};

const verifyAndEnrichLead = (place) => {
  let verificationScore = 50;

  if (place.name) verificationScore += 10;
  if (place.formatted_address) verificationScore += 10;
  if (place.formatted_phone_number) verificationScore += 10;
  if (place.website) verificationScore += 10;
  if (place.rating && place.user_ratings_total > 0) verificationScore += 10;

  return {
    id: place.place_id,
    businessName: place.name,
    businessType: place.types[0].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    contactDetails: {
      phone: place.formatted_phone_number || '',
      website: place.website || '',
      email: '',
      socialMedia: {}
    },
    address: place.formatted_address,
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    },
    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
    description: place.editorial_summary?.overview || '',
    photos: (place.photos || []).slice(0, 3).map(photo => ({
      url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${config.google.placesApiKey}`
    })),
    verificationScore,
    source: 'Google Places'
  };
};

const searchPlaces = async (sector, location, maxResults = 100) => {
  try {
    console.log(`Searching for ${sector} businesses in ${location}, max results: ${maxResults}`);

    // Get coordinates for the location
    const { lat, lng } = await getCoordinatesForLocation(location);
    console.log(`Using coordinates for ${location}: lat=${lat}, lng=${lng}`);

    const type = mapSectorToPlacesType(sector);
    console.log(`Mapped sector ${sector} to place type: ${type}`);

    // Strategy 1: Search with type and keyword
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=${type}&keyword=${encodeURIComponent(sector)}&key=${config.google.placesApiKey}`;
    console.log(`Executing Strategy 1 search for ${sector} in ${location}`);

    let strategy1Places = [];
    let response;

    try {
      response = await axios.get(searchUrl);

      if (response.data.status === 'OK') {
        strategy1Places = response.data.results;
        console.log(`Strategy 1 initial search found ${strategy1Places.length} places`);

        let pageToken = response.data.next_page_token;
        let pageCount = 0;

        while (pageToken && pageCount < 2 && strategy1Places.length < maxResults) {
          console.log(`Fetching next page of results (page ${pageCount + 2})`);
          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            const nextPageResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${pageToken}&key=${config.google.placesApiKey}`
            );

            if (nextPageResponse.data.status === 'OK') {
              strategy1Places = [...strategy1Places, ...nextPageResponse.data.results];
              pageToken = nextPageResponse.data.next_page_token;
              console.log(`Added ${nextPageResponse.data.results.length} more places, total: ${strategy1Places.length}`);
            } else {
              console.log(`Next page request failed with status: ${nextPageResponse.data.status}`);
              break;
            }

            pageCount++;
          } catch (error) {
            console.error(`Error fetching next page: ${error.message}`);
            break;
          }
        }
      } else {
        console.log(`Strategy 1 search failed with status: ${response.data.status}`);
      }
    } catch (error) {
      console.error(`Error in Strategy 1 search: ${error.message}`);
    }

    // If Strategy 1 didn't find enough results, try Strategy 2
    let finalPlaces = strategy1Places;
    if (strategy1Places.length < maxResults) {
      console.log(`Strategy 1 found only ${strategy1Places.length} places, trying Strategy 2`);
      const altSearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&keyword=${encodeURIComponent(sector)}&key=${config.google.placesApiKey}`;

      let strategy2Places = [];

      try {
        response = await axios.get(altSearchUrl);

        if (response.data.status === 'OK') {
          strategy2Places = response.data.results;
          console.log(`Strategy 2 initial search found ${strategy2Places.length} places`);

          let pageToken = response.data.next_page_token;
          let pageCount = 0;

          while (pageToken && pageCount < 2 && strategy2Places.length < maxResults) {
            console.log(`Fetching next page of results for Strategy 2 (page ${pageCount + 2})`);
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
              const nextPageResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${pageToken}&key=${config.google.placesApiKey}`
              );

              if (nextPageResponse.data.status === 'OK') {
                strategy2Places = [...strategy2Places, ...nextPageResponse.data.results];
                pageToken = nextPageResponse.data.next_page_token;
                console.log(`Added ${nextPageResponse.data.results.length} more places to Strategy 2, total: ${strategy2Places.length}`);
              } else {
                console.log(`Next page request for Strategy 2 failed with status: ${nextPageResponse.data.status}`);
                break;
              }

              pageCount++;
            } catch (error) {
              console.error(`Error fetching next page for Strategy 2: ${error.message}`);
              break;
            }
          }
        } else {
          console.log(`Strategy 2 search failed with status: ${response.data.status}`);
        }
      } catch (error) {
        console.error(`Error in Strategy 2 search: ${error.message}`);
      }

      // Combine results from both strategies, removing duplicates
      const existingIds = new Set(finalPlaces.map(p => p.place_id));
      const uniqueStrategy2Places = strategy2Places.filter(p => !existingIds.has(p.place_id));
      finalPlaces = [...finalPlaces, ...uniqueStrategy2Places];
      console.log(`Combined unique places from both strategies: ${finalPlaces.length}`);
    }

    // If we still don't have any places, return an empty array
    if (finalPlaces.length === 0) {
      console.log(`No places found for ${sector} in ${location}`);
      return [];
    }

    console.log(`Enriching ${Math.min(finalPlaces.length, maxResults)} places with details`);
    const enrichedPlaces = await Promise.all(
      finalPlaces.slice(0, maxResults).map(async (place) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,editorial_summary,photos,geometry,types&key=${config.google.placesApiKey}`;
          const detailsResponse = await axios.get(detailsUrl);

          if (detailsResponse.data.status === 'OK') {
            return verifyAndEnrichLead(detailsResponse.data.result);
          }

          console.log(`Could not get details for place ${place.place_id}, using basic info`);
          return verifyAndEnrichLead(place);
        } catch (error) {
          console.error(`Error getting details for place ${place.place_id}: ${error.message}`);
          return verifyAndEnrichLead(place);
        }
      })
    );

    console.log(`Successfully enriched ${enrichedPlaces.length} places`);
    return enrichedPlaces;
  } catch (error) {
    console.error(`Fatal error in searchPlaces: ${error.message}`);
    console.error(error.stack);
    // Return empty array instead of throwing to prevent 500 errors
    return [];
  }
};

module.exports = {
  searchPlaces
};
