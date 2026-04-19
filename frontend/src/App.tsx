import React, { useState, useEffect } from 'react';
import { CSVUploader } from './components/CSVUploader';
import { ResultTable } from './components/ResultTable';
import { ResultChart } from './components/ResultChart';

function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  // Update layout if window resizes
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/query?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error: Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
              SHIPMENT <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-slate-500 font-medium">Logistics Intelligence Dashboard</p>
          </div>
          <CSVUploader onUploadSuccess={() => setQuery("Show shipment overview")} />
        </header>

        {/* Search Bar */}
        <form onSubmit={handleQuery} className="relative">
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g., 'Carrier performance'..."
            className="w-full p-6 pr-40 rounded-3xl border-none shadow-xl text-lg outline-none focus:ring-4 focus:ring-blue-100"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-3 bottom-3 bg-slate-900 text-white px-10 rounded-2xl font-bold hover:bg-blue-600 transition-colors"
          >
            {loading ? "..." : "Analyze"}
          </button>
        </form>

        <div className="min-h-[400px]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Processing</p>
            </div>
          )}

          {!loading && result?.type === 'dashboard' && (
            <div className="space-y-8">
              
              {/* --- THE GRID FIX --- */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', 
                gap: '2rem', 
                width: '100%' 
              }}>
                
                <div style={{ minWidth: 0 }}>
                  <ResultChart result={{
                    chart_type: 'bar',
                    data: result.chart_data,
                    x: result.config.x,
                    y: result.config.y,
                    title: `Delays by ${result.config.x}`
                  }} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <ResultChart result={{
                    chart_type: 'pie',
                    data: result.chart_data,
                    x: result.config.x,
                    y: result.config.y,
                    title: "Share of Total Delays"
                  }} />
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-800">Shipment Audit</h2>
                </div>
                <div className="p-2">
                  <ResultTable data={result.table_data} title="" />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;