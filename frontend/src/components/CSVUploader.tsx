import React, { useState } from 'react';

export const CSVUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;  

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("File processed successfully!");
        onUploadSuccess();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.detail}`);
      }
    } catch (err) {
      alert("Error connecting to backend");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white text-center">      
      <label className="cursor-pointer">
        <span className="text-blue-600 font-semibold">{uploading ? 'Processing...' : 'UPLOAD CSV'}</span>
        <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={uploading} />
      </label>
    </div>
  );
};