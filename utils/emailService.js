//utils/emailService.js
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generate 6-digit OTP (random)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate time-based OTP (deterministic within 10-minute window)
export const generateTimedOTP = (email) => {
  // Get current 10-minute window timestamp
  const timeWindow = Math.floor(Date.now() / (10 * 60 * 1000));
  const secret = process.env.JWT_SECRET || 'vaaniai-secret-fallback';
  
  // Create hash using email + time window + secret
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${email.toLowerCase()}-${timeWindow}`)
    .digest('hex');
  
  // Convert first 6 hex chars to number and ensure 6 digits
  const otp = parseInt(hash.substring(0, 6), 16) % 1000000;
  return otp.toString().padStart(6, '0');
};

// Verify time-based OTP
export const verifyTimedOTP = (email, otp) => {
  const expectedOTP = generateTimedOTP(email);
  return expectedOTP === otp.trim();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, username = 'User') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VaaniAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your VaaniAI Signup OTP',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                padding: 40px;
                text-align: center;
              }
              .content {
                background: white;
                border-radius: 8px;
                padding: 30px;
                margin-top: 20px;
              }
              .otp {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #667eea;
                background: #f3f4f6;
                padding: 15px 30px;
                border-radius: 8px;
                display: inline-block;
                margin: 20px 0;
              }
              .warning {
                color: #ef4444;
                font-size: 14px;
                margin-top: 20px;
              }
              h1 {
                color: white;
                margin: 0;
              }
              p {
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🤖 VaaniAI</h1>
              <div class="content">
                <h2>Hello ${username}!</h2>
                <p>Your One-Time Password (OTP) for signup is:</p>
                <div class="otp">${otp}</div>
                <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                <p class="warning">⚠️ Do not share this OTP with anyone!</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  If you didn't request this OTP, please ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Hello ${username}!\n\nYour VaaniAI signup OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nDo not share this OTP with anyone!\n\nIf you didn't request this OTP, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VaaniAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to VaaniAI! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                padding: 40px;
                text-align: center;
              }
              .content {
                background: white;
                border-radius: 8px;
                padding: 30px;
                margin-top: 20px;
              }
              h1 { color: white; margin: 0; }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🤖 VaaniAI</h1>
              <div class="content">
                <h2>Welcome ${username}!</h2>
                <p>Thank you for joining VaaniAI. We're excited to have you on board!</p>
                <p>Start chatting with our AI assistant and experience intelligent conversations.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                  Start Chatting
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};
