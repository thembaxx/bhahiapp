'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Package,
  BookOpen,
  BarChart3,
  Sparkles,
  Search,
  ScanBarcode,
  Plus,
  Send,
  Users,
  Award,
  Printer,
  RotateCcw,
  Settings,
  ChevronRight,
  X,
  ShieldCheck,
  Scale,
  Lock,
  Download,
} from 'lucide-react';
import {
  BahiState,
  Customer,
  CustomerCategory,
  CustomerTag,
  INITIAL_STATE,
  LanguageCode,
  LANGUAGE_NAMES,
  ProductItem,
  SMSTone,
  TransactionRecord,
  formatRand0,
  generateSMSText,
  tt,
} from '@/lib/bahi-data';
import {
  BahiBrandLogo,
  BahiIconSuiteShowcase,
  CreditHalfGauge,
  DecorativeShapes,
  DotMatrixCounter,
  PixelBlockChart,
  ReminderSignalIllustration,
  SalesWaveChart,
  SpazaArchIllustration,
  StatusRing,
} from '@/components/VisualCharts';
import { CRMCustomerModal } from '@/components/CRMCustomerModal';
import { CustomerProfileScreen } from '@/components/CustomerProfileScreen';
import { SwipeableCustomerRow } from '@/components/SwipeableCustomerRow';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { ReportsDashboard } from '@/components/ReportsDashboard';
import { SettingsModal } from '@/components/SettingsModal';
import { LegalPrivacyModal } from '@/components/LegalPrivacyModal';
import { ThreeOnboardingScene } from '@/components/ThreeOnboardingScene';

const STORAGE_KEY = 'bahiapp.v3.state';

type TabId = 'home' | 'stock' | 'credit' | 'reports' | 'brand';

interface FlyingChip {
  id: number;
  x: number;
  y: number;
  text: string;
}

export default function BahiAppPage() {
  const [state, setState] = useState<BahiState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [flyingChips, setFlyingChips] = useState<FlyingChip[]>([]);

  // Header Settings, Legal/Privacy & Onboarding tour state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalInitialSection, setLegalInitialSection] = useState<
    'privacy' | 'terms' | 'sms' | 'rights'
  >('privacy');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Stock filters
  const [stockQuery, setStockQuery] = useState('');
  const [stockCategory, setStockCategory] = useState<
    'All' | ProductItem['category']
  >('All');
  const [scannerOpen, setScannerOpen] = useState(false);

  // CRM filters, active profile screen & Add Customer modal state
  const [crmQuery, setCrmQuery] = useState('');
  const [crmCategoryFilter, setCrmCategoryFilter] = useState<
    'all' | CustomerCategory | 'late'
  >('all');
  const [topCustomerMetric, setTopCustomerMetric] = useState<
    'credit' | 'frequency'
  >('credit');
  const [profileCustomerId, setProfileCustomerId] = useState<number | null>(
    null
  );
  const [profileInitialEdit, setProfileInitialEdit] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [lastDeletedCustomer, setLastDeletedCustomer] =
    useState<Customer | null>(null);

  // Bulk SMS Assistant language & tone state
  const [assistantSmsLang, setAssistantSmsLang] = useState<LanguageCode>('en');
  const [assistantSmsTone, setAssistantSmsTone] = useState<SMSTone>('friendly');

  // Load saved state from localStorage while ensuring demo data is always populated
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          ...parsed,
          onboarded: true,
          items: parsed.items?.length ? parsed.items : prev.items,
          customers: parsed.customers?.length
            ? parsed.customers.map((c: Customer) => {
                const fallback = prev.customers.find((pc) => pc.id === c.id);
                return {
                  ...c,
                  tags: c.tags !== undefined ? c.tags : fallback?.tags || [],
                };
              })
            : prev.customers,
          transactions: parsed.transactions?.length
            ? parsed.transactions
            : prev.transactions,
        }));
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state, hydrated]);

  useEffect(() => {
    setAssistantSmsLang(state.lang);
  }, [state.lang]);

  // Sync light / high-contrast dark theme to document root & browser theme-color
  useEffect(() => {
    const activeTheme = state.theme || 'light';
    document.documentElement.dataset.theme = activeTheme;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        'content',
        activeTheme === 'dark' ? '#07191C' : '#FBF8F3'
      );
    }
  }, [state.theme]);

  const showToast = (msg: string) => {
    setToastMsg(tt(msg, state.lang));
  };

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const spawnFlyingChip = (x: number, y: number, text: string) => {
    const id = Date.now() + Math.random();
    setFlyingChips((prev) => [...prev, { id, x, y, text }]);
    setTimeout(() => {
      setFlyingChips((prev) => prev.filter((c) => c.id !== id));
    }, 950);
  };

  const vibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const openCustomerProfile = (
    customerId: number,
    startInEditMode = false
  ) => {
    vibrate();
    setProfileInitialEdit(startInEditMode);
    setProfileCustomerId(customerId);
    setActiveTab('credit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCustomer = (customer: Customer) => {
    vibrate();
    setLastDeletedCustomer(customer);
    setState((prev) => ({
      ...prev,
      syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
      customers: prev.customers.filter((c) => c.id !== customer.id),
    }));
    if (profileCustomerId === customer.id) {
      setProfileCustomerId(null);
    }
    setToastMsg(`Deleted ${customer.name}`);
  };

  const handleUndoDeleteCustomer = () => {
    if (!lastDeletedCustomer) return;
    vibrate();
    const restored = lastDeletedCustomer;
    setLastDeletedCustomer(null);
    setState((prev) => ({
      ...prev,
      customers: [restored, ...prev.customers],
    }));
    setToastMsg(`Restored ${restored.name}`);
  };

  // Toggle Online / Offline simulation
  const handleToggleSync = () => {
    vibrate();
    setState((prev) => {
      const nextOnline = !prev.online;
      if (nextOnline && prev.syncQueue > 0) {
        showToast(`Back online · ${prev.syncQueue} changes synced`);
        return { ...prev, online: true, syncQueue: 0 };
      } else if (!nextOnline) {
        showToast('Offline · changes save on this phone');
        return { ...prev, online: false };
      }
      return { ...prev, online: nextOnline };
    });
  };

  // Toggle between Light Theme and High-Contrast Dark Mode
  const handleToggleTheme = (explicitTheme?: 'light' | 'dark') => {
    vibrate();
    const current = state.theme || 'light';
    const nextTheme =
      explicitTheme ?? (current === 'dark' ? 'light' : 'dark');
    setState((prev) => ({ ...prev, theme: nextTheme }));
    showToast(
      nextTheme === 'dark'
        ? 'High-contrast dark mode enabled'
        : 'Warm paper light theme enabled'
    );
  };

  // Sell 1 item from stock
  const handleSellItem = (
    itemId: number,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    vibrate();
    const targetItem = state.items.find((i) => i.id === itemId);
    if (!targetItem) return;
    if (targetItem.qty <= 0) {
      showToast('Out of stock. Restock first');
      return;
    }

    if (e) {
      spawnFlyingChip(
        e.clientX,
        e.clientY - 20,
        `+${formatRand0(targetItem.price)}`
      );
    }

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      productId: targetItem.id,
      productName: targetItem.name,
      type: 'cash_sale',
      amount: targetItem.price,
      quantity: 1,
      date: 'Just now',
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
      today: {
        ...prev.today,
        cash: prev.today.cash + targetItem.price,
      },
      items: prev.items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              qty: it.qty - 1,
              soldDaily: it.soldDaily + 1,
              soldWeekly: it.soldWeekly + 1,
              soldMonthly: it.soldMonthly + 1,
            }
          : it
      ),
      transactions: [newTx, ...prev.transactions],
    }));
    showToast('Sold 1 item');
  };

  // Restock item
  const handleRestockItem = (itemId: number) => {
    vibrate();
    setState((prev) => ({
      ...prev,
      syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
      items: prev.items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              qty: Math.min(
                it.maxQty,
                it.qty + Math.max(1, Math.round(it.maxQty / 3))
              ),
            }
          : it
      ),
    }));
    showToast('Restocked');
  };

  // Add new product item
  const handleAddNewItem = (newItem: {
    name: string;
    price: number;
    category: ProductItem['category'];
    barcode: string;
    qty: number;
  }) => {
    vibrate();
    setState((prev) => {
      const nextId = prev.items.length;
      const created: ProductItem = {
        id: nextId,
        name: newItem.name,
        category: newItem.category,
        qty: newItem.qty,
        maxQty: Math.max(20, newItem.qty * 2),
        price: newItem.price,
        costPrice: Math.round(newItem.price * 0.76),
        barcode: newItem.barcode,
        soldDaily: 1,
        soldWeekly: 4,
        soldMonthly: 12,
      };
      return {
        ...prev,
        syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
        items: [created, ...prev.items],
      };
    });
    showToast('Added');
  };

  // Record credit sale or payment for a customer
  const handleRecordCustomerTx = (
    customerId: number,
    type: 'credit_sale' | 'payment',
    amount: number,
    productNote: string
  ) => {
    vibrate();
    const nowStr = 'Just now';
    const txId = `tx-${Date.now()}`;

    setState((prev) => {
      const targetCust = prev.customers.find((c) => c.id === customerId);
      if (!targetCust) return prev;

      const actualAmount =
        type === 'payment' ? Math.min(amount, targetCust.owed) : amount;

      const newTx: TransactionRecord = {
        id: txId,
        customerId,
        customerName: targetCust.name,
        productName: productNote,
        type,
        amount: actualAmount,
        date: nowStr,
        timestamp: Date.now(),
        notes: productNote,
      };

      const updatedCustomers = prev.customers.map((c) => {
        if (c.id !== customerId) return c;
        if (type === 'credit_sale') {
          const nextOwed = c.owed + actualAmount;
          return {
            ...c,
            owed: nextOwed,
            daysOverdue: c.owed === 0 ? 1 : c.daysOverdue,
            totalCreditExtended: c.totalCreditExtended + actualAmount,
            purchaseCount: c.purchaseCount + 1,
            lastPurchaseDate: 'Today',
            history: [newTx, ...c.history],
          };
        } else {
          const nextOwed = Math.max(0, c.owed - actualAmount);
          return {
            ...c,
            owed: nextOwed,
            daysOverdue: nextOwed === 0 ? 0 : c.daysOverdue,
            totalPaid: c.totalPaid + actualAmount,
            lastPurchaseDate: 'Today',
            history: [newTx, ...c.history],
          };
        }
      });

      return {
        ...prev,
        syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
        today: {
          cash:
            type === 'payment'
              ? prev.today.cash + actualAmount
              : prev.today.cash,
          credit:
            type === 'credit_sale'
              ? prev.today.credit + actualAmount
              : prev.today.credit,
        },
        month: {
          given:
            type === 'credit_sale'
              ? prev.month.given + actualAmount
              : prev.month.given,
          collected:
            type === 'payment'
              ? prev.month.collected + actualAmount
              : prev.month.collected,
        },
        customers: updatedCustomers,
        transactions: [newTx, ...prev.transactions],
      };
    });

    showToast(type === 'credit_sale' ? 'Credit added' : 'Payment recorded');
  };

  // Send single SMS reminder
  const handleSendCustomerSMS = (
    customer: Customer,
    lang: LanguageCode,
    tone: SMSTone,
    message: string
  ) => {
    vibrate();
    const tx: TransactionRecord = {
      id: `sms-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      type: 'sms_reminder',
      amount: customer.owed,
      date: 'Just now',
      timestamp: Date.now(),
      langUsed: lang,
      notes: `${LANGUAGE_NAMES[lang].label} (${tone}): "${message.slice(
        0,
        48
      )}..."`,
    };

    setState((prev) => ({
      ...prev,
      syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
      customers: prev.customers.map((c) =>
        c.id === customer.id
          ? { ...c, preferredLang: lang, history: [tx, ...c.history] }
          : c
      ),
      transactions: [tx, ...prev.transactions],
    }));

    showToast(
      state.online
        ? `SMS sent: 1 (${LANGUAGE_NAMES[lang].label})`
        : `SMS queued: 1 · sends when online`
    );
  };

  // Send bulk SMS reminders to all overdue accounts
  const handleSendBulkLateSMS = () => {
    vibrate();
    const lateCustomers = state.customers.filter(
      (c) => c.owed > 0 && c.daysOverdue >= 7
    );
    if (lateCustomers.length === 0) {
      showToast('No late accounts');
      return;
    }

    const nowTs = Date.now();
    const newTxList: TransactionRecord[] = lateCustomers.map((c, idx) => ({
      id: `sms-bulk-${nowTs}-${idx}`,
      customerId: c.id,
      customerName: c.name,
      type: 'sms_reminder',
      amount: c.owed,
      date: 'Just now',
      timestamp: nowTs,
      langUsed: assistantSmsLang,
      notes: `Bulk ${LANGUAGE_NAMES[assistantSmsLang].label} (${assistantSmsTone}) reminder`,
    }));

    setState((prev) => ({
      ...prev,
      syncQueue: prev.online
        ? prev.syncQueue
        : prev.syncQueue + lateCustomers.length,
      customers: prev.customers.map((c) => {
        const matchingTx = newTxList.find((tx) => tx.customerId === c.id);
        return matchingTx ? { ...c, history: [matchingTx, ...c.history] } : c;
      }),
      transactions: [...newTxList, ...prev.transactions],
    }));

    showToast(
      state.online
        ? `SMS sent: ${lateCustomers.length}`
        : `SMS queued: ${lateCustomers.length} · sends when online`
    );
  };

  // Save edited or new customer profile (including custom color-coded tags)
  const handleSaveCustomer = (
    data: {
      id?: number;
      name: string;
      phone: string;
      category: CustomerCategory;
      preferredLang: LanguageCode;
      notes: string;
      tags?: CustomerTag[];
    },
    initialCredit = 0
  ) => {
    vibrate();
    const avatarColors = [
      '#DDF24E',
      '#F2B8B5',
      '#BDEBE3',
      '#F5D77A',
      '#D0E2FF',
      '#C5F0A4',
    ];

    if (data.id !== undefined) {
      setState((prev) => ({
        ...prev,
        syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
        customers: prev.customers.map((c) =>
          c.id === data.id
            ? {
                ...c,
                name: data.name,
                phone: data.phone,
                category: data.category,
                preferredLang: data.preferredLang,
                notes: data.notes,
                tags: data.tags !== undefined ? data.tags : c.tags,
              }
            : c
        ),
      }));
      showToast('Customer profile updated');
    } else {
      const newId = state.customers.length;
      setState((prev) => {
        const initHistory: TransactionRecord[] =
          initialCredit > 0
            ? [
                {
                  id: `tx-init-${Date.now()}`,
                  customerId: newId,
                  customerName: data.name,
                  type: 'credit_sale',
                  amount: initialCredit,
                  productName: 'Opening credit balance',
                  date: 'Today',
                  timestamp: Date.now(),
                },
              ]
            : [];
        const newCustomer: Customer = {
          id: newId,
          name: data.name,
          phone: data.phone,
          category: data.category,
          owed: initialCredit,
          daysOverdue: initialCredit > 0 ? 1 : 0,
          totalCreditExtended: initialCredit,
          totalPaid: 0,
          purchaseCount: initialCredit > 0 ? 1 : 0,
          avatarColor: avatarColors[newId % avatarColors.length],
          preferredLang: data.preferredLang,
          lastPurchaseDate: initialCredit > 0 ? 'Today' : 'New account',
          notes: data.notes,
          tags: data.tags || [
            { id: `tag-new-${Date.now()}`, label: 'New', color: '#74C2F6' },
          ],
          history: initHistory,
        };
        return {
          ...prev,
          syncQueue: prev.online ? prev.syncQueue : prev.syncQueue + 1,
          today: {
            ...prev.today,
            credit: prev.today.credit + initialCredit,
          },
          month: {
            ...prev.month,
            given: prev.month.given + initialCredit,
          },
          customers: [newCustomer, ...prev.customers],
          transactions: [...initHistory, ...prev.transactions],
        };
      });
      setCreatingCustomer(false);
      setProfileCustomerId(newId);
      setActiveTab('credit');
      showToast('Added');
    }
  };

  const handleResetDemoData = () => {
    vibrate();
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
    setProfileCustomerId(null);
    showToast('Demo data restored');
  };

  const handleOpenLegalSection = (
    section: 'privacy' | 'terms' | 'sms' | 'rights' = 'privacy'
  ) => {
    vibrate();
    setLegalInitialSection(section);
    setLegalModalOpen(true);
  };

  const handleAcceptLegalTerms = () => {
    vibrate();
    const stamp = `${new Date().toISOString().slice(0, 10)} · v1.4 (POPIA & NCA Compliant)`;
    setState((prev) => ({
      ...prev,
      legalAcceptedAt: stamp,
    }));
    showToast('Legal & POPIA terms accepted');
  };

  const handleExportDataJson = () => {
    vibrate();
    try {
      const payload = JSON.stringify(state, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bahiapp-ledger-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Shop ledger exported (.JSON)');
    } catch {
      showToast('Export failed');
    }
  };

  const handleWipeAllData = () => {
    vibrate();
    localStorage.removeItem(STORAGE_KEY);
    setState({
      ...INITIAL_STATE,
      today: { cash: 0, credit: 0 },
      month: { given: 0, collected: 0 },
      customers: [],
      transactions: [],
    });
    setProfileCustomerId(null);
    showToast('All local customer & transaction data wiped');
  };

  // Derived metrics
  const todayTotal = state.today.cash + state.today.credit;
  const monthCollectedPct = Math.min(
    100,
    Math.round((state.month.collected / Math.max(1, state.month.given)) * 100)
  );
  const outstandingTotal = Math.max(
    0,
    state.customers.reduce((acc, c) => acc + c.owed, 0)
  );
  const lateAccounts = state.customers.filter(
    (c) => c.owed > 0 && c.daysOverdue >= 7
  );
  const lowStockItems = [...state.items]
    .sort((a, b) => a.qty / a.maxQty - b.qty / b.maxQty)
    .slice(0, 3);

  const filteredStock = state.items.filter((i) => {
    const matchesSearch = i.name
      .toLowerCase()
      .includes(stockQuery.trim().toLowerCase());
    const matchesCat =
      stockCategory === 'All' || i.category === stockCategory;
    return matchesSearch && matchesCat;
  });

  const filteredCustomers = state.customers.filter((c) => {
    const q = crmQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.notes && c.notes.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some((t) => t.label.toLowerCase().includes(q)));
    if (!matchesSearch) return false;
    if (crmCategoryFilter === 'all') return true;
    if (crmCategoryFilter === 'late') return c.owed > 0 && c.daysOverdue >= 7;
    return c.category === crmCategoryFilter;
  });

  const topCustomersList = [...state.customers]
    .sort((a, b) =>
      topCustomerMetric === 'credit'
        ? b.totalCreditExtended - a.totalCreditExtended
        : b.purchaseCount - a.purchaseCount
    )
    .slice(0, 4);

  const activeProfileCustomer =
    profileCustomerId !== null
      ? state.customers.find((c) => c.id === profileCustomerId) || null
      : null;

  const sampleLateCustomer = lateAccounts[0] || state.customers[0];
  const assistantSmsPreview = sampleLateCustomer
    ? generateSMSText({
        customerName: sampleLateCustomer.name,
        shopName: state.shopName,
        amountOwed: sampleLateCustomer.owed || 320,
        daysOverdue: sampleLateCustomer.daysOverdue || 7,
        lang: assistantSmsLang,
        tone: assistantSmsTone,
      })
    : '';

  const navItems: Array<{ id: TabId; label: string; icon: React.ElementType }> =
    [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'stock', label: tt('Stock', state.lang), icon: Package },
      { id: 'credit', label: tt('Customers', state.lang), icon: BookOpen },
      { id: 'reports', label: tt('Reports', state.lang), icon: BarChart3 },
      { id: 'brand', label: 'Brand', icon: Sparkles },
    ];

  return (
    <div className="min-h-screen relative pb-32">
      {/* Layered Drifting Aurora + Tactile Ledger Dot-Grid Background */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <i className="absolute w-[70vmax] h-[70vmax] rounded-full bg-[#BDEBE3] -left-[20vmax] -top-[25vmax] blur-[75px] opacity-55 animate-aurora-1" />
        <i className="absolute w-[70vmax] h-[70vmax] rounded-full bg-[#E6F58B] -right-[30vmax] top-[10vh] blur-[75px] opacity-55 animate-aurora-2" />
        <i className="absolute w-[70vmax] h-[70vmax] rounded-full bg-[#F6C4C0] -left-[10vmax] -bottom-[35vmax] blur-[75px] opacity-55 animate-aurora-3" />
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              'radial-gradient(var(--ink) 0.85px, transparent 0.85px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      {/* Main Responsive Container */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6">
        {/* Simplified Header: Brand Emblem + Greeting + Single Settings Trigger */}
        <header className="pt-5 pb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, rotate: -3 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setProfileCustomerId(null);
                setActiveTab('home');
              }}
              className="w-12 h-12 rounded-[18px] bg-[#050709] grid place-items-center shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)] border border-white/10 shrink-0 overflow-hidden"
              aria-label="BahiApp Home"
            >
              <BahiBrandLogo size={40} />
            </motion.button>
            <div className="min-w-0">
              <h1 className="font-fraunces text-2xl sm:text-3xl font-medium tracking-tight text-[#13222B] truncate">
                {tt('Hello', state.lang)}, {state.ownerName}
              </h1>
              <small className="text-xs text-[#78808A] flex items-center gap-1.5 truncate mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    state.online ? 'bg-[#5BD16B]' : 'bg-[#F4C84E]'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{state.shopName}</span>
              </small>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.06, rotate: 12 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              vibrate();
              setSettingsOpen(true);
            }}
            className="relative w-11 h-11 bg-white rounded-full text-[#13222B] shadow-[0_8px_24px_-10px_rgba(19,34,43,0.45)] border border-[#ECE8DE] grid place-items-center shrink-0"
            aria-label="Open Shop Settings"
          >
            <Settings className="w-5 h-5 text-[#1F5F63]" />
            {!state.online && state.syncQueue > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DDF24E] text-[#13222B] font-mono text-[10px] font-bold grid place-items-center">
                {state.syncQueue}
              </span>
            )}
          </motion.button>
        </header>

        {/* VIEW 1: HOME TAB */}
        {activeTab === 'home' && (
          <motion.main
            key="tab-home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            {/* Left / Primary Column */}
            <div className="lg:col-span-7 space-y-4">
              {/* Today's Takings Hero Card */}
              <motion.section
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm text-[#78808A]">
                      {tt('Today’s takings', state.lang)}
                    </div>
                    <div className="text-4xl sm:text-5xl text-[#13222B] my-1.5">
                      <DotMatrixCounter value={todayTotal} decimals={2} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#78808A]">
                      <b className="w-5 h-5 rounded-full bg-[#4CB944] text-white text-[11px] grid place-items-center shrink-0">
                        ↑
                      </b>
                      <span>{tt('R410 more than yesterday', state.lang)}</span>
                    </div>
                  </div>
                  <PixelBlockChart />
                </div>

                {/* Spacious 3-Metric Pills */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-5 border-t border-[#ECE8DE]">
                  <div className="bg-[#F4F2EC] rounded-2xl sm:rounded-3xl p-3">
                    <small className="text-[11px] sm:text-xs text-[#78808A] block truncate">
                      {tt('Cash', state.lang)}
                    </small>
                    <div className="font-mono font-bold tabular-nums text-base sm:text-xl text-[#13222B] mt-0.5">
                      {formatRand0(state.today.cash)}
                    </div>
                  </div>
                  <div className="bg-[#F4F2EC] rounded-2xl sm:rounded-3xl p-3">
                    <small className="text-[11px] sm:text-xs text-[#78808A] block truncate">
                      {tt('On credit', state.lang)}
                    </small>
                    <div className="font-mono font-bold tabular-nums text-base sm:text-xl text-[#13222B] mt-0.5">
                      {formatRand0(state.today.credit)}
                    </div>
                  </div>
                  <div className="bg-[#F4F2EC] rounded-2xl sm:rounded-3xl p-3">
                    <small className="text-[11px] sm:text-xs text-[#78808A] block truncate">
                      {tt('Profit est.', state.lang)}
                    </small>
                    <div className="font-mono font-bold tabular-nums text-base sm:text-xl text-[#1F5F63] mt-0.5">
                      {formatRand0(todayTotal * 0.21)}
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* This Week Wave Card */}
              <motion.section
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <div className="text-sm text-[#78808A]">
                  {tt('This week', state.lang)}
                </div>
                <div className="text-4xl sm:text-5xl text-[#13222B] my-1.5">
                  <DotMatrixCounter
                    value={18800 + todayTotal}
                    decimals={2}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#78808A]">
                  <b className="w-5 h-5 rounded-full bg-[#4CB944] text-white text-[11px] grid place-items-center shrink-0">
                    ↑
                  </b>
                  <span>{tt('Sales up 12% on last week', state.lang)}</span>
                </div>
                <SalesWaveChart
                  values={[2380, 3120, 2760, 3480, 2910, 4150, todayTotal]}
                  labels={['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today']}
                />
              </motion.section>

              {/* Credit Owed Spectrum Card */}
              <motion.section
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <div className="text-sm text-[#78808A]">
                  {tt('Credit owed to you', state.lang)}
                </div>
                <div className="text-4xl sm:text-5xl text-[#13222B] my-1.5">
                  <DotMatrixCounter value={outstandingTotal} decimals={2} />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#78808A]">
                  <b className="w-5 h-5 rounded-full bg-[#4CB944] text-white text-[11px] grid place-items-center shrink-0">
                    ↑
                  </b>
                  <span>
                    {tt(
                      `Of ${formatRand0(state.month.given)} given this month`,
                      state.lang
                    )}
                  </span>
                </div>

                {/* Spectrum Progress Bar with Collected % Bubble */}
                <div className="h-3.5 rounded-full bg-[#F4F2EC] relative mt-10 mb-5">
                  <motion.i
                    initial={{ width: 0 }}
                    animate={{ width: `${monthCollectedPct}%` }}
                    transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                    className="absolute inset-y-0 left-0 rounded-full block"
                    style={{
                      background:
                        'linear-gradient(90deg, #DDF24E, #74C2F6 30%, #F5B83D 62%, #E8453C)',
                    }}
                  />
                  <motion.span
                    initial={{ left: '0%' }}
                    animate={{ left: `${monthCollectedPct}%` }}
                    transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                    className="absolute -top-8 -translate-x-1/2 bg-[#0B0B0C] text-white rounded-full px-3 py-0.5 text-xs font-mono font-semibold tabular-nums whitespace-nowrap shadow-sm"
                  >
                    {tt(`Collected ${monthCollectedPct}%`, state.lang)}
                  </motion.span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#F4F2EC] rounded-2xl p-3">
                    <div className="font-mono font-bold tabular-nums text-lg sm:text-xl text-[#13222B]">
                      {formatRand0(state.month.collected)}
                    </div>
                    <small className="text-xs text-[#78808A] block">
                      {tt('Collected', state.lang)}
                    </small>
                  </div>
                  <div className="bg-[#F4F2EC] rounded-2xl p-3">
                    <div className="font-mono font-bold tabular-nums text-lg sm:text-xl text-[#E8453C]">
                      {formatRand0(outstandingTotal)}
                    </div>
                    <small className="text-xs text-[#78808A] block">
                      {tt('Outstanding', state.lang)}
                    </small>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Right / Secondary Column */}
            <div className="lg:col-span-5 space-y-4">
              {/* Multi-Language SMS Reminder Assistant Card */}
              <motion.section
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.05,
                  type: 'spring',
                  stiffness: 280,
                  damping: 24,
                }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.06 }}
                      className="w-12 h-12 rounded-2xl grid place-items-center text-lg text-[#13222B] shrink-0 shadow-sm"
                      style={{
                        background:
                          'linear-gradient(135deg, #DDF24E 0%, #74C2F6 55%, #BDEBE3 100%)',
                      }}
                    >
                      ✦
                    </motion.div>
                    <div className="min-w-0">
                      <div className="text-xs text-[#78808A]">
                        {tt('Reminder assistant', state.lang)}
                      </div>
                      <b className="font-fraunces font-medium text-lg text-[#13222B] block leading-snug">
                        {tt(
                          `${lateAccounts.length} accounts are a week late`,
                          state.lang
                        )}
                      </b>
                    </div>
                  </div>
                  <ReminderSignalIllustration />
                </div>

                {/* Multi-language selector for SMS reminders (Spacious on mobile) */}
                <div className="bg-[#F4F2EC] rounded-3xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#13222B]">
                      SMS Reminder Language
                    </span>
                    <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-white p-1 rounded-full">
                      {(['en', 'zu', 'st'] as LanguageCode[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setAssistantSmsLang(l)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors text-center ${
                            assistantSmsLang === l
                              ? 'bg-[#13222B] text-white'
                              : 'text-[#78808A] hover:text-[#13222B]'
                          }`}
                        >
                          {LANGUAGE_NAMES[l].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#78808A] leading-relaxed">
                    “{assistantSmsPreview}”
                  </p>
                </div>

                <p className="text-xs text-[#78808A]">
                  {lateAccounts.length > 0
                    ? tt(
                        `${formatRand0(
                          lateAccounts.reduce((a, c) => a + c.owed, 0)
                        )} is waiting on late accounts`,
                        state.lang
                      )
                    : tt('Everyone is up to date.', state.lang)}
                </p>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendBulkLateSMS}
                  className="w-full min-h-[52px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-sm shadow-[0_14px_30px_-14px_rgba(130,160,0,0.8)] flex items-center justify-center gap-2 px-4"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {tt(
                      `Send ${lateAccounts.length} SMS reminders`,
                      state.lang
                    )}{' '}
                    ({LANGUAGE_NAMES[assistantSmsLang].label})
                  </span>
                </motion.button>
              </motion.section>

              {/* Regulars Grid (Spacious cards, never squashed on mobile) */}
              <motion.section
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                    {tt('Regulars', state.lang)}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileCustomerId(null);
                      setActiveTab('credit');
                    }}
                    className="text-xs font-medium text-[#1F5F63] hover:underline"
                  >
                    {tt('View all', state.lang)} →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
                  {state.customers.slice(0, 4).map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      whileHover={{ y: -2, scale: 1.01 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => openCustomerProfile(c.id)}
                      className="flex items-center justify-between gap-3 bg-[#F4F2EC] hover:bg-[#ECE8DE] rounded-[26px] p-3 text-left transition-colors min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <i
                          className="w-11 h-11 rounded-full grid place-items-center font-fraunces font-semibold text-base not-italic text-[#13222B] shrink-0 shadow-xs"
                          style={{ backgroundColor: c.avatarColor }}
                        >
                          {c.name[0]}
                        </i>
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-[#13222B] truncate">
                            {c.name}
                          </span>
                          <small className="text-xs font-mono font-bold tabular-nums text-[#78808A] block">
                            {c.owed > 0 ? formatRand0(c.owed) : 'Settled'}
                          </small>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#78808A] shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* Next Stock Order Card with Spaza Archway Illustration */}
              <motion.section
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <SpazaArchIllustration />
                  <div>
                    <div className="text-xs text-[#78808A]">
                      {tt('Next stock order', state.lang)}
                    </div>
                    <div className="font-mono font-extrabold tabular-nums text-3xl sm:text-4xl text-[#13222B] my-0.5">
                      OCT 23
                    </div>
                    <div
                      className="flex items-center gap-2 mt-1.5"
                      aria-hidden="true"
                    >
                      {[0, 1, 2, 3, 4].map((d) => (
                        <i
                          key={d}
                          className={`w-3 h-3 rounded-full border-[1.5px] block ${
                            d === 4
                              ? 'bg-[#13222B] border-[#13222B]'
                              : 'border-[#78808A]'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-mono tabular-nums text-[#78808A] ml-1">
                        {tt('in 4 days', state.lang)}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveTab('stock')}
                  className="min-h-[42px] px-4 py-2 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] self-start sm:self-center shrink-0"
                >
                  Check low stock →
                </motion.button>
              </motion.section>

              {/* Running Low Stock Card (Un-squashed responsive rows) */}
              <motion.section
                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                    {tt('Running low', state.lang)}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stock')}
                    className="text-xs font-medium text-[#1F5F63] hover:underline"
                  >
                    {tt('View all', state.lang)} →
                  </button>
                </div>
                <div className="space-y-2.5">
                  {lowStockItems.map((item) => {
                    const pct = (item.qty / item.maxQty) * 100;
                    const color =
                      pct < 30 ? '#E8453C' : pct < 60 ? '#F4C84E' : '#74C2F6';
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F2EC] rounded-[28px] p-3.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusRing
                            percent={pct}
                            color={color}
                            label={String(item.qty)}
                          />
                          <div className="min-w-0">
                            <b className="text-sm font-medium text-[#13222B] block leading-snug">
                              {item.name}
                            </b>
                            <small className="text-xs text-[#78808A]">
                              {item.qty > 0
                                ? tt(
                                    `${formatRand0(item.price)} each · ${
                                      item.qty
                                    } left`,
                                    state.lang
                                  )
                                : tt(
                                    `${formatRand0(
                                      item.price
                                    )} each · Out of stock`,
                                    state.lang
                                  )}
                            </small>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => handleSellItem(item.id, e)}
                            className="min-h-[40px] px-4 rounded-full bg-[#13222B] text-white text-xs font-medium text-center"
                          >
                            Sell ·{' '}
                            <span className="font-mono tabular-nums">
                              {formatRand0(item.price)}
                            </span>
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleRestockItem(item.id)}
                            className="min-h-[40px] px-3.5 rounded-full bg-white text-xs font-mono font-semibold tabular-nums text-[#13222B] text-center"
                          >
                            +{Math.round(item.maxQty / 3)}
                          </motion.button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            </div>
          </motion.main>
        )}

        {/* VIEW 2: STOCK & BARCODE SCANNER TAB */}
        {activeTab === 'stock' && (
          <motion.main
            key="tab-stock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            <div className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="font-fraunces text-2xl font-medium text-[#13222B]">
                    {tt('Stock', state.lang)} & Till Inventory
                  </h2>
                  <p className="text-xs text-[#78808A]">
                    Tap Sell to ring up cash sales or Scan barcode with camera
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setScannerOpen(true)}
                  className="min-h-[44px] px-4 rounded-full bg-[#13222B] text-white text-xs font-medium flex items-center gap-2"
                >
                  <ScanBarcode className="w-4 h-4 text-[#DDF24E]" />
                  <span>{tt('Scan', state.lang)}</span>
                </motion.button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex rounded-2xl bg-[#F4F2EC] overflow-hidden mt-4">
                <span className="bg-[#0B0B0C] w-12 grid place-items-center text-white shrink-0">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                  placeholder={tt('Search items', state.lang)}
                  className="flex-1 bg-transparent px-4 py-3.5 text-sm text-[#13222B] focus:outline-none min-w-0"
                />
                {stockQuery && (
                  <button
                    type="button"
                    onClick={() => setStockQuery('')}
                    className="px-3 text-[#78808A] hover:text-[#13222B]"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                {(
                  ['All', 'Staples', 'Pantry', 'Fresh', 'Household'] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setStockCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      stockCategory === cat
                        ? 'bg-[#13222B] text-white'
                        : 'bg-[#F4F2EC] text-[#78808A] hover:text-[#13222B]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Stock Items List (Spacious mobile-first cards) */}
              <div className="space-y-3 mt-5">
                {filteredStock.length === 0 ? (
                  <p className="text-sm text-[#78808A] py-8 text-center">
                    {tt('No items match. Try another name.', state.lang)}
                  </p>
                ) : (
                  filteredStock.map((item) => {
                    const pct = (item.qty / item.maxQty) * 100;
                    const color =
                      pct < 30 ? '#E8453C' : pct < 60 ? '#F4C84E' : '#74C2F6';
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        whileHover={{ y: -1 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-[#F4F2EC] rounded-[30px] p-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <StatusRing
                            percent={pct}
                            color={color}
                            label={String(item.qty)}
                          />
                          <div className="min-w-0">
                            <b className="text-base font-medium text-[#13222B] block leading-snug">
                              {item.name}
                            </b>
                            <small className="text-xs text-[#78808A] block mt-0.5">
                              {item.qty > 0
                                ? tt(
                                    `${formatRand0(item.price)} each · ${
                                      item.qty
                                    } left`,
                                    state.lang
                                  )
                                : tt(
                                    `${formatRand0(
                                      item.price
                                    )} each · Out of stock`,
                                    state.lang
                                  )}{' '}
                              · {item.category}
                            </small>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.93 }}
                            onClick={(e) => handleSellItem(item.id, e)}
                            className="min-h-[42px] px-4 rounded-full bg-[#0B0B0C] text-white text-xs font-medium text-center"
                          >
                            Sell (
                            <span className="font-mono tabular-nums">
                              {formatRand0(item.price)}
                            </span>
                            )
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.93 }}
                            onClick={() => handleRestockItem(item.id)}
                            className="min-h-[42px] px-4 rounded-full bg-white border border-[#ECE8DE] text-[#13222B] text-xs font-mono font-semibold tabular-nums text-center"
                          >
                            Restock +{Math.round(item.maxQty / 3)}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.main>
        )}

        {/* VIEW 3: CREDIT BOOK, CRM DIRECTORY & DETAILED CUSTOMER PROFILE SCREEN */}
        {activeTab === 'credit' && (
          <motion.main
            key="tab-credit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            {activeProfileCustomer ? (
              <CustomerProfileScreen
                customer={activeProfileCustomer}
                shopName={state.shopName}
                appLang={state.lang}
                initialEditing={profileInitialEdit}
                onBack={() => {
                  setProfileInitialEdit(false);
                  setProfileCustomerId(null);
                }}
                onRecordTransaction={handleRecordCustomerTx}
                onSendSMS={handleSendCustomerSMS}
                onUpdateCustomer={(data) => handleSaveCustomer(data)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column: Credit Half-Gauge + Top Customers Leaderboard */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Half-Circle Credit Gauge Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                        {tt('Credit book', state.lang)}
                      </h2>
                      <span className="text-xs font-mono tabular-nums text-[#78808A]">
                        {state.customers.length} accounts
                      </span>
                    </div>

                    <CreditHalfGauge
                      percent={monthCollectedPct}
                      collectedLabel={tt('Collected', state.lang)}
                      collectedAmount={formatRand0(state.month.collected)}
                    />

                    <div className="bg-[#F4F2EC] rounded-[26px] p-4 mt-4 flex items-center justify-between">
                      <div>
                        <b className="text-sm font-medium text-[#13222B] block">
                          {tt(`${monthCollectedPct}% paid back`, state.lang)}
                        </b>
                        <small className="text-xs text-[#78808A]">
                          {tt(
                            `${formatRand0(outstandingTotal)} still with ${
                              state.customers.filter((c) => c.owed > 0).length
                            } customers`,
                            state.lang
                          )}
                        </small>
                      </div>
                    </div>
                  </motion.div>

                  {/* Top Customers Leaderboard Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#1F5F63]" />
                        <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                          {tt('Top customers', state.lang)}
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-full w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setTopCustomerMetric('credit')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors text-center ${
                            topCustomerMetric === 'credit'
                              ? 'bg-[#13222B] text-white'
                              : 'text-[#78808A] hover:text-[#13222B]'
                          }`}
                        >
                          {tt('By credit', state.lang)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopCustomerMetric('frequency')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors text-center ${
                            topCustomerMetric === 'frequency'
                              ? 'bg-[#13222B] text-white'
                              : 'text-[#78808A] hover:text-[#13222B]'
                          }`}
                        >
                          {tt('By frequency', state.lang)}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 mt-4">
                      {topCustomersList.map((cust, i) => (
                        <motion.button
                          key={cust.id}
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => openCustomerProfile(cust.id)}
                          className="w-full flex items-center justify-between gap-3 bg-[#F4F2EC] hover:bg-[#ECE8DE] rounded-[24px] p-3.5 text-left transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="w-10 h-10 rounded-full grid place-items-center font-mono font-bold tabular-nums text-xs text-[#13222B] shrink-0"
                              style={{ backgroundColor: cust.avatarColor }}
                            >
                              0{i + 1}
                            </span>
                            <div className="min-w-0">
                              <b className="text-sm font-medium text-[#13222B] block truncate">
                                {cust.name}
                              </b>
                              <small className="text-xs text-[#78808A] capitalize">
                                {cust.category} ·{' '}
                                <span className="font-mono tabular-nums">
                                  {cust.purchaseCount}
                                </span>{' '}
                                purchases
                              </small>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <b className="font-mono font-extrabold tabular-nums text-base text-[#13222B] block">
                              {topCustomerMetric === 'credit'
                                ? formatRand0(cust.totalCreditExtended)
                                : `${cust.purchaseCount}x`}
                            </b>
                            <small className="text-[11px] text-[#78808A]">
                              {topCustomerMetric === 'credit'
                                ? 'Total credit'
                                : 'Total visits'}
                            </small>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Full CRM Directory with Customer Search, Category Filter & Add Customer */}
                <div className="lg:col-span-7">
                  <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h2 className="font-fraunces text-2xl font-medium text-[#13222B]">
                          {tt('Customers', state.lang)} & CRM
                        </h2>
                        <p className="text-xs text-[#78808A]">
                          Select any customer to open their profile, purchase
                          history & contact form
                        </p>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setCreatingCustomer(true)}
                        className="min-h-[44px] px-4 rounded-full bg-[#13222B] text-white text-xs font-medium flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-[#DDF24E]" />
                        <span>{tt('Add customer', state.lang)}</span>
                      </motion.button>
                    </div>

                    {/* Customer Search Bar with Instant Clear */}
                    <div className="flex rounded-2xl bg-[#F4F2EC] overflow-hidden mt-4">
                      <span className="bg-[#0B0B0C] w-12 grid place-items-center text-white shrink-0">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={crmQuery}
                        onChange={(e) => setCrmQuery(e.target.value)}
                        placeholder="Search customer by name, phone, or note..."
                        aria-label="Search customers"
                        className="flex-1 bg-transparent px-4 py-3.5 text-sm text-[#13222B] focus:outline-none min-w-0"
                      />
                      {crmQuery && (
                        <button
                          type="button"
                          onClick={() => setCrmQuery('')}
                          className="px-3 text-[#78808A] hover:text-[#13222B]"
                          aria-label="Clear customer search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap mt-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(
                          [
                            { id: 'all', label: 'All' },
                            { id: 'regular', label: 'Regular' },
                            { id: 'vip', label: 'VIP' },
                            { id: 'new', label: 'New' },
                            { id: 'late', label: 'Late (7d+)' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCrmCategoryFilter(tab.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              crmCategoryFilter === tab.id
                                ? 'bg-[#13222B] text-white'
                                : 'bg-[#F4F2EC] text-[#78808A] hover:text-[#13222B]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#78808A] bg-[#F4F2EC] px-2.5 py-1 rounded-full">
                          ↔ Swipe row to edit or delete
                        </span>
                        <span className="text-xs font-mono tabular-nums text-[#78808A]">
                          {filteredCustomers.length} shown
                        </span>
                      </div>
                    </div>

                    {/* Swipeable Customer Rows (Swipe Right = Quick Edit, Swipe Left = Edit / Delete) */}
                    <div className="space-y-2.5 mt-5">
                      {filteredCustomers.length === 0 ? (
                        <div className="text-center py-8 space-y-2">
                          <Users className="w-7 h-7 text-[#78808A] mx-auto" />
                          <p className="text-sm text-[#78808A]">
                            No customers match “{crmQuery}”.
                          </p>
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          {filteredCustomers.map((c) => (
                            <SwipeableCustomerRow
                              key={c.id}
                              customer={c}
                              appLang={state.lang}
                              onOpenProfile={(id) =>
                                openCustomerProfile(id, false)
                              }
                              onSwipeEdit={(cust) => {
                                showToast(`Editing ${cust.name}`);
                                openCustomerProfile(cust.id, true);
                              }}
                              onSwipeDelete={handleDeleteCustomer}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.main>
        )}

        {/* VIEW 4: REPORTING & ANALYTICS DASHBOARD */}
        {activeTab === 'reports' && (
          <motion.main
            key="tab-reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <ReportsDashboard
              state={state}
              appLang={state.lang}
              onQuickSell={handleSellItem}
            />
          </motion.main>
        )}

        {/* VIEW 5: BRAND, 3D SHOWCASE & PRINTABLE WINDOW POSTER */}
        {activeTab === 'brand' && (
          <motion.main
            key="tab-brand"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            <div className="lg:col-span-6 space-y-4">
              {/* Brand Story Card */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[22px] bg-[#050709] grid place-items-center shadow-md shrink-0 border border-white/10">
                    <BahiBrandLogo size={54} />
                  </div>
                  <div>
                    <b className="font-fraunces text-3xl sm:text-4xl font-medium tracking-tight text-[#13222B] block">
                      BahiApp
                    </b>
                    <span className="text-xs text-[#78808A]">
                      Every sale, in the book.
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[#78808A] mt-4 leading-relaxed">
                  Bahi is the traditional shopkeeper’s ledger (bahi-khata), the
                  book credit has always lived in. BahiApp puts that book on
                  every spaza and duka phone, offline. The reworked mark uses
                  layered translucent glass pages, a frosted-glass spine, and a
                  smooth multi-stop spectrum mesh gradient glowing from stocked
                  sky blue through lime to overdue coral.
                </p>
                <div className="mt-4">
                  <BahiIconSuiteShowcase />
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowOnboarding(true)}
                  className="mt-4 px-4 py-2.5 rounded-full bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay Interactive 3D Onboarding</span>
                </motion.button>
              </motion.div>

              {/* Interactive 3D Shape Language Card */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                  3D & Shape language
                </h2>
                <div
                  className="relative h-56 rounded-[30px] overflow-hidden mt-3 transition-colors"
                  style={{
                    background:
                      state.theme === 'dark'
                        ? 'linear-gradient(165deg, #07191C 0%, #123A3F 55%, #1E4E56 100%)'
                        : 'linear-gradient(165deg, #BDEBE3 0%, #E6F58B 55%, #F6C4C0 100%)',
                  }}
                >
                  <DecorativeShapes className="absolute inset-0 z-0" />
                  <ThreeOnboardingScene
                    step={1}
                    theme={state.theme || 'light'}
                    compact
                    className="absolute inset-0 z-10"
                  />
                </div>
                <p className="text-sm text-[#78808A] mt-3">
                  Arches for shop doors, a scalloped coin, a dot-matrix globe,
                  and a sun for the day’s takings. Move your pointer or finger
                  to rotate.
                </p>
              </motion.div>

              {/* Colour Means Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                  Colour means status
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                  <div className="rounded-2xl p-3 text-xs text-white min-h-[68px] bg-[#1F5F63]">
                    Lagoon
                    <small className="block opacity-80 font-mono">#1F5F63</small>
                  </div>
                  <div className="rounded-2xl p-3 text-xs text-white min-h-[68px] bg-[#13222B]">
                    Till
                    <small className="block opacity-80 font-mono">#13222B</small>
                  </div>
                  <div className="rounded-2xl p-3 text-xs text-[#13222B] min-h-[68px] bg-[#DDF24E]">
                    Lime
                    <small className="block opacity-80 font-mono">#DDF24E</small>
                  </div>
                  <div className="rounded-2xl p-3 text-xs text-[#13222B] min-h-[68px] bg-[#74C2F6]">
                    Stocked
                    <small className="block opacity-80 font-mono">#74C2F6</small>
                  </div>
                  <div className="rounded-2xl p-3 text-xs text-[#13222B] min-h-[68px] bg-[#F5B83D]">
                    Due soon
                    <small className="block opacity-80 font-mono">#F5B83D</small>
                  </div>
                  <div className="rounded-2xl p-3 text-xs text-white min-h-[68px] bg-[#E8453C]">
                    Overdue
                    <small className="block opacity-80 font-mono">#E8453C</small>
                  </div>
                </div>
                <div
                  className="h-3 rounded-full mt-5"
                  style={{
                    background:
                      'linear-gradient(90deg, #DDF24E, #74C2F6 30%, #F5B83D 62%, #E8453C)',
                  }}
                />
              </motion.div>
            </div>

            {/* Right Column: Printable A4 Shop Window Poster */}
            <div className="lg:col-span-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                    {tt('Window poster', state.lang)} (A4)
                  </h2>
                  <span className="text-xs text-[#78808A]">
                    {LANGUAGE_NAMES[state.lang].label}
                  </span>
                </div>

                {/* Printable A4 Container */}
                <div
                  id="pz"
                  className="aspect-[1/1.414] bg-white rounded-[24px] overflow-hidden my-4 border-2 border-[#ECE8DE] p-6 sm:p-10 flex flex-col justify-between text-[#0B0B0C]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <BahiBrandLogo size={60} />
                      <SpazaArchIllustration />
                    </div>
                    <h3 className="font-fraunces text-3xl sm:text-5xl font-medium leading-none tracking-tight">
                      {state.shopName}
                    </h3>
                    <h4 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#1F5F63]">
                      {tt('Buy now, pay later', state.lang)}
                    </h4>
                    <div
                      className="h-3.5 rounded-full"
                      style={{
                        background:
                          'linear-gradient(90deg, #DDF24E, #74C2F6 30%, #F5B83D 62%, #E8453C)',
                      }}
                    />
                    <p className="text-base sm:text-lg text-[#13222B] pt-2">
                      {tt('Ask inside about a credit account.', state.lang)}
                    </p>
                    <p className="text-base sm:text-lg text-[#78808A]">
                      {tt('Pay when you can.', state.lang)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-[#ECE8DE] text-xs text-[#78808A]">
                    <span>BahiApp · Digital Spaza Book</span>
                    <span>English · isiZulu · Sesotho</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.print()}
                  className="w-full min-h-[52px] rounded-full bg-[#DDF24E] text-[#13222B] font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_14px_30px_-14px_rgba(130,160,0,0.8)]"
                >
                  <Printer className="w-4 h-4" />
                  <span>{tt('Print window poster', state.lang)}</span>
                </motion.button>
              </motion.div>

              {/* Legal, POPIA Privacy & NCA Compliance Card */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/85 rounded-[38px] sm:rounded-[44px] p-5 sm:p-6 shadow-[0_18px_50px_-28px_rgba(19,60,60,0.45)] border border-white space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1F5F63]" />
                    <h2 className="font-fraunces text-xl font-medium text-[#13222B]">
                      Data Usage, Privacy & Legal Protection
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-[#1F5F63]">
                    POPIA · NCA · CPA
                  </span>
                </div>

                <p className="text-xs text-[#78808A] leading-relaxed">
                  BahiApp is an <b>offline-first digital notebook</b> and
                  arithmetic calculator—not a bank, debt collector, or
                  registered credit provider under the{' '}
                  <b>National Credit Act (NCA)</b>. Customer phone numbers and
                  credit tabs stay on your phone under <b>POPIA</b> data
                  minimization rules and are never sold or shared with credit
                  bureaus.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenLegalSection('privacy')}
                    className="min-h-[42px] rounded-2xl bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] px-3 py-2 flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#1F5F63]" />
                    <span>POPIA & Data Policy</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenLegalSection('terms')}
                    className="min-h-[42px] rounded-2xl bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] px-3 py-2 flex items-center justify-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#1F5F63]" />
                    <span>NCA & Tax Disclaimers</span>
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportDataJson}
                    className="min-h-[42px] rounded-2xl bg-[#13222B] text-white text-xs font-medium px-3 py-2 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#DDF24E]" />
                    <span>Export Shop Backup (.JSON)</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOpenLegalSection('rights')}
                    className="min-h-[42px] rounded-2xl bg-[#F4F2EC] hover:bg-[#ECE8DE] text-xs font-medium text-[#13222B] px-3 py-2 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1F5F63]" />
                    <span>Data Rights & Erase</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.main>
        )}

        {/* Quiet Legal, POPIA Privacy & NCA Disclaimer Footer */}
        <footer className="mt-8 pt-4 border-t border-[#ECE8DE] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#78808A]">
          <p className="text-center sm:text-left">
            BahiApp is an informal bookkeeping notebook only · Not a registered
            credit provider (NCA) or tax advisor (SARS).
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => handleOpenLegalSection('privacy')}
              className="hover:text-[#13222B] underline underline-offset-2 transition-colors"
            >
              Data Usage & POPIA Privacy
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleOpenLegalSection('terms')}
              className="hover:text-[#13222B] underline underline-offset-2 transition-colors"
            >
              NCA & Liability Terms
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleOpenLegalSection('sms')}
              className="hover:text-[#13222B] underline underline-offset-2 transition-colors"
            >
              SMS Rules
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleOpenLegalSection('rights')}
              className="hover:text-[#13222B] underline underline-offset-2 transition-colors"
            >
              Export / Wipe Data
            </button>
          </div>
        </footer>
      </div>

      {/* Responsive Floating iOS Bottom Navigation Pill with Spring Indicator */}
      <nav
        aria-label="Primary Navigation"
        className="fixed left-1/2 -translate-x-1/2 bottom-4 z-30 w-[calc(100vw-24px)] max-w-[440px] sm:max-w-[460px] bg-[#13222B]/95 backdrop-blur-xl border border-white/15 rounded-[30px] p-1.5 flex items-center justify-between gap-1 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                vibrate();
                if (item.id === 'credit') {
                  setProfileCustomerId(null);
                }
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label={item.label}
              data-active-nav={isActive ? 'true' : 'false'}
              className={`relative flex-1 min-w-0 h-[52px] rounded-[22px] flex flex-col items-center justify-center gap-0.5 transition-colors z-10 px-1 ${
                isActive ? 'text-[#13222B]' : 'text-white/80 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="iosBottomNavIndicator"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 30,
                  }}
                  className="absolute inset-0 rounded-[22px] bg-[#DDF24E] -z-10 shadow-sm"
                />
              )}
              <motion.span
                key={isActive ? 'active' : 'inactive'}
                initial={isActive ? { scale: 0.6, rotate: -12 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 440,
                  damping: 18,
                }}
              >
                <Icon className="w-5 h-5" />
              </motion.span>
              <span className="text-[10px] font-medium tracking-tight leading-none truncate max-w-full">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Flying "+R62" Sale Feedback Chips */}
      <AnimatePresence>
        {flyingChips.map((chip) => (
          <motion.div
            key={chip.id}
            initial={{ opacity: 1, y: 0, scale: 0.85 }}
            animate={{ opacity: 0, y: -70, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ left: chip.x, top: chip.y }}
            className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 font-mono font-extrabold tabular-nums text-xl text-[#13222B] bg-[#DDF24E] px-3 py-0.5 rounded-full shadow-md"
          >
            {chip.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Spring Toast Notification (with Undo button when a customer is deleted) */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 360, damping: 25 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-[88px] z-40 bg-[#0B0B0C] text-white border border-white/15 px-4 py-2.5 rounded-full text-xs font-medium shadow-xl flex items-center gap-3 whitespace-nowrap"
          >
            <span>{toastMsg}</span>
            {lastDeletedCustomer && toastMsg.startsWith('Deleted ') && (
              <button
                type="button"
                onClick={handleUndoDeleteCustomer}
                className="px-2.5 py-0.5 rounded-full bg-[#DDF24E] text-[#07191C] font-semibold text-[11px]"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        state={state}
        onClose={() => setSettingsOpen(false)}
        onUpdateShopDetails={(ownerName, shopName) => {
          setState((prev) => ({ ...prev, ownerName, shopName }));
          showToast('Shop details saved');
        }}
        onSelectLanguage={(lang) => {
          setState((prev) => ({ ...prev, lang }));
        }}
        onToggleTheme={handleToggleTheme}
        onToggleSync={handleToggleSync}
        onLaunchOnboarding={() => setShowOnboarding(true)}
        onOpenBrandPoster={() => setActiveTab('brand')}
        onOpenLegalPrivacy={() => handleOpenLegalSection('privacy')}
        onResetDemoData={handleResetDemoData}
      />

      {/* Legal, Data Usage & POPIA Privacy Modal */}
      <LegalPrivacyModal
        isOpen={legalModalOpen}
        state={state}
        initialSection={legalInitialSection}
        onClose={() => setLegalModalOpen(false)}
        onAcceptLegalTerms={handleAcceptLegalTerms}
        onExportDataJson={handleExportDataJson}
        onWipeAllData={handleWipeAllData}
      />

      {/* Add Customer Modal */}
      <CRMCustomerModal
        customer={null}
        isCreatingNew={creatingCustomer}
        isOpen={creatingCustomer}
        shopName={state.shopName}
        appLang={state.lang}
        onClose={() => setCreatingCustomer(false)}
        onRecordTransaction={handleRecordCustomerTx}
        onSendSMS={handleSendCustomerSMS}
        onSaveCustomer={handleSaveCustomer}
      />

      {/* Barcode Scanner & New Item Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        items={state.items}
        appLang={state.lang}
        onClose={() => setScannerOpen(false)}
        onSellItem={(id) => handleSellItem(id)}
        onAddNewItem={handleAddNewItem}
      />

      {/* 3D Interactive Onboarding Modal (Launched via Settings or Brand Tab) */}
      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          lang={state.lang}
          theme={state.theme || 'light'}
          ownerName={state.ownerName}
          shopName={state.shopName}
          onSelectLanguage={(l) => setState((prev) => ({ ...prev, lang: l }))}
          onComplete={(ownerName, shopName) => {
            setState((prev) => ({
              ...prev,
              onboarded: true,
              ownerName,
              shopName,
            }));
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}
