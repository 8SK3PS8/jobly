// Content script for scraping Greenhouse job posting pages

/**
 * Scrapes job data from a Greenhouse job posting page
 * @returns {Object} Job data object with company, title, location, status, jobUrl, dateApplied
 */
function scrapeGreenhouseJob() {
  // Check if we're on a valid Greenhouse job page
  if (!window.location.href.includes('boards.greenhouse.io')) {
    return { error: 'Not a Greenhouse job page' };
  }

  // Scrape job title with fallbacks
  const title = document.querySelector('.app-title')?.innerText?.trim()
    || document.querySelector('h1.app-title')?.innerText?.trim()
    || document.querySelector('h1')?.innerText?.trim()
    || '';

  // Scrape company name with fallbacks
  const company = document.querySelector('.company-name')?.innerText?.trim()
    || document.querySelector('[class*="company-name"]')?.innerText?.trim()
    || document.querySelector('span.company-name')?.innerText?.trim()
    || extractCompanyFromUrl();

  // Scrape location with fallbacks
  const location = document.querySelector('.location')?.innerText?.trim()
    || document.querySelector('[class*="location"]')?.innerText?.trim()
    || document.querySelector('.job-location')?.innerText?.trim()
    || '';

  // Get current URL
  const jobUrl = window.location.href;

  // Generate today's date in YYYY-MM-DD format
  const dateApplied = new Date().toISOString().split('T')[0];

  return {
    company,
    title,
    location,
    status: 'Applied',
    jobUrl,
    dateApplied
  };
}

/**
 * Extracts company name from the Greenhouse URL
 * URL format: boards.greenhouse.io/COMPANY_NAME/jobs/...
 * @returns {string} Company name or empty string
 */
function extractCompanyFromUrl() {
  const match = window.location.href.match(/boards\.greenhouse\.io\/([^\/]+)/);
  if (match && match[1]) {
    // Convert URL slug to readable name (e.g., "my-company" -> "My Company")
    return match[1]
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return '';
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    try {
      const data = scrapeGreenhouseJob();
      sendResponse(data);
    } catch (error) {
      sendResponse({ error: error.message || 'Failed to scrape job data' });
    }
  }
  return true; // Required for async sendResponse
});
