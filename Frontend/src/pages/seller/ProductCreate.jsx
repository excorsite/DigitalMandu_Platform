import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProduct, useProductDetail, useUpdateProduct } from '../../api/hooks';
import InputField from '../../components/common/InputField';
import { PrimaryButton } from '../../components/common/Button';
import { CloudArrow } from '../../assets/data/icons';
import { getProductImage } from '../../utils/productImage';

export default function SellerProductCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { data: detail, isLoading: isLoadingProduct } = useProductDetail(id, isEditing);
  const { mutateAsync: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const isPending = isCreating || isUpdating;
  const product = detail?.data;
  const [form, setForm] = useState({ productName:'', productDescription:'', productPrice:'', productStock:'', productStatus:'public' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!product) return;
    setForm({
      productName: product.productName || '',
      productDescription: product.productDescription || '',
      productPrice: product.productPrice ?? '',
      productStock: product.productStock ?? '',
      productStatus: product.productStatus || 'public',
    });
  }, [product]);

  const onChange = e => setForm(f=>({...f, [e.target.name]: e.target.value}));
  const onFile = e => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const onSubmit = async e => {
    e.preventDefault();
    const fd = new FormData();
    if (isEditing) {
      fd.append('updatedUserProductName', form.productName);
      fd.append('updatedUserProductDescription', form.productDescription);
      fd.append('updatedUserProductPrice', form.productPrice);
      fd.append('updatedUserProductStock', form.productStock);
      fd.append('updatedUserProductStatus', form.productStatus);
    } else {
      if (!file) { alert('Product image required'); return; }
      fd.append('productName', form.productName);
      fd.append('productDescription', form.productDescription);
      fd.append('productPrice', form.productPrice);
      fd.append('productStock', form.productStock);
      fd.append('productStatus', form.productStatus);
    }
    if (file) fd.append('productImage', file);
    try {
      if (isEditing) await updateProduct({ id, data: fd });
      else await createProduct(fd);
      navigate('/seller/products');
    } catch {}
  };

  if (isEditing && isLoadingProduct) return <div className="p-6">Loading product...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-serif mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <InputField label="Product Name" name="productName" value={form.productName} onChange={onChange} placeholder="e.g. Vintage Burger" />
        <div>
          <label className="text-sm text-primary mb-1 block">Description</label>
          <textarea name="productDescription" value={form.productDescription} onChange={onChange} rows={4} className="w-full bg-[#F6F6F6] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Describe the dish..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Price (Rs)" name="productPrice" type="number" value={form.productPrice} onChange={onChange} placeholder="250" />
          <InputField label="Stock" name="productStock" type="number" value={form.productStock} onChange={onChange} placeholder="50" />
        </div>
        <div>
          <label className="text-sm text-primary mb-1 block">Status</label>
          <select name="productStatus" value={form.productStatus} onChange={onChange} className="w-full bg-[#F6F6F6] rounded px-3 py-2 h-[42px] text-sm">
            <option value="draft">Draft</option>
            <option value="public">Public</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-primary mb-1 block">Product Photo {isEditing ? '(optional)' : '*'}</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-border bg-green-footer rounded-xl p-6 cursor-pointer hover:bg-green-50 transition">
            <CloudArrow />
            <span className="text-sm text-gray-600 mt-2">{file ? file.name : 'Click to upload image'}</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
          {(preview || (isEditing && product)) && <img src={preview || getProductImage(product)} alt="Product preview" className="mt-3 h-40 w-full object-cover rounded-lg border" />}
        </div>
        <PrimaryButton label={isPending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Product')} type="submit" loading={isPending} className="w-full justify-center" />
      </form>
    </div>
  );
}
