import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';

function App() {
  const { user, logout } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthForm, setShowAuthForm] = useState(false);

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
    <div className="min-h-screen bg-[#FDF8F3]">
      <header className="bg-[#4A2E1F] text-white py-8 px-4 text-center relative">
        <div className="absolute top-4 right-4">
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <span>Hi, {user.name}</span>
              <button
                onClick={logout}
                className="bg-[#6B4530] px-3 py-1 rounded-lg hover:bg-[#7d5238]"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthForm(true)}
              className="bg-white text-[#4A2E1F] px-4 py-1 rounded-lg text-sm font-medium hover:bg-[#f5f0e8]"
            >
              Log In / Sign Up
            </button>
          )}
        </div>
        <h1 className="text-4xl font-serif">Café Doux</h1>
        <p className="mt-2 text-[#D4B896]">Choose a branch to start your order</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {loading && <p className="text-center text-gray-500">Loading branches...</p>}

        <div className="grid gap-6 sm:grid-cols-2">
          {branches.map((branch) => (
            <div
              key={branch.id}
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

      {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} />}
    </div>
  );
}

export default App;