interface Line {
  type: 'add' | 'del' | 'ctx'
  num?: number
  content: string
}

const sampleDiffs: Record<string, Line[]> = {
  'PaymentService.ts': [
    { type: 'ctx', num: 42, content: 'async authorize(amount: number, token: string) {' },
    { type: 'del', num: 43, content: '  const result = await gateway.charge(amount, token);' },
    { type: 'add', num: 43, content: '  const currency = order.currency_code ?? \'USD\';' },
    { type: 'add', num: 44, content: '  const result = await gateway.charge(amount, token, currency);' },
    { type: 'add', num: 45, content: '  if (!result.success && currency !== \'USD\') {' },
    { type: 'add', num: 46, content: '    return fallbackUSD(amount, token);' },
    { type: 'ctx', num: 47, content: '  }' },
    { type: 'ctx', num: 48, content: '  return result;' },
  ],
  'CheckoutController.ts': [
    { type: 'ctx', num: 18, content: '@Post(\'/checkout\')' },
    { type: 'del', num: 19, content: '  const { items, token } = req.body;' },
    { type: 'add', num: 19, content: '  const { items, token, currency } = req.body;' },
    { type: 'add', num: 20, content: '  if (!SUPPORTED_CURRENCIES.includes(currency)) {' },
    { type: 'add', num: 21, content: '    return res.status(400).json({ error: \'Unsupported currency\' });' },
    { type: 'add', num: 22, content: '  }' },
    { type: 'ctx', num: 23, content: '  const order = await checkout.process(items, token);' },
  ],
  'Order.ts': [
    { type: 'ctx', num: 12, content: 'export class Order {' },
    { type: 'del', num: 13, content: '  total: number;' },
    { type: 'add', num: 13, content: '  total: number;' },
    { type: 'add', num: 14, content: '  currency_code: string = \'USD\';' },
    { type: 'ctx', num: 15, content: '  items: OrderItem[];' },
  ],
  '0042_add_currency.sql': [
    { type: 'ctx', num: 1, content: '-- Migration: Add multi-currency support' },
    { type: 'add', num: 2, content: 'ALTER TABLE orders' },
    { type: 'add', num: 3, content: '  ADD COLUMN currency_code VARCHAR(3) NOT NULL DEFAULT \'USD\';' },
    { type: 'add', num: 4, content: '' },
    { type: 'add', num: 5, content: 'CREATE TABLE exchange_rates (' },
    { type: 'add', num: 6, content: '  id SERIAL PRIMARY KEY,' },
    { type: 'add', num: 7, content: '  base VARCHAR(3) NOT NULL,' },
    { type: 'add', num: 8, content: '  quote VARCHAR(3) NOT NULL,' },
    { type: 'add', num: 9, content: '  rate DECIMAL(18,8) NOT NULL,' },
    { type: 'add', num: 10, content: '  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW()' },
    { type: 'add', num: 11, content: ');' },
    { type: 'add', num: 12, content: '' },
    { type: 'add', num: 13, content: 'CREATE INDEX idx_orders_currency ON orders(currency_code);' },
  ],
}

export function getDiffLines(filename: string): Line[] {
  return sampleDiffs[filename] ?? sampleDiffs['PaymentService.ts']
}

export default function DiffViewer({ filename }: { filename: string }) {
  const lines = getDiffLines(filename)
  return (
    <div className="font-mono text-xs">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-black/30">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-ember/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber2/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald2/70" />
        </div>
        <span className="text-zinc-500 text-xs ml-2">{filename}</span>
        <span className="ml-auto text-[10px] text-zinc-600">
          {lines.filter((l) => l.type === 'add').length}+ {lines.filter((l) => l.type === 'del').length}-
        </span>
      </div>
      {/* Diff body */}
      <div className="overflow-x-auto py-1">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-0.5 ${
              line.type === 'add' ? 'diff-add' : line.type === 'del' ? 'diff-del' : 'diff-ctx'
            }`}
          >
            <span className="text-zinc-600 select-none w-5 text-right shrink-0">{line.num ?? ''}</span>
            <span className={`select-none w-4 shrink-0 ${line.type === 'add' ? 'diff-add-text' : line.type === 'del' ? 'diff-del-text' : 'text-zinc-600'}`}>
              {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
            </span>
            <span className={`whitespace-pre ${line.type === 'ctx' ? 'text-zinc-400' : 'text-zinc-200'}`}>{line.content || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
