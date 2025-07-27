import { useEffect, useState } from 'react';

const API_BASE = 'http://127.0.0.1:5000/api';

const MemorialCard = () => {
  const [type, setType] = useState<'christian' | 'muslim'>('christian');
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/${type}-template`)
      .then(res => res.json())
      .then(data => {
        setTemplate(data);
        setLoading(false);
      });
  }, [type]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-beige-50 to-white flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
        {/* Dropdown for template selection */}
        <div className="mb-2 w-full flex justify-end">
          <select
            className="border rounded px-3 py-1 text-gray-700 bg-white shadow"
            value={type}
            onChange={e => setType(e.target.value as 'christian' | 'muslim')}
          >
            <option value="christian">Christian</option>
            <option value="muslim">Muslim</option>
          </select>
        </div>
        <div className="flex items-center gap-12">
          {/* Memorial Card */}
          <div className={`relative bg-gradient-to-b from-green-50 via-white to-green-100 border-green-100 p-8 rounded-lg shadow-2xl border w-80`}>
            {loading && <div className="text-center">Loading...</div>}
            {template && (
              <>
                {/* Card Header */}
                <div className="text-center mb-6">
                  {template.arabic && <div className="text-xl text-green-900 font-arabic mb-1">{template.arabic}</div>}
                  <div className="text-4xl font-serif text-green-900 tracking-wider font-bold">{template.title}</div>
                </div>
                {/* Image */}
                {template.image && (
                  <img src={`http://127.0.0.1:5000${template.image}`} alt="Memorial" className="mb-6 mx-auto w-64 h-40 object-cover" />
                )}
                {/* Memorial Text */}
                <div className="text-center mb-6 text-green-900">
                  <h2 className="text-lg font-serif mb-2 font-semibold">{template.subtitle}</h2>
                  <h2 className="text-2xl font-serif mb-4 font-semibold">{template.name}</h2>
                </div>
                {/* Scan Instructions and QR Code */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-left">
                    <p className="text-xs leading-relaxed">{template.instruction}</p>
                  </div>
                  <div className="flex justify-center">
                    <img src={`http://127.0.0.1:5000${template.qr}`} alt="QR Code" className="w-16 h-16" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorialCard;