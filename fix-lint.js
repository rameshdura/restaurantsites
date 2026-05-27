const fs = require('fs');

function fixFile(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
  }
  fs.writeFileSync(file, content, 'utf8');
}

// 1. OwnerDashboardClient.tsx
fixFile('apps/web/app/[restaurant]/owner/OwnerDashboardClient.tsx', [
  ['  Clock,\n', ''],
  ['  CreditCard,\n', ''],
  ['  ChevronRight,\n', ''],
  ['  menu: any[]', '  menu: { id?: string; name?: string; price?: string | number; [key: string]: unknown }[]'],
  ['  menuCategories: any[]', '  menuCategories: { items?: { id?: string; name?: string; price?: string | number; [key: string]: unknown }[]; [key: string]: unknown }[]'],
  ['const [sessions, setSessions] = useState<any[]>([])', 'const [sessions, setSessions] = useState<{ session_id: string; table_number: string; status: string; created_at: string; last_activity: string; orders?: { total?: number; subtotal?: number; service_charge?: number; tax?: number; tips?: number; discount?: number; items?: { item_id: string; qty: number; notes?: string; [key: string]: unknown }[] }; [key: string]: unknown }[]>([])'],
  ['(i: any)', '(i: { id?: string; [key: string]: unknown })'],
  ['(sum: number, i: any)', '(sum: number, i: { qty?: number; [key: string]: unknown })'],
  ['(item: any)', '(item: { item_id: string; qty: number; notes?: string; [key: string]: unknown })'],
]);

// 2. TableLandingClient.tsx
fixFile('apps/web/app/[restaurant]/table/[tableId]/TableLandingClient.tsx', [
  ['useState<any>(null)', 'useState<Record<string, unknown> | null>(null)']
]);

// 3. food-menu.tsx
fixFile('apps/web/components/food-menu/food-menu.tsx', [
  ['initialSession?: any', 'initialSession?: Record<string, unknown> | null'],
  ['onSessionChange?: (session: any) => void', 'onSessionChange?: (session: Record<string, unknown> | null) => void'],
  ['const [session, setSession] = useState<any>(initialSession)', 'const [session, setSession] = useState<Record<string, unknown> | null>(initialSession)'],
  ['const [receiptSession, setReceiptSession] = useState<any>(null)', 'const [receiptSession, setReceiptSession] = useState<Record<string, unknown> | null>(null)'],
  ['const [cart, setCart] = useState<any[]>([])', 'const [cart, setCart] = useState<{ item_id: string; qty: number; notes?: string; [key: string]: unknown }[]>([])'],
  ['      setReceiptSession(session)\n      setShowReceipt(true)', '      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setReceiptSession(session)\n      // eslint-disable-next-line react-hooks/set-state-in-effect\n      setShowReceipt(true)'],
  ['  }, [showReceipt, receiptSession])', '  }, [showReceipt, receiptSession, onSessionChange])'],
  ['(sum: number, item: any)', '(sum: number, item: { qty: number; [key: string]: unknown })'],
  ['(sum: number, cartItem: any)', '(sum: number, cartItem: { item_id: string; qty: number; [key: string]: unknown })'],
  ['(cartItem: any)', '(cartItem: { item_id: string; qty: number; notes?: string; [key: string]: unknown })'],
  ['(orderItem: any)', '(orderItem: { item_id: string; qty: number; notes?: string; [key: string]: unknown })'],
  ['(item: any)', '(item: { item_id: string; qty: number; notes?: string; [key: string]: unknown })'],
  ['(i: any)', '(i: { id?: string; [key: string]: unknown })'],
]);
