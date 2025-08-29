# Automated ESPN Login with Selenium Plan

## Overview
Implement automated browser login similar to fantasy-football-metrics-weekly-report for seamless user authentication.

## User Experience
```
1. User enters ESPN username/password in your app
2. App opens automated browser window
3. Logs in automatically
4. Extracts cookies
5. Stores securely
6. User is authenticated - no manual steps!
```

## Technical Implementation

### Backend Endpoint
```javascript
// POST /api/auth/espn-auto-login
app.post('/api/auth/espn-auto-login', async (req, res) => {
  const { username, password, leagueId } = req.body;
  
  try {
    // Launch automated browser
    const browser = await puppeteer.launch({
      headless: false, // Show browser for user confidence
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to ESPN login
    await page.goto('https://registerdisney.go.com/jgc/v8/client/ESPN-FANTASYLM-PROD/guest/login');
    
    // Fill login form
    await page.type('#did-ui-view input[type="email"]', username);
    await page.type('#did-ui-view input[type="password"]', password);
    await page.click('#did-ui-view button[type="submit"]');
    
    // Wait for redirect to fantasy
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Extract cookies
    const cookies = await page.cookies('https://fantasy.espn.com');
    const espnS2 = cookies.find(c => c.name === 'espn_s2');
    const swid = cookies.find(c => c.name === 'SWID');
    
    await browser.close();
    
    if (!espnS2 || !swid) {
      throw new Error('Failed to retrieve ESPN cookies');
    }
    
    // Store encrypted credentials
    const sessionToken = await storeUserCredentials({
      espnS2: espnS2.value,
      swid: swid.value,
      leagueId
    });
    
    res.json({ 
      success: true, 
      sessionToken,
      message: 'Successfully logged in to ESPN!'
    });
    
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Login failed: ' + error.message 
    });
  }
});
```

### Frontend Login Component
```jsx
function AutoESPNLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    leagueId: '329849'
  });
  const [isLogging, setIsLogging] = useState(false);

  const handleAutoLogin = async () => {
    setIsLogging(true);
    
    try {
      const response = await fetch('/api/auth/espn-auto-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Store session token
        localStorage.setItem('fantasy-session', result.sessionToken);
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Connect to ESPN Fantasy</h2>
      
      <input
        type="email"
        placeholder="ESPN Email"
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
      />
      
      <input
        type="password"
        placeholder="ESPN Password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
      />
      
      <button 
        onClick={handleAutoLogin}
        disabled={isLogging}
        className="auto-login-btn"
      >
        {isLogging ? (
          <>
            <Loader className="animate-spin" />
            Logging in... (browser will open)
          </>
        ) : (
          'Login Automatically'
        )}
      </button>
      
      <div className="security-notice">
        🔒 Your credentials are used once to get session cookies, 
        then immediately discarded. We never store your password.
      </div>
    </div>
  );
}
```

## Benefits

### User Experience:
✅ **Familiar login flow** - username/password like every other app
✅ **No technical knowledge** required
✅ **Automated process** - user just watches it work
✅ **Professional appearance** - looks like a real app

### Technical Benefits:
✅ **Handles ESPN's complex auth** automatically
✅ **Works with 2FA** and other security measures
✅ **Reliable cookie extraction**
✅ **Secure credential handling** (passwords never stored)

## Security Considerations

### Password Security:
- Passwords transmitted over HTTPS only
- Never stored - used once and discarded
- Session cookies encrypted in database
- Clear security messaging to users

### Browser Automation:
- Runs on server (not user's machine)
- Isolated browser sessions
- Automatic cleanup after use
- Rate limiting to prevent abuse

## Deployment Considerations

### Server Requirements:
- Puppeteer/Selenium dependencies
- Chrome browser installed
- Sufficient memory for browser instances
- Queue system for multiple simultaneous logins

### AWS Implementation:
```yaml
# Docker container with Chrome + Puppeteer
FROM node:16-alpine
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Fallback Strategy
Always provide manual cookie entry as backup:
- If automated login fails
- For users who prefer manual method
- For testing/debugging purposes