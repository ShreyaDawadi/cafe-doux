import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [branchId, setBranchId] = useState(null);
  const [items, setItems] = useState([]); // [{ menuItemId, name, price, quantity }]

  const addItem = (menuItem, newBranchId) => {
    // If switching branches, clear the cart first (can't mix branches in one order)
    if (branchId !== null && branchId !== newBranchId) {
      const confirmed = window.confirm(
        'Your cart has items from a different branch. Starting a new order will clear your current cart. Continue?'
      );
      if (!confirmed) return;
      setItems([]);
    }

    setBranchId(newBranchId);

    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.menuItemId === menuItem.id);
      if (existing) {
        return prevItems.map((i) =>
          i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { menuItemId: menuItem.id, name: menuItem.name, price: parseFloat(menuItem.price), quantity: 1 }];
    });
  };

  const removeItem = (menuItemId) => {
    setItems((prevItems) => prevItems.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setBranchId(null);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ branchId, items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}