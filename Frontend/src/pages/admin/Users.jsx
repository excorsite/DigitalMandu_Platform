import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';

export default function AdminUsers() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => client.get('/users').then(r=>r.data) });
  if (isLoading) return <SkeletonTableLoader />;
  const users = data?.data || data || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      {users.length===0 ? <p className="text-gray-600">No users or failed to load.</p> : users.map(u=>(
        <div key={u._id} className="bg-white p-4 rounded border mb-2 flex justify-between"><span>{u.userEmail || u.email}</span><span className="text-sm text-gray-500">{u.role}</span></div>
      ))}
    </div>
  );
}
