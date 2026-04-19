import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid, Legend 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export const ResultChart = ({ result }: { result: any }) => {
  const { chart_type, data, x, y, title } = result;

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-lg border border-slate-100 flex flex-col overflow-hidden w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <span className="text-[10px] font-bold px-3 py-1 bg-slate-50 text-slate-400 rounded-full uppercase">
          {chart_type}
        </span>
      </div>

      {/* ResponsiveContainer needs a parent with an explicit height 
         and minWidth: 0 to prevent it from forcing the parent to grow.
      */}
      <div style={{ width: '100%', height: '350px', position: 'relative', minWidth: 0 }}>
        <ResponsiveContainer width="99%" height="100%">
          {chart_type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                dataKey={y}
                nameKey={x}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                label={{ fill: '#64748b', fontSize: 10 }}
              >
                {data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey={x} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey={y} 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]} 
                barSize={32} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};