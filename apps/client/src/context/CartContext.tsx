import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useGetCart } from "@workspace/api-client-react";

interface CartContextType {
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { data: cart, refetch } = useGetCart({
    query: {
      queryKey: ["cart"],
      enabled: true
    }
  });

  const cartItemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider value={{ 
      cartItemCount, 
      isCartOpen, 
      setIsCartOpen,
      refreshCart: () => refetch()
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
