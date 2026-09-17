export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} CampusIQ. All rights reserved.</p>
        <p>Helping students find their path, one career at a time.</p>
      </div>
    </footer>
  );
}
