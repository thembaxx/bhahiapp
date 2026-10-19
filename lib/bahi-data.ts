export type LanguageCode = 'en' | 'zu' | 'st';
export type CustomerCategory = 'regular' | 'new' | 'vip';
export type SMSTone = 'friendly' | 'standard' | 'urgent';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface TransactionRecord {
  id: string;
  customerId?: number;
  customerName?: string;
  productId?: number;
  productName?: string;
  type: 'cash_sale' | 'credit_sale' | 'payment' | 'restock' | 'sms_reminder';
  amount: number;
  quantity?: number;
  date: string;
  timestamp: number;
  notes?: string;
  langUsed?: LanguageCode;
}

export interface ProductItem {
  id: number;
  name: string;
  category: 'Staples' | 'Pantry' | 'Fresh' | 'Household';
  qty: number;
  maxQty: number;
  price: number;
  costPrice: number;
  barcode: string;
  soldDaily: number;
  soldWeekly: number;
  soldMonthly: number;
}

export interface CustomerTag {
  id: string;
  label: string;
  color: string;
}

export const TAG_COLOR_SWATCHES: Array<{ name: string; hex: string }> = [
  { name: 'Lime', hex: '#DDF24E' },
  { name: 'Sky', hex: '#74C2F6' },
  { name: 'Mint', hex: '#BDEBE3' },
  { name: 'Amber', hex: '#F5B83D' },
  { name: 'Coral', hex: '#F6C4C0' },
  { name: 'Lavender', hex: '#D0E2FF' },
];

export const PRESET_CUSTOMER_TAGS: Array<{ label: string; color: string }> = [
  { label: 'Trusted', color: '#DDF24E' },
  { label: 'New', color: '#74C2F6' },
  { label: 'Needs Follow-up', color: '#F6C4C0' },
  { label: 'Pension Day', color: '#BDEBE3' },
  { label: 'Friday Payer', color: '#F5B83D' },
  { label: 'Family Account', color: '#D0E2FF' },
];

export interface Customer {
  id: number;
  name: string;
  phone: string;
  category: CustomerCategory;
  owed: number;
  daysOverdue: number;
  totalCreditExtended: number;
  totalPaid: number;
  purchaseCount: number;
  avatarColor: string;
  preferredLang: LanguageCode;
  lastPurchaseDate: string;
  notes: string;
  tags?: CustomerTag[];
  popiaConsent?: boolean;
  history: TransactionRecord[];
}

export interface BahiState {
  onboarded: boolean;
  online: boolean;
  syncQueue: number;
  lang: LanguageCode;
  theme?: 'light' | 'dark';
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  ownerName: string;
  shopName: string;
  legalAcceptedAt?: string;
  today: {
    cash: number;
    credit: number;
  };
  month: {
    given: number;
    collected: number;
  };
  items: ProductItem[];
  customers: Customer[];
  transactions: TransactionRecord[];
}

export const LANGUAGE_NAMES: Record<LanguageCode, { label: string; native: string; region: string }> = {
  en: { label: 'English', native: 'English', region: 'South Africa / Pan-Africa' },
  zu: { label: 'isiZulu', native: 'isiZulu', region: 'KwaZulu-Natal & Gauteng' },
  st: { label: 'Sesotho', native: 'Sesotho', region: 'Free State, Gauteng & Lesotho' },
};

export const INITIAL_STATE: BahiState = {
  onboarded: true,
  online: true,
  syncQueue: 0,
  lang: 'en',
  theme: 'light',
  soundEnabled: true,
  hapticsEnabled: true,
  ownerName: 'Thandi',
  shopName: 'Thandi’s Spaza',
  legalAcceptedAt: '2026-10-19 · v1.4 (POPIA & NCA Compliant)',
  today: {
    cash: 1920.5,
    credit: 925.0,
  },
  month: {
    given: 4770,
    collected: 3120,
  },
  items: [
    {
      id: 0,
      name: 'Maize meal 5kg (Ace)',
      category: 'Staples',
      qty: 14,
      maxQty: 30,
      price: 62,
      costPrice: 48,
      barcode: '600123450000',
      soldDaily: 9,
      soldWeekly: 54,
      soldMonthly: 218,
    },
    {
      id: 1,
      name: 'Cooking oil 2L (Sunfoil)',
      category: 'Pantry',
      qty: 6,
      maxQty: 20,
      price: 78,
      costPrice: 61,
      barcode: '600123450001',
      soldDaily: 6,
      soldWeekly: 38,
      soldMonthly: 152,
    },
    {
      id: 2,
      name: 'Brown Sugar 2kg (Huletts)',
      category: 'Staples',
      qty: 18,
      maxQty: 30,
      price: 44,
      costPrice: 34,
      barcode: '600123450002',
      soldDaily: 11,
      soldWeekly: 64,
      soldMonthly: 260,
    },
    {
      id: 3,
      name: 'White Bread Loaf (Albany)',
      category: 'Fresh',
      qty: 9,
      maxQty: 25,
      price: 19,
      costPrice: 14.5,
      barcode: '600123450003',
      soldDaily: 24,
      soldWeekly: 158,
      soldMonthly: 640,
    },
    {
      id: 4,
      name: 'Large Eggs, Tray of 30',
      category: 'Fresh',
      qty: 4,
      maxQty: 12,
      price: 89,
      costPrice: 69,
      barcode: '600123450004',
      soldDaily: 5,
      soldWeekly: 31,
      soldMonthly: 124,
    },
    {
      id: 5,
      name: 'Parboiled Rice 2kg (Tastic)',
      category: 'Staples',
      qty: 3,
      maxQty: 15,
      price: 52,
      costPrice: 40,
      barcode: '600123450005',
      soldDaily: 7,
      soldWeekly: 42,
      soldMonthly: 170,
    },
    {
      id: 6,
      name: 'Sunlight Bath Soap 175g',
      category: 'Household',
      qty: 22,
      maxQty: 40,
      price: 14,
      costPrice: 9.5,
      barcode: '600123450006',
      soldDaily: 14,
      soldWeekly: 82,
      soldMonthly: 330,
    },
    {
      id: 7,
      name: 'Full Cream Milk 1L UHT',
      category: 'Fresh',
      qty: 11,
      maxQty: 24,
      price: 24,
      costPrice: 18,
      barcode: '600123450007',
      soldDaily: 13,
      soldWeekly: 79,
      soldMonthly: 310,
    },
  ],
  customers: [
    {
      id: 0,
      name: 'Mama Nomsa Khumalo',
      phone: '+27 82 419 3821',
      category: 'regular',
      owed: 420,
      daysOverdue: 9,
      totalCreditExtended: 1840,
      totalPaid: 1420,
      purchaseCount: 28,
      avatarColor: '#DDF24E',
      preferredLang: 'zu',
      lastPurchaseDate: '2 days ago',
      notes: 'Pensions payout every 1st Tuesday of the month. Very reliable.',
      tags: [
        { id: 'tag-trusted', label: 'Trusted', color: '#DDF24E' },
        { id: 'tag-pension', label: 'Pension Day', color: '#BDEBE3' },
      ],
      history: [
        {
          id: 'tx-101',
          type: 'credit_sale',
          amount: 164,
          productName: 'Maize meal 5kg + Oil 2L + Bread',
          date: 'Oct 17 · 14:20',
          timestamp: 1760710800000,
          notes: 'Sent grandchild with booklet',
        },
        {
          id: 'tx-102',
          type: 'payment',
          amount: 300,
          date: 'Oct 12 · 10:05',
          timestamp: 1760263500000,
          notes: 'Cash payment at counter',
        },
        {
          id: 'tx-103',
          type: 'credit_sale',
          amount: 256,
          productName: 'Eggs tray + Sugar 2kg + Rice 2kg',
          date: 'Oct 10 · 16:40',
          timestamp: 1760114400000,
        },
        {
          id: 'tx-104',
          type: 'payment',
          amount: 450,
          date: 'Oct 03 · 09:15',
          timestamp: 1759482900000,
          notes: 'Settled September balance',
        },
      ],
    },
    {
      id: 1,
      name: 'Sipho Mokoena',
      phone: '+27 73 892 1044',
      category: 'vip',
      owed: 185,
      daysOverdue: 2,
      totalCreditExtended: 2450,
      totalPaid: 2265,
      purchaseCount: 35,
      avatarColor: '#F2B8B5',
      preferredLang: 'st',
      lastPurchaseDate: 'Yesterday',
      notes: 'Runs local taxi route; pays every Friday afternoon.',
      tags: [
        { id: 'tag-trusted', label: 'Trusted', color: '#DDF24E' },
        { id: 'tag-friday', label: 'Friday Payer', color: '#F5B83D' },
      ],
      history: [
        {
          id: 'tx-201',
          type: 'credit_sale',
          amount: 185,
          productName: 'Cooking oil 2L + Eggs tray + Bread',
          date: 'Oct 18 · 18:10',
          timestamp: 1760811000000,
        },
        {
          id: 'tx-202',
          type: 'payment',
          amount: 520,
          date: 'Oct 15 · 17:30',
          timestamp: 1760549400000,
          notes: 'Full weekly settlement',
        },
        {
          id: 'tx-203',
          type: 'credit_sale',
          amount: 310,
          productName: 'Maize meal 5kg x2 + Milk 1L x4',
          date: 'Oct 11 · 08:45',
          timestamp: 1760172300000,
        },
      ],
    },
    {
      id: 2,
      name: 'Bra Joe Sithole',
      phone: '+27 83 551 9087',
      category: 'regular',
      owed: 640,
      daysOverdue: 14,
      totalCreditExtended: 1590,
      totalPaid: 950,
      purchaseCount: 19,
      avatarColor: '#BDEBE3',
      preferredLang: 'en',
      lastPurchaseDate: '5 days ago',
      notes: 'Builder contractor; waiting for fortnightly site wage.',
      tags: [
        { id: 'tag-followup', label: 'Needs Follow-up', color: '#F6C4C0' },
      ],
      history: [
        {
          id: 'tx-301',
          type: 'credit_sale',
          amount: 290,
          productName: 'Maize meal 5kg + Rice 2kg + Eggs tray',
          date: 'Oct 14 · 19:00',
          timestamp: 1760468400000,
        },
        {
          id: 'tx-302',
          type: 'credit_sale',
          amount: 350,
          productName: 'Groceries bundle for household',
          date: 'Oct 05 · 15:20',
          timestamp: 1759677600000,
        },
        {
          id: 'tx-303',
          type: 'payment',
          amount: 400,
          date: 'Sep 30 · 16:10',
          timestamp: 1759248600000,
        },
      ],
    },
    {
      id: 3,
      name: 'Auntie Lindiwe Ndaba',
      phone: '+27 71 204 6632',
      category: 'vip',
      owed: 95,
      daysOverdue: 1,
      totalCreditExtended: 1980,
      totalPaid: 1885,
      purchaseCount: 42,
      avatarColor: '#F5D77A',
      preferredLang: 'zu',
      lastPurchaseDate: 'Today',
      notes: 'Buys bread and milk daily for crèche children.',
      tags: [
        { id: 'tag-trusted', label: 'Trusted', color: '#DDF24E' },
        { id: 'tag-family', label: 'Family Account', color: '#D0E2FF' },
      ],
      history: [
        {
          id: 'tx-401',
          type: 'credit_sale',
          amount: 95,
          productName: 'White Bread Loaf x5',
          date: 'Today · 07:30',
          timestamp: 1760859000000,
        },
        {
          id: 'tx-402',
          type: 'payment',
          amount: 380,
          date: 'Oct 17 · 12:00',
          timestamp: 1760702400000,
          notes: 'Paid via cash',
        },
      ],
    },
    {
      id: 4,
      name: 'Thabo Dlamini',
      phone: '+27 64 918 7721',
      category: 'new',
      owed: 310,
      daysOverdue: 7,
      totalCreditExtended: 510,
      totalPaid: 200,
      purchaseCount: 6,
      avatarColor: '#D0E2FF',
      preferredLang: 'st',
      lastPurchaseDate: '1 week ago',
      notes: 'Moved into 42 Vilakazi Street last month.',
      tags: [
        { id: 'tag-new', label: 'New', color: '#74C2F6' },
        { id: 'tag-followup', label: 'Needs Follow-up', color: '#F6C4C0' },
      ],
      history: [
        {
          id: 'tx-501',
          type: 'credit_sale',
          amount: 310,
          productName: 'Cooking oil 2L + Maize meal 5kg + Sugar 2kg',
          date: 'Oct 12 · 19:15',
          timestamp: 1760296500000,
        },
        {
          id: 'tx-502',
          type: 'payment',
          amount: 200,
          date: 'Oct 07 · 13:40',
          timestamp: 1759844400000,
          notes: 'First credit installment',
        },
      ],
    },
    {
      id: 5,
      name: 'Gogo Zanele Mthembu',
      phone: '+27 79 331 5509',
      category: 'regular',
      owed: 0,
      daysOverdue: 0,
      totalCreditExtended: 1420,
      totalPaid: 1420,
      purchaseCount: 24,
      avatarColor: '#C5F0A4',
      preferredLang: 'zu',
      lastPurchaseDate: '3 days ago',
      notes: 'Always settles early.',
      tags: [
        { id: 'tag-trusted', label: 'Trusted', color: '#DDF24E' },
      ],
      history: [
        {
          id: 'tx-601',
          type: 'payment',
          amount: 280,
          date: 'Oct 16 · 11:00',
          timestamp: 1760612400000,
          notes: 'Settled full account',
        },
      ],
    },
  ],
  transactions: [
    {
      id: 'tx-401',
      customerId: 3,
      customerName: 'Auntie Lindiwe Ndaba',
      type: 'credit_sale',
      amount: 95,
      productName: 'White Bread Loaf x5',
      date: 'Today · 07:30',
      timestamp: 1760859000000,
    },
    {
      id: 'tx-201',
      customerId: 1,
      customerName: 'Sipho Mokoena',
      type: 'credit_sale',
      amount: 185,
      productName: 'Cooking oil 2L + Eggs tray + Bread',
      date: 'Yesterday · 18:10',
      timestamp: 1760811000000,
    },
    {
      id: 'tx-101',
      customerId: 0,
      customerName: 'Mama Nomsa Khumalo',
      type: 'credit_sale',
      amount: 164,
      productName: 'Maize meal 5kg + Oil 2L + Bread',
      date: 'Oct 17 · 14:20',
      timestamp: 1760710800000,
    },
    {
      id: 'tx-402',
      customerId: 3,
      customerName: 'Auntie Lindiwe Ndaba',
      type: 'payment',
      amount: 380,
      date: 'Oct 17 · 12:00',
      timestamp: 1760702400000,
    },
  ],
};

// Dictionary of translations: [isiZulu, Sesotho]
const DICT: Record<string, [string, string]> = {
  Hello: ['Sawubona', 'Dumela'],
  Synced: ['Kuvumelanisiwe', 'E sync-ile'],
  'Offline · # queued': ['Awunayo i-inthanethi · # alindile', 'Ha ho inthanete · # e emetse'],
  'Today’s takings': ['Imali yanamuhla', 'Chelete ea kajeno'],
  '# more than yesterday': ['# ngaphezu kwayizolo', '# ho feta maobane'],
  Cash: ['Imali esandleni', 'Chelete ka letsoho'],
  'On credit': ['Esikweletini', 'Ka mokoloto'],
  'Profit est.': ['Inzuzo (isilinganiso)', 'Phaello (kakaretso)'],
  'Credit owed to you': ['Imali ekweletwa wena', 'Chelete eo u e kolotwang'],
  'Of # given this month': ['Kwabolekwa # kule nyanga', 'Ho kolotisitsoe # khoeli ena'],
  'Collected #': ['Kuqoqiwe #', 'Ho bokelloe #'],
  Collected: ['Kuqoqiwe', 'Ho bokelloe'],
  Outstanding: ['Okusele', 'Se setseng'],
  'Reminder assistant': ['Umsizi wezikhumbuzo', 'Mothusi oa ho hopotsa'],
  '# accounts are a week late': ['# ama-akhawunti ephuze iviki', '# li-akhaonto li liehile ka beke'],
  '# is waiting on late accounts': ['# ilindile ku-ama-akhawunti aphuzile', '# e emetse li-akhaonto tse liehileng'],
  'Everyone is up to date.': ['Wonke umuntu ukhokhile.', 'Bohle ba lefile ka nako.'],
  'Send # SMS reminders': ['Thumela izikhumbuzo ze-SMS: #', 'Romela litšupiso tsa SMS: #'],
  'Running low': ['Isitoko siyaphela', 'Setoko se felang'],
  'View all': ['Buka konke', 'Sheba tsohle'],
  '# each · # left': ['# ngalunye · # esele', '# e ’ngoe · # e setseng'],
  '# each · Out of stock': ['# ngalunye · Isiphelile', '# e ’ngoe · E felile'],
  Stock: ['Isitoko', 'Setoko'],
  'Search items': ['Sesha izinto', 'Batla lintho'],
  'No items match. Try another name.': ['Ayikho into efanayo. Zama elinye igama.', 'Ha ho letho le lumellanang. Leka lebitso le leng.'],
  Scan: ['Skena', 'Skena'],
  'Credit book': ['Ibhuku lezikweletu', 'Buka ea likoloto'],
  '# paid back': ['# kubuyisiwe', '# e khutlisitsoe'],
  '# still with # customers': ['# kusele kumakhasimende angu-#', '# e setse ho bareki ba #'],
  Customers: ['Amakhasimende', 'Bareki'],
  'Top customers': ['Amakhasimende aphambili', 'Bareki ba ka sehloohong'],
  'Late · # days': ['Sekwephuzile · izinsuku #', 'E liehile · matsatsi a #'],
  'Owing · # days': ['Kukweletwa · izinsuku #', 'Ho na le mokoloto · matsatsi a #'],
  Settled: ['Kukhokhiwe', 'E lefilwe'],
  Close: ['Vala', 'Koala'],
  'Owes you': ['Ukukweletayo', 'O u kolota'],
  'Amount in rand': ['Inani ngamarandi', 'Palo ka li-rand'],
  'Add credit sale': ['Engeza ukuboleka', 'Kenya mokoloto'],
  'Record payment': ['Bhala inkokhelo', 'Ngola tefo'],
  'Send reminder SMS': ['Thumela isikhumbuzo se-SMS', 'Romela SMS ea ho hopotsa'],
  'Back online · # changes synced': ['Ubuyele ku-inthanethi · izinguquko # zivumelanisiwe', 'O khutlile inthaneteng · liphetoho tse # li sync-ile'],
  'Offline · changes save on this phone': ['Awunayo i-inthanethi · izinguquko zigcinwa kule foni', 'Ha ho inthanete · liphetoho li bolokiloe fonong ena'],
  'No late accounts': ['Awekho ama-akhawunti aphuzile', 'Ha ho li-akhaonto tse liehileng'],
  'SMS sent: #': ['Ama-SMS athunyelwe: #', 'Li-SMS li rometsoe: #'],
  'SMS queued: # · sends when online': ['Ama-SMS alindile: # · athunyelwa uma ubuyele ku-inthanethi', 'Li-SMS li emetse: # · li tla romelloa ha u khutla inthaneteng'],
  'Out of stock. Restock first': ['Isiphelile. Engeza isitoko kuqala', 'E felile. Eketsa setoko pele'],
  'Sold 1 item': ['Kudayiswe okukodwa', 'Ho rekisitsoe e ’ngoe'],
  Restocked: ['Isitoko sengeziwe', 'Setoko se kentsoe'],
  'Credit added': ['Ukuboleka kwengeziwe', 'Mokoloto o kentsoe'],
  'Payment recorded': ['Inkokhelo ibhaliwe', 'Tefo e ngotsoe'],
  'Enter an amount': ['Faka inani', 'Kenya palo'],
  'Enter name and price': ['Faka igama nentengo', 'Kenya lebitso le theko'],
  'Scan barcode': ['Skena ibhakhodi', 'Skena barcode'],
  'Point the camera at a barcode': ['Khomba ikhamera ebhakhodini', 'Supa khamera ho barcode'],
  'Or type the barcode': ['Noma thayipha ibhakhodi', 'Kapa ngola barcode'],
  'Use code': ['Sebenzisa ikhodi', 'Sebelisa khoutu'],
  'Try demo code': ['Zama ikhodi yokuzama', 'Leka khoutu ea teko'],
  'Camera unavailable. Type the barcode instead.': ['Ikhamera ayitholakali. Thayipha ibhakhodi.', 'Khamera ha e fumanehe. Ngola barcode.'],
  Sold: ['Kudayiswe', 'Ho rekisitsoe'],
  'Unknown barcode. Add this item': ['Ibhakhodi engaziwa. Engeza le nto', 'Barcode e sa tsejoeng. Kenya ntho ena'],
  'Item name': ['Igama lento', 'Lebitso la ntho'],
  'Price in rand': ['Intengo ngamarandi', 'Theko ka li-rand'],
  'Add item': ['Engeza into', 'Kenya ntho'],
  Added: ['Kungeziwe', 'Ho kentsoe'],
  'Welcome to BahiApp': ['Siyakwamukela ku-BahiApp', 'Rea u amohela ho BahiApp'],
  'Choose your language': ['Khetha ulimi lwakho', 'Khetha puo ea hao'],
  'Tell us about your shop': ['Sitshele ngesitolo sakho', 'Re bolelle ka lebenkele la hao'],
  'Your name': ['Igama lakho', 'Lebitso la hao'],
  'Shop name': ['Igama lesitolo', 'Lebitso la lebenkele'],
  Continue: ['Qhubeka', 'Tsoela pele'],
  'How BahiApp works': ['Indlela i-BahiApp esebenza ngayo', 'BahiApp e sebetsa joang'],
  'Works without data': ['Isebenza ngaphandle kwedatha', 'E sebetsa ntle le data'],
  'Everything saves on your phone and syncs later.': ['Konke kugcinwa kufoni yakho kuvumelane kamuva.', 'Tsohle li bolokiloe fonong ea hao ’me li sync hamorao.'],
  'Your credit book': ['Ibhuku lakho lezikweletu', 'Buka ea hao ea likoloto'],
  'See who owes you, and for how long.': ['Bona ukuthi ubani ukukweleta nokuthi kudala kangakanani.', 'Bona hore ke mang ea u kolotang, le hore ke nako e kae.'],
  'Friendly reminders': ['Izikhumbuzo ezinomusa', 'Litšupiso tse mosa'],
  'Automatic SMS to late customers.': ['I-SMS ezenzakalelayo kumakhasimende aphuzile.', 'SMS ka bohona ho bareki ba liehileng.'],
  'Open my shop': ['Vula isitolo sami', 'Bula lebenkele la ka'],
  'Window poster': ['Iphosta yefasitela', 'Poster ea fensetere'],
  'Print window poster': ['Phrinta iphosta', 'Hatisa poster'],
  'Buy now, pay later': ['Thenga manje, khokha kamuva', 'Reka hona joale, lefa hamorao'],
  'Ask inside about a credit account.': ['Buza ngaphakathi nge-akhawunti yesikweletu.', 'Botsa kahare ka akhaonto ea mokoloto.'],
  'Pay when you can.': ['Khokha uma ukwazi.', 'Lefa ha u khona.'],
  'This week': ['Kuleli viki', 'Beke ena'],
  Regulars: ['Amakhasimende avamile', 'Bareki ba kamehla'],
  'Next stock order': ['I-oda elandelayo yesitoko', 'Odara e latelang ea setoko'],
  'in # days': ['kusele izinsuku #', 'ho setse matsatsi a #'],
  'Sales up # on last week': ['Ukudayisa kunyuke ngo-# kuneviki eledlule', 'Thekiso e nyolohile ka # ho feta beke e fetileng'],
  Skip: ['Yeqa', 'Tlola'],
  Reports: ['Imibiko', 'Litlaleho'],
  Daily: ['Nsuku zonke', 'Ka letsatsi'],
  Weekly: ['Ngeviki', 'Ka beke'],
  Monthly: ['Ngenyanga', 'Ka khoeli'],
  'Total sales': ['Ukudayisa konke', 'Thekiso eohle'],
  'Credit extended': ['Isikweletu esikhishiwe', 'Mokoloto o fanoeng'],
  'Payments received': ['Izinkokhelo ezitholiwe', 'Litefo tse amohetsoeng'],
  'Outstanding credit': ['Isikweletu esisele', 'Mokoloto o setseng'],
  'Top 5 selling products': ['Izinto ezidayisa kakhulu ezingu-5', 'Lihlahisoa tse 5 tse rekisoang haholo'],
  'By quantity': ['Ngenani', 'Ka bongata'],
  'By revenue': ['Ngemali', 'Ka lekeno'],
  'Add customer': ['Engeza ikhasimende', 'Kenya moreki'],
  'Purchase history': ['Umlando wokuthenga', 'Nalane ea theko'],
  'Edit details': ['Hlela imininingwane', 'Lokisa lintlha'],
  'By credit': ['Ngesikweletu', 'Ka mokoloto'],
  'By frequency': ['Ngokuthenga', 'Ka makhetlo'],
  'Quick Pay': ['Khokha masinya', 'Lefa kapele'],
  'Settle all': ['Khokha konke', 'Lefa tsohle'],
};

export function tt(str: string, lang: LanguageCode): string {
  if (lang === 'en') return str;
  const idx = lang === 'zu' ? 0 : 1;
  const nums: string[] = [];
  const key = str.trim().replace(/R?\d[\d,]*(?:\.\d+)?%?/g, (m) => {
    nums.push(m);
    return '#';
  });
  const entry = DICT[key];
  if (!entry || !entry[idx]) return str;
  let i = 0;
  return entry[idx].replace(/#/g, () => nums[i++] || '#');
}

export function formatRandParts(n: number): { whole: string; cents: string } {
  const [i, d] = n.toFixed(2).split('.');
  return {
    whole: 'R' + Number(i).toLocaleString('en-US'),
    cents: '.' + d,
  };
}

export function formatRand0(n: number): string {
  return 'R' + Math.round(n).toLocaleString('en-US');
}

export function generateSMSText(params: {
  customerName: string;
  shopName: string;
  amountOwed: number;
  daysOverdue: number;
  lang: LanguageCode;
  tone: SMSTone;
}): string {
  const firstName = params.customerName.split(' ')[0] || params.customerName;
  const amount = formatRand0(params.amountOwed);
  const days = Math.max(1, params.daysOverdue);
  const { shopName, lang, tone } = params;

  if (lang === 'zu') {
    if (tone === 'friendly') {
      return `Sawubona ${firstName}, siyakubingelela ngothando e-${shopName}! Sikukhumbuza ngomusa ukuthi isikweletu sakho encwadini yethu singu-${amount}. Sicela udlule ukhokhe uma usukwazi. Siyabonga ngokusekela kwakho!`;
    }
    if (tone === 'urgent') {
      return `Sawubona ${firstName}, isikweletu sakho esingu-${amount} e-${shopName} sesidlulelwe yisikhathi ngezinsuku ezingu-${days}. Sicela udlule esitolo uze uzokhokha ukuze sigcine ibhuku lakho lesikweletu livuliwe. Siyabonga.`;
    }
    return `Sawubona ${firstName}, siqhamuka e-${shopName}. Isikweletu sakho singu-${amount}. Sicela ukhokhe uma ukwazi. Ngiyabonga!`;
  }

  if (lang === 'st') {
    if (tone === 'friendly') {
      return `Dumela ${firstName}, re u lumelisa ka mofuthu ho tsoa ho ${shopName}! Re u hopotsa ka mosa hore mokoloto oa hau bukeng ea rona ke ${amount}. Ka kopo feta u lefe ha u se u khona. Re leboha tšehetso ea hau!`;
    }
    if (tone === 'urgent') {
      return `Dumela ${firstName}, mokoloto oa hau oa ${amount} ho ${shopName} o se o liehile ka matsatsi a ${days}. Ka kopo etela lebenkeleng ho tla lefa hore re boloke buka ea hau ea mokoloto e bulehile. Re a leboha.`;
    }
    return `Dumela ${firstName}, re tsoa ho ${shopName}. Mokoloto oa hau ke ${amount}. Ka kopo lefa ha u khona. Kea leboha!`;
  }

  // English ('en')
  if (tone === 'friendly') {
    return `Hi ${firstName}, warm greetings from ${shopName}! Just a friendly reminder that your shop credit balance is ${amount}. Please pop in when you can. Thank you for supporting local!`;
  }
  if (tone === 'urgent') {
    return `Dear ${firstName}, your credit account of ${amount} at ${shopName} is now ${days} days overdue. Please visit the shop to settle or arrange payment so we can keep your account active. Thank you.`;
  }
  return `Hi ${firstName}, this is ${shopName}. Your account is ${amount}. Please pay when you can. Thank you!`;
}
