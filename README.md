# Lead Generation Application

A comprehensive lead generation application that provides real business leads by integrating with Google Places API. The application consists of a React frontend and an Express backend.

## Features

- Real-time business data from Google Places API
- Custom location search with "Others" option
- Social media links for leads when available
- Google OAuth authentication with Supabase
- Export leads to Google Sheets
- Interactive UI with filtering and sorting options
- Export leads to CSV or Google Sheets
- Authentication with Supabase
- Caching to improve performance and reduce API calls
- Rate limiting to prevent abuse

## Project Structure

The project is divided into two main parts:

- `frontend`: React application built with Vite and Material UI (root directory)
- `backend`: Express server for API integration and web scraping

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Places API key
- Supabase account

## Deployment

This application can be deployed to various hosting platforms. For detailed instructions, see the [Deployment Guide](DEPLOYMENT_GUIDE.md).

### Quick Deployment Steps

1. **Backend Deployment**:
   ```bash
   # Run the backend deployment script
   ./deploy-backend.sh
   ```

2. **Frontend Deployment**:
   ```bash
   # Run the frontend deployment script
   ./deploy-frontend.sh
   ```

3. **Update Environment Variables**:
   - Update `VITE_BACKEND_API_URL` in the frontend to point to your deployed backend
   - Update `ALLOWED_ORIGINS` in the backend to include your deployed frontend URL

## Installation and Setup

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```
PORT=3000
NODE_ENV=development
GOOGLE_PLACES_API_KEY=your_google_places_api_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

4. Start the backend server:

```bash
npm run dev
```

The backend server will run on http://localhost:3000.

### Frontend Setup

1. Navigate to the frontend directory (project root):

```bash
cd ..
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
VITE_BACKEND_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_SHEETS_CLIENT_ID=your_google_sheets_client_id
VITE_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
```

4. Create the necessary tables in Supabase:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the SQL from `supabase/migrations/create_tables.sql`
   - Run the SQL to create the tables

5. Start the frontend development server:

```bash
npm run dev
```

The frontend will run on http://localhost:5173.

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Sign in with your Supabase account
3. Search for leads by selecting a business sector and location
4. Filter and sort the results as needed
5. Export the leads to CSV or Google Sheets

## Detailed Project Structure

### Frontend (Root Directory)

- `src/components/` - React components
  - `Home/` - Home page components
  - `Results/` - Results page components
  - `Auth/` - Authentication components
  - `common/` - Common components (Header, Footer)
- `src/services/` - Service modules
  - `apiService.js` - API service for handling requests to the backend
  - `googleSheetsService.js` - Service for Google Sheets integration
  - `supabaseClient.js` - Supabase client configuration
- `src/data/` - Mock data for development
- `supabase/migrations/` - SQL scripts for Supabase setup

### Backend (backend/ Directory)

- `src/controllers/` - API controllers
  - `leadController.js` - Controller for lead-related endpoints
- `src/services/` - Service modules
  - `googlePlacesService.js` - Service for Google Places API integration
  - `leadService.js` - Service for processing lead data
- `src/routes/` - API routes
  - `leads.js` - Routes for lead-related endpoints
- `src/utils/` - Utility functions
  - `cache.js` - Caching utility
  - `errorHandler.js` - Error handling utility
- `src/config/` - Configuration files
  - `index.js` - Central configuration

## Data Collection Sources

The application collects real lead data from multiple sources:

1. **Google Places API** - Provides real business information based on location
   - Business name, address, phone number
   - Website URL, rating, reviews
   - Business types/categories
   - Photos
   - Google Maps URL

2. **JustDial** - Web scraping for Indian business listings
   - Business name, address, phone number
   - Rating, reviews
   - Years in business

## Lead Verification

Leads are verified using multiple factors:

- Contact information completeness (phone, address, website)
- Rating and review analysis
- Business details completeness
- Years in business
- Photos availability

Each lead receives a verification score (0-100) based on these factors.

## API Endpoints

### Search for Leads

```
GET /api/leads/search?sector=Retail&location=Chennai
```

Query Parameters:
- `sector` (required): Business sector (e.g., Retail, Electronics)
- `location` (required): Location name (e.g., Chennai, Mumbai)
- `sources` (optional): Comma-separated list of sources (e.g., google,justdial)
- `forceRefresh` (optional): Whether to force refresh the cache (true/false)

### Get Lead by ID

```
GET /api/leads/:id
```

Parameters:
- `id` (required): Lead ID

## Deployment

### Backend Deployment

1. Set the environment variables in your production environment
2. Build and start the server:

```bash
cd backend
npm start
```

### Frontend Deployment

1. Build the frontend:

```bash
npm run build
```

2. Deploy the contents of the `dist` directory to your web server

## Important Notes

1. **Google Places API**: You need a valid Google Places API key with billing enabled to get real data.
   - **API Key Setup**: Follow the instructions in `API_KEY_SETUP_GUIDE.md` to create and configure your Google Places API key.
   - **API Key Restrictions**: Make sure your API key does not have referer or IP restrictions that would prevent it from working in your development environment.
   - **Required APIs**: Enable the Places API, Maps JavaScript API, and Geocoding API in your Google Cloud Console.
2. **JustDial Scraping**: Web scraping may violate JustDial's terms of service. Use at your own risk and consider their robots.txt file.
3. **Rate Limiting**: The backend includes rate limiting to prevent abuse of the APIs.
4. **Caching**: Results are cached to improve performance and reduce API calls.

## License

[MIT](LICENSE)
