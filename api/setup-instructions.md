# Multi-Device Workshop Setup Guide

## 🚀 Quick Start (30 Minutes)

This guide will get your business process workshop tool running with multi-device support using Supabase backend.

### Prerequisites
- Basic HTML/JavaScript knowledge
- A web hosting solution (Vercel, Netlify, or any web server)
- Email to send department links

## Step 1: Supabase Setup (10 minutes)

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Note your project URL and anon key

### 1.2 Setup Database
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `api/database-schema.sql`
3. Run the SQL script
4. Verify tables are created: `projects`, `department_tokens`, `processes`

### 1.3 Configure Authentication
1. Go to **Authentication** → **Settings**
2. Disable email confirmations (for workshop simplicity)
3. Add your domain to allowed origins

## Step 2: Configure Application (5 minutes)

### 2.1 Update Supabase Configuration
Edit `api/supabase-config.js`:

```javascript
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 2.2 Test Configuration
1. Open `business-automation-dashboard.html` in a browser
2. Check browser console for:
   - `✅ Supabase connected successfully` (online mode)
   - `📱 Running in offline mode with localStorage` (fallback)

## Step 3: Deploy Application (10 minutes)

### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/your/project
vercel

# Follow prompts to deploy
```

### Option B: Netlify
1. Drag and drop your project folder to [netlify.com/drop](https://netlify.com/drop)
2. Get your deployment URL

### Option C: GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch

## Step 4: Workshop Setup (5 minutes)

### 4.1 Create Workshop Project
1. Access your deployed dashboard with admin password
2. Click "Add New Project"
3. Fill in workshop details:
   - Name: "Q4 2024 Automation Workshop"
   - Description: "Cross-department process automation initiative"
   - Workshop Date: Select your workshop date

### 4.2 Generate Department Links
1. Select your new project
2. The system will automatically generate unique links for each department
3. Links format: `yoursite.com/business-automation-dashboard.html?project=PROJECT_ID&dept=DEPARTMENT&pt=TOKEN`

### 4.3 Email Department Links
Send emails to department heads with their specific links:

```
Subject: Business Process Automation Workshop - Your Department Link

Hi [Department Head],

Please use this link to access the workshop tool and submit your department's processes:

[DEPARTMENT_SPECIFIC_LINK]

This link is unique to your department and will automatically load your section of the workshop.

Thanks!
```

## Step 5: Workshop Execution

### Before Workshop
- [ ] Test all department links work
- [ ] Verify processes appear in admin dashboard
- [ ] Prepare workshop presentation screens

### During Workshop
1. **Facilitator**: Use admin dashboard for real-time monitoring
2. **Departments**: Access their individual links on any device
3. **Real-time sync**: All submissions appear immediately on facilitator screen
4. **Analytics**: Live workshop metrics and department participation

### After Workshop
1. Generate final workshop report
2. Export data for further analysis
3. Share prioritization results with stakeholders

## Testing Your Setup

### Manual Test Checklist
- [ ] Admin can create projects ✓
- [ ] Department links work on different devices ✓
- [ ] Processes appear in real-time ✓
- [ ] Analytics update correctly ✓
- [ ] Offline mode works as fallback ✓

### Automated Tests
Run the test suite:
```bash
npm test
```

## Troubleshooting

### Common Issues

**1. "Supabase connection failed"**
- Check your SUPABASE_URL and SUPABASE_ANON_KEY
- Verify your domain is in allowed origins
- Check network connectivity

**2. "Processes not appearing"**
- Verify currentProjectId is set correctly
- Check browser console for errors
- Ensure department tokens are valid

**3. "Real-time updates not working"**
- Confirm Supabase real-time is enabled
- Check WebSocket connections in browser dev tools
- Verify subscription setup

**4. "Department links not working"**
- Validate URL parameters are correct
- Check token generation function
- Verify project exists in database

### Support

**Logs to Check:**
- Browser console for frontend errors
- Supabase logs for backend issues
- Network tab for API call failures

**Debug Mode:**
Add `?debug=true` to any URL to enable verbose logging.

## Production Considerations

### Security
- [ ] Use environment variables for Supabase credentials
- [ ] Implement proper Row Level Security policies
- [ ] Add rate limiting for API calls
- [ ] Use HTTPS for all communications

### Performance
- [ ] Enable Supabase connection pooling
- [ ] Add CDN for static assets
- [ ] Implement lazy loading for large datasets
- [ ] Monitor database query performance

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor Supabase usage quotas
- [ ] Track workshop participation metrics
- [ ] Set up uptime monitoring

## Workshop URL Examples

### Admin Dashboard
```
https://yoursite.com/business-automation-dashboard.html
```

### Department Links
```
Finance:
https://yoursite.com/business-automation-dashboard.html?project=abc123&dept=finance&pt=fin_token_456

Operations:
https://yoursite.com/business-automation-dashboard.html?project=abc123&dept=operations&pt=ops_token_789

HR:
https://yoursite.com/business-automation-dashboard.html?project=abc123&dept=hr&pt=hr_token_012
```

## Advanced Features

### Custom Branding
1. Update CSS variables in the dashboard
2. Replace logo and colors to match company branding
3. Customize department names and categories

### Integration Options
- **Email automation**: Use Zapier/Make to auto-send department links
- **Slack integration**: Post workshop updates to team channels
- **Export formats**: CSV, PDF, PowerPoint for different stakeholders

### Scaling
- Supabase free tier: 500MB database, 2GB bandwidth
- Paid plans available for larger workshops
- Can handle 100+ concurrent users with proper setup

---

🎉 **You're ready to run your multi-device business process workshop!**

For questions or issues, check the troubleshooting section or review the test cases in `tests/multi-device-workshop.test.js`.