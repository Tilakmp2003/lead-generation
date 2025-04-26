// Google Sheets API integration service

// Google API credentials from environment variables
const CLIENT_ID = import.meta.env.VITE_GOOGLE_SHEETS_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Log for debugging (remove in production)
console.log('Google Sheets Client ID:', CLIENT_ID ? 'Configured' : 'Missing');
console.log('Google Sheets API Key:', API_KEY ? 'Configured' : 'Missing');

// Initialize the Google API client
export const initGoogleSheetsAPI = () => {
  return new Promise((resolve, reject) => {
    // Check if API credentials are available
    if (!API_KEY || !CLIENT_ID) {
      console.warn('Google Sheets API credentials missing. Some features may not work.');
      reject(new Error('Google Sheets API credentials missing'));
      return;
    }

    // Check if gapi is loaded
    if (!window.gapi) {
      console.error('Google API client library not loaded');
      reject(new Error('Google API client library not loaded'));
      return;
    }

    // For development environment, we'll use a mock implementation
    // In production, you would need to properly configure the OAuth client
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Development environment detected. Using mock Google Sheets API.');

      // Create mock implementations for Google Sheets API
      window.gapi.auth2 = {
        getAuthInstance: () => ({
          isSignedIn: { get: () => false },
          signIn: () => Promise.resolve({ name: 'Mock User' }),
          signOut: () => Promise.resolve()
        })
      };

      // Resolve with mock implementation
      resolve();
      return;
    }

    // For production environment, initialize the real API
    window.gapi.load('client:auth2', () => {
      window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        resolve();
      }).catch(error => {
        console.error('Error initializing Google API client:', error);
        reject(error);
      });
    });
  });
};

// Sign in the user
export const signIn = () => {
  return window.gapi.auth2.getAuthInstance().signIn();
};

// Sign out the user
export const signOut = () => {
  return window.gapi.auth2.getAuthInstance().signOut();
};

// Check if user is signed in
export const isSignedIn = () => {
  return window.gapi.auth2.getAuthInstance().isSignedIn.get();
};

// Create a new Google Sheet
export const createSheet = async (title) => {
  try {
    // Check if we're in development mode with mock implementation
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Creating mock Google Sheet:', title);
      // Return a mock spreadsheet object
      return {
        spreadsheetId: 'mock-sheet-id-' + Date.now(),
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock-sheet-id',
        properties: {
          title: title
        }
      };
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
    // Prepare headers
    const headers = [
      'Business Name',
      'Business Type',
      'Owner Name',
      'Email',
      'Phone',
      'Social Media',
      'Address',
      'Description'
    ];

    // Prepare data rows
    const rows = leads.map(lead => [
      lead.businessName,
      lead.businessType,
      lead.ownerName,
      lead.contactDetails.email,
      lead.contactDetails.phone,
      Object.values(lead.contactDetails.socialMedia || {}).join(', '),
      lead.address,
      lead.description
    ]);

    // Combine headers and rows
    const values = [headers, ...rows];

    // Check if we're in development mode with mock implementation
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Exporting leads to mock Google Sheet:', sheetId);
      console.log('Data being exported:', values);
      // Return a mock response
      return {
        spreadsheetId: sheetId,
        updatedCells: values.flat().length,
        updatedRange: 'Sheet1!A1:H' + (leads.length + 1)
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
    // Check if we're in development mode with mock implementation
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Getting mock spreadsheets list');
      // Return mock spreadsheets
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
