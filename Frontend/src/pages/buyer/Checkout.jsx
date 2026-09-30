import { useState, useEffect } from 'react';
import { useCreateOrder, useInitiatePayment, useCart } from '../../api/hooks';
import { PrimaryButton } from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';
import { PackageIcon, LocationIcon } from '../../assets/data/icons';
import { getCartProductId, calcSubtotal } from '../../utils/cart';
import { useAuthStore } from '../../store/authStore';

export default function Checkout() {
  const { data } = useCart();
  const { user } = useAuthStore();
  const items = data?.data || data?.items || data?.cart || [];
  const subtotal = calcSubtotal(items);
  const [shippingAddress, setShippingAddress] = useState('');
  const [detecting, setDetecting] = useState(false);
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: initiatePayment, isPending: payPending } = useInitiatePayment();
  const navigate = useNavigate();

  // prefill from user profile if available
  useEffect(() => {
    if (user?.address) setShippingAddress(user.address);
  }, [user]);

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        // reverse via nominatim (no key)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const json = await res.json();
        const addr = json.display_name || `${latitude}, ${longitude}`;
        setShippingAddress(addr);
        toast.success('Location detected');
      } catch { toast.error('Failed to reverse geocode'); }
      finally { setDetecting(false); }
    }, () => { toast.error('Location permission denied'); setDetecting(false); });
  };

  const validate = () => {
    if (!items.length) { toast.error('Cart is empty'); return false; }
    if (!shippingAddress.trim() || shippingAddress.trim().length < 10) { toast.error('Please enter full delivery address (min 10 chars)'); return false; }
    if (subtotal <= 0) { toast.error(`Invalid total Rs ${subtotal}. Check cart prices.`); return false; }
    return true;
  };

  const handleOrder = () => {
    if (!validate()) return;
    const orderItems = items.map(it => ({ product: getCartProductId(it), quantity: it.quantity || 1 }));
    createOrder({ shippingAddress: shippingAddress.trim(), items: orderItems, totalAmount: subtotal, paymentDetails: { method: 'cod', status: 'pending' } }, { onSuccess: ()=> { toast.success('Order placed'); navigate('/orders'); }, onError: (e)=> toast.error(e.response?.data?.message|| e.response?.data?.msg || 'Failed') });
  };
  const handleKhalti = () => {
    if (!validate()) return;
    const orderItems = items.map(it => ({ product: getCartProductId(it), quantity: it.quantity || 1 }));
    createOrder({ shippingAddress: shippingAddress.trim(), items: orderItems, totalAmount: subtotal, paymentDetails: { method: 'khalti', status: 'unpaid' } }, {
      onSuccess: (res) => {
        const orderId = res.data?.data?._id || res.data?._id || res.data?.order?._id;
        if (!orderId) return toast.error('Order created but no ID');
        initiatePayment({ orderId, amount: subtotal }, { onSuccess: (r)=> { const url=r.data?.paymentUrl || r.data?.payment_url || r.data?.data?.payment_url; if(url) window.location.href=url; else toast.error('No payment URL'); }, onError: (e)=> toast.error(e.response?.data?.message || 'Payment failed') });
      },
      onError: (e)=> toast.error(e.response?.data?.message || 'Failed to create order')
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-serif text-primary mb-6 flex items-center gap-3"><img src={assets.parcel_icon} alt="" className="h-7" /> Checkout</h1>
      <div className="bg-white p-6 rounded-xl border border-green-border shadow-sm space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-footer rounded-lg border border-green-border">
          <div className="flex items-center gap-3"><PackageIcon className="size-6 text-primary" /><div><p className="font-semibold text-gray-900">Cart total</p><p className="text-sm text-gray-600">{items.length} items · Rs {subtotal} · Free delivery</p></div></div>
        </div>

        <div>
          <label className="text-sm font-medium text-primary mb-1 flex items-center gap-1.5"><LocationIcon /> Delivery Address *</label>
          <textarea value={shippingAddress} onChange={e=>setShippingAddress(e.target.value)} rows={3} placeholder="House no, street, city, landmark..." className="w-full bg-[#F6F6F6] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-transparent" />
          <button type="button" onClick={detectLocation} disabled={detecting} className="mt-2 text-xs font-medium text-primary hover:underline disabled:opacity-50">{detecting ? 'Detecting...' : '📍 Use my current location'}</button>
          <p className="text-xs text-gray-500 mt-1">Needed for delivery. Min 10 characters.</p>
        </div>

        <div className="grid gap-3 pt-2">
          <PrimaryButton label={isPending ? 'Placing...' : `Place Order (COD) — Rs ${subtotal}`} loading={isPending} onClick={handleOrder} />
          <PrimaryButton label={payPending ? 'Redirecting...' : `Pay with Khalti — Rs ${subtotal}`} variant="secondary" loading={payPending} onClick={handleKhalti} />
        </div>
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2"><img src={assets.bag_icon} alt="" className="h-4" /> Secure checkout powered by Khalti</p>
      </div>
    </div>
  );
}
