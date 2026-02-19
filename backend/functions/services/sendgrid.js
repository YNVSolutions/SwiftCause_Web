const { onCall, HttpsError } = require("firebase-functions/v2/https");
const sgMail = require("@sendgrid/mail");
const admin = require("firebase-admin");

// Set API key once at cold start (better practice)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = onCall(async (request) => {
  try {
    const { to, templateId, templateData } = request.data;

    if (!to || !templateId || !templateData) {
      throw new HttpsError("invalid-argument", "Missing required fields.");
    }

    let dynamicTemplateData = { ...templateData };

    // Generate the verification link
    const actionCodeSettings = {
      url: `${process.env.APP_URL || 'https://your-app.web.app'}/auth/action`,
      handleCodeInApp: true,
    };

    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(to, actionCodeSettings);

    dynamicTemplateData.verifyUrl = verificationLink;
    dynamicTemplateData.email = to;
    
    // Add year if not provided
    if (!dynamicTemplateData.year) {
      dynamicTemplateData.year = new Date().getFullYear();
    }

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || "ayushbhatia456@gmail.com",
      templateId,
      dynamic_template_data: dynamicTemplateData,
    };

    await sgMail.send(msg);

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("SendGrid Error:", error?.response?.body || error.message);
    throw new HttpsError("internal", "Failed to send email");
  }
});
