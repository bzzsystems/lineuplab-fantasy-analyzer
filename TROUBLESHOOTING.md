# LineupLab Fantasy Football App - Production Troubleshooting Guide

## User-Reported Issues: "Unable to Load Your Data" or "No season data available"

### Quick Diagnostic Checklist

When users report data loading issues, check these in order:

1. **Backend Request Logs**: Look for missing progressive loading calls
2. **Session Management**: Check for session ID mismatches  
3. **Data Processing**: Verify frontend state management
4. **ESPN API**: Monitor rate limiting and response times
5. **Client-side Errors**: Check browser console for JavaScript errors

---

## Issue Priority Matrix (Based on 2025-08-30 Development Analysis)

### 🔴 CRITICAL - Progressive Loading System Failure
**Symptoms**: Users get "No season data available" error
**Root Cause**: Progressive loading endpoint `/secure-team-week-range` never called
**Evidence**: Backend logs show only `/secure-team-quick-summary` requests (weeks 17-19)
**Impact**: Users see only 3 recent weeks instead of full season analysis

**Diagnostic Commands**:
```bash
# Check if progressive loading is being called
grep "secure-team-week-range" backend_logs.log
grep "Progressive loading" backend_logs.log

# Look for frontend state management issues
grep "getProgressiveSeasonSummary" frontend_debug.log
```

**Potential Fixes**:
- Verify frontend `useTeamData` hook progressive loading logic
- Check API service `getProgressiveSeasonSummary` method implementation
- Ensure proper error handling in progressive loading chain

---

### 🟡 HIGH - Frontend Data Processing Logic
**Symptoms**: Backend returns data but frontend shows "No season data available"
**Root Cause**: Data transformation or state management error
**Evidence**: Backend responds 200 OK but frontend fails to process response

**Diagnostic Commands**:
```bash
# Check frontend processing of backend responses
grep "seasonData" frontend_debug.log
grep "No season data" frontend_debug.log
```

**Potential Fixes**:
- Verify data transformation in `useTeamData` hook
- Check React state updates and conditional rendering logic
- Validate data structure compatibility between backend/frontend

---

### 🟠 MEDIUM - Session ID Generation Mismatch  
**Symptoms**: Authentication works but with session errors in logs
**Root Cause**: JWT tokens reference different session ID than stored ESPN session
**Evidence**: "Session not found" + "Found fallback session" pattern
**Impact**: Functional but unreliable, potential failure under load

**Diagnostic Commands**:
```bash
# Look for session mismatches
grep "Session not found" backend_logs.log
grep "Found fallback session" backend_logs.log

# Check session creation vs JWT issuance
grep "Creating session" backend_logs.log
grep "JWT decoded successfully" backend_logs.log
```

**Potential Fixes**:
- Review session ID generation in authentication flow
- Ensure consistent hashing between login and JWT creation
- Add session cleanup for stale/mismatched sessions

---

### 🟢 LOW - ESPN API Request Optimization
**Symptoms**: Slow performance, potential rate limiting
**Root Cause**: Excessive repeated requests to same endpoints
**Evidence**: Multiple identical requests in rapid succession
**Impact**: Performance degradation, potential ESPN API limits

**Diagnostic Commands**:
```bash
# Check for request spam
grep -c "secure-team-quick-summary" backend_logs.log
grep "429" backend_logs.log  # Rate limit responses
```

**Potential Fixes**:
- Implement request deduplication
- Add client-side caching for repeated calls
- Optimize frontend to avoid unnecessary re-renders

---

## Production Monitoring Recommendations

### Key Metrics to Track
1. **Progressive Loading Success Rate**: % of users completing full season load
2. **Session Mismatch Frequency**: Rate of "Session not found" errors  
3. **API Response Times**: ESPN endpoint performance
4. **User Completion Rate**: % reaching final dashboard view

### Alert Thresholds
- Progressive loading failure rate > 5%
- Session mismatch rate > 10%  
- Average load time > 15 seconds
- ESPN API errors > 2%

### Log Analysis Commands
```bash
# Daily health check
grep -c "No season data" production_logs_$(date +%Y-%m-%d).log
grep -c "Progressive loading" production_logs_$(date +%Y-%m-%d).log  
grep -c "Session not found" production_logs_$(date +%Y-%m-%d).log

# Performance analysis  
grep "ESPN API request successful" production_logs.log | tail -100
grep "Progressive loading.*completed" production_logs.log | tail -50
```

---

## User Communication Templates

### For Progressive Loading Issues:
"We're experiencing intermittent issues loading historical fantasy data. Your recent weeks should display, but full season analysis may be limited. We're working on a fix."

### For Session Issues:
"If you're seeing login problems, try clearing your browser storage and logging in again with fresh ESPN credentials."

### For Performance Issues:
"Initial load times may be longer than expected (15-30 seconds). The app will load your most recent data first, then fill in historical analysis progressively."

---

## Development Environment vs Production Differences

**Development**: Session issues masked by fallback mechanisms
**Production**: May fail harder without fallback, need robust error handling

**Development**: Single user, low load
**Production**: Multiple concurrent users, potential race conditions in session management

**Development**: Local ESPN API calls
**Production**: Network latency may exacerbate timing issues in progressive loading

---

*Last Updated: 2025-08-30*  
*Based on comprehensive diagnostic analysis during pre-production testing*