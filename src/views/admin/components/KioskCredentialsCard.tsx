import React, { useCallback, useState } from "react";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { useToast } from "../../../shared/ui/ToastProvider";
import { cn } from "../../../shared/ui/utils";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

interface KioskCredentialsCardProps {
  kioskId: string;
  accessCode?: string;
  className?: string;
}

export function KioskCredentialsCard({
  kioskId,
  accessCode,
  className,
}: KioskCredentialsCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  const handleCopyId = useCallback(async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(kioskId);
      setCopied(true);
      showToast("Kiosk ID copied", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy kiosk ID", error);
      setCopied(false);
      showToast("Unable to copy kiosk ID. Please try again.", "error");
    }
  }, [kioskId, showToast]);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2",
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Kiosk ID
        </p>
        <p className="font-mono text-sm text-gray-900 break-all">{kioskId}</p>
        <p className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Access Code
        </p>
        <Badge className="border-indigo-100 bg-indigo-50 text-indigo-700">
          {accessCode
            ? showAccessCode
              ? accessCode
              : "******"
            : "Not set"}
        </Badge>
      </div>
      <div className="flex w-40 flex-col gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopyId}
          className={cn(
            "w-full shrink-0 border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50",
            copied && "border-green-200 bg-green-50 text-green-700"
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy ID"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setShowAccessCode((prev) => !prev)}
          disabled={!accessCode}
          className="w-full shrink-0 border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showAccessCode ? "Hide Access Code" : "Show Access Code"}
        </Button>
      </div>
    </div>
  );
}
