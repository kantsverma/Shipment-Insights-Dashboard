import React from 'react';

export const ResultTable = ({ data, title }: { data: any[], title: string }) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="table-wrapper">
      <div className="table-card">

        <div className="table-title">
          <h3>{title}</h3>
        </div>

        <div className="table-container">
          <table className="result-table">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((h) => (
                  <th key={h}>
                    {h.replace('_', ' ').toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  {headers.map((h) => (
                    <td key={h}>{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};