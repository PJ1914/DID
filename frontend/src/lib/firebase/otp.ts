import { createOTPCode, getOTPByEmail, verifyOTP as verifyOTPInDB } from "./firestore"
import { Timestamp } from "firebase/firestore"

/**
 * Generate a random 6-digit OTP code
 * @returns 6-digit OTP string
 */
export const generateOTPCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP to user's email
 * @param email - User email
 * @param code - OTP code
 * @returns Promise
 */
export const sendOTPEmail = async (email: string, code: string): Promise<void> => {
  // TODO: Integrate with email service (Firebase Functions + SendGrid/Resend)
  console.log(`📧 OTP Email to ${email}: ${code}`)

  /*
   * For production, create a Firebase Cloud Function:
   * 
   * import * as functions from "firebase-functions"
   * import * as sgMail from "@sendgrid/mail"
   * 
   * sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
   * 
   * export const sendOTPEmail = functions.https.onCall(async (data) => {
   *   const { email, code } = data
   *   const msg = {
   *     to: email,
   *     from: "noreply@bc-cvs.com",
   *     subject: "Your BC-CVS Verification Code",
   *     html: `<h2>Your verification code is: ${code}</h2>
   *            <p>This code expires in 10 minutes.</p>`,
   *   }
   *   await sgMail.send(msg)
   *   return { success: true }
   * })
   */

  // For development: Log to console
  if (process.env.NODE_ENV === "development") {
    console.log("=".repeat(50))
    console.log(`OTP CODE FOR ${email}`)
    console.log(`CODE: ${code}`)
    console.log(`Valid for: 10 minutes`)
    console.log("=".repeat(50))
  }
}

/**
 * Generate and store OTP for a user
 * @param userId - User ID
 * @param email - User email
 * @returns OTP code
 */
export const generateAndStoreOTP = async (userId: string, email: string): Promise<string> => {
  const code = generateOTPCode()
  const expiresAt = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) // 10 minutes

  await createOTPCode({
    userId,
    email,
    code,
    expiresAt,
    verified: false,
  })

  await sendOTPEmail(email, code)

  return code
}

/**
 * Verify OTP code
 * @param email - User email
 * @param code - OTP code to verify
 * @returns True if valid, false otherwise
 */
export const verifyOTPCode = async (email: string, code: string): Promise<boolean> => {
  console.log("🔍 Verifying OTP:", { email, code })
  
  const otpRecord = await getOTPByEmail(email)

  if (!otpRecord) {
    console.log("❌ No OTP record found for email:", email)
    return false
  }

  console.log("📝 OTP Record found:", {
    storedCode: otpRecord.code,
    inputCode: code,
    expiresAt: otpRecord.expiresAt.toDate(),
    verified: otpRecord.verified
  })

  // Check if expired
  const now = Timestamp.now()
  if (otpRecord.expiresAt.toMillis() < now.toMillis()) {
    console.log("⏰ OTP expired")
    return false
  }

  // Check if code matches (trim whitespace and compare)
  const storedCode = otpRecord.code.trim()
  const inputCode = code.trim()
  
  if (storedCode !== inputCode) {
    console.log("❌ Code mismatch:", { storedCode, inputCode })
    return false
  }

  console.log("✅ OTP verified successfully")
  
  // Mark as verified
  await verifyOTPInDB(otpRecord.id)

  return true
}

/**
 * Email templates
 */
export const emailTemplates = {
  otp: (code: string) => ({
    subject: "Your BC-CVS Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; border-radius: 10px; padding: 40px; max-width: 600px; margin: 0 auto; }
            .code { font-size: 32px; font-weight: bold; color: #6366f1; text-align: center; padding: 20px; background-color: #f0f0ff; border-radius: 8px; letter-spacing: 5px; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #333;">BC-CVS Verification Code</h2>
            <p>Your verification code is:</p>
            <div class="code">${code}</div>
            <p style="margin-top: 20px; color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>BC-CVS - Blockchain Certificate Verification System</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  welcome: (name: string) => ({
    subject: "Welcome to BC-CVS",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; border-radius: 10px; padding: 40px; max-width: 600px; margin: 0 auto; }
            .button { display: inline-block; padding: 12px 30px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #333;">Welcome to BC-CVS, ${name}!</h2>
            <p>Your account has been successfully created.</p>
            <p>You can now issue, verify, and manage blockchain certificates securely.</p>
            <a href="https://your-domain.com/bc-cvs" class="button">Get Started</a>
          </div>
        </body>
      </html>
    `,
  }),

  certificateIssued: (studentName: string, certificateName: string) => ({
    subject: "New Certificate Issued",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; border-radius: 10px; padding: 40px; max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #333;">🎓 New Certificate Issued</h2>
            <p>Hi ${studentName},</p>
            <p>A new certificate has been issued for: <strong>${certificateName}</strong></p>
            <p>You can view and download it from your BC-CVS dashboard.</p>
            <a href="https://your-domain.com/bc-cvs/student/my-certificates" style="display: inline-block; padding: 12px 30px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Certificate</a>
          </div>
        </body>
      </html>
    `,
  }),
}
