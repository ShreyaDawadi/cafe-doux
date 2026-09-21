import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';

function Checkout() {
  const { branchId, items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      setError('Please log in to place an order.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('Please enter a delivery address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          branchId,
          orderType,
          deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif text-[#4A2E1F] mb-3">Order placed! 🎉</h2>
        <p className="text-gray-600 mb-6">We're getting your order ready.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#4A2E1F] text-white px-6 py-2 rounded-lg hover:bg-[#6B4530]"
        >
          Back to branches
        </button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-6">Your cart is empty.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#4A2E1F] text-white px-6 py-2 rounded-lg hover:bg-[#6B4530]"
        >
          Browse branches
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-serif text-[#4A2E1F] mb-6">Your Order</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-[#E8DCC8] divide-y divide-[#E8DCC8]">
        {items.map((item) => (
          <div key={item.menuItemId} className="p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-800">{item.name}</h4>
              <p className="text-sm text-gray-500">Rs {item.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.menuItemId)}
                className="text-red-500 text-sm ml-2 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-[#4A2E1F] mb-3">Order Type</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setOrderType('pickup')}
            className={`flex-1 py-3 rounded-lg border ${
              orderType === 'pickup' ? 'bg-[#4A2E1F] text-white' : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Pickup
          </button>
          <button
            onClick={() => setOrderType('delivery')}
            className={`flex-1 py-3 rounded-lg border ${
              orderType === 'delivery' ? 'bg-[#4A2E1F] text-white' : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Delivery
          </button>
        </div>

        {orderType === 'delivery' && (
          <input
            type="text"
            placeholder="Enter your delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2E1F]"
          />
        )}
      </div>

      <div className="mt-6 flex justify-between items-center text-lg font-semibold text-[#4A2E1F]">
        <span>Total</span>
        <span>Rs {total.toFixed(2)}</span>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={submitting}
        className="w-full mt-4 bg-[#4A2E1F] text-white py-3 rounded-lg font-medium hover:bg-[#6B4530] disabled:opacity-50"
      >
        {submitting ? 'Placing order...' : 'Place Order'}
      </button>
    </main>
  );
}

export default Checkout;