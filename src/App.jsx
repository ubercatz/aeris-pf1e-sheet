import React from 'react';

export default function App({ actor }) {
  return (
    <div className="p-4 bg-slate-900 text-slate-100 min-h-full">
      <h1 className="text-2xl font-bold text-amber-500">
        React Sheet Connected: {actor.name}
      </h1>
      <p className="mt-2 text-slate-300">
        If you are seeing this, Aeris Core successfully mounted the React interface.
      </p>
    </div>
  );
}