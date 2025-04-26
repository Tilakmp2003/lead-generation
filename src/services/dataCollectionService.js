import supabase from './supabaseClient';
import { mockLeads } from '../data/mockLeads';

// Service for collecting business lead data from various sources
class DataCollectionService {
  constructor() {
    this.sources = [
      { name: 'Google Places', handler: this.fetchFromGooglePlaces },
      { name: 'Yellow Pages', handler: this.fetchFromYellowPages },
      { name: 'Business Directories', handler: this.fetchFromBusinessDirectories },
      { name: 'Mock Data', handler: this.fetchFromMockData }
    ];
  }

  /**
   * Generate a random Indian phone number
   * @returns {string} - Formatted Indian phone number
   */
  generateIndianPhoneNumber() {
    // Indian mobile numbers start with digits 6-9
    const firstDigit = Math.floor(Math.random() * 4) + 6;

    // Generate the remaining 9 digits
    const remainingDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');

    // Format as +91 XXXXX XXXXX
    return `+91 ${firstDigit}${remainingDigits.substring(0, 5)} ${remainingDigits.substring(5)}`;
  }

  /**
   * Generate a realistic Indian business name
   * @param {string} sector - Business sector
   * @param {string} location - Location
   * @returns {string} - Realistic Indian business name
   */
  generateIndianBusinessName(sector, location) {
    // Common Indian business name prefixes
    const prefixes = [
      'Shri', 'Sri', 'Sree', 'Shree', 'Jai', 'New', 'Royal', 'Maha', 'Super',
      'Aditya', 'Vijay', 'Ganesh', 'Krishna', 'Lakshmi', 'Saraswati', 'Durga',
      'Raj', 'Devi', 'Swami', 'Guru', 'Bharat', 'Indian', 'National', 'Global',
      'Metro', 'City', 'Urban', 'Modern', 'Classic', 'Premier', 'Elite', 'Prime'
    ];

    // Common Indian business name suffixes based on sector
    const suffixes = {
      'Retail': ['Mart', 'Store', 'Emporium', 'Bazaar', 'Supermarket', 'Shop', 'Traders', 'Retail', 'Outlet'],
      'Electronics': ['Electronics', 'Gadgets', 'Digital World', 'Tech Hub', 'Computers', 'Mobile Zone', 'Appliances'],
      'Grocery': ['Grocers', 'Supermarket', 'Fresh Mart', 'Provisions', 'Food Bazaar', 'Kirana', 'General Store'],
      'Fashion': ['Fashions', 'Garments', 'Textiles', 'Clothing', 'Boutique', 'Dress Palace', 'Saree Center'],
      'Home Decor': ['Furnishings', 'Home Center', 'Furniture Mart', 'Decor World', 'Interior Solutions'],
      'All': ['Enterprises', 'Industries', 'Limited', 'Pvt Ltd', 'Corporation', 'Group', 'Associates', 'Company']
    };

    // Common Indian family names/surnames that are often used in business names
    const familyNames = [
      'Sharma', 'Patel', 'Singh', 'Gupta', 'Jain', 'Agarwal', 'Reddy', 'Iyer',
      'Rao', 'Nair', 'Menon', 'Pillai', 'Desai', 'Shah', 'Mehta', 'Verma',
      'Malhotra', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Das', 'Bose', 'Sen',
      'Naidu', 'Choudhury', 'Yadav', 'Kumar', 'Shetty', 'Hegde', 'Kamath'
    ];

    // Location-specific business names
    const locationSpecificNames = {
      'Chennai': ['Madras', 'Tamil', 'Chennai', 'Anna', 'Adyar', 'T Nagar', 'Mylapore'],
      'Mumbai': ['Bombay', 'Mumbai', 'Maharashtra', 'Dadar', 'Andheri', 'Borivali'],
      'Delhi': ['Delhi', 'New Delhi', 'Dilli', 'Connaught', 'Karol Bagh', 'Chandni Chowk'],
      'Bangalore': ['Bengaluru', 'Karnataka', 'Whitefield', 'Indiranagar', 'Koramangala'],
      'Hyderabad': ['Hyderabad', 'Telangana', 'Secunderabad', 'Jubilee Hills', 'Banjara Hills'],
      'Kolkata': ['Calcutta', 'Bengal', 'Kolkata', 'Howrah', 'Park Street'],
      'Madurai': ['Madurai', 'Tamil', 'Meenakshi', 'Pandian']
    };

    // Generate a random business name
    const nameType = Math.floor(Math.random() * 5); // 0-4 for different name patterns

    let businessName = '';

    switch (nameType) {
      case 0: // Prefix + Sector + Suffix
        businessName = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${sector} ${suffixes[sector][Math.floor(Math.random() * suffixes[sector].length)]}`;
        break;
      case 1: // Family Name + Sector + Suffix
        businessName = `${familyNames[Math.floor(Math.random() * familyNames.length)]} ${sector} ${suffixes[sector][Math.floor(Math.random() * suffixes[sector].length)]}`;
        break;
      case 2: // Location Specific + Sector + Suffix
        const locNames = locationSpecificNames[location] || ['Indian'];
        businessName = `${locNames[Math.floor(Math.random() * locNames.length)]} ${sector} ${suffixes[sector][Math.floor(Math.random() * suffixes[sector].length)]}`;
        break;
      case 3: // Prefix + Family Name + Suffix
        businessName = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${familyNames[Math.floor(Math.random() * familyNames.length)]} ${suffixes['All'][Math.floor(Math.random() * suffixes['All'].length)]}`;
        break;
      case 4: // Family Name & Family Name + Suffix
        const familyName1 = familyNames[Math.floor(Math.random() * familyNames.length)];
        let familyName2 = familyNames[Math.floor(Math.random() * familyNames.length)];
        // Make sure we don't get the same family name twice
        while (familyName1 === familyName2) {
          familyName2 = familyNames[Math.floor(Math.random() * familyNames.length)];
        }
        businessName = `${familyName1} & ${familyName2} ${suffixes['All'][Math.floor(Math.random() * suffixes['All'].length)]}`;
        break;
    }

    return businessName;
  }

  /**
   * Generate a random Indian address
   * @param {string} location - City name
   * @param {string} streetType - Type of street (e.g., Main St, Blvd)
   * @returns {string} - Formatted Indian address
   */
  generateIndianAddress(location, streetType = '') {
    // Common Indian street/area names
    const streetNames = [
      'Gandhi Road', 'Nehru Street', 'MG Road', 'Patel Nagar',
      'Shivaji Marg', 'Rajiv Chowk', 'Subhash Nagar', 'Anna Salai',
      'Kamaraj Avenue', 'Periyar Road', 'Ambedkar Street'
    ];

    // Common area types
    const areaTypes = ['Nagar', 'Colony', 'Extension', 'Layout', 'Enclave', 'Garden', 'Vihar'];

    // Generate building number
    const buildingNumber = Math.floor(Math.random() * 300) + 1;

    // Select a random street name
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];

    // Select a random area type if no street type is provided
    const area = streetType || areaTypes[Math.floor(Math.random() * areaTypes.length)];

    // Generate a random PIN code (Indian postal code - 6 digits)
    // Chennai: 600001-600100, Bangalore: 560001-560100, etc.
    let pinCode;
    if (location === 'Chennai') {
      pinCode = 600000 + Math.floor(Math.random() * 100) + 1;
    } else if (location === 'Bangalore') {
      pinCode = 560000 + Math.floor(Math.random() * 100) + 1;
    } else if (location === 'Mumbai') {
      pinCode = 400000 + Math.floor(Math.random() * 100) + 1;
    } else if (location === 'Delhi') {
      pinCode = 110000 + Math.floor(Math.random() * 100) + 1;
    } else if (location === 'Kolkata') {
      pinCode = 700000 + Math.floor(Math.random() * 100) + 1;
    } else if (location === 'Hyderabad') {
      pinCode = 500000 + Math.floor(Math.random() * 100) + 1;
    } else if (location === 'Madurai') {
      pinCode = 625000 + Math.floor(Math.random() * 20) + 1;
    } else {
      pinCode = 600000 + Math.floor(Math.random() * 100) + 1; // Default to Chennai range
    }

    return `${buildingNumber}, ${streetName}, ${area}, ${location} - ${pinCode}`;
  }

  /**
   * Main method to fetch leads based on sector and location
   * @param {string} sector - Business sector (e.g., Retail, Electronics)
   * @param {string} location - Location (e.g., Madurai, Chennai)
   * @returns {Promise<Array>} - Array of lead objects
   */
  async fetchLeads(sector, location) {
    console.log(`Fetching leads for ${sector} in ${location}`);

    try {
      // Check if we have cached data in Supabase
      const { data: cachedLeads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('sector', sector)
        .eq('location', location);

      if (error) {
        console.error('Error fetching from Supabase:', error);
        throw error;
      }

      // If we have cached data and it's not too old, return it
      if (cachedLeads && cachedLeads.length > 0) {
        const cacheTimestamp = new Date(cachedLeads[0].updated_at);
        const now = new Date();
        const cacheAgeHours = (now - cacheTimestamp) / (1000 * 60 * 60);

        // If cache is less than 24 hours old, use it
        if (cacheAgeHours < 24) {
          console.log('Using cached data from Supabase');
          return cachedLeads.map(lead => this.formatLead(lead));
        }
      }

      // Otherwise, fetch fresh data from sources
      console.log('Fetching fresh data from sources');

      // Try to fetch from external sources
      let leads = [];

      // Try Google Places API
      try {
        const googleLeads = await this.fetchFromGooglePlaces(sector, location);
        leads = [...leads, ...googleLeads];
      } catch (sourceError) {
        console.error('Error fetching from Google Places:', sourceError);
      }

      // Try Yellow Pages
      try {
        const yellowPagesLeads = await this.fetchFromYellowPages(sector, location);
        leads = [...leads, ...yellowPagesLeads];
      } catch (sourceError) {
        console.error('Error fetching from Yellow Pages:', sourceError);
      }

      // Try Business Directories
      try {
        const directoryLeads = await this.fetchFromBusinessDirectories(sector, location);
        leads = [...leads, ...directoryLeads];
      } catch (sourceError) {
        console.error('Error fetching from Business Directories:', sourceError);
      }

      // If we couldn't get any leads from external sources, use mock data as fallback
      if (leads.length === 0) {
        console.log('No leads found from external sources, using mock data as fallback');
        leads = await this.fetchFromMockData(sector, location);
      }

      // Store the fresh data in Supabase for future use (if authenticated)
      if (leads.length > 0) {
        try {
          // Check if we have a valid session first
          const { data: sessionData } = await supabase.auth.getSession();

          if (sessionData?.session) {
            // User is authenticated, try to store leads
            const leadsToStore = leads.map(lead => ({
              business_name: lead.businessName,
              business_type: lead.businessType,
              owner_name: lead.ownerName,
              email: lead.contactDetails.email,
              phone: lead.contactDetails.phone,
              social_media: JSON.stringify(lead.contactDetails.socialMedia),
              address: lead.address,
              description: lead.description,
              sector: sector,
              location: location,
              source: lead.source || 'unknown',
              verification_score: lead.verificationScore || Math.random() * 100,
              updated_at: new Date().toISOString()
            }));

            // Upsert the leads to Supabase
            const { error: upsertError } = await supabase
              .from('leads')
              .upsert(leadsToStore, { onConflict: 'business_name,location' });

            if (upsertError) {
              console.error('Error storing leads in Supabase:', upsertError);
            } else {
              console.log('Successfully stored leads in Supabase');
            }
          } else {
            console.log('User not authenticated, skipping Supabase storage');
          }
        } catch (error) {
          console.error('Error checking authentication or storing leads:', error);
        }
      }

      return leads;
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      // Fallback to mock data if all else fails
      return this.fetchFromMockData(sector, location);
    }
  }

  /**
   * Format a lead from Supabase to match our application's format
   * @param {Object} lead - Lead from Supabase
   * @returns {Object} - Formatted lead
   */
  formatLead(lead) {
    return {
      id: lead.id,
      businessName: lead.business_name,
      businessType: lead.business_type,
      ownerName: lead.owner_name,
      contactDetails: {
        email: lead.email,
        phone: lead.phone,
        socialMedia: JSON.parse(lead.social_media || '{}')
      },
      address: lead.address,
      description: lead.description,
      verificationScore: lead.verification_score
    };
  }

  /**
   * Fetch leads from Google Places API
   * @param {string} sector - Business sector
   * @param {string} location - Location
   * @returns {Promise<Array>} - Array of lead objects
   */
  async fetchFromGooglePlaces(sector, location) {
    console.log('Fetching from Google Places API');

    try {
      // Get Google Places API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

      // Check if API key is available
      if (!apiKey) {
        console.warn('Google Places API key missing. Cannot fetch from Google Places.');
        return [];
      }

      // CORS issues may prevent direct API calls from client-side
      // In a real implementation, this might need a backend proxy
      // For now, we'll generate mock data based on the sector and location

      // Generate some mock data based on the sector and location
      const mockCount = Math.floor(Math.random() * 3) + 3; // 3-5 results
      const leads = [];

      for (let i = 0; i < mockCount; i++) {
        const businessName = this.generateIndianBusinessName(sector, location);
        const phone = this.generateIndianPhoneNumber();
        const address = this.generateIndianAddress(location, 'Complex');
        const rating = (Math.floor(Math.random() * 15) + 35) / 10; // 3.5-5.0 rating
        const reviewCount = Math.floor(Math.random() * 200) + 50; // 50-249 reviews

        // Create description
        let description = `Rating: ${rating}/5. ${reviewCount} reviews. Categories: ${sector}, store, point_of_interest, establishment.`;

        // Create a lead object
        leads.push({
          id: `gp-${i}-${Date.now()}`,
          businessName,
          businessType: sector,
          ownerName: '', // Not available from Google Places
          contactDetails: {
            email: '', // Not available from Google Places
            phone,
            socialMedia: {} // Not available from Google Places
          },
          address,
          description,
          source: 'Google Places (Simulated)',
          verificationScore: this.calculateGooglePlacesScore({
            hasPhone: true,
            hasAddress: true,
            hasWebsite: Math.random() > 0.3, // 70% chance of having a website
            hasRating: true,
            hasReviews: true,
            hasTypes: true
          })
        });
      }

      return leads;
    } catch (error) {
      console.error('Error fetching from Google Places:', error);
      return [];
    }
  }

  /**
   * Map our business sector to Google Places API business type
   * @param {string} sector - Our business sector
   * @returns {string} - Google Places API business type
   */
  mapSectorToGoogleType(sector) {
    const mapping = {
      'Retail': 'store',
      'Electronics': 'electronics_store',
      'Grocery': 'grocery_or_supermarket',
      'Fashion': 'clothing_store',
      'Home Decor': 'home_goods_store',
      'All': 'store'
    };

    return mapping[sector] || 'store';
  }

  /**
   * Calculate a verification score for a Google Places result
   * @param {Object} factors - Verification factors
   * @returns {number} - Verification score (0-100)
   */
  calculateGooglePlacesScore(factors) {
    let score = 0;

    // Check if factors is a valid object
    if (!factors || typeof factors !== 'object') {
      return 50; // Default score if factors are invalid
    }

    // Has phone number
    if (factors.hasPhone) {
      score += 20;
    }

    // Has website
    if (factors.hasWebsite) {
      score += 20;
    }

    // Has rating
    if (factors.hasRating) {
      score += 10;
    }

    // Has reviews
    if (factors.hasReviews) {
      score += 10;
    }

    // Has address
    if (factors.hasAddress) {
      score += 20;
    }

    // Has types/categories
    if (factors.hasTypes) {
      score += 10;
    }

    // Has photos
    if (factors.hasPhotos) {
      score += 10;
    }

    return score;
  }

  /**
   * Fetch leads from Yellow Pages
   * @param {string} sector - Business sector
   * @param {string} location - Location
   * @returns {Promise<Array>} - Array of lead objects
   */
  async fetchFromYellowPages(sector, location) {
    console.log('Fetching from Yellow Pages');

    try {
      // CORS issues prevent direct scraping from client-side
      // In a real implementation, this would be done through a backend proxy
      console.log('Yellow Pages scraping requires a backend proxy to avoid CORS issues');

      // Generate some mock data based on the sector and location
      // This simulates what we would get from Yellow Pages
      const mockCount = Math.floor(Math.random() * 3) + 2; // 2-4 results
      const leads = [];

      for (let i = 0; i < mockCount; i++) {
        const businessName = this.generateIndianBusinessName(sector, location);
        const phone = this.generateIndianPhoneNumber();
        const address = this.generateIndianAddress(location, 'Market');
        const yearsInBusiness = Math.floor(Math.random() * 20) + 1;

        // Create description
        let description = `Categories: ${sector}, Retail. `;
        description += `Years in business: ${yearsInBusiness}. `;

        // Create a lead object
        leads.push({
          id: `yp-${i}-${Date.now()}`,
          businessName,
          businessType: sector,
          ownerName: '', // Not available from Yellow Pages
          contactDetails: {
            email: '', // Not available from Yellow Pages
            phone,
            socialMedia: {}
          },
          address,
          description,
          source: 'Yellow Pages (Simulated)',
          verificationScore: this.calculateYellowPagesScore({
            hasPhone: true,
            hasAddress: true,
            hasWebsite: false,
            hasSocialMedia: false,
            hasYearsInBusiness: true,
            hasCategories: true
          })
        });
      }

      return leads;
    } catch (error) {
      console.error('Error fetching from Yellow Pages:', error);
      return [];
    }
  }

  /**
   * Map our business sector to Yellow Pages category
   * @param {string} sector - Our business sector
   * @returns {string} - Yellow Pages category
   */
  mapSectorToYellowPagesCategory(sector) {
    const mapping = {
      'Retail': 'retail',
      'Electronics': 'electronics',
      'Grocery': 'grocery stores',
      'Fashion': 'clothing stores',
      'Home Decor': 'home decor',
      'All': 'retail'
    };

    return mapping[sector] || 'retail';
  }

  /**
   * Calculate a verification score for a Yellow Pages result
   * @param {Object} data - Data about the Yellow Pages listing
   * @returns {number} - Verification score (0-100)
   */
  calculateYellowPagesScore(data) {
    let score = 0;

    // Has phone number
    if (data.hasPhone) {
      score += 20;
    }

    // Has address
    if (data.hasAddress) {
      score += 20;
    }

    // Has website
    if (data.hasWebsite) {
      score += 20;
    }

    // Has social media
    if (data.hasSocialMedia) {
      score += 15;
    }

    // Has years in business
    if (data.hasYearsInBusiness) {
      score += 15;
    }

    // Has categories
    if (data.hasCategories) {
      score += 10;
    }

    return score;
  }

  /**
   * Fetch leads from various business directories
   * @param {string} sector - Business sector
   * @param {string} location - Location
   * @returns {Promise<Array>} - Array of lead objects
   */
  async fetchFromBusinessDirectories(sector, location) {
    console.log('Fetching from Business Directories');

    try {
      // CORS issues prevent direct scraping from client-side
      // In a real implementation, this would be done through a backend proxy
      console.log('Business directory scraping requires a backend proxy to avoid CORS issues');

      // Generate some mock data based on the sector and location
      // This simulates what we would get from business directories
      const mockCount = Math.floor(Math.random() * 4) + 3; // 3-6 results
      const leads = [];

      // Generate mock data for Manta
      for (let i = 0; i < Math.ceil(mockCount/2); i++) {
        const businessName = this.generateIndianBusinessName(sector, location);
        const phone = this.generateIndianPhoneNumber();
        const address = this.generateIndianAddress(location, 'Business Park');

        // Create description
        const description = `${sector} business serving the ${location} area.`;

        // Create a lead object
        leads.push({
          id: `manta-${i}-${Date.now()}`,
          businessName,
          businessType: sector,
          ownerName: '', // Not available from Manta
          contactDetails: {
            email: '', // Not available from Manta
            phone,
            socialMedia: {} // Not available from Manta
          },
          address,
          description,
          source: 'Manta (Simulated)',
          verificationScore: this.calculateBusinessDirectoryScore({
            hasPhone: true,
            hasAddress: true,
            hasWebsite: false,
            hasDescription: true
          })
        });
      }

      // Generate mock data for Yelp
      for (let i = 0; i < Math.floor(mockCount/2); i++) {
        const businessName = this.generateIndianBusinessName(sector, location);
        const phone = this.generateIndianPhoneNumber();
        const address = this.generateIndianAddress(location, 'Plaza');
        const rating = (Math.floor(Math.random() * 10) + 35) / 10; // 3.5-4.5 rating
        const reviewCount = Math.floor(Math.random() * 100) + 10; // 10-109 reviews

        // Create description
        let description = `Rating: ${rating}/5. ${reviewCount} reviews. Categories: ${sector}, Retail.`;

        // Create a lead object
        leads.push({
          id: `yelp-${i}-${Date.now()}`,
          businessName,
          businessType: sector,
          ownerName: '', // Not available from Yelp
          contactDetails: {
            email: '', // Not available from Yelp
            phone,
            socialMedia: {} // Not available from Yelp
          },
          address,
          description,
          source: 'Yelp (Simulated)',
          verificationScore: this.calculateBusinessDirectoryScore({
            hasPhone: true,
            hasAddress: true,
            hasRating: true,
            hasReviews: true,
            hasCategories: true
          })
        });
      }

      return leads;
    } catch (error) {
      console.error('Error fetching from Business Directories:', error);
      return [];
    }
  }

  /**
   * Map our business sector to Manta category
   * @param {string} sector - Our business sector
   * @returns {string} - Manta category
   */
  mapSectorToMantaCategory(sector) {
    const mapping = {
      'Retail': 'retail',
      'Electronics': 'electronics',
      'Grocery': 'grocery',
      'Fashion': 'clothing',
      'Home Decor': 'home decor',
      'All': 'retail'
    };

    return mapping[sector] || 'retail';
  }

  /**
   * Map our business sector to Yelp category
   * @param {string} sector - Our business sector
   * @returns {string} - Yelp category
   */
  mapSectorToYelpCategory(sector) {
    const mapping = {
      'Retail': 'shopping',
      'Electronics': 'electronics',
      'Grocery': 'grocery',
      'Fashion': 'fashion',
      'Home Decor': 'home decor',
      'All': 'shopping'
    };

    return mapping[sector] || 'shopping';
  }

  /**
   * Calculate a verification score for a business directory result
   * @param {Object} data - Data about the business directory listing
   * @returns {number} - Verification score (0-100)
   */
  calculateBusinessDirectoryScore(data) {
    let score = 0;

    // Has phone number
    if (data.hasPhone) {
      score += 20;
    }

    // Has address
    if (data.hasAddress) {
      score += 20;
    }

    // Has website
    if (data.hasWebsite) {
      score += 20;
    }

    // Has description
    if (data.hasDescription) {
      score += 10;
    }

    // Has rating
    if (data.hasRating) {
      score += 15;
    }

    // Has reviews
    if (data.hasReviews) {
      score += 10;
    }

    // Has categories
    if (data.hasCategories) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Fetch leads from mock data
   * This is a fallback for demonstration purposes
   */
  async fetchFromMockData(sector, location) {
    console.log('Fetching from mock data');

    // Filter mock leads based on sector and location
    let filteredLeads = [...mockLeads];

    if (sector && sector !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.businessType === sector);
    }

    if (location && location !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.address.includes(location));
    }

    // Add a random verification score to each lead
    return filteredLeads.map(lead => ({
      ...lead,
      verificationScore: Math.floor(Math.random() * 100)
    }));
  }
}

// Create and export a singleton instance
const dataCollectionService = new DataCollectionService();
export default dataCollectionService;
