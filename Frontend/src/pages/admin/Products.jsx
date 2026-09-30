import { useProducts } from '../../api/hooks';
import { SkeletonTableLoader } from '../../components/common/SkletonLoader';

export default function AdminProducts() {
  const { data, isLoading } = useProducts();
  if (isLoading) return <SkeletonTableLoader />;
  const products = data?.data || data?.products || [];
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Product Moderation</h1>
      {products.map(p=>(
        <div key={p._id} className="bg-white p-4 rounded border mb-2 flex justify-between"><span>{p.productName || p.name}</span><span>Rs {p.productPrice || p.price}</span></div>
      ))}
    </div>
  );
}
