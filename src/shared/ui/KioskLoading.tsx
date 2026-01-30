interface KioskLoadingProps {
  message?: string;
  submessage?: string;
}

export function KioskLoading({
  message = 'Loading...',
  submessage,
}: KioskLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50/70 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
        <p className="text-[#0A0A0A] text-base sm:text-lg font-medium">{message}</p>
        {submessage ? (
          <p className="text-gray-500 text-sm">{submessage}</p>
        ) : null}
      </div>
    </div>
  );
}

