import { searchDermatologists } from '../services/googlePlacesService.js';

/**
 * Search for dermatologists by zipcode
 */
export const searchDermatologistsByZipcode = async (req, res) => {
  try {
    const { zipcode } = req.query;
    console.log('Received search request for zipcode:', zipcode);

    if (!zipcode) {
      return res.status(400).json({ error: 'Zipcode is required' });
    }

    // Validate zipcode format (5 digits)
    const zipcodeRegex = /^\d{5}$/;
    if (!zipcodeRegex.test(zipcode.trim())) {
      return res.status(400).json({ error: 'Invalid zipcode format. Please provide a 5-digit zipcode.' });
    }

    const results = await searchDermatologists(zipcode.trim());
    console.log('Search completed. Found', results.length, 'dermatologists');

    res.json({
      success: true,
      count: results.length,
      dermatologists: results,
    });
  } catch (error) {
    console.error('Search dermatologists error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific error cases
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        error: 'Service configuration error. Please contact support.' 
      });
    }
    
    if (error.message.includes('location')) {
      return res.status(400).json({ 
        error: 'Could not find location for the provided zipcode. Please verify the zipcode and try again.' 
      });
    }

    // Return the actual error message to help with debugging
    res.status(500).json({ 
      error: error.message || 'Failed to search for dermatologists. Please try again later.' 
    });
  }
};
