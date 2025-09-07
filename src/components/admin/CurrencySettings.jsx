import React, { useState, useEffect } from "react";
import { getPaymentConfig, updatePaymentConfig } from "../../api/settingsService";
import { Button } from "../ui/button";

const CURRENCIES = [
  { code: "usd", label: "US Dollar (USD)" },
  { code: "eur", label: "Euro (EUR)" },
  { code: "inr", label: "Indian Rupee (INR)" },
  { code: "gbp", label: "British Pound (GBP)" },
];

export default function CurrencySettings() {
  const [currency, setCurrency] = useState("usd");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    getPaymentConfig()
      .then((config) => setCurrency(config.defaultCurrency || "usd"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updatePaymentConfig({ defaultCurrency: currency });
      setMessage("Currency updated successfully!");
    } catch (err) {
      setMessage("Failed to update currency.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <label htmlFor="currency" className="block font-medium">
        Global Payment Currency
      </label>
      <select
        id="currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        disabled={loading || saving}
        className="border rounded px-3 py-2"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={saving || loading}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </form>
  );
}