// zonta-site/src/context/CartContext.test.tsx
import { renderHook, act } from "@testing-library/react";
import { CartContext } from "./CartContext";
import { CartProvider } from "./CartProvider";
import { useContext } from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

test("adds items to cart", () => {
  const { result } = renderHook(() => useContext(CartContext), { wrapper });

  act(() =>
    result.current?.addItem({
      _id: "1",
      title: "Item",
      price: 10
    })
  );

  expect(result.current?.items.length).toBe(1);
  expect(result.current?.items[0].title).toBe("Item");
});