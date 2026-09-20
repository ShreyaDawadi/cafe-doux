import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BranchList() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/branches`)
      .then((res) => res.json())
      .then((data) => {
        setBranches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-serif text-[#4A2E1F] mb-6">Choose a branch to start your order</h2>

      {loading && <p className="text-center text-gray-500">Loading branches...</p>}

      <div className="grid gap-6 sm:grid-cols-2">
        {branches.map((branch) => (
          <div
            key={branch.id}
            onClick={() => navigate(`/branch/${branch.id}`)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-[#E8DCC8]"
          >
            <h2 className="text-xl font-semibold text-[#4A2E1F]">{branch.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{branch.address}, {branch.city}</p>
            <p className="text-sm text-gray-500">{branch.phone}</p>
            <div className="flex gap-2 mt-3">
              {branch.delivery_available && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Delivery Available
                </span>
              )}
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Pickup Available
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default BranchList;
