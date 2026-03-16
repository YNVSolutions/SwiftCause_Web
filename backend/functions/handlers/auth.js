const admin = require("firebase-admin");
const cors = require("../middleware/cors");

const ALLOWED_EVENT_TYPES = new Set([
  "password_reset_request",
  "password_reset_confirm",
]);

const ALLOWED_STATUSES = new Set([
  "attempted",
  "submitted",
  "throttled",
  "failed",
  "completed",
  "invalid_link",
]);

const normalizeString = (value, maxLength = 500) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
};

const normalizeMetadata = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const output = {};

  Object.entries(value).forEach(([key, rawValue]) => {
    const safeKey = normalizeString(key, 100);
    if (!safeKey) return;

    if (typeof rawValue === "string") {
      output[safeKey] = rawValue.slice(0, 500);
      return;
    }

    if (
      typeof rawValue === "number" ||
      typeof rawValue === "boolean" ||
      rawValue === null
    ) {
      output[safeKey] = rawValue;
    }
  });

  return output;
};

const logAuthEvent = (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({error: "Method not allowed"});
      }

      const eventType = normalizeString(req.body?.eventType, 100);
      const status = normalizeString(req.body?.status, 50);

      if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
        return res.status(400).send({error: "Invalid eventType."});
      }

      if (!status || !ALLOWED_STATUSES.has(status)) {
        return res.status(400).send({error: "Invalid status."});
      }

      await admin.firestore().collection("authEvents").add({
        eventType,
        status,
        emailMasked: normalizeString(req.body?.emailMasked, 254),
        clientSessionId: normalizeString(req.body?.clientSessionId, 200),
        route: normalizeString(req.body?.route, 200),
        errorCode: normalizeString(req.body?.errorCode, 100),
        metadata: normalizeMetadata(req.body?.metadata),
        userAgent: normalizeString(req.get("user-agent"), 500),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).send({success: true});
    } catch (error) {
      console.error("Error logging auth event:", error);
      return res.status(500).send({error: "Failed to log auth event."});
    }
  });
};

module.exports = {
  logAuthEvent,
};
