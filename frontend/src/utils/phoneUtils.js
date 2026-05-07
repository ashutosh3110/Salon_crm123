/**
 * Masks a phone number based on the user's role.
 * Admins see the full number, others see a masked version.
 * @param {string} phone - The phone number to mask.
 * @param {string} role - The user's role.
 * @returns {string} The masked or full phone number.
 */
export const maskPhone = (phone, role) => {
    if (!phone) return '';
    if (role === 'admin') return phone;

    // Default masking logic (handles different lengths)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;

    const lastFour = cleaned.slice(-4);
    const maskedPart = '*'.repeat(cleaned.length - 4);
    return `${maskedPart}${lastFour}`;
};

/**
 * Checks if a search term matches a phone number (stripped of formatting).
 */
export const matchPhone = (phone, searchTerm) => {
    if (!phone || !searchTerm) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanSearch = searchTerm.replace(/\D/g, '');
    return cleanPhone.includes(cleanSearch);
};
