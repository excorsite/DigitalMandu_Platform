export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Total Users</p><p className="text-3xl font-bold">—</p></div>
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Total Products</p><p className="text-3xl font-bold">—</p></div>
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Total Orders</p><p className="text-3xl font-bold">—</p></div>
        <div className="bg-white p-6 rounded-lg border"><p className="text-sm text-gray-600">Revenue</p><p className="text-3xl font-bold text-green-600">—</p></div>
      </div>
    </div>
  );
}
