const admin = require("firebase-admin");
const cors = require("../middleware/cors");
const {verifyRecaptcha} = require("../utils/recaptcha");

/**
 * Handle user signup with reCAPTCHA verification
 * This is called from the frontend before Firebase Auth signup
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const verifySignupRecaptcha = (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({error: "Method not allowed"});
      }

      const {recaptchaToken, email} = req.body;

      if (!recaptchaToken) {
        return res.status(400).send({
          error: "reCAPTCHA verification required",
        });
      }

      if (!email) {
        return res.status(400).send({
          error: "Email is required",
        });
      }

      // Verify reCAPTCHA
      const isValid = await verifyRecaptcha(recaptchaToken);

      if (!isValid) {
        return res.status(400).send({
          error: "reCAPTCHA verification failed. Please try again.",
        });
      }

      // Check if email already exists
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        if (userRecord) {
          return res.status(400).send({
            error: "Email already registered",
          });
        }
      } catch (error) {
        // User doesn't exist, which is what we want for signup
        if (error.code !== "auth/user-not-found") {
          throw error;
        }
      }

      // reCAPTCHA verified and email available
      return res.status(200).send({
        success: true,
        message: "Verification successful",
      });
    } catch (error) {
      console.error("Error in signup verification:", error);
      return res.status(500).send({
        error: error.message || "Verification failed",
      });
    }
  });
};

module.exports = {
  verifySignupRecaptcha,
};
