// Google Sheets API integration service

// Google API credentials from environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

// Initialize the Google API client
export const initGoogleSheetsAPI = () => {
  return new Promise((resolve, reject) => {
    const waitForGapi = () => {
      if (!window.gapi || !window.google?.accounts?.oauth2) {
        setTimeout(waitForGapi, 100);
        return;
      }
      
      // Check if API credentials are available
      if (!API_KEY || !CLIENT_ID) {
        console.error('Google Sheets API credentials missing. Check your environment variables.');
        reject(new Error('Google Sheets API credentials missing'));
        return;
      }

      // For development environment, use mock implementation
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Development environment detected. Using mock Google Sheets API.');
        window.gapi.client = {
          init: () => Promise.resolve(),
          sheets: {
            spreadsheets: {
              create: () => Promise.resolve({ result: { spreadsheetId: 'mock-id' } }),
              values: { update: () => Promise.resolve({ result: {} }) }
            }
          },
          drive: {
            files: { list: () => Promise.resolve({ result: { files: [] } }) }
          }
        };
        resolve();
        return;
      }

      // Initialize the real API for production
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          resolve();
        } catch (error) {
          console.error('Error initializing Google API client:', error);
          reject(error);
        }
      });
    };

    waitForGapi();
  });
};

// Sign in the user with improved error handling
export const signIn = () => {
  return new Promise((resolve, reject) => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(response);
            return;
          }
          
          // Store the access token
          localStorage.setItem('gapi_access_token', response.access_token);
          window.gapi.client.setToken({ access_token: response.access_token });
          resolve(response);
        },
        error_callback: (error) => {
          console.error('OAuth Error:', error);
          reject(error);
        }
      });

      if (localStorage.getItem('gapi_access_token')) {
        // Token exists, verify it
        window.gapi.client.setToken({
          access_token: localStorage.getItem('gapi_access_token')
        });
        resolve({ access_token: localStorage.getItem('gapi_access_token') });
      } else {
        // Request authorization
        client.requestAccessToken();
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      reject(error);
    }
  });
};

// Sign out the user
export const signOut = () => {
  localStorage.removeItem('gapi_access_token');
  if (window.gapi?.client) {
    window.gapi.client.setToken(null);
  }
  return Promise.resolve();
};

// Check if user is signed in
export const isSignedIn = () => {
  return !!localStorage.getItem('gapi_access_token');
};

// Create a new Google Sheet
export const createSheet = async (title) => {
  try {
    // Check if we're in development mode with mock implementation
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Creating mock Google Sheet:', title);
      return {
        spreadsheetId: 'mock-sheet-id-' + Date.now(),
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock-sheet-id',
        properties: {
          title: title
        }
      };
    }

    // Ensure we have a valid token
    if (!isSignedIn()) {
      await signIn();
    }

    // Real implementation for production
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

    // Check if we're in development mode with mock implementation
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Exporting leads to mock Google Sheet:', sheetId);
      console.log('Data being exported:', values);
      return {
        spreadsheetId: sheetId,
        updatedCells: values.flat().length,
        updatedRange: 'Sheet1!A1:I' + (leads.length + 1)
      };
    }

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

// Get a list of user's spreadsheets
export const getSpreadsheets = async () => {
  try {
    // Ensure we have a valid token
    if (!isSignedIn()) {
      await signIn();
    }

    // Check if we're in development mode with mock implementation
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Getting mock spreadsheets list');
      return [
        { id: 'mock-sheet-id-1', name: 'Mock Spreadsheet 1' },
        { id: 'mock-sheet-id-2', name: 'Mock Spreadsheet 2' },
        { id: 'mock-sheet-id-3', name: 'Lead Generation Data' }
      ];
    }

    // Real implementation for production
    const response = await window.gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)'
    });

    return response.result.files;
  } catch (error) {
    console.error('Error getting spreadsheets:', error);
    throw error;
  }
};
