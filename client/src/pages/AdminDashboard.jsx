import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState('orders');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/menu`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setMenuItems);
  };

  const fetchOrders = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders);
  };

  useEffect(() => {
    Promise.all([fetchMenu(), fetchOrders()]).finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async (item) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/admin/menu/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...item, available: !item.available }),
    });
    fetchMenu();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    preparing: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  const nextStatus = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'completed',
  };

  if (loading) return <p className="text-center text-gray-500 py-10">Loading dashboard...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-serif text-[#4A2E1F] mb-6">Branch Dashboard</h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'orders' ? 'bg-[#4A2E1F] text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Incoming Orders
        </button>
        <button
          onClick={() => setTab('menu')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === 'menu' ? 'bg-[#4A2E1F] text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Manage Menu
        </button>
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-[#E8DCC8] p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{order.customer_name}</h3>
                  <p className="text-sm text-gray-500">{order.customer_email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.order_type} · Rs {order.total} · {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              {nextStatus[order.status] && (
                <button
                  onClick={() => updateOrderStatus(order.id, nextStatus[order.status])}
                  className="mt-3 text-sm bg-[#4A2E1F] text-white px-4 py-2 rounded-lg hover:bg-[#6B4530]"
                >
                  Mark as {nextStatus[order.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'menu' && (
        <div className="space-y-3">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-[#E8DCC8] p-4 flex justify-between items-center"
            >
              <div>
                <h4 className={`font-medium ${item.available ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                  {item.name}
                </h4>
                <p className="text-sm text-gray-500">{item.category} · Rs {item.price}</p>
              </div>
              <button
                onClick={() => toggleAvailability(item)}
                className={`text-sm px-4 py-2 rounded-lg font-medium ${
                  item.available
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {item.available ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;