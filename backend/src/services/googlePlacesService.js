const axios = require('axios');
const config = require('../config');

const getCoordinatesForLocation = async (location) => {
  const cityCoordinates = {
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'chennai': { lat: 13.0827, lng: 80.2707 }
  };

  const cityKey = location.toLowerCase().split(',')[0].trim();
  if (cityCoordinates[cityKey]) {
    return cityCoordinates[cityKey];
  }

  const searchLocation = location.toLowerCase().includes('india') ? 
    location : `${location}, India`;

  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchLocation)}&key=${config.google.placesApiKey}`;
    const response = await axios.get(geocodeUrl);

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    }
    
    throw new Error(`Geocoding failed: ${response.data.status}`);
  } catch (error) {
    throw new Error('Error geocoding location: ' + error.message);
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
    const { lat, lng } = await getCoordinatesForLocation(location);
    const type = mapSectorToPlacesType(sector);
    
    // Strategy 1: Search with type and keyword
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=${type}&keyword=${encodeURIComponent(sector)}&key=${config.google.placesApiKey}`;
    
    let strategy1Places = [];
    let response = await axios.get(searchUrl);
    
    if (response.data.status === 'OK') {
      strategy1Places = response.data.results;
      let pageToken = response.data.next_page_token;
      let pageCount = 0;
      
      while (pageToken && pageCount < 2 && strategy1Places.length < maxResults) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const nextPageResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${pageToken}&key=${config.google.placesApiKey}`
          );
          
          if (nextPageResponse.data.status === 'OK') {
            strategy1Places = [...strategy1Places, ...nextPageResponse.data.results];
            pageToken = nextPageResponse.data.next_page_token;
          } else {
            break;
          }
          
          pageCount++;
        } catch (error) {
          break;
        }
      }
    }

    // If Strategy 1 didn't find enough results, try Strategy 2
    let finalPlaces = strategy1Places;
    if (strategy1Places.length < maxResults) {
      const altSearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&keyword=${encodeURIComponent(sector)}&key=${config.google.placesApiKey}`;
      
      let strategy2Places = [];
      response = await axios.get(altSearchUrl);
      
      if (response.data.status === 'OK') {
        strategy2Places = response.data.results;
        let pageToken = response.data.next_page_token;
        let pageCount = 0;
        
        while (pageToken && pageCount < 2 && strategy2Places.length < maxResults) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          try {
            const nextPageResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${pageToken}&key=${config.google.placesApiKey}`
            );
            
            if (nextPageResponse.data.status === 'OK') {
              strategy2Places = [...strategy2Places, ...nextPageResponse.data.results];
              pageToken = nextPageResponse.data.next_page_token;
            } else {
              break;
            }
            
            pageCount++;
          } catch (error) {
            break;
          }
        }
      }

      const existingIds = new Set(finalPlaces.map(p => p.place_id));
      const uniqueStrategy2Places = strategy2Places.filter(p => !existingIds.has(p.place_id));
      finalPlaces = [...finalPlaces, ...uniqueStrategy2Places];
    }

    const enrichedPlaces = await Promise.all(
      finalPlaces.slice(0, maxResults).map(async (place) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,editorial_summary,photos,geometry,types&key=${config.google.placesApiKey}`;
          const detailsResponse = await axios.get(detailsUrl);
          
          if (detailsResponse.data.status === 'OK') {
            return verifyAndEnrichLead(detailsResponse.data.result);
          }
          
          return verifyAndEnrichLead(place);
        } catch (error) {
          return verifyAndEnrichLead(place);
        }
      })
    );

    return enrichedPlaces;
  } catch (error) {
    throw new Error('Error searching places: ' + error.message);
  }
};

module.exports = {
  searchPlaces
};
