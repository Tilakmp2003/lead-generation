import supabase from './supabaseClient';

/**
 * Service for verifying and scoring lead authenticity
 */
class LeadVerificationService {
  /**
   * Verify and score a batch of leads
   * @param {Array} leads - Array of lead objects to verify
   * @returns {Promise<Array>} - Array of verified lead objects with scores
   */
  async verifyAndScoreLeads(leads) {
    console.log(`Verifying ${leads.length} leads`);
    
    // In a real implementation, this would use more sophisticated verification methods
    const verifiedLeads = await Promise.all(
      leads.map(async lead => {
        const score = await this.calculateVerificationScore(lead);
        return {
          ...lead,
          verificationScore: score
        };
      })
    );
    
    // Sort by verification score (highest first)
    return verifiedLeads.sort((a, b) => b.verificationScore - a.verificationScore);
  }
  
  /**
   * Calculate a verification score for a lead
   * @param {Object} lead - Lead object to score
   * @returns {Promise<number>} - Verification score (0-100)
   */
  async calculateVerificationScore(lead) {
    // In a real implementation, this would use multiple factors
    // For now, we'll use a simple scoring algorithm
    
    let score = 0;
    
    // Check if email follows a business pattern
    if (lead.contactDetails.email && this.isBusinessEmail(lead.contactDetails.email)) {
      score += 20;
    }
    
    // Check if phone number is valid
    if (lead.contactDetails.phone && this.isValidPhoneNumber(lead.contactDetails.phone)) {
      score += 20;
    }
    
    // Check if address is detailed
    if (lead.address && lead.address.split(',').length >= 3) {
      score += 20;
    }
    
    // Check if business has social media
    if (lead.contactDetails.socialMedia && Object.keys(lead.contactDetails.socialMedia).length > 0) {
      score += 20;
    }
    
    // Check if business description is detailed
    if (lead.description && lead.description.length > 50) {
      score += 20;
    }
    
    // In a real implementation, we would also:
    // - Cross-reference with other data sources
    // - Check if business is registered
    // - Verify website existence and activity
    // - Use machine learning for pattern recognition
    
    return score;
  }
  
  /**
   * Check if an email follows a business pattern
   * @param {string} email - Email to check
   * @returns {boolean} - Whether the email follows a business pattern
   */
  isBusinessEmail(email) {
    // Simple check: does the email contain the business name?
    const emailParts = email.split('@');
    if (emailParts.length !== 2) return false;
    
    const domain = emailParts[1];
    return !domain.includes('gmail.com') && 
           !domain.includes('yahoo.com') && 
           !domain.includes('hotmail.com') &&
           !domain.includes('outlook.com');
  }
  
  /**
   * Check if a phone number is valid
   * @param {string} phone - Phone number to check
   * @returns {boolean} - Whether the phone number is valid
   */
  isValidPhoneNumber(phone) {
    // Simple check: does the phone number have the right format?
    return /^[+]?[\d\s-]{10,15}$/.test(phone);
  }
  
  /**
   * Get the top N verified leads
   * @param {Array} leads - Array of verified lead objects
   * @param {number} limit - Maximum number of leads to return
   * @returns {Array} - Top N verified leads
   */
  getTopVerifiedLeads(leads, limit = 100) {
    // Sort by verification score (highest first)
    const sortedLeads = [...leads].sort((a, b) => b.verificationScore - a.verificationScore);
    
    // Return the top N leads
    return sortedLeads.slice(0, limit);
  }
}

// Create and export a singleton instance
const leadVerificationService = new LeadVerificationService();
export default leadVerificationService;
