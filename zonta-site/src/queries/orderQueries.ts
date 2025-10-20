// src/queries/orderQueries.ts

// ================================
// 🧩 Order Type Definition
// ================================
export interface OrderItem {
  _type?: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  email: string;
  total: number;
  status: "Pending" | "Completed" | "Cancelled";
  items?: OrderItem[];
  createdAt: string;
  shippingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
}

// ================================
// 🔐 Helper: Get Admin Token
// ================================
function getAuthHeaders() {
  const token = localStorage.getItem("adminToken");
  if (!token) throw new Error("No admin token found. Please log in again.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ================================
// 📦 Fetch All Orders
// ================================
export const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch orders: ${msg}`);
  }

  const data = await res.json();
  return data.orders || data; // flexible depending on backend structure
};

// ================================
// 🔄 Update Order Status
// ================================
export const updateOrderStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "Pending" | "Completed" | "Cancelled";
}): Promise<Order> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/orders/update-status`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, status }),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to update order status: ${msg}`);
  }

  return res.json();
};

// ================================
// 📤 Optional: Delete Order (Future Use)
// ================================
export const deleteOrder = async (id: string): Promise<{ success: boolean }> => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/orders/${id}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete order: ${msg}`);
  }

  return res.json();
};