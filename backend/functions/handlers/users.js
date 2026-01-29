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
      
      // Get caller's user data to check permissions
      const callerDoc = await admin
          .firestore()
          .collection("users")
          .doc(auth.uid)
          .get();
      
      if (!callerDoc.exists) {
        return res.status(403).send({error: "Caller is not a valid user"});
      }

      const callerData = callerDoc.data();
      const callerPermissions = callerData?.permissions || [];

      // Check if caller has create_user permission
      if (!callerPermissions.includes("create_user") && 
          callerData?.role !== "admin" && 
          callerData?.role !== "super_admin") {
        return res.status(403).send({
          error: "You do not have permission to create users",
        });
      }

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
 * Update a user's role and permissions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateUser = (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({error: "Method not allowed"});
      }

      const auth = await verifyAuth(req);
      
      // Get caller's user data to check permissions
      const callerDoc = await admin
          .firestore()
          .collection("users")
          .doc(auth.uid)
          .get();
      
      if (!callerDoc.exists) {
        return res.status(403).send({error: "Caller is not a valid user"});
      }

      const callerData = callerDoc.data();
      const callerPermissions = callerData?.permissions || [];

      // Check if caller has edit_user permission
      if (!callerPermissions.includes("edit_user") && 
          callerData?.role !== "admin" && 
          callerData?.role !== "super_admin") {
        return res.status(403).send({
          error: "You do not have permission to edit users",
        });
      }

      const {userId, data} = req.body;
      if (!userId || !data) {
        return res.status(400).send({
          error: "The 'userId' and 'data' are required.",
        });
      }

      // Prepare update data
      const updateData = {};
      if (data.role !== undefined) updateData.role = data.role;
      if (data.permissions !== undefined) {
        updateData.permissions = data.permissions;
      }
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      // Update Firestore document
      await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .update(updateData);

      return res.status(200).send({
        success: true,
        message: `Successfully updated user with ID ${userId}.`,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.code && (error.code === 401 || error.code === 403)) {
        return res.status(error.code).send({error: error.message});
      }
      return res
          .status(500)
          .send({error: error.message || "Failed to update user."});
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
      
      // Get caller's user data to check permissions
      const callerDoc = await admin
          .firestore()
          .collection("users")
          .doc(auth.uid)
          .get();
      
      if (!callerDoc.exists) {
        return res.status(403).send({error: "Caller is not a valid user"});
      }

      const callerData = callerDoc.data();
      const callerPermissions = callerData?.permissions || [];

      // Check if caller has delete_user permission
      if (!callerPermissions.includes("delete_user") && 
          callerData?.role !== "admin" && 
          callerData?.role !== "super_admin") {
        return res.status(403).send({
          error: "You do not have permission to delete users",
        });
      }

      const {userId} = req.body;
      if (!userId) {
        return res.status(400).send({error: "The 'userId' is required."});
      }

      if (auth.uid === userId) {
        return res
            .status(403)
            .send({error: "You cannot delete your own account."});
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
  updateUser,
  deleteUser,
};
