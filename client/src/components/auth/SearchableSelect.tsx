import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

type SearchableSelectProps = {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  searchPlaceholder?: string;
  isRTL?: boolean;
};

export function SearchableSelect({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  searchPlaceholder = 'Search…',
  isRTL = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const panelOpen = open && !disabled;

  return (
    <div ref={rootRef} className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={clsx(
          'flex w-full items-center justify-between gap-2 rounded-xl border bg-gray-50/80 py-3 px-4 text-left text-sm shadow-inner transition-colors',
          error ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200 focus-within:border-[#003B5C]',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-white',
          isRTL && 'text-right'
        )}
        aria-expanded={panelOpen}
        aria-haspopup="listbox"
      >
        <span className={clsx('truncate', !value && 'text-gray-400')}>{value || placeholder}</span>
        <ChevronDown className={clsx('h-4 w-4 shrink-0 text-gray-500 transition-transform', panelOpen && 'rotate-180')} />
      </button>
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}

      <AnimatePresence>
        {panelOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="relative z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5"
          >
            <div
              className={clsx(
                'flex items-center gap-2 border-b border-gray-100 px-3 py-2',
                isRTL && 'flex-row-reverse'
              )}
            >
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400"
                autoFocus
              />
            </div>
            <ul
              role="listbox"
              className="max-h-52 overflow-y-auto py-1"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500">{isRTL ? 'لا توجد نتائج' : 'No matches'}</li>
              ) : (
                filtered.map((opt) => (
                  <li key={opt} role="option" aria-selected={value === opt}>
                    <button
                      type="button"
                      className={clsx(
                        'w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#003B5C]/8',
                        value === opt && 'bg-[#003B5C]/10 font-semibold text-[#003B5C]',
                        isRTL && 'text-right'
                      )}
                      onClick={() => {
                        onChange(opt);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      {opt}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
