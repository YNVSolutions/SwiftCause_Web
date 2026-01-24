const admin = require("firebase-admin");
const {verifyAuth, ensureAdmin} = require("../middleware/auth");
const cors = require("../middleware/cors");

/**
 * Create a new user with role and permissions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createUser = (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({error: "Method not allowed"});
      }

      const auth = await verifyAuth(req);
      await ensureAdmin(auth);

      const {email, password, username, role, permissions, organizationId} =
        req.body;

      if (!email || !password || !username || !role || !organizationId) {
        return res
            .status(400)
            .send({error: "Missing required fields for user creation."});
      }

      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: username,
        emailVerified: true,
      });

      const userDocData = {
        username,
        email,
        role,
        permissions: permissions || [],
        organizationId,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin
          .firestore()
          .collection("users")
          .doc(userRecord.uid)
          .set(userDocData);

      return res.status(200).send({
        success: true,
        message: `Successfully created user ${username}.`,
        uid: userRecord.uid,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code && (error.code === 401 || error.code === 403)) {
        return res.status(error.code).send({error: error.message});
      }
      return res
          .status(500)
          .send({error: error.message || "An unknown error occurred."});
    }
  });
};

/**
 * Delete a user by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const deleteUser = (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({error: "Method not allowed"});
      }

      const auth = await verifyAuth(req);
      await ensureAdmin(auth);

      const {userId} = req.body;
      if (!userId) {
        return res.status(400).send({error: "The 'userId' is required."});
      }

      if (auth.uid === userId) {
        return res
            .status(403)
            .send({error: "Admins cannot delete their own account."});
      }

      await admin.auth().deleteUser(userId);
      await admin.firestore().collection("users").doc(userId).delete();

      return res.status(200).send({
        success: true,
        message: `Successfully deleted user with ID ${userId}.`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.code && (error.code === 401 || error.code === 403)) {
        return res.status(error.code).send({error: error.message});
      }
      return res
          .status(500)
          .send({error: error.message || "Failed to delete user."});
    }
  });
};

module.exports = {
  createUser,
  deleteUser,
};
