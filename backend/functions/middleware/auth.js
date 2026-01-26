const admin = require("firebase-admin");

/**
 * Verify Firebase ID token from Authorization header
 * @param {object} req - Express request object
 * @return {Promise<object>} Decoded token
 */
const verifyAuth = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.code = 401;
    throw error;
  }
};

/**
 * Ensure the authenticated user has admin permissions
 * @param {object} auth - Decoded authentication token
 * @return {Promise<void>} Promise that resolves if authorized
 */
const ensureAdmin = async (auth) => {
  const callerDoc = await admin
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .get();
  if (!callerDoc.exists) {
    const error = new Error("Caller is not a valid user");
    error.code = 403;
    throw error;
  }
  const userData = callerDoc.data();
  const userRole = userData?.role;
  const permissions = userData?.permissions || [];

  const isAuthorized =
    userRole === "admin" ||
    userRole === "super_admin" ||
    permissions.includes("create_user") ||
    permissions.includes("delete_user");

  if (!isAuthorized) {
    const error = new Error(
        "You do not have permission to perform this action",
    );
    error.code = 403;
    throw error;
  }
};

module.exports = {
  verifyAuth,
  ensureAdmin,
};
