# Lead Generation Backend

This is the backend server for the Lead Generation application. It provides real business lead data by integrating with Google Places API and scraping JustDial.

## Features

- Real-time business data from Google Places API
- Web scraping of JustDial for additional business data
- Caching to improve performance and reduce API calls
- Rate limiting to prevent abuse
- Error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Places API key

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
GOOGLE_PLACES_API_KEY=your_google_places_api_key
JUSTDIAL_BASE_URL=https://www.justdial.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=3600
```

5. Start the server:

```bash
npm run dev
```

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

## Development

To run the server in development mode with hot reloading:

```bash
npm run dev
```

## Production

To run the server in production mode:

```bash
npm start
```

## License

This project is licensed under the MIT License.
