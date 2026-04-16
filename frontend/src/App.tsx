import React, { useState } from 'react';
import { CSVUploader } from './components/CSVUploader';
import { ResultTable } from './components/ResultTable';
import { ResultChart } from './components/ResultChart';

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL;  

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/query?q=${encodeURIComponent(query)}`);      
      // const res = await fetch(`http://127.0.0.1:8000/query?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Make sure backend is running and CSV uploaded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">

        {/* Main Card */}
        <div className="bg-white rounded-[28px] shadow-2xl px-8 md:px-14 py-10">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
              Shipment Insights Dashboard
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Upload shipment data and analyze logistics insights instantly
            </p>
          </div>

          {/* Upload + Query Row */}
          <div className="space-y-6">

            {/* Upload */}
            <div className="flex justify-center">
              <div className="w-full md:w-[340px]">
                <CSVUploader onUploadSuccess={() => setQuery("")} />
              </div>
            </div>

            {/* Query Form */}
            <form onSubmit={handleQuery} className="flex flex-col md:flex-row gap-4 items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Which routes had the most delays last month?"
                className="w-full flex-1 px-6 py-5 text-lg rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="px-10 py-5 rounded-2xl bg-sky-400 hover:bg-sky-500 text-white text-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-slate-300"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="mt-10 rounded-3xl bg-slate-50 border border-slate-100 p-6 min-h-[350px] max-h-[60vh] overflow-auto">
            {loading && (
              <div className="flex justify-center items-center h-52 text-slate-400 text-lg animate-pulse">
                Creating shipment insights...
              </div>
            )}

            {!loading && result && (
              <>
                {result.type === 'chart' && <ResultChart result={result} />}
                {result.type === 'table' && (
                  <ResultTable data={result.data} title={result.title} />
                )}
              </>
            )}

            {!loading && !result && (
              <div className="flex justify-center items-center h-52 text-slate-400 text-lg">
                Results will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;