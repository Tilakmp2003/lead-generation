// Google Sheets API integration service
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

export const initGoogleSheetsAPI = async () => {
  if (!CLIENT_ID || !API_KEY) {
    throw new Error('Google Sheets API credentials are missing');
  }

  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

    await new Promise((resolve, reject) => {
      gapi.load('client', { callback: resolve, onerror: reject });
    });

    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined at request time
    });
    gisInited = true;

    return true;
  } catch (err) {
    throw new Error('Error initializing Google Sheets API: ' + err.message);
  }
};

// Sign in the user
export const signIn = async () => {
  if (!gapiInited || !gisInited) {
    throw new Error('Google API not initialized');
  }

  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if (resp.error) {
        reject(resp);
      }
      resolve(resp);
    };
    tokenClient.requestAccessToken();
  });
};

// Check if user is signed in
export const isSignedIn = () => {
  return gapi.client.getToken() !== null;
};

// Create a new Google Sheet
export const createSheet = async (title) => {
  const response = await gapi.client.sheets.spreadsheets.create({
    properties: {
      title
    }
  });
  return response.result;
};

// Export leads to Google Sheets
export const exportLeadsToSheet = async (leads, spreadsheetId) => {
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

  // Prepare the data rows
  const rows = leads.map(lead => [
    lead.businessName || '',
    lead.businessType || '',
    lead.ownerName || '',
    lead.contactDetails?.email || '',
    lead.contactDetails?.phone || '',
    lead.contactDetails?.website || '',
    lead.address || '',
    lead.description || '',
    lead.verificationScore?.toString() || '0',
    Object.entries(lead.contactDetails?.socialMedia || {})
      .map(([platform, url]) => `${platform}: ${url}`)
      .join('\n'),
    lead.googleMapsUrl || ''
  ]);

  // Combine headers and rows
  const values = [headers, ...rows];

  try {
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: { values }
    });

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

    await gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: { requests }
    });

    return true;
  } catch (err) {
    throw new Error('Error exporting to sheet: ' + err.message);
  }
};
