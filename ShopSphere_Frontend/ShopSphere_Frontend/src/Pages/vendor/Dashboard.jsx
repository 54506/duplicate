import { useEffect, useState } from "react";
import { getVendorProducts } from "../../api/vendor_axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {

  const [stats, setStats] = useState({ revenue: "0.00", products: 0, orders: 0, avg: "0.00" });
  const [salesChart, setSalesChart] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch real products from backend
        const products = await getVendorProducts();

        // Revenue and Orders should be based on real sales transactions.
        // For now, we set these to 0 as order logic is not yet integrated.
        const totalProducts = products.length;
        const totalOrders = 0;
        const revenue = 0.00;

        setStats({
          revenue: "0.00",
          products: totalProducts,
          orders: totalOrders,
          avg: "0.00"
        });

        // Sales Chart reflects trends (set to 0 for now)
        setSalesChart([
          { month: "Jan", sales: 0 },
          { month: "Feb", sales: 0 },
          { month: "Mar", sales: 0 },
          { month: "Apr", sales: 0 },
          { month: "May", sales: 0 },
          { month: "Jun", sales: 0 }
        ]);

        // Recent Orders represents actual transactions
        setRecentOrders([]);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium tracking-wide italic">Synchronizing store metrics...</p>
      </div>
    );
  }

  return (
    <div>
      {/* WELCOME */}
      <div className="p-6 flex justify-between items-center mb-10">

        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>

      </div>

      {/* KPI CARDS */}
      <div className="grid lg:grid-cols-4 gap-6 mb-10">

        <Card title="Total Revenue" value={`₹${stats.revenue}`} />
        <Card title="Total Products" value={stats.products} />
        <Card title="Total Orders" value={stats.orders} />
        <Card title="Avg Order Value" value={`₹${stats.avg}`} />

      </div>

      {/* SALES OVERVIEW */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">

        <h2 className="font-bold mb-4">Sales Overview</h2>

        <ResponsiveContainer height={280}>
          <LineChart data={salesChart}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line dataKey="sales" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* RECENT ORDERS (CARD STYLE LIKE IMAGE) */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="font-bold mb-6">Recent Orders</h2>

        <div className="space-y-4">

          {recentOrders.map(order => (

            <div
              key={order.id}
              className="flex justify-between items-center border rounded-lg p-4"
            >

              <div>
                <p className="font-semibold">{order.id}</p>
                <p className="text-sm text-gray-400">{order.name}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold">₹{order.amount}</p>

                <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                  {order.status}
                </span>
              </div>

            </div>

          ))}

          {recentOrders.length === 0 && (
            <p className="text-center text-gray-400">No orders yet.</p>
          )}

        </div>

      </div>

    </div>
  );
}

/* KPI CARD */

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
