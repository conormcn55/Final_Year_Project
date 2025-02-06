import { useState, useEffect } from 'react';

const useEircodeGeocoding = (eircode) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  useEffect(() => {
    const geocodeEircode = async () => {
      if (!eircode) {
        setCoordinates(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const formattedEircode = eircode.replace(/\s/g, '').toUpperCase();
        
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?` +
          `address=${encodeURIComponent(formattedEircode + ', Ireland')}` +
          `&components=country:IE` +
          `&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setCoordinates({ 
            latitude: lat, 
            longitude: lng,
            formattedAddress: data.results[0].formatted_address
          });
        } else {
          throw new Error(`Geocoding failed: ${data.status}`);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    geocodeEircode();
  }, [eircode]);

  return { coordinates, loading, error };
};

export default useEircodeGeocoding;