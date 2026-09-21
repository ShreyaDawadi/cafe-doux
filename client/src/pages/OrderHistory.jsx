import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function OrderHistory() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    preparing: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  if (loading) return <p className="text-center text-gray-500 py-10">Loading your orders...</p>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-serif text-[#4A2E1F] mb-6">Your Orders</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-[#E8DCC8] p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[#4A2E1F]">{order.branch_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()} · {order.order_type}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <p className="mt-3 font-semibold text-[#4A2E1F]">Rs {order.total}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default OrderHistory;