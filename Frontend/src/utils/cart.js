export function getCartProduct(item) {
  const product = Array.isArray(item?.product)
    ? item.product[0]
    : item?.product;
  return product && typeof product === "object" ? product : item;
}
export function getCartPrice(item) {
  const p = getCartProduct(item);
  const price = Number(p?.productPrice ?? p?.price ?? item?.productPrice ?? 0);
  return Number.isFinite(price) && price >= 0 ? price : 0;
}
export function getCartName(item) {
  const p = getCartProduct(item);
  return p?.productName ?? p?.name ?? item?.productName ?? "Item";
}
export function getCartProductId(item) {
  const rawProduct = item?.product;
  const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
  if (product && typeof product === "object" && product._id) {
    return String(product._id);
  }
  if (typeof product === "string") return product;
  if (product && typeof product.toString === "function") {
    const productId = product.toString();
    if (productId !== "[object Object]") return productId;
  }
  return item?.productId ?? item?._id;
}
export function calcSubtotal(items) {
  return (items || []).reduce(
    (subtotal, item) =>
      subtotal + getCartPrice(item) * (Number(item.quantity) || 1),
    0,
  );
}
