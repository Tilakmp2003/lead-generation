# OAuth Verification Documentation

## Scope Justifications

### 1. Google Drive File Scope (`/auth/drive.file`)
This scope is required to:
- Create new Google Sheets documents to store exported lead data
- Write lead data to these specific sheets
- Update existing sheets when users re-export or update lead data
- No access to user's other Drive files is needed or requested

### 2. Google Sheets Scope (`/auth/spreadsheets`)
This scope is required to:
- Write lead data into created spreadsheets in a structured format
- Format the data with proper headers and columns
- Update existing sheets with new lead data
- Ensure proper formatting and data organization

## Demo Video Script

1. **Application Overview** (30 seconds)
   - Show the homepage and explain the lead generation purpose
   - Demonstrate user registration/login process

2. **Lead Search** (30 seconds)
   - Show how users search for leads by sector and location
   - Display search results with verified business information

3. **Google Sheets Integration** (1 minute)
   - Demonstrate the Google OAuth login process
   - Show lead export functionality
   - Display the created Google Sheet with exported leads
   - Demonstrate data formatting and organization

4. **Privacy & Data Usage** (30 seconds)
   - Show privacy policy and terms pages
   - Highlight data protection measures
   - Demonstrate limited scope usage

## Test User Credentials
- Email: test.user@leadfind.com
- Password: TestUser2025#
- Role: Standard user with access to all features

## Additional Information

### Project Setup
1. Frontend: Next.js application hosted on Vercel
2. Backend: Node.js/Express API hosted on Render
3. Database: Supabase (PostgreSQL)

### OAuth Integration Details
1. Production Domain: https://leadfind.vercel.app
2. Authorized Redirect URIs:
   - https://leadfind.vercel.app/oauth2callback
3. JavaScript Origins:
   - https://leadfind.vercel.app

### Data Access & Security
1. Only access sheets created by the application
2. No access to user's existing Drive files
3. Data encryption in transit and at rest
4. Regular security audits and updates