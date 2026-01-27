import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Convert zipcode to coordinates using Geocoding API
 */
const zipcodeToCoordinates = async (zipcode) => {
  try {
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const response = await axios.get(geocodeUrl, {
      params: {
        address: zipcode,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    console.log('Geocoding response status:', response.data.status);
    console.log('Geocoding response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      console.log('Found coordinates for zipcode:', zipcode, location);
      return { lat: location.lat, lng: location.lng };
    } else if (response.data.status === 'ZERO_RESULTS') {
      console.error('Geocoding: No results found for zipcode:', zipcode);
      return null;
    } else {
      const errorMsg = response.data.error_message || response.data.status;
      console.error('Geocoding failed:', response.data.status, errorMsg);
      
      // If Geocoding API is not enabled, try using Places API Text Search as fallback
      if (response.data.status === 'REQUEST_DENIED' || response.data.error_message?.includes('API key')) {
        console.log('Geocoding API failed, trying Places API Text Search as fallback...');
        return await zipcodeToCoordinatesFallback(zipcode);
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error geocoding zipcode:', error.response?.data || error.message);
    
    // Try fallback if main geocoding fails
    console.log('Trying fallback geocoding method...');
    return await zipcodeToCoordinatesFallback(zipcode);
  }
};

/**
 * Fallback: Use Places API Text Search to get coordinates
 */
const zipcodeToCoordinatesFallback = async (zipcode) => {
  try {
    const searchUrl = `${BASE_URL}/textsearch/json`;
    const response = await axios.get(searchUrl, {
      params: {
        query: zipcode,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    console.log('Fallback geocoding response status:', response.data.status);
    
    if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      console.log('Found coordinates via fallback for zipcode:', zipcode, location);
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error('Fallback geocoding failed:', response.data.status, response.data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error in fallback geocoding:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

/**
 * Parse address into components
 */
const parseAddress = (formattedAddress) => {
  const parts = formattedAddress.split(',').map((p) => p.trim());
  
  // Extract zipcode (usually last part or second to last)
  let zipcode = '';
  let state = '';
  let city = '';
  let address = '';

  // Try to find zipcode (5 digits)
  const zipcodeMatch = formattedAddress.match(/\b\d{5}\b/);
  if (zipcodeMatch) {
    zipcode = zipcodeMatch[0];
  }

  // Extract state (usually 2-letter code before zipcode)
  const stateMatch = formattedAddress.match(/\b([A-Z]{2})\s+\d{5}\b/);
  if (stateMatch) {
    state = stateMatch[1];
  }

  // City is usually before state
  if (parts.length >= 3) {
    city = parts[parts.length - 2] || '';
    address = parts.slice(0, -2).join(', ') || parts[0] || '';
  } else {
    address = formattedAddress;
  }

  return { address, city, state, zipcode };
};

/**
 * Map Google Places types to dermatology specialties
 */
const mapSpecialties = (types) => {
  const specialtyMap = {
    doctor: 'General Dermatology',
    dermatologist: 'Dermatology',
    health: 'Health Services',
    hospital: 'Hospital Services',
    'beauty_salon': 'Cosmetic Dermatology',
    spa: 'Cosmetic Services',
  };

  const specialties = [];
  if (types) {
    types.forEach((type) => {
      const specialty = specialtyMap[type];
      if (specialty && !specialties.includes(specialty)) {
        specialties.push(specialty);
      }
    });
  }

  // Default specialty if none found
  if (specialties.length === 0) {
    specialties.push('Dermatology');
  }

  return specialties;
};

/**
 * Process Places API results and get detailed information
 */
const processPlacesResults = async (places, zipcode, userLocation) => {
  // Get detailed information for each place (to get phone numbers)
  // Limit to first 10 to avoid too many API calls
  const placesToProcess = places.slice(0, 10);
  console.log('Processing', placesToProcess.length, 'places for details');
  
  const detailedPlaces = await Promise.all(
    placesToProcess.map(async (place, index) => {
      try {
        // Add small delay to avoid rate limiting
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const detailsUrl = `${BASE_URL}/details/json`;
        const detailsResponse = await axios.get(detailsUrl, {
          params: {
            place_id: place.place_id,
            fields: 'name,formatted_address,formatted_phone_number,rating,types,geometry',
            key: GOOGLE_PLACES_API_KEY,
          },
        });

        if (detailsResponse.data.status === 'OK') {
          return detailsResponse.data.result;
        } else {
          console.warn(`Details API returned status: ${detailsResponse.data.status} for place ${place.place_id}`);
          return place;
        }
      } catch (error) {
        console.error(`Error fetching details for place ${place.place_id}:`, error.response?.data || error.message);
        return place;
      }
    })
  );

  // Transform and calculate distances
  const dermatologists = detailedPlaces
    .map((place) => {
      const placeLocation = place.geometry?.location;
      if (!placeLocation) {
        console.warn('Place missing geometry:', place.name || place.place_id);
        return null;
      }

      // Calculate distance if user location is available, otherwise set to 0
      let distance = 0;
      if (userLocation) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          placeLocation.lat,
          placeLocation.lng
        );
      }

      const { address, city, state, zipcode: placeZipcode } = parseAddress(
        place.formatted_address || ''
      );

      const dermatologist = {
        id: place.place_id,
        name: place.name || 'Unknown',
        address: address || '',
        city: city || '',
        state: state || '',
        zipcode: placeZipcode || zipcode,
        phone: place.formatted_phone_number || 'N/A',
        distance: distance,
        rating: place.rating || 0,
        specialties: mapSpecialties(place.types || []),
      };
      
      console.log('Processed dermatologist:', dermatologist.name, 'distance:', dermatologist.distance);
      return dermatologist;
    })
    .filter((doc) => doc !== null);

  // Sort by distance if available, otherwise just return results
  if (userLocation) {
    dermatologists.sort((a, b) => a.distance - b.distance);
  }

  console.log('Returning', dermatologists.length, 'dermatologists');
  return dermatologists;
};

/**
 * Search for dermatologists near a zipcode using Google Places API
 */
export const searchDermatologists = async (zipcode) => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Google Places API key is missing');
    throw new Error('Google Places API key is not configured');
  }

  console.log('Searching for dermatologists near zipcode:', zipcode);

  try {
    // Try to get coordinates first, but if that fails, use Text Search directly
    let userLocation = await zipcodeToCoordinates(zipcode);
    
    // If geocoding fails, we'll use Text Search which doesn't require coordinates
    if (!userLocation) {
      console.log('Geocoding failed, using Text Search API directly with zipcode');
      
      // Use Text Search API directly with zipcode
      const searchUrl = `${BASE_URL}/textsearch/json`;
      const searchResponse = await axios.get(searchUrl, {
        params: {
          query: `dermatologist ${zipcode}`,
          key: GOOGLE_PLACES_API_KEY,
        },
      });

      console.log('Text Search API response status:', searchResponse.data.status);
      console.log('Text Search API results count:', searchResponse.data.results?.length || 0);

      if (searchResponse.data.status === 'ZERO_RESULTS') {
        console.log('No results found for zipcode:', zipcode);
        return [];
      }

      if (searchResponse.data.status !== 'OK' && searchResponse.data.status !== 'ZERO_RESULTS') {
        const errorMsg = searchResponse.data.error_message || searchResponse.data.status;
        console.error('Google Places API error:', searchResponse.data.status, errorMsg);
        throw new Error(`Google Places API error: ${searchResponse.data.status} - ${errorMsg}`);
      }

      const places = searchResponse.data.results || [];
      console.log('Found', places.length, 'places via Text Search');

      // Process results without distance calculation (since we don't have user location)
      const dermatologists = await processPlacesResults(places, zipcode, null);
      return dermatologists;
    }

    console.log('User location:', userLocation);

    // Use Nearby Search API which is more reliable for location-based searches
    const searchUrl = `${BASE_URL}/nearbysearch/json`;
    const searchParams = {
      location: `${userLocation.lat},${userLocation.lng}`,
      radius: 25000, // Search within 25km (~15 miles)
      keyword: 'dermatologist',
      key: GOOGLE_PLACES_API_KEY,
    };
    
    const searchResponse = await axios.get(searchUrl, {
      params: searchParams,
    });

    console.log('Places API response status:', searchResponse.data.status);
    console.log('Places API results count:', searchResponse.data.results?.length || 0);

    if (searchResponse.data.status === 'ZERO_RESULTS') {
      console.log('No results found for zipcode:', zipcode);
      return [];
    }

    if (searchResponse.data.status !== 'OK' && searchResponse.data.status !== 'ZERO_RESULTS') {
      const errorMsg = searchResponse.data.error_message || searchResponse.data.status;
      console.error('Google Places API error:', searchResponse.data.status, errorMsg);
      throw new Error(`Google Places API error: ${searchResponse.data.status} - ${errorMsg}`);
    }

    const places = searchResponse.data.results || [];
    console.log('Found', places.length, 'places');

    // Process results with distance calculation
    const dermatologists = await processPlacesResults(places, zipcode, userLocation);
    return dermatologists;
  } catch (error) {
    console.error('Error searching dermatologists:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    if (error.response?.data?.error_message) {
      throw new Error(`Google Places API: ${error.response.data.error_message}`);
    }
    
    if (error.response?.data?.status) {
      throw new Error(`Google Places API error: ${error.response.data.status}`);
    }
    
    throw error;
  }
};
