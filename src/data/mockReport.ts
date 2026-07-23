export type RiskLevel = 'High' | 'Medium' | 'Low'

export interface AffectedFile {
  path: string
  type: 'service' | 'controller' | 'model' | 'config' | 'test' | 'migration' | 'feature'
  change: 'modified' | 'added' | 'deleted'
  risk: RiskLevel
  reason: string
  linesChanged: number
}

export interface DbChange {
  table: string
  operation: 'ALTER' | 'CREATE' | 'INDEX' | 'DROP COLUMN'
  detail: string
  risk: RiskLevel
  migration: string
}

export interface FunctionalArea {
  name: string
  impact: RiskLevel
  description: string
  affectedFlows: string[]
}

export interface TestCase {
  id: string
  title: string
  type: 'regression' | 'new' | 'integration'
  status: 'recommended' | 'required'
  feature: string
}

export interface Recommendation {
  priority: 'P0' | 'P1' | 'P2'
  text: string
  category: string
}

export interface ReportData {
  ticketId: string
  ticketSummary: string
  generatedAt: string
  riskLevel: RiskLevel
  riskScore: number
  scoreBreakdown: { files: number; database: number; functional: number; tests: number }
  summary: string
  affectedFiles: AffectedFile[]
  dbChanges: DbChange[]
  functionalAreas: FunctionalArea[]
  testCases: TestCase[]
  recommendations: Recommendation[]
  dependencies: { name: string; version: string; reason: string }[]
}

export const mockReport: ReportData = {
  ticketId: 'PAY-1247',
  ticketSummary: 'Add multi-currency support to checkout flow',
  generatedAt: '2026-07-23 09:42 UTC',
  riskLevel: 'High',
  riskScore: 78,
  scoreBreakdown: { files: 32, database: 24, functional: 14, tests: 8 },
  summary:
    'Introducing multi-currency at checkout touches the payment authorization service, order persistence layer, and 3 customer-facing flows. Database schema requires a new currency_code column on orders and a new exchange_rate table, impacting existing foreign-key relationships. Regression risk is high due to legacy single-currency assumptions in 6 services.',
  affectedFiles: [
    { path: 'src/services/PaymentService.ts', type: 'service', change: 'modified', risk: 'High', reason: 'Core authorization logic branches on currency', linesChanged: 142 },
    { path: 'src/controllers/CheckoutController.ts', type: 'controller', change: 'modified', risk: 'High', reason: 'Request validation accepts currency field', linesChanged: 58 },
    { path: 'src/models/Order.ts', type: 'model', change: 'modified', risk: 'Medium', reason: 'New currency_code property + serialization', linesChanged: 34 },
    { path: 'src/models/ExchangeRate.ts', type: 'model', change: 'added', risk: 'Medium', reason: 'New entity for FX rate lookups', linesChanged: 76 },
    { path: 'src/config/currencies.ts', type: 'config', change: 'added', risk: 'Low', reason: 'Allowed currency list + rounding rules', linesChanged: 22 },
    { path: 'db/migrations/0042_add_currency.sql', type: 'migration', change: 'added', risk: 'High', reason: 'ALTER orders + CREATE exchange_rate', linesChanged: 48 },
    { path: 'tests/checkout.feature', type: 'feature', change: 'modified', risk: 'Medium', reason: 'New Gherkin scenarios for currency selection', linesChanged: 64 },
    { path: 'tests/PaymentService.spec.ts', type: 'test', change: 'modified', risk: 'Medium', reason: 'Mock FX provider + multi-currency assertions', linesChanged: 91 },
  ],
  dbChanges: [
    { table: 'orders', operation: 'ALTER', detail: 'ADD COLUMN currency_code VARCHAR(3) NOT NULL DEFAULT \'USD\'', risk: 'High', migration: '0042_add_currency.sql' },
    { table: 'exchange_rates', operation: 'CREATE', detail: 'New table: id, base, quote, rate, effective_at', risk: 'Medium', migration: '0042_add_currency.sql' },
    { table: 'orders', operation: 'INDEX', detail: 'CREATE INDEX idx_orders_currency ON orders(currency_code)', risk: 'Low', migration: '0042_add_currency.sql' },
    { table: 'order_items', operation: 'ALTER', detail: 'ADD COLUMN unit_price_currency VARCHAR(3)', risk: 'Medium', migration: '0043_items_currency.sql' },
  ],
  functionalAreas: [
    { name: 'Checkout & Payment', impact: 'High', description: 'Currency selection, conversion display, and authorization in target currency', affectedFlows: ['Cart review', 'Payment submission', 'Receipt rendering'] },
    { name: 'Order Management', impact: 'High', description: 'Persistence and retrieval of currency-aware orders', affectedFlows: ['Order history', 'Refund processing'] },
    { name: 'Reporting & Analytics', impact: 'Medium', description: 'Revenue reports must normalize to base currency', affectedFlows: ['Daily revenue', 'Monthly reconciliation'] },
    { name: 'Notifications', impact: 'Low', description: 'Email templates render currency symbol', affectedFlows: ['Order confirmation email'] },
  ],
  testCases: [
    { id: 'TC-501', title: 'Checkout with EUR displays converted total', type: 'new', status: 'required', feature: 'checkout.feature' },
    { id: 'TC-502', title: 'Payment authorization in non-USD currency', type: 'new', status: 'required', feature: 'checkout.feature' },
    { id: 'TC-503', title: 'Refund issues in original currency', type: 'integration', status: 'required', feature: 'refund.feature' },
    { id: 'TC-504', title: 'Legacy USD-only orders still render correctly', type: 'regression', status: 'required', feature: 'order_history.feature' },
    { id: 'TC-505', title: 'Revenue report normalizes mixed currencies', type: 'regression', status: 'recommended', feature: 'reporting.feature' },
    { id: 'TC-506', title: 'Exchange rate cache refresh on stale data', type: 'integration', status: 'recommended', feature: 'fx.feature' },
  ],
  recommendations: [
    { priority: 'P0', text: 'Backfill existing orders with currency_code = \'USD\' before deploying the migration to avoid NOT NULL constraint failures.', category: 'Database' },
    { priority: 'P0', text: 'Add a fallback to USD when exchange_rates has no entry for a currency pair to prevent checkout failures.', category: 'Resilience' },
    { priority: 'P1', text: 'Coordinate release with the FX rate provider SLA; cache rates with a 15-minute TTL.', category: 'Performance' },
    { priority: 'P1', text: 'Update order confirmation email templates to render the correct currency symbol and code.', category: 'UX' },
    { priority: 'P2', text: 'Document the new currency_code field in the public API spec and changelog.', category: 'Documentation' },
  ],
  dependencies: [
    { name: '@payments/fx-provider', version: '^2.1.0', reason: 'New transitive dependency for live exchange rates' },
    { name: 'decimal.js', version: '^10.4.3', reason: 'Precise currency conversion arithmetic' },
  ],
}
