// Mock data for lead generation
export const mockLeads = [
  {
    id: 1,
    businessName: "Madurai Electronics",
    businessType: "Electronics",
    ownerName: "Rajesh Kumar",
    contactDetails: {
      email: "rajesh@maduraielectronics.com",
      phone: "+91 9876543210",
      socialMedia: {
        facebook: "facebook.com/maduraielectronics",
        linkedin: "linkedin.com/company/madurai-electronics"
      }
    },
    address: "123 Main Street, Madurai, Tamil Nadu, India",
    description: "Leading electronics retailer in Madurai with over 15 years of experience."
  },
  {
    id: 2,
    businessName: "Chennai Fashion Hub",
    businessType: "Fashion",
    ownerName: "Priya Sharma",
    contactDetails: {
      email: "priya@chennaifashion.com",
      phone: "+91 9876543211",
      socialMedia: {
        facebook: "facebook.com/chennaifashionhub",
        instagram: "instagram.com/chennaifashion"
      }
    },
    address: "456 Fashion Street, Chennai, Tamil Nadu, India",
    description: "Premium fashion outlet offering the latest trends in clothing and accessories."
  },
  {
    id: 3,
    businessName: "Bangalore Grocery Mart",
    businessType: "Grocery",
    ownerName: "Arun Singh",
    contactDetails: {
      email: "arun@bangaloregrocery.com",
      phone: "+91 9876543212",
      socialMedia: {
        facebook: "facebook.com/bangaloregrocery",
        twitter: "twitter.com/bangaloregrocery"
      }
    },
    address: "789 Food Avenue, Bangalore, Karnataka, India",
    description: "One-stop shop for all grocery needs with fresh produce and imported goods."
  },
  {
    id: 4,
    businessName: "Hyderabad Mobile Store",
    businessType: "Electronics",
    ownerName: "Vikram Reddy",
    contactDetails: {
      email: "vikram@hyderabadmobile.com",
      phone: "+91 9876543213",
      socialMedia: {
        facebook: "facebook.com/hyderabadmobile",
        youtube: "youtube.com/hyderabadmobile"
      }
    },
    address: "101 Tech Road, Hyderabad, Telangana, India",
    description: "Authorized dealer for all major mobile brands with expert repair services."
  },
  {
    id: 5,
    businessName: "Kochi Seafood Market",
    businessType: "Grocery",
    ownerName: "Maya Thomas",
    contactDetails: {
      email: "maya@kochiseafood.com",
      phone: "+91 9876543214",
      socialMedia: {
        facebook: "facebook.com/kochiseafood",
        instagram: "instagram.com/kochiseafood"
      }
    },
    address: "222 Harbor Road, Kochi, Kerala, India",
    description: "Fresh seafood sourced directly from local fishermen every morning."
  },
  {
    id: 6,
    businessName: "Delhi Furniture House",
    businessType: "Home Decor",
    ownerName: "Amit Kapoor",
    contactDetails: {
      email: "amit@delhifurniture.com",
      phone: "+91 9876543215",
      socialMedia: {
        facebook: "facebook.com/delhifurniture",
        pinterest: "pinterest.com/delhifurniture"
      }
    },
    address: "333 Decor Street, Delhi, India",
    description: "Handcrafted furniture with modern designs and traditional craftsmanship."
  },
  {
    id: 7,
    businessName: "Jaipur Handicrafts",
    businessType: "Retail",
    ownerName: "Sunita Jain",
    contactDetails: {
      email: "sunita@jaipurhandicrafts.com",
      phone: "+91 9876543216",
      socialMedia: {
        facebook: "facebook.com/jaipurhandicrafts",
        etsy: "etsy.com/shop/jaipurhandicrafts"
      }
    },
    address: "444 Craft Lane, Jaipur, Rajasthan, India",
    description: "Authentic Rajasthani handicrafts made by local artisans."
  },
  {
    id: 8,
    businessName: "Mumbai Fashion Boutique",
    businessType: "Fashion",
    ownerName: "Neha Patel",
    contactDetails: {
      email: "neha@mumbaifashion.com",
      phone: "+91 9876543217",
      socialMedia: {
        facebook: "facebook.com/mumbaifashion",
        instagram: "instagram.com/mumbaifashion"
      }
    },
    address: "555 Style Road, Mumbai, Maharashtra, India",
    description: "Designer clothing and accessories for the fashion-forward customer."
  },
  {
    id: 9,
    businessName: "Kolkata Book Store",
    businessType: "Retail",
    ownerName: "Debashish Roy",
    contactDetails: {
      email: "debashish@kolkatabooks.com",
      phone: "+91 9876543218",
      socialMedia: {
        facebook: "facebook.com/kolkatabooks",
        twitter: "twitter.com/kolkatabooks"
      }
    },
    address: "666 Literary Lane, Kolkata, West Bengal, India",
    description: "Extensive collection of books in multiple languages with rare editions."
  },
  {
    id: 10,
    businessName: "Ahmedabad Textile Emporium",
    businessType: "Retail",
    ownerName: "Rajan Mehta",
    contactDetails: {
      email: "rajan@ahmedabadtextile.com",
      phone: "+91 9876543219",
      socialMedia: {
        facebook: "facebook.com/ahmedabadtextile",
        linkedin: "linkedin.com/company/ahmedabad-textile"
      }
    },
    address: "777 Fabric Road, Ahmedabad, Gujarat, India",
    description: "Traditional and modern textiles with custom tailoring services."
  }
];

// Business sectors for dropdown
export const businessSectors = [
  "All",
  "Retail",
  "Electronics",
  "Grocery",
  "Fashion",
  "Home Decor"
];

// Locations for search
export const locations = [
  "All",
  "Madurai",
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Kochi",
  "Delhi",
  "Jaipur",
  "Mumbai",
  "Kolkata",
  "Ahmedabad",
  "Others" // Added Others option for custom location input
];

// Function to filter leads based on sector and location
export const filterLeads = (sector, location) => {
  console.log('Filter function called with:', { sector, location });

  // Start with all leads
  let filteredLeads = [...mockLeads];

  // Filter by sector if specified and not "All"
  if (sector && sector !== "All") {
    console.log('Filtering by sector:', sector);
    filteredLeads = filteredLeads.filter(lead => lead.businessType === sector);
    console.log('After sector filter:', filteredLeads.length, 'leads');
  }

  // Filter by location if specified and not "All"
  if (location && location !== "All") {
    console.log('Filtering by location:', location);
    filteredLeads = filteredLeads.filter(lead => lead.address.includes(location));
    console.log('After location filter:', filteredLeads.length, 'leads');
  }

  console.log('Final filtered leads:', filteredLeads.length);
  return filteredLeads;
};
