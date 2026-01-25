/**
 * Frontend Validation Utilities
 * Provides type checking and validation for login credentials
 */

/**
 * Validates EPIC Number format
 * EPIC format: 5 letters followed by 7 digits (e.g., VLINK1234567)
 */
export function validateEPIC(epic) {
  if (!epic || typeof epic !== "string") {
    return {
      isValid: false,
      error: "EPIC number is required",
    };
  }

  const trimmed = epic.trim().toUpperCase();
  
  // Remove spaces and hyphens
  const cleaned = trimmed.replace(/[\s-]/g, "");

  // Check length (should be 10 characters: 3 letters + 7 digits)
  if (cleaned.length !== 12) {
    return {
      isValid: false,
      error: "EPIC number must be exactly 12 characters (e.g., VLINK1234567)",
    };
  }

  // Check format: 3 letters followed by 7 digits
  const epicPattern = /^[A-Z]{5}[0-9]{7}$/;
  if (!epicPattern.test(cleaned)) {
    return {
      isValid: false,
      error: "EPIC number must be 5 letters followed by 7 digits (e.g., VLINK1234567)",
    };
  }

  return {
    isValid: true,
    normalized: cleaned,
    error: null,
  };
}

/**
 * Validates Government ID format
 * Gov ID format: Can be alphanumeric, may include hyphens (e.g., GOV-XXXX-XXXX or GOV123456)
 */
export function validateGovID(govId) {
  if (!govId || typeof govId !== "string") {
    return {
      isValid: false,
      error: "Government ID is required",
    };
  }

  const trimmed = govId.trim().toUpperCase();
  
  // Remove spaces but keep hyphens
  const cleaned = trimmed.replace(/\s/g, "");

  // Check minimum length
  if (cleaned.length < 6) {
    return {
      isValid: false,
      error: "Government ID must be at least 6 characters",
    };
  }

  // Check maximum length
  if (cleaned.length > 20) {
    return {
      isValid: false,
      error: "Government ID must not exceed 20 characters",
    };
  }

  // Allow alphanumeric and hyphens
  const govIdPattern = /^[A-Z0-9-]+$/;
  if (!govIdPattern.test(cleaned)) {
    return {
      isValid: false,
      error: "Government ID can only contain letters, numbers, and hyphens",
    };
  }

  return {
    isValid: true,
    normalized: cleaned,
    error: null,
  };
}

/**
 * Validates password strength
 */
export function validatePassword(password, isClaim = false) {
  if (!password || typeof password !== "string") {
    return {
      isValid: false,
      error: "Password is required",
    };
  }

  const trimmed = password.trim();

  // Minimum length check
  if (trimmed.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  // Maximum length check
  if (trimmed.length > 128) {
    return {
      isValid: false,
      error: "Password must not exceed 128 characters",
    };
  }

  // For new password (claim), check strength requirements
  if (isClaim) {
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(trimmed)) {
      return {
        isValid: false,
        error: "Password must contain at least one uppercase letter",
      };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(trimmed)) {
      return {
        isValid: false,
        error: "Password must contain at least one lowercase letter",
      };
    }

    // Check for at least one number
    if (!/[0-9]/.test(trimmed)) {
      return {
        isValid: false,
        error: "Password must contain at least one number",
      };
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed)) {
      return {
        isValid: false,
        error: "Password must contain at least one special character",
      };
    }
  }

  return {
    isValid: true,
    normalized: trimmed,
    error: null,
  };
}

/**
 * Validates all login credentials before submission
 */
export function validateLoginCredentials(identifier, password, type = "voter") {
  const errors = {};

  // Validate identifier based on type
  if (type === "voter") {
    const epicValidation = validateEPIC(identifier);
    if (!epicValidation.isValid) {
      errors.identifier = epicValidation.error;
    }
  } else if (type === "admin" || type === "officer") {
    const govIdValidation = validateGovID(identifier);
    if (!govIdValidation.isValid) {
      errors.identifier = govIdValidation.error;
    }
  }

  // Validate password
  const passwordValidation = validatePassword(password, false);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates claim/register credentials
 */
export function validateClaimCredentials(epic, password) {
  const errors = {};

  // Validate EPIC
  const epicValidation = validateEPIC(epic);
  if (!epicValidation.isValid) {
    errors.identifier = epicValidation.error;
  }

  // Validate password with strength requirements
  const passwordValidation = validatePassword(password, true);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Type casting utilities
 */
export function castToEPIC(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function castToGovID(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toUpperCase().replace(/\s/g, "");
}

export function sanitizePassword(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim();
}

/**
 * Validates Aadhaar Number format
 * Aadhaar format: 12 digits (e.g., 1234 5678 9012)
 */
export function validateAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== "string") {
    return {
      isValid: false,
      error: "Aadhaar number is required",
    };
  }

  // Remove spaces and hyphens
  const cleaned = aadhaar.trim().replace(/[\s-]/g, "");

  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      error: "Aadhaar number must contain only digits",
    };
  }

  // Check length (should be 12 digits)
  if (cleaned.length !== 12) {
    return {
      isValid: false,
      error: "Aadhaar number must be exactly 12 digits",
    };
  }

  return {
    isValid: true,
    normalized: cleaned,
    error: null,
  };
}

/**
 * Validates Name (First/Last Name)
 */
export function validateName(name, fieldName = "Name") {
  if (!name || typeof name !== "string") {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  const trimmed = name.trim();

  // Check minimum length
  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 2 characters long`,
    };
  }

  // Check maximum length
  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed 50 characters`,
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (!namePattern.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    };
  }

  return {
    isValid: true,
    normalized: trimmed,
    error: null,
  };
}

/**
 * Type casting for Aadhaar
 */
export function castToAadhaar(value) {
  if (!value || typeof value !== "string") return "";
  // Remove all non-digits
  return value.replace(/\D/g, "").slice(0, 12);
}

/**
 * Type casting for Name
 */
export function castToName(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim();
}

