# ESPN Cookie Extractor Chrome Extension Plan

## Overview
Create a simple Chrome extension that extracts ESPN fantasy football cookies automatically, making league rollout much easier.

## Extension Structure
```
manifest.json       - Extension configuration
content.js         - Runs on ESPN pages, extracts cookies
popup.html/js      - Extension popup interface
background.js      - Handles cookie extraction logic
```

## User Experience Flow
1. User installs extension from Chrome Web Store
2. User visits ESPN fantasy football (already logged in)
3. User clicks extension icon in toolbar
4. Extension shows extracted cookies in copyable format
5. User copies/pastes into your fantasy app
6. Done! No developer tools needed

## Technical Implementation

### manifest.json
```json
{
  "manifest_version": 3,
  "name": "ESPN Fantasy Cookie Extractor",
  "version": "1.0",
  "description": "Extract ESPN fantasy cookies for third-party analysis",
  "permissions": [
    "cookies",
    "activeTab"
  ],
  "host_permissions": [
    "https://*.espn.com/*"
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

### popup.html (Simple Interface)
```html
<div class="container">
  <h3>ESPN Fantasy Cookies</h3>
  <div class="cookie-section">
    <label>ESPN_S2:</label>
    <textarea id="espn-s2" readonly></textarea>
    <button onclick="copyToClipboard('espn-s2')">Copy</button>
  </div>
  <div class="cookie-section">
    <label>SWID:</label>
    <textarea id="swid" readonly></textarea>
    <button onclick="copyToClipboard('swid')">Copy</button>
  </div>
  <div class="status" id="status"></div>
</div>
```

### popup.js (Cookie Extraction)
```javascript
// Extract cookies when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  
  if (!tab.url.includes('espn.com')) {
    showError('Please navigate to ESPN Fantasy Football first');
    return;
  }

  // Get ESPN cookies
  chrome.cookies.get({
    url: 'https://fantasy.espn.com',
    name: 'espn_s2'
  }, (espnS2Cookie) => {
    if (espnS2Cookie) {
      document.getElementById('espn-s2').value = espnS2Cookie.value;
    }
  });

  chrome.cookies.get({
    url: 'https://fantasy.espn.com', 
    name: 'SWID'
  }, (swidCookie) => {
    if (swidCookie) {
      document.getElementById('swid').value = swidCookie.value;
    }
  });
});

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  element.select();
  document.execCommand('copy');
  showSuccess('Copied to clipboard!');
}
```

## Benefits for League Rollout

### For Users:
- ✅ No developer tools knowledge needed
- ✅ One-click cookie extraction  
- ✅ Professional, trusted experience
- ✅ Works on any computer/browser

### For You:
- ✅ Dramatically reduces support burden
- ✅ Higher conversion rate (more users complete setup)
- ✅ Looks more legitimate/professional
- ✅ Reusable for other leagues

## Development Timeline
- Day 1: Basic extension development
- Day 2: Testing with ESPN
- Day 3: Chrome Web Store submission
- Day 4-7: Review process
- Week 2: Available for league rollout

## Alternative: Use Existing Extension
Several open-source ESPN cookie extractors already exist:
- Could fork/modify existing extension
- Faster to market
- Build on proven code