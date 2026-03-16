export function Header() {
  return (
    <div className="flex items-center gap-2">
      <svg className="h-5 w-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
      </svg>
      <h1 className="text-sm font-bold text-gray-800 md:text-base">Carte Parcoursup</h1>
    </div>
  );
}
