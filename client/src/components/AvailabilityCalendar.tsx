import { useMemo } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  value: string;
  onChange: (isoDate: string) => void;
  month: string; // YYYY-MM
  setMonth: (month: string) => void;
  unavailableDates: Set<string>;
  isRTL?: boolean;
  unavailableMessage?: string;
};

const addMonths = (yyyyMm: string, delta: number) => {
  const [y, m] = yyyyMm.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() + delta);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const daysInMonth = (yyyyMm: string) => {
  const [y, m] = yyyyMm.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

const weekdayIndex = (yyyyMm: string, day: number) => {
  const [y, m] = yyyyMm.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day)).getUTCDay(); // 0=Sun
};

export default function AvailabilityCalendar({
  value,
  onChange,
  month,
  setMonth,
  unavailableDates,
  isRTL = false,
  unavailableMessage = 'هذا اليوم غير متاح',
}: Props) {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const grid = useMemo(() => {
    const total = daysInMonth(month);
    const firstDow = weekdayIndex(month, 1); // 0..6
    const leading = firstDow; // start from Sunday
    const cells: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    for (let day = 1; day <= total; day++) {
      const iso = `${month}-${String(day).padStart(2, '0')}`;
      cells.push({ iso, day });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  const weeks = useMemo(() => {
    const out: Array<Array<(typeof grid)[number]>> = [];
    for (let i = 0; i < grid.length; i += 7) out.push(grid.slice(i, i + 7));
    return out;
  }, [grid]);

  const weekDays = isRTL ? ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          className="p-2 rounded-lg hover:bg-white transition-colors"
          aria-label="Prev month"
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <div className="font-semibold text-gray-800">{month}</div>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="p-2 rounded-lg hover:bg-white transition-colors"
          aria-label="Next month"
        >
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center font-semibold">{d}</div>
          ))}
        </div>

        <div className="space-y-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-2">
              {week.map((cell, ci) => {
                if (!cell) return <div key={ci} className="h-10" />;
                const disabled = cell.iso < todayIso || unavailableDates.has(cell.iso);
                const selected = value === cell.iso;
                return (
                  <button
                    key={ci}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (unavailableDates.has(cell.iso)) return;
                      onChange(cell.iso);
                    }}
                    className={clsx(
                      'h-10 rounded-lg text-sm font-semibold transition-colors border',
                      selected ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-800 border-gray-200 hover:border-[var(--color-gold)]',
                      disabled && 'opacity-40 cursor-not-allowed hover:border-gray-200'
                    )}
                    title={unavailableDates.has(cell.iso) ? unavailableMessage : cell.iso}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {value && unavailableDates.has(value) ? (
          <div className="mt-3 text-sm text-red-600">{unavailableMessage}</div>
        ) : null}
      </div>
    </div>
  );
}

