const GIFT_AID_CANONICAL_FLOW = "declaration-first";
const GIFT_AID_DECLARATION_TEXT_VERSION = "hmrc-ch3-2026-03";
const GIFT_AID_RETENTION_YEARS = 6;

const GIFT_AID_DECLARATION_STATUS = Object.freeze({
  PENDING: "pending",
  ACTIVE: "active",
  INVALID: "invalid",
  CLAIMED: "claimed",
  REJECTED: "rejected",
});

const GIFT_AID_HMRC_CLAIM_STATUS = Object.freeze({
  PENDING: "pending",
  INCLUDED: "included",
  SUBMITTED: "submitted",
  PAID: "paid",
});

const GIFT_AID_OPERATIONAL_STATUS = Object.freeze({
  CAPTURED: "captured",
  EXPORTED: "exported",
});

module.exports = {
  GIFT_AID_CANONICAL_FLOW,
  GIFT_AID_DECLARATION_TEXT_VERSION,
  GIFT_AID_RETENTION_YEARS,
  GIFT_AID_DECLARATION_STATUS,
  GIFT_AID_HMRC_CLAIM_STATUS,
  GIFT_AID_OPERATIONAL_STATUS,
};
