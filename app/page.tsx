import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-6 bg-gray-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="2" rx="1" fill="#888" />
          <rect x="3" y="11" width="18" height="2" rx="1" fill="#888" />
          <rect x="3" y="17" width="12" height="2" rx="1" fill="#888" />
          <circle cx="20" cy="18" r="3" fill="#22c55e" />
          <path
            d="M18.5 18l1 1 2-2"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-medium mb-3">TodoMaster</h1>
      <p className="text-gray-500 text-base mb-10 leading-relaxed">
        A simple way to stay on top of your tasks.
        <br />
        Sign in to get started.
      </p>

      <div className="flex gap-2 justify-center mb-12">
        <Link
          href="/sign-up"
          className="px-6 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800">
          Get started
        </Link>
        <Link
          href="/sign-in"
          className="px-6 py-2 text-sm rounded-lg border hover:bg-gray-50">
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2 text-sm rounded-lg border hover:bg-gray-50">
          Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 text-left">
        {[
          { title: "Organize", desc: "Keep all your tasks in one place" },
          { title: "Search", desc: "Find any todo instantly" },
          { title: "Pro plan", desc: "Unlock unlimited todos" },
        ].map((f) => (
          <div key={f.title} className="p-4 border rounded-xl">
            <p className="text-sm font-medium mb-1">{f.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}