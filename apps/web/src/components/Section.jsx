import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Section({ title, to, children, right }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">{title}</h2>
        {right ?? (to && (
          <Link to={to} className="flex items-center gap-0.5 text-[13px] font-semibold text-primary hover:opacity-70">
            Lihat semua
            <ChevronRight size={16} />
          </Link>
        ))}
      </div>
      {children}
    </section>
  );
}
