// lib/otpCache.js
const otpStore = new Map();

export function storeOTP(email, otp) {
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email.toLowerCase(), { otp, expiry }); // Store email in lowercase
  
  console.log(`[OTP Store] Stored OTP for ${email}: ${otp}, expires at ${new Date(expiry)}`);
  
  // Auto cleanup after expiry
  setTimeout(() => {
    otpStore.delete(email.toLowerCase());
    console.log(`[OTP Store] Cleaned up OTP for ${email}`);
  }, 10 * 60 * 1000);
}

export function verifyOTP(email, otp) {
  const normalizedEmail = email.toLowerCase();
  const stored = otpStore.get(normalizedEmail);
  
  console.log(`[OTP Verify] Checking OTP for ${email}`);
  console.log(`[OTP Verify] Stored data:`, stored);
  console.log(`[OTP Verify] Provided OTP: ${otp}`);
  
  if (!stored) {
    console.log(`[OTP Verify] No OTP found for ${email}`);
    return { valid: false, error: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiry) {
    otpStore.delete(normalizedEmail);
    console.log(`[OTP Verify] OTP expired for ${email}`);
    return { valid: false, error: 'OTP has expired' };
  }
  
  if (stored.otp !== otp) {
    console.log(`[OTP Verify] OTP mismatch. Expected: ${stored.otp}, Got: ${otp}`);
    return { valid: false, error: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it
  otpStore.delete(normalizedEmail);
  console.log(`[OTP Verify] OTP verified successfully for ${email}`);
  return { valid: true };
}

export function clearOTP(email) {
  otpStore.delete(email.toLowerCase());
}

// Debug function to see all stored OTPs
export function debugOTPStore() {
  console.log('[OTP Store] Current entries:', Array.from(otpStore.entries()));
  return Array.from(otpStore.entries());
}
