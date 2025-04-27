import { supabase } from './supabase';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const searchLeads = async (sector, location, options = {}) => {
  try {
    const { maxResults = 100 } = options;
    const params = new URLSearchParams({
      sector,
      location,
      maxResults: maxResults.toString()
    });

    let headers = {
      'Content-Type': 'application/json'
    };

    // Add auth header if session exists
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }

    const response = await fetch(`${API_URL}/leads/search?${params.toString()}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }

    const data = await response.json();
    return data.leads || [];
  } catch (error) {
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
      'Content-Type': 'application/json'
    };

    // Add auth header if session exists
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.access_token) {
      headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
    }

    const response = await fetch(`${API_URL}/leads/${id}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lead details');
    }

    const data = await response.json();
    return data.lead;
  } catch (error) {
    throw new Error('Error getting lead: ' + error.message);
  }
};

export {
  searchLeads,
  saveSearch,
  getSavedSearches,
  saveExport,
  getExportHistory,
  getLead
};
