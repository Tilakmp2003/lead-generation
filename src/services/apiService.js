import supabase from './supabaseClient';

// Backend API URL - Use environment variable or fallback to deployed URL
const API_URL = import.meta.env.VITE_API_URL || 'https://lead-gen-fsei.onrender.com';

const searchLeads = async (sector, location, options = {}) => {
  try {
    const { maxResults = 100 } = options;
    const params = new URLSearchParams({
      sector,
      location,
      maxResults: maxResults.toString()
    });

    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add auth header if session exists
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }

    const response = await fetch(`${API_URL}/api/leads/search?${params.toString()}`, {
      method: 'GET',
      headers,
      mode: 'cors'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to fetch leads: ${response.status}`);
    }

    const data = await response.json();
    return data.leads || [];
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Error searching leads: ' + error.message);
  }
};

const saveSearch = async (userId, sector, location) => {
  try {
    const { error } = await supabase
      .from('searches')
      .insert([
        {
          user_id: userId,
          sector,
          location,
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) throw error;
  } catch (error) {
    throw new Error('Error saving search: ' + error.message);
  }
};

const getSavedSearches = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new Error('Error getting saved searches: ' + error.message);
  }
};

const saveExport = async (userId, sector, location, leadCount, spreadsheetUrl) => {
  try {
    const { error } = await supabase
      .from('exports')
      .insert([
        {
          user_id: userId,
          sector,
          location,
          lead_count: leadCount,
          spreadsheet_url: spreadsheetUrl,
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) throw error;
  } catch (error) {
    throw new Error('Error saving export: ' + error.message);
  }
};

const getExportHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('exports')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new Error('Error getting export history: ' + error.message);
  }
};

const getLead = async (id) => {
  try {
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add auth header if session exists
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }

    const response = await fetch(`${API_URL}/api/leads/${id}`, {
      method: 'GET',
      headers,
      mode: 'cors'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch lead details');
    }

    const data = await response.json();
    return data.lead;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Error getting lead: ' + error.message);
  }
};

const apiService = {
  searchLeads,
  saveSearch,
  getSavedSearches,
  saveExport,
  getExportHistory,
  getLead
};

export default apiService;
