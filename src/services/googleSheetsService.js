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
      if (!window.gapi) {
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
        window.gapi.auth2 = {
          getAuthInstance: () => ({
            isSignedIn: { get: () => false },
            signIn: () => Promise.resolve({ name: 'Mock User' }),
            signOut: () => Promise.resolve()
          })
        };
        resolve();
        return;
      }

      // Initialize the real API for production
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
            ux_mode: 'redirect',
            redirect_uri: `${window.location.origin}/oauth2callback`,
            access_type: 'offline',
            include_granted_scopes: true
          });
          
          // Additional check to ensure Sheets API is loaded
          if (!window.gapi.client.sheets) {
            throw new Error('Google Sheets API failed to load');
          }
          
          resolve();
        } catch (error) {
          console.error('Error initializing Google API client:', error);
          reject(error);
        }
      });
    };

    // Start waiting for GAPI to load
    waitForGapi();
  });
};

// Sign in the user with improved error handling
export const signIn = async () => {
  try {
    const auth2 = window.gapi.auth2.getAuthInstance();
    const options = {
      prompt: 'consent',
      ux_mode: 'redirect',
      redirect_uri: `${window.location.origin}/oauth2callback`,
      access_type: 'offline',
      include_granted_scopes: true
    };
    
    console.log('Starting Google Sign In with options:', options);
    const user = await auth2.signIn(options);
    return user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    if (error.error === 'popup_closed_by_user') {
      throw new Error('Sign in was cancelled. Please try again.');
    } else if (error.error === 'access_denied') {
      throw new Error('Please grant access to Google Sheets to export leads.');
    } else if (error.error === 'idpiframe_initialization_failed') {
      throw new Error('Google Sign In is not properly configured. Please check your domain settings.');
    } else {
      throw error;
    }
  }
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
