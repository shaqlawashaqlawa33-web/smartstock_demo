import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/button';

export default function CurrencyToggle() {
  const { config, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1" role="group" aria-label="Currency selector">
      <Button
        size="sm"
        onClick={() => setCurrency('IQD')}
        className={
          config.currency === 'IQD'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white h-7 px-3 text-xs'
            : 'bg-transparent hover:bg-slate-700 text-slate-400 h-7 px-3 text-xs'
        }
        aria-pressed={config.currency === 'IQD'}
      >
        د.ع IQD
      </Button>
      <Button
        size="sm"
        onClick={() => setCurrency('USD')}
        className={
          config.currency === 'USD'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white h-7 px-3 text-xs'
            : 'bg-transparent hover:bg-slate-700 text-slate-400 h-7 px-3 text-xs'
        }
        aria-pressed={config.currency === 'USD'}
      >
        $ USD
      </Button>
    </div>
  );
}
