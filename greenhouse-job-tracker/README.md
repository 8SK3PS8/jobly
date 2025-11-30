# 🌱 Greenhouse Job Tracker

A Chrome extension that scrapes job application data from Greenhouse job boards and saves them to Google Sheets for easy tracking.

## Features

- **One-click scraping** - Automatically extracts job title, company, and location from Greenhouse pages
- **Google Sheets integration** - Saves directly to your spreadsheet
- **Status tracking** - Set application status (Applied, Interview, Rejected, Offer)
- **Clean UI** - Simple, minimal interface

## Installation

### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Job Tracker Extension")
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: "Greenhouse Job Tracker"
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `https://www.googleapis.com/auth/spreadsheets`
4. Back in Credentials, create the OAuth Client ID:
   - Application type: **Chrome Extension**
   - Name: "Greenhouse Job Tracker"
   - Item ID: Leave blank for now (we'll add it later)
5. Click "Create" and **copy the Client ID**

### Step 3: Set Up Google Sheet

1. Create a new [Google Sheet](https://sheets.google.com)
2. Rename the first tab to `Applications`
3. Add headers in Row 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Date | Company | Title | Location | Status | URL |

4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

### Step 4: Configure the Extension

1. Clone or download this repository
2. Open `manifest.json` and replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your OAuth Client ID:
   ```json
   "oauth2": {
     "client_id": "123456789-abc123.apps.googleusercontent.com",
     ...
   }
   ```
3. Open `scripts/background.js` and replace `YOUR_SPREADSHEET_ID_HERE` with your Spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
   ```

### Step 5: Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `greenhouse-job-tracker` folder
5. Copy the **Extension ID** shown under the extension

### Step 6: Add Extension ID to Google Cloud

1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add the Extension ID under "Item ID"
4. Save

## Usage

1. Navigate to a Greenhouse job posting (e.g., `boards.greenhouse.io/company/jobs/12345`)
2. Click the extension icon in your toolbar
3. Review the scraped job data
4. Select your application status
5. Click "Save to Sheets"
6. First time only: Authorize the extension to access your Google Sheets

## Supported URLs

The extension works on pages matching:
- `https://boards.greenhouse.io/*`

Examples:
- `https://boards.greenhouse.io/anthropic/jobs/4038981008`
- `https://boards.greenhouse.io/stripe/jobs/5089432`

## Troubleshooting

### "Please refresh the page and try again"
The content script didn't load. Refresh the Greenhouse page and try again.

### OAuth/Authentication errors
1. Make sure your OAuth Client ID is correctly configured
2. Verify the Extension ID matches in Google Cloud Console
3. Try removing and re-adding the extension

### "API Error: 403"
1. Make sure Google Sheets API is enabled in your Cloud project
2. Verify the spreadsheet exists and the ID is correct
3. Check that you have edit access to the spreadsheet

### Data not appearing in sheet
1. Verify the sheet tab is named exactly `Applications`
2. Check the column range (A:F) matches the headers

## Project Structure

```
greenhouse-job-tracker/
├── manifest.json           # Extension configuration
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.js            # Popup logic
│   └── popup.css           # Styles
├── scripts/
│   ├── content.js          # Page scraping logic
│   └── background.js       # Google Sheets API integration
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Future Improvements

- [ ] Support for Lever, Workday, LinkedIn
- [ ] Duplicate detection
- [ ] Notes field
- [ ] Edit saved applications
- [ ] Browser notifications
- [ ] Dark mode

## License

MIT License - feel free to modify and use as needed.

## Contributing

Pull requests welcome! For major changes, please open an issue first.
