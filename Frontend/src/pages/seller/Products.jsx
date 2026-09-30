import { useProducts, useDeleteProduct } from '../../api/hooks';
import { getProductImage, handleImgError } from '../../utils/productImage';
import { Link } from 'react-router-dom';
import { PrimaryButton, SecondaryButton } from '../../components/common/Button';

export default function SellerProducts() {
  const { data, isLoading } = useProducts({ page:1, limit:50 });
  const { mutate: del } = useDeleteProduct();
  const products = data?.data || data?.products || [];
  if (isLoading) return <div className="p-6">Loading...</div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-serif">Manage Products</h1>
        <Link to="/seller/products/create"><PrimaryButton label="+ Add Product" onClick={()=>{}} /></Link>
      </div>
      {products.length===0 ? <div className="bg-white border border-dashed rounded-xl p-12 text-center text-gray-500">No products yet. Create your first product.</div> :
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p,i)=>(
          <div key={p._id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition">
            <img src={getProductImage(p,i)} onError={e=>handleImgError(e,i)} alt={p.productName} className="h-48 w-full object-cover bg-green-footer" />
            <div className="p-4">
              <h3 className="font-semibold truncate">{p.productName || p.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{p.productDescription}</p>
              <p className="font-bold text-primary mt-2">Rs {p.productPrice}</p>
              <p className="text-xs text-gray-400">Stock: {p.productStock} • {p.productStatus}</p>
              <div className="flex gap-2 mt-3">
                <SecondaryButton label="Delete" onClick={()=> { if(confirm('Delete?')) del(p._id); }} className="flex-1 justify-center" />
                <span className={`text-xs px-2 py-1 rounded-full self-center ${p.productStatus==='public'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{p.productStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
