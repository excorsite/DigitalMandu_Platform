import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProduct } from '../../api/hooks';
import InputField from '../../components/common/InputField';
import { PrimaryButton } from '../../components/common/Button';
import { CloudArrow } from '../../assets/data/icons';

export default function SellerProductCreate() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateProduct();
  const [form, setForm] = useState({ productName:'', productDescription:'', productPrice:'', productStock:'', productStatus:'public' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const onChange = e => setForm(f=>({...f, [e.target.name]: e.target.value}));
  const onFile = e => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!file) { alert('Product image required'); return; }
    const fd = new FormData();
    fd.append('productName', form.productName);
    fd.append('productDescription', form.productDescription);
    fd.append('productPrice', form.productPrice);
    fd.append('productStock', form.productStock);
    fd.append('productStatus', form.productStatus);
    fd.append('productImage', file);
    try { await mutateAsync(fd); navigate('/seller/products'); } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-serif mb-6">Add New Product</h1>
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
          <label className="text-sm text-primary mb-1 block">Product Photo *</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-border bg-green-footer rounded-xl p-6 cursor-pointer hover:bg-green-50 transition">
            <CloudArrow />
            <span className="text-sm text-gray-600 mt-2">{file ? file.name : 'Click to upload image'}</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
          {preview && <img src={preview} alt="preview" className="mt-3 h-40 w-full object-cover rounded-lg border" />}
        </div>
        <PrimaryButton label={isPending ? 'Creating...' : 'Create Product'} type="submit" loading={isPending} className="w-full justify-center" />
      </form>
    </div>
  );
}
