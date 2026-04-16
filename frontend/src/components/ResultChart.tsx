import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, Legend 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export const ResultChart = ({ result }: { result: any }) => {
  const { chart_type, data, x, y, title } = result;

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
        <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest">
          {chart_type}
        </span>
      </div>

      {/* FIX: Added a min-height and a unique KEY.
          The key={data.length} trick forces Recharts to calculate 
          dimensions again when data is loaded.
      */}
      <div className="w-full" style={{ height: '400px', minHeight: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart_type === 'pie' ? (
            <PieChart key={`pie-${data.length}`}>
              <Pie
                data={data}
                dataKey={y}      // Matches "delay_minutes"
                nameKey={x}      // Matches "carrier"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                label={{ fill: '#64748b', fontSize: 12 }}
              >
                {data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          ) : (
            <BarChart key={`bar-${data.length}`} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey={x} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey={y} 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]} 
                barSize={45} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};