import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { CartProvider } from './CartContext';
import AuthForm from './AuthForm';
import BranchList from './pages/BranchList';
import BranchMenu from './pages/BranchMenu';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, logout } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#FDF8F3]">
          <header className="bg-[#4A2E1F] text-white py-8 px-4 text-center relative">
            <div className="absolute top-4 right-4">
              {user ? (
                <div className="flex items-center gap-3 text-sm">
                  {user.role === 'branch_admin' ? (
                    <Link to="/admin" className="hover:underline">Dashboard</Link>
                  ) : (
                    <Link to="/orders" className="hover:underline">My Orders</Link>
                  )}
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
            <Link to="/">
              <h1 className="text-4xl font-serif">Café Doux</h1>
            </Link>
            <p className="mt-2 text-[#D4B896]">Coffee, pastries, and a little sweetness</p>
          </header>

          <Routes>
            <Route path="/" element={<BranchList />} />
            <Route path="/branch/:branchId" element={<BranchMenu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>

          {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} />}
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;