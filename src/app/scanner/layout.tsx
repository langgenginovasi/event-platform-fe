export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center text-white">
      {/* Mobile viewport constraint for desktop users to ensure mobile-first experience */}
      <div className="w-full max-w-md bg-black relative flex flex-col min-h-screen overflow-hidden shadow-2xl">
        {children}
      </div>
    </div>
  );
}
