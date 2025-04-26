import axios from 'axios';
import { supabase } from './supabase';

// Backend API URL
const API_URL = import.meta.env.VITE_BACKEND_API_URL;

if (!API_URL) {
  console.error('CRITICAL: Missing environment variable VITE_BACKEND_API_URL. API calls will fail.');
  // Optionally throw an error or display a message to the user
  // throw new Error('Backend API URL is not configured. Please check your environment variables.');
}
/**
 * Service for handling API requests
 */
class ApiService {
  /**
   * Search for leads based on sector and location
   * @param {string} sector - Business sector
   * @param {string} location - Location
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of lead objects
   */
  async searchLeads(sector, location, options = {}) {
    try {
      console.log(`Searching for ${sector} leads in ${location} with options:`, options);

      // Get authentication token
      let authHeader = {};

      try {
        // Get the current session
        const { data } = await supabase.auth.getSession();

        if (data?.session?.access_token) {
          console.log('Using authenticated session for API request');
          authHeader = {
            Authorization: `Bearer ${data.session.access_token}`
          };
        } else if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Proceeding without authentication');
        } else {
          console.warn('No authentication token available');
        }
      } catch (authError) {
        console.error('Error getting authentication token:', authError);
        if (process.env.NODE_ENV !== 'development') {
          throw new Error('Authentication required. Please log in to search for leads.');
        }
      }

      // Ensure maxResults is included in options if not already set
      const updatedOptions = {
        maxResults: 100, // Default to 100 leads
        ...options
      };

      // Build query parameters
      const params = new URLSearchParams({
        sector,
        location,
        ...updatedOptions
      });

      // Make request to backend API with shorter timeout
      console.log(`Making API request to: ${API_URL}/leads/search?${params.toString()}`);
      const response = await axios.get(
        `${API_URL}/leads/search?${params.toString()}`,
        {
          headers: authHeader,
          timeout: 10000 // Reduce timeout to 10 seconds for faster response
        }
      );

      // Check if the request was successful
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      console.log('API Response:', response);
      console.log('API Response data:', response.data);

      // Ensure we have a valid response structure
      console.log('Raw API response data structure:', JSON.stringify(response.data));

      // Extract leads data, ensuring it's always an array
      let leadsData = [];

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        leadsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        leadsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract any array from the response
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          // Use the first array found
          leadsData = possibleArrays[0];
        }
      }

      console.log(`Successfully extracted ${leadsData.length} leads from response`);

      // Process leads immediately to ensure they have all required fields
      const processedLeads = leadsData.map(lead => ({
        ...lead,
        id: lead.id || `lead-${Math.random().toString(36).substring(2, 9)}`,
        businessName: lead.businessName || 'Unknown Business',
        businessType: lead.businessType || 'Retail',
        verificationScore: lead.verificationScore || Math.floor(Math.random() * 100),
        contactDetails: {
          ...(lead.contactDetails || {}),
          email: lead.contactDetails?.email || '',
          phone: lead.contactDetails?.phone || '',
          website: lead.contactDetails?.website || '',
          socialMedia: lead.contactDetails?.socialMedia || {}
        },
        address: lead.address || 'Address not available',
        description: lead.description || 'No description available'
      }));

      // Log a sample of processed leads
      if (processedLeads.length > 0) {
        console.log('First processed lead sample:', processedLeads[0]);
      }

      // Return the processed leads data
      return processedLeads;
    } catch (error) {
      console.error('Error in searchLeads:', error);

      // Log more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }

      // If the backend is not available, show a more user-friendly error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to the backend server. Please make sure it is running.');
      }

      // If authentication error
      if (error.response && error.response.status === 401) {
        throw new Error('Authentication required. Please log in to search for leads.');
      }

      // If CORS error
      if (error.message && error.message.includes('CORS')) {
        throw new Error('CORS error: The backend server is not allowing requests from this origin.');
      }

      throw error;
    }
  }

  /**
   * Save a search to the user's history
   * @param {string} userId - User ID
   * @param {string} sector - Business sector
   * @param {string} location - Location
   * @returns {Promise<Object>} - Saved search object
   */
  async saveSearch(userId, sector, location) {
    try {
      console.log('Saving search to Supabase:', { userId, sector, location });

      const { data, error } = await supabase
        .from('saved_searches')
        .insert([
          {
            user_id: userId,
            sector: sector,
            location: location
          }
        ])
        .select();

      if (error) {
        console.error('Error saving search to Supabase:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  /**
   * Get a user's saved searches
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of saved search objects
   */
  async getSavedSearches(userId) {
    try {
      console.log('Getting saved searches from Supabase for user:', userId);

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting saved searches from Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting saved searches:', error);
      throw error;
    }
  }

  /**
   * Save an export to the user's history
   * @param {string} userId - User ID
   * @param {string} sector - Business sector
   * @param {string} location - Location
   * @param {number} leadCount - Number of leads exported
   * @param {string} spreadsheetUrl - URL of the exported spreadsheet
   * @returns {Promise<Object>} - Saved export object
   */
  async saveExport(userId, sector, location, leadCount, spreadsheetUrl) {
    try {
      console.log('Saving export to Supabase:', { userId, sector, location, leadCount, spreadsheetUrl });

      const { data, error } = await supabase
        .from('exports')
        .insert([
          {
            user_id: userId,
            sector: sector,
            location: location,
            lead_count: leadCount,
            spreadsheet_url: spreadsheetUrl
          }
        ])
        .select();

      if (error) {
        console.error('Error saving export to Supabase:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error saving export:', error);
      throw error;
    }
  }

  /**
   * Get a user's export history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of export objects
   */
  async getExportHistory(userId) {
    try {
      console.log('Getting export history from Supabase for user:', userId);

      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting export history from Supabase:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting export history:', error);
      throw error;
    }
  }

  /**
   * Get a lead by ID
   * @param {string} id - Lead ID
   * @returns {Promise<Object>} - Lead object
   */
  async getLeadById(id) {
    try {
      console.log(`Getting lead with ID: ${id}`);

      // Get authentication token
      let authHeader = {};

      try {
        // Get the current session
        const { data } = await supabase.auth.getSession();

        if (data?.session?.access_token) {
          console.log('Using authenticated session for API request');
          authHeader = {
            Authorization: `Bearer ${data.session.access_token}`
          };
        } else if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Proceeding without authentication');
        } else {
          console.warn('No authentication token available');
        }
      } catch (authError) {
        console.error('Error getting authentication token:', authError);
        if (process.env.NODE_ENV !== 'development') {
          throw new Error('Authentication required. Please log in to view lead details.');
        }
      }

      // Make request to backend API
      console.log(`Making API request to: ${API_URL}/leads/${id}`);
      const response = await axios.get(
        `${API_URL}/leads/${id}`,
        {
          headers: authHeader
        }
      );

      // Check if the request was successful
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      console.log('Successfully retrieved lead details');

      // Return the lead data
      return response.data.data;
    } catch (error) {
      console.error(`Error getting lead with ID ${id}:`, error);

      // If the backend is not available, show a more user-friendly error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to the backend server. Please make sure it is running.');
      }

      // If authentication error
      if (error.response && error.response.status === 401) {
        throw new Error('Authentication required. Please log in to view lead details.');
      }

      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
