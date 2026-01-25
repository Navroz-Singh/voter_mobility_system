/**
 * Consistent Zones/Constituencies List
 * This ensures all zones are consistent across the application
 * and maintains backward compatibility with existing data
 */

// Standard zone format: "Zone X - Location Name"
export const ZONES = [
  "Zone A - North Delhi",
  "Zone B - South Delhi",
  "Zone C - East Delhi",
  "Zone D - West Delhi",
  "Zone E - Central Delhi",
];

// Legacy zone formats (for backward compatibility)
export const LEGACY_ZONES = [
  "ZONE A - NORTH DELHI",
  "ZONE B - SOUTH DELHI",
  "ZONE C - EAST DELHI",
  "ZONE D - WEST DELHI",
  "ZONE E - CENTRAL DELHI",
];

/**
 * Normalizes zone name to standard format
 * Handles both legacy and new formats
 */
export function normalizeZone(zone) {
  if (!zone || typeof zone !== "string") return null;
  
  const trimmed = zone.trim();
  
  // Check if it's already in standard format
  if (ZONES.includes(trimmed)) {
    return trimmed;
  }
  
  // Check if it's in legacy format and convert
  const upperTrimmed = trimmed.toUpperCase();
  const legacyIndex = LEGACY_ZONES.findIndex(
    (legacy) => legacy.toUpperCase() === upperTrimmed
  );
  
  if (legacyIndex !== -1) {
    return ZONES[legacyIndex];
  }
  
  // Try to match by pattern (Zone X - Location)
  const pattern = /^(ZONE|Zone)\s+([A-E])\s*-\s*(.+)$/i;
  const match = trimmed.match(pattern);
  
  if (match) {
    const zoneLetter = match[2].toUpperCase();
    const location = match[3]
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    
    return `Zone ${zoneLetter} - ${location}`;
  }
  
  // Return as-is if no match (preserve existing data)
  return trimmed;
}

/**
 * Validates if a zone is valid
 */
export function isValidZone(zone) {
  if (!zone || typeof zone !== "string") return false;
  const normalized = normalizeZone(zone);
  return ZONES.includes(normalized) || LEGACY_ZONES.includes(zone.toUpperCase());
}

