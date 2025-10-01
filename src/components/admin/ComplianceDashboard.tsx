import { useEffect, useMemo, useState } from "react";
import { auth } from "../../lib/firebase";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface AuditLog {
  id: string;
  actorEmail?: string;
  actorUid?: string;
  action: string;
  details: Record<string, any>;
  timestamp?: { seconds: number; nanoseconds: number } | string | null;
}

function formatTimestamp(ts: any) {
  if (!ts) return "";
  if (typeof ts === "string") return new Date(ts).toLocaleString();
  if (typeof ts === "object" && typeof ts.seconds === "number") {
    return new Date(ts.seconds * 1000).toLocaleString();
  }
  return "";
}

interface ComplianceDashboardProps {
  onBack?: () => void;
}

export function ComplianceDashboard({ onBack }: ComplianceDashboardProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [limit, setLimit] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const currentUser = useMemo(() => auth.currentUser, [auth.currentUser]);

  const fetchLogs = async (limitValue: number) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentUser) throw new Error("Not authenticated");
      const idToken = await currentUser.getIdToken();
      const base = import.meta.env.VITE_CLOUD_FUNCTIONS_BASE;
      if (!base) throw new Error("Missing VITE_CLOUD_FUNCTIONS_BASE");
      const url = new URL(`${base}/getAuditLogs`);
      url.searchParams.set("limit", String(limitValue));
      const resp = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${idToken}`,
        },
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || resp.statusText);
      }
      const data = await resp.json();
      const list = (data?.logs || []) as AuditLog[];
      setLogs(list);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(limit);
  }, []);

  useEffect(() => {
    fetchLogs(limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              Back to Dashboard
            </Button>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Compliance Dashboard</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => fetchLogs(limit)} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-4 border-red-300 bg-red-50">
          <CardContent className="p-3 text-red-700 text-sm">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="px-2 py-2">Actor Email</th>
                  <th className="px-2 py-2">Action</th>
                  <th className="px-2 py-2">Details</th>
                  <th className="px-2 py-2">Timestamp</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const snippet = JSON.stringify(log.details || {}).slice(0, 80);
                  return (
                    <tr key={log.id} className="border-t">
                      <td className="px-2 py-2 whitespace-nowrap">{log.actorEmail || "-"}</td>
                      <td className="px-2 py-2 whitespace-nowrap font-medium">{log.action}</td>
                      <td className="px-2 py-2">
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {snippet}{snippet.length >= 80 ? "…" : ""}
                        </code>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                      <td className="px-2 py-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelected(log)}>View</Button>
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td className="px-2 py-4 text-gray-500" colSpan={5}>No logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
{selected ? JSON.stringify(selected.details, null, 2) : ""}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}


