import { Link, useLocation } from 'react-router-dom';

const labels = { clients: 'Clients', periodic: 'Periodic', 'active-client': 'Active' };

export default function Breadcrumbs({ items }) {
  const location = useLocation();
  if (items) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        {items.map((it, i) => (
          <span key={it.path || i}>
            {i > 0 && ' / '}
            {it.path && i !== items.length - 1 ? <Link to={it.path} className="hover:underline text-green-700">{it.label}</Link> : <span className={i === items.length - 1 ? 'font-semibold text-gray-900' : ''}>{it.label}</span>}
          </span>
        ))}
      </nav>
    );
  }
  const segs = location.pathname.split('/').filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <Link to="/" className="hover:underline">Home</Link>
      {segs.map((s, i) => {
        const path = '/' + segs.slice(0, i + 1).join('/');
        const isLast = i === segs.length - 1;
        const label = labels[s] || s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return <span key={path}>{' / '}{isLast ? <span className="font-semibold text-gray-900">{label}</span> : <Link to={path} className="hover:underline text-green-700">{label}</Link>}</span>;
      })}
    </nav>
  );
}
