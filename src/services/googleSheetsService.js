// Google Sheets API integration service
const CLIENT_ID = import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let initializationPromise = null;

// Check if the required environment variables are set
const checkCredentials = () => {
  console.log('Checking Google Sheets API credentials...');
  console.log('CLIENT_ID available:', !!CLIENT_ID);
  console.log('API_KEY available:', !!API_KEY);

  if (!CLIENT_ID || !API_KEY) {
    console.error('Google Sheets API credentials are missing. Export to Google Sheets will not work.');
    return false;
  }
  return true;
};

// Initialize the Google Sheets API
export const initGoogleSheetsAPI = async () => {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // If already initialized, return immediately
  if (gapiInited && gisInited && tokenClient) {
    console.log('Google Sheets API already initialized');
    return true;
  }

  // Check if credentials are available
  if (!checkCredentials()) {
    return false;
  }

  console.log('Initializing Google Sheets API...');

  // Create a new initialization promise
  initializationPromise = (async () => {
    try {
      // Load the Google API client library
      if (!window.gapi) {
        console.log('Loading Google API client library...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          script.onerror = (e) => {
            console.error('Failed to load Google API client library:', e);
            reject(new Error('Failed to load Google API client library'));
          };
          document.body.appendChild(script);
        });
      }

      // Initialize the gapi client
      if (!gapiInited) {
        console.log('Initializing gapi client...');
        await new Promise((resolve, reject) => {
          window.gapi.load('client', {
            callback: resolve,
            onerror: (e) => {
              console.error('Failed to load gapi client:', e);
              reject(new Error('Failed to load gapi client'));
            }
          });
        });

        console.log('Initializing gapi client with API key and discovery docs...');
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        console.log('gapi client initialized successfully');
      }

      // Load the Google Identity Services library
      if (!window.google || !window.google.accounts) {
        console.log('Loading Google Identity Services library...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.onload = resolve;
          script.onerror = (e) => {
            console.error('Failed to load Google Identity Services library:', e);
            reject(new Error('Failed to load Google Identity Services library'));
          };
          document.body.appendChild(script);
        });
      }

      // Initialize the token client
      if (!tokenClient && window.google && window.google.accounts && window.google.accounts.oauth2) {
        console.log('Initializing token client...');
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined at request time
        });
        gisInited = true;
        console.log('Token client initialized successfully');
      }

      console.log('Google Sheets API initialized successfully');
      return true;
    } catch (err) {
      console.error('Error initializing Google Sheets API:', err);
      gapiInited = false;
      gisInited = false;
      tokenClient = null;
      initializationPromise = null;
      throw new Error('Error initializing Google Sheets API: ' + err.message);
    }
  })();

  return initializationPromise;
};

// Sign in the user
export const signIn = async () => {
  try {
    // Make sure the API is initialized first
    await initGoogleSheetsAPI();

    if (!gapiInited || !gisInited || !tokenClient) {
      console.error('Google API not fully initialized');
      throw new Error('Google API not fully initialized');
    }

    console.log('Requesting access token...');
    return new Promise((resolve, reject) => {
      tokenClient.callback = (resp) => {
        if (resp.error) {
          console.error('Error getting access token:', resp.error);
          reject(resp);
        } else {
          console.log('Access token obtained successfully');
          resolve(resp);
        }
      };

      try {
        tokenClient.requestAccessToken();
      } catch (error) {
        console.error('Error requesting access token:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
};

// Check if user is signed in
export const isSignedIn = () => {
  try {
    // Make sure gapi is available
    if (!window.gapi || !window.gapi.client) {
      console.warn('gapi client not available, user cannot be signed in');
      return false;
    }

    const token = window.gapi.client.getToken();
    return token !== null;
  } catch (error) {
    console.error('Error checking if user is signed in:', error);
    return false;
  }
};

// Create a new Google Sheet
export const createSheet = async (title) => {
  try {
    // Make sure the API is initialized first
    await initGoogleSheetsAPI();

    if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
      console.error('Google Sheets API not available');
      throw new Error('Google Sheets API not available');
    }

    console.log('Creating new Google Sheet with title:', title);
    const response = await window.gapi.client.sheets.spreadsheets.create({
      properties: {
        title
      }
    });

    console.log('Sheet created successfully:', response.result.spreadsheetId);
    return response.result;
  } catch (error) {
    console.error('Error creating Google Sheet:', error);
    throw new Error('Error creating Google Sheet: ' + error.message);
  }
};

// Export leads to Google Sheets
export const exportLeadsToSheet = async (leads, spreadsheetId) => {
  try {
    // Make sure the API is initialized first
    await initGoogleSheetsAPI();

    if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
      console.error('Google Sheets API not available');
      throw new Error('Google Sheets API not available');
    }

    console.log('Exporting leads to Google Sheet:', spreadsheetId);

    // Prepare the header row
    const headers = [
      'Business Name',
      'Business Type',
      'Owner Name',
      'Email',
      'Phone',
      'Website',
      'Address',
      'Description',
      'Verification Score',
      'Social Media',
      'Google Maps'
    ];

    // Prepare the data rows with defensive checks
    const rows = leads.map(lead => {
      // Ensure lead and contactDetails exist
      const safeContactDetails = lead.contactDetails || {};
      const safeSocialMedia = safeContactDetails.socialMedia || {};

      return [
        lead.businessName || '',
        lead.businessType || '',
        lead.ownerName || '',
        safeContactDetails.email || '',
        safeContactDetails.phone || '',
        safeContactDetails.website || '',
        lead.address || '',
        lead.description || '',
        (lead.verificationScore !== undefined) ? lead.verificationScore.toString() : '0',
        Object.entries(safeSocialMedia)
          .map(([platform, url]) => `${platform}: ${url}`)
          .join('\n'),
        lead.googleMapsUrl || ''
      ];
    });

    // Combine headers and rows
    const values = [headers, ...rows];

    console.log(`Updating sheet with ${rows.length} leads...`);

    // Update the sheet with the data
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log('Sheet data updated successfully, auto-resizing columns...');

    // Auto-resize columns
    const requests = [{
      autoResizeDimensions: {
        dimensions: {
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: headers.length
        }
      }
    }];

    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: { requests }
    });

    console.log('Sheet formatting completed successfully');
    return true;
  } catch (error) {
    console.error('Error exporting to Google Sheet:', error);
    throw new Error('Error exporting to sheet: ' + error.message);
  }
};
