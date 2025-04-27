// Google Sheets API integration service
const CLIENT_ID = import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize the Google API client
export const initGoogleSheetsAPI = () => {
  return new Promise((resolve, reject) => {
    // Log environment variables (without exposing full values)
    console.log('Google Sheets API initialization:');
    console.log('- Client ID available:', !!CLIENT_ID);
    console.log('- API Key available:', !!API_KEY);
    console.log('- Client ID prefix:', CLIENT_ID ? CLIENT_ID.substring(0, 10) + '...' : 'N/A');

    if (!CLIENT_ID || !API_KEY) {
      console.error('Missing Google Sheets API credentials');
      reject(new Error('Missing Google Sheets API credentials'));
      return;
    }

    const maybeResolve = () => {
      if (gapiInited && gisInited) {
        console.log('Google Sheets API initialization complete');
        resolve();
      }
    };

    const initializeGapiClient = async () => {
      try {
        console.log('Initializing GAPI client with API key and discovery docs');
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        console.log('GAPI client initialized successfully');
        gapiInited = true;
        maybeResolve();
      } catch (error) {
        console.error('Error initializing GAPI client:', error);
        reject(error);
      }
    };

    // First, load and initialize the gapi.client
    if (!window.gapi) {
      console.log('Loading Google API script');
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('Google API script loaded, loading client');
        window.gapi.load('client', initializeGapiClient);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error);
        reject(new Error('Failed to load Google API script'));
      };
      document.body.appendChild(script);
    } else {
      console.log('Google API already loaded, initializing client');
      window.gapi.load('client', initializeGapiClient);
    }

    // Then, initialize the tokenClient
    if (!window.google) {
      console.log('Loading Google Identity Services script');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        console.log('Google Identity Services script loaded, initializing token client');
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // Will be set later
          error_callback: (err) => {
            console.error('TokenClient Error:', err);
            reject(err);
          }
        });
        console.log('Token client initialized');
        gisInited = true;
        maybeResolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Identity Services script:', error);
        reject(new Error('Failed to load Google Identity Services script'));
      };
      document.body.appendChild(script);
    } else {
      console.log('Google Identity Services already loaded, initializing token client');
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be set later
        error_callback: (err) => {
          console.error('TokenClient Error:', err);
          reject(err);
        }
      });
      console.log('Token client initialized');
      gisInited = true;
      maybeResolve();
    }
  });
};

// Sign in the user with improved error handling
export const signIn = () => {
  return new Promise((resolve, reject) => {
    console.log('Attempting to sign in to Google...');

    if (!tokenClient) {
      const error = new Error('Token client not initialized. Call initGoogleSheetsAPI first.');
      console.error(error);
      reject(error);
      return;
    }

    try {
      console.log('Setting up token client callback');

      // Set the callback before requesting token
      tokenClient.callback = (response) => {
        if (response.error) {
          console.error('Token client callback error:', response.error);
          reject(response);
          return;
        }
        console.log('Successfully obtained Google access token');
        window.gapi.client.setToken(response);
        resolve(response);
      };

      // Request token
      if (window.gapi.client.getToken() === null) {
        console.log('No existing token found, requesting new access token');
        tokenClient.requestAccessToken();
      } else {
        // Skip if already signed in
        console.log('User already signed in, using existing token');
        resolve(window.gapi.client.getToken());
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      reject(error);
    }
  });
};

// Sign out the user
export const signOut = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken(null);
  }
};

// Check if user is signed in
export const isSignedIn = () => {
  return window.gapi?.client?.getToken() !== null;
};

// Create a new Google Sheet
export const createSheet = async (title) => {
  try {
    console.log('Creating new Google Sheet with title:', title);

    // Ensure we have a valid token
    if (!isSignedIn()) {
      console.log('User not signed in, requesting sign in before creating sheet');
      await signIn();
    }

    // Verify that the sheets API is available
    if (!window.gapi?.client?.sheets) {
      console.error('Google Sheets API not available');
      throw new Error('Google Sheets API not available. Please refresh the page and try again.');
    }

    console.log('Creating spreadsheet...');
    const response = await window.gapi.client.sheets.spreadsheets.create({
      properties: {
        title: title
      }
    });

    console.log('Spreadsheet created successfully:', response.result.spreadsheetId);
    return response.result;
  } catch (error) {
    console.error('Error creating sheet:', error);
    // Provide more detailed error message
    if (error.result && error.result.error) {
      console.error('API Error details:', error.result.error);
      throw new Error(`Failed to create Google Sheet: ${error.result.error.message}`);
    }
    throw error;
  }
};

// Export leads to Google Sheets
export const exportLeadsToSheet = async (leads, sheetId) => {
  try {
    console.log(`Exporting ${leads.length} leads to Google Sheet with ID: ${sheetId}`);

    // Ensure we have a valid token
    if (!isSignedIn()) {
      console.log('User not signed in, requesting sign in before exporting data');
      await signIn();
    }

    // Verify that the sheets API is available
    if (!window.gapi?.client?.sheets) {
      console.error('Google Sheets API not available');
      throw new Error('Google Sheets API not available. Please refresh the page and try again.');
    }

    // Prepare headers
    const headers = [
      'Business Name',
      'Business Type',
      'Owner Name',
      'Email',
      'Phone',
      'Website',
      'Address',
      'Description',
      'Verification Score'
    ];

    // Prepare data rows
    const rows = leads.map(lead => [
      lead.businessName,
      lead.businessType,
      lead.ownerName || '',
      lead.contactDetails?.email || '',
      lead.contactDetails?.phone || '',
      lead.contactDetails?.website || '',
      lead.address || '',
      lead.description || '',
      lead.verificationScore || ''
    ]);

    // Combine headers and rows
    const values = [headers, ...rows];

    console.log(`Updating spreadsheet with ${values.length} rows of data`);

    // Real implementation for production
    const response = await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: values
      }
    });

    console.log('Data successfully exported to Google Sheet');
    return response.result;
  } catch (error) {
    console.error('Error exporting leads:', error);
    // Provide more detailed error message
    if (error.result && error.result.error) {
      console.error('API Error details:', error.result.error);
      throw new Error(`Failed to export data to Google Sheet: ${error.result.error.message}`);
    }
    throw error;
  }
};
