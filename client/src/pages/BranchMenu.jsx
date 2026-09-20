import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';

function BranchMenu() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { items, addItem, total, branchId: cartBranchId } = useCart();

  const [branch, setBranch] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/branches`).then((res) => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/branches/${branchId}/menu`).then((res) => res.json()),
    ]).then(([branches, menu]) => {
      const currentBranch = branches.find((b) => b.id === parseInt(branchId));
      setBranch(currentBranch);
      setMenuItems(menu);
      setLoading(false);
    });
  }, [branchId]);

  // Group menu items by category for nicer display
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const cartItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (loading) return <p className="text-center text-gray-500 py-10">Loading menu...</p>;
  if (!branch) return <p className="text-center text-gray-500 py-10">Branch not found.</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 pb-32">
      <button onClick={() => navigate('/')} className="text-[#4A2E1F] text-sm mb-4 hover:underline">
        ← Back to branches
      </button>

      <h2 className="text-2xl font-serif text-[#4A2E1F]">{branch.name}</h2>
      <p className="text-sm text-gray-500 mb-8">{branch.address}, {branch.city}</p>

      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-[#6B4530] mb-3">{category}</h3>
          <div className="space-y-3">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center border border-[#E8DCC8]"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="text-sm font-semibold text-[#4A2E1F] mt-1">Rs {item.price}</p>
                </div>
                <button
                  onClick={() => addItem(item, parseInt(branchId))}
                  className="bg-[#4A2E1F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#6B4530]"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {cartItemCount > 0 && cartBranchId === parseInt(branchId) && (
        <Link
          to="/checkout"
          className="fixed bottom-0 left-0 right-0 bg-[#4A2E1F] text-white p-4 flex justify-between items-center px-6"
        >
          <span>{cartItemCount} item{cartItemCount > 1 ? 's' : ''} in cart</span>
          <span className="font-semibold">Rs {total.toFixed(2)} — View Cart →</span>
        </Link>
      )}
    </main>
  );
}

export default BranchMenu;