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
    const maybeResolve = () => {
      if (gapiInited && gisInited) {
        resolve();
      }
    };

    const initializeGapiClient = async () => {
      try {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        maybeResolve();
      } catch (error) {
        console.error('Error initializing GAPI client:', error);
        reject(error);
      }
    };

    // First, load and initialize the gapi.client
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', initializeGapiClient);
      };
      script.onerror = (error) => reject(new Error('Failed to load Google API script'));
      document.body.appendChild(script);
    } else {
      window.gapi.load('client', initializeGapiClient);
    }

    // Then, initialize the tokenClient
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // Will be set later
          error_callback: (err) => {
            console.error('TokenClient Error:', err);
            reject(err);
          }
        });
        gisInited = true;
        maybeResolve();
      };
      script.onerror = (error) => reject(new Error('Failed to load Google Identity Services script'));
      document.body.appendChild(script);
    } else {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be set later
        error_callback: (err) => {
          console.error('TokenClient Error:', err);
          reject(err);
        }
      });
      gisInited = true;
      maybeResolve();
    }
  });
};

// Sign in the user with improved error handling
export const signIn = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized. Call initGoogleSheetsAPI first.'));
      return;
    }

    try {
      // Set the callback before requesting token
      tokenClient.callback = (response) => {
        if (response.error) {
          reject(response);
          return;
        }
        window.gapi.client.setToken(response);
        resolve(response);
      };

      // Request token
      if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken();
      } else {
        // Skip if already signed in
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
    // Ensure we have a valid token
    if (!isSignedIn()) {
      await signIn();
    }

    const response = await window.gapi.client.sheets.spreadsheets.create({
      properties: {
        title: title
      }
    });

    return response.result;
  } catch (error) {
    console.error('Error creating sheet:', error);
    throw error;
  }
};

// Export leads to Google Sheets
export const exportLeadsToSheet = async (leads, sheetId) => {
  try {
    // Ensure we have a valid token
    if (!isSignedIn()) {
      await signIn();
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

    // Real implementation for production
    const response = await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: values
      }
    });

    return response.result;
  } catch (error) {
    console.error('Error exporting leads:', error);
    throw error;
  }
};
