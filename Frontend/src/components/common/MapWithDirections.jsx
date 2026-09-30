export default function MapWithDirections({ lat, lng, address, label }) {
  if (!lat && !lng && !address) return null;
  const query = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
  const dirHref = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const embedSrc = lat && lng
    ? `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  return (
    <div className="rounded-lg border overflow-hidden">
      <iframe title={label || address || 'Map'} src={embedSrc} className="w-full h-48 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="flex items-center justify-between p-2 bg-gray-50 text-sm">
        <span className="truncate text-gray-600">{label || address || `${lat}, ${lng}`}</span>
        <a href={dirHref} target="_blank" rel="noopener noreferrer" className="ml-2 shrink-0 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Get Directions</a>
      </div>
    </div>
  );
}
