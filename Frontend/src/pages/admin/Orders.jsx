import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';

export default function AdminOrders() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-orders'], queryFn: () => client.get('/getOrdersAsAnAdmin').then(r=>r.data) });
  if (isLoading) return <SkeletonTableLoader />;
  const orders = data?.data || data || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Orders</h1>
      {orders.length===0 ? <p className="text-gray-600">No orders.</p> : orders.map(o=>(
        <div key={o._id} className="bg-white p-4 rounded border mb-2"><p>Order #{o._id}</p><p className="text-sm text-gray-500">{o.orderStatus}</p></div>
      ))}
    </div>
  );
}
