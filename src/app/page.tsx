'use client';

import dynamic from 'next/dynamic';

const AppClientWrapper = dynamic(() => import('@/components/AppClientWrapper'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold animate-pulse shadow-lg shadow-indigo-500/20">
          ⚡
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Loading Daily Activities PWA...
        </div>
        <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-indigo-500 rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return <AppClientWrapper />;
}
