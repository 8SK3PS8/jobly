// Background service worker for Google Sheets API integration

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Applications';

// ============================================
// MESSAGE LISTENER
// ============================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveToSheets') {
    saveToGoogleSheets(request.data)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }
});

// ============================================
// GOOGLE SHEETS API FUNCTIONS
// ============================================

/**
 * Saves job data to Google Sheets
 * @param {Object} jobData - The job data to save
 * @returns {Promise} Resolves on success, rejects on failure
 */
async function saveToGoogleSheets(jobData) {
  // Get OAuth token
  const token = await getAuthToken();

  // Prepare row data in order: Date, Company, Title, Location, Status, URL
  const values = [[
    jobData.dateApplied,
    jobData.company,
    jobData.title,
    jobData.location,
    jobData.status,
    jobData.jobUrl
  ]];

  // Build the API URL
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:F:append?valueInputOption=USER_ENTERED`;

  // Make the API request
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  });

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Gets an OAuth token for Google Sheets API
 * @returns {Promise<string>} The OAuth token
 */
function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!token) {
        reject(new Error('Failed to get authentication token'));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Clears cached auth token (useful for re-authentication)
 * @param {string} token - The token to remove from cache
 */
function removeCachedAuthToken(token) {
  return new Promise((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      resolve();
    });
  });
}
