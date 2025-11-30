// Popup script for Greenhouse Job Tracker

document.addEventListener('DOMContentLoaded', init);

// DOM Elements
let elements = {};

// Scraped job data storage
let scrapedJobData = null;

/**
 * Initialize the popup
 */
async function init() {
  // Cache DOM elements
  elements = {
    notGreenhouse: document.getElementById('not-greenhouse'),
    loading: document.getElementById('loading'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    jobPreview: document.getElementById('job-preview'),
    company: document.getElementById('company'),
    title: document.getElementById('title'),
    location: document.getElementById('location'),
    status: document.getElementById('status'),
    saveBtn: document.getElementById('save-btn'),
    btnText: document.getElementById('btn-text'),
    btnLoading: document.getElementById('btn-loading'),
    statusMessage: document.getElementById('status-message')
  };

  // Set up event listeners
  elements.saveBtn.addEventListener('click', handleSave);

  // Get current tab and check if it's a Greenhouse page
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.url?.includes('boards.greenhouse.io')) {
      showNotGreenhouse();
      return;
    }

    // Show loading state
    showLoading();

    // Request scrape from content script
    chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, handleScrapeResponse);

  } catch (error) {
    showError('Failed to access current tab');
  }
}

/**
 * Handle the response from the content script
 * @param {Object} response - The scraped data or error
 */
function handleScrapeResponse(response) {
  // Hide loading
  hideLoading();

  // Check for Chrome runtime errors (content script not loaded)
  if (chrome.runtime.lastError) {
    showError('Please refresh the page and try again');
    return;
  }

  // Check for scraping errors
  if (!response || response.error) {
    showError(response?.error || 'Failed to scrape job data');
    return;
  }

  // Store the scraped data
  scrapedJobData = response;

  // Populate the preview
  populatePreview(response);

  // Show the preview
  showJobPreview();
}

/**
 * Populate the preview fields with scraped data
 * @param {Object} data - The scraped job data
 */
function populatePreview(data) {
  elements.company.value = data.company || 'Unknown Company';
  elements.title.value = data.title || 'Unknown Title';
  elements.location.value = data.location || 'Location not specified';
  elements.status.value = data.status || 'Applied';
}

/**
 * Handle save button click
 */
async function handleSave() {
  if (!scrapedJobData) {
    showStatus('No job data to save', 'error');
    return;
  }

  // Get current status selection
  const jobData = {
    ...scrapedJobData,
    status: elements.status.value
  };

  // Show loading state
  setButtonLoading(true);

  // Send to background script
  chrome.runtime.sendMessage(
    { action: 'saveToSheets', data: jobData },
    handleSaveResponse
  );
}

/**
 * Handle the response from saving to sheets
 * @param {Object} response - Success or error response
 */
function handleSaveResponse(response) {
  setButtonLoading(false);

  if (chrome.runtime.lastError) {
    showStatus('Failed to save: ' + chrome.runtime.lastError.message, 'error');
    return;
  }

  if (response?.success) {
    showStatus('✓ Saved to Google Sheets!', 'success');
    // Disable button after successful save
    elements.saveBtn.disabled = true;
    elements.btnText.textContent = 'Saved!';
  } else {
    showStatus('Error: ' + (response?.error || 'Unknown error'), 'error');
  }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

function showNotGreenhouse() {
  elements.notGreenhouse.classList.remove('hidden');
}

function showLoading() {
  elements.loading.classList.remove('hidden');
}

function hideLoading() {
  elements.loading.classList.add('hidden');
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorState.classList.remove('hidden');
}

function showJobPreview() {
  elements.jobPreview.classList.remove('hidden');
}

function setButtonLoading(isLoading) {
  elements.saveBtn.disabled = isLoading;
  elements.btnText.classList.toggle('hidden', isLoading);
  elements.btnLoading.classList.toggle('hidden', !isLoading);
}

/**
 * Show a status message
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showStatus(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = type;
  elements.statusMessage.classList.remove('hidden');

  // Auto-hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      elements.statusMessage.classList.add('hidden');
    }, 3000);
  }
}
