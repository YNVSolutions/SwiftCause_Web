const {defineSecret} = require("firebase-functions/params");
const https = require("https");

// Define reCAPTCHA secret
const recaptchaSecretKey = defineSecret("RECAPTCHA_SECRET_KEY");

/**
 * Verify reCAPTCHA token with Google
 * Must be called within a function that has recaptchaSecretKey bound
 * @param {string} token - The reCAPTCHA token from the client
 * @return {Promise<boolean>} - Returns true if verification succeeds
 */
async function verifyRecaptcha(token) {
  if (!token) {
    throw new Error("reCAPTCHA token is required");
  }

  // Get secret key from Secret Manager
  const secretKey = recaptchaSecretKey.value();

  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    throw new Error("reCAPTCHA verification not configured");
  }

  return new Promise((resolve, reject) => {
    const postData = `secret=${secretKey}&response=${token}`;

    const options = {
      hostname: "www.google.com",
      path: "/recaptcha/api/siteverify",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          const {success, score, "error-codes": errorCodes} = response;

          if (!success) {
            console.error("reCAPTCHA verification failed:", errorCodes);
            resolve(false);
            return;
          }

          // For v2, there's no score, just success/failure
          // For v3, you might want to check the score
          if (score !== undefined && score < 0.5) {
            console.warn("reCAPTCHA score too low:", score);
            resolve(false);
            return;
          }

          resolve(true);
        } catch (error) {
          console.error("Error parsing reCAPTCHA response:", error);
          reject(new Error("Failed to parse reCAPTCHA response"));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Error verifying reCAPTCHA:", error);
      reject(new Error("Failed to verify reCAPTCHA"));
    });

    req.write(postData);
    req.end();
  });
}

module.exports = {
  verifyRecaptcha,
  recaptchaSecretKey,
};
