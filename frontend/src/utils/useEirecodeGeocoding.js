import { useState, useEffect } from 'react';

/**
 * Custom React hook to convert an Irish Eircode to geographical coordinates
 * using Google Maps Geocoding API
 */
const useEircodeGeocoding = (eircode) => {
  const [coordinates, setCoordinates] = useState(null);  // State for storing the resulting coordinates
  const [loading, setLoading] = useState(false);  // State for tracking the loading status of the API request
  const [error, setError] = useState(null);  // State for storing any errors that occur during geocoding
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;  // Get Google Maps API key from environment variables

  // Effect hook that runs when the eircode parameter changes
  useEffect(() => {
    /**
     * Function to perform the geocoding request
     */
    const geocodeEircode = async () => {
      // If no eircode is provided, reset coordinates and exit early
      if (!eircode) {
        setCoordinates(null);
        return;
      }

      // Set loading state to true and clear any previous errors
      setLoading(true);
      setError(null);

      try {
        // Format the eircode: remove spaces and convert to uppercase
        const formattedEircode = eircode.replace(/\s/g, '').toUpperCase();
        // Make a request to Google Maps Geocoding API
        // Appends "Ireland" to improve accuracy and restricts results to Ireland
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?` +
          `address=${encodeURIComponent(formattedEircode + ', Ireland')}` +
          `&components=country:IE` +
          `&key=${GOOGLE_MAPS_API_KEY}`
        );

        // Parse the JSON response
        const data = await response.json();

        // Check if the geocoding was successful
        if (data.status === 'OK' && data.results.length > 0) {
          // Extract latitude and longitude from the response
          const { lat, lng } = data.results[0].geometry.location;
          // Update coordinates state with the result
          setCoordinates({ 
            latitude: lat, 
            longitude: lng,
            formattedAddress: data.results[0].formatted_address
          });
        } else {
          // Throw an error if geocoding failed
          throw new Error(`Geocoding failed: ${data.status}`);
        }
      } catch (err) {
        // Log the error to console and update error state
        console.error('Geocoding error:', err);
        setError(err.message);
      } finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
      }
    };

    // Call the geocoding function
    geocodeEircode();
  }, [eircode]); // Re-run this effect when eircode changes

  // Return an object with the coordinates, loading state, and any error
  return { coordinates, loading, error };
};

// Export the hook for use in other components
export default useEircodeGeocoding;