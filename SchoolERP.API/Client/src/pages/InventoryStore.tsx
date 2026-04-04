import { useLocalization } from '../contexts/LocalizationContext';
import { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, Search, 
  Plus, Filter, 
  ShoppingCart, Send, AlertCircle,
  Trash2, Edit3, UserCheck, BarChart3,
  Box, History, Layers, X, Loader2
} from 'lucide-react';
import { 
    inventoryApi, 
    InventoryItem, 
    InventoryTransaction, 
    InventorySupplier, 
    InventoryCategory,
    InventoryTransactionType
} from '../api/inventoryApi';
import { toast } from 'react-hot-toast';
import { FileText, CheckCircle, Clock, AlertCircle as AlertCircleIcon } from 'lucide-react';


export default function InventoryStore() {
  const { formatCurrency, formatDate, settings } = useLocalization();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'suppliers' | 'transactions' | 'categories'>('dashboard');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<InventorySupplier | null>(null);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [transactionType, setTransactionType] = useState<InventoryTransactionType>(InventoryTransactionType.Purchase);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, transRes, suppsRes, catsRes] = await Promise.all([
        inventoryApi.getItems(),
        inventoryApi.getTransactions(),
        inventoryApi.getSuppliers(),
        inventoryApi.getCategories(),
      ]);
      setItems(itemsRes.data);
      setTransactions(transRes.data);
      setSuppliers(suppsRes.data);
      setCategories(catsRes.data);
    } catch (error: any) {
      console.error('Failed to fetch inventory data', error);
      const msg = error.response?.data?.title || error.message;
      toast.error('Sync Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpsertItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryId = formData.get('categoryId') as string;
    if(!categoryId) {
        toast.error('Please select a category');
        return;
    }

    const data = {
      id: editingItem?.id,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      categoryId: categoryId,
      unit: formData.get('unit') as string,
      minQuantity: Number(formData.get('minQuantity')),
      unitPrice: Number(formData.get('unitPrice')),
    };

    try {
      await inventoryApi.upsertItem(data);
      toast.success(editingItem ? 'Item updated' : 'Item added');
      setShowItemModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await inventoryApi.deleteItem(id);
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleUpsertSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingSupplier?.id,
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      category: formData.get('category') as string,
    };

    try {
      await inventoryApi.upsertSupplier(data);
      toast.success(editingSupplier ? 'Supplier updated' : 'Supplier added');
      setShowSupplierModal(false);
      setEditingSupplier(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save supplier');
    }
  };

  const handleUpsertCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingCategory?.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    };

    try {
      await inventoryApi.upsertCategory(data);
      toast.success(editingCategory ? 'Category updated' : 'Category added');
      setShowCategoryModal(false);
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemId = formData.get('itemId') as string;
    if(!itemId) {
        toast.error('Please select an item');
        return;
    }

    const isPurchase = transactionType === InventoryTransactionType.Purchase;

    const data = {
      itemId: itemId,
      type: transactionType,
      quantity: Number(formData.get('quantity')),
      unitPrice: Number(formData.get('unitPrice')),
      reference: formData.get('reference') as string,
      entity: formData.get('entity') as string,
      handledBy: formData.get('handledBy') as string,
      notes: formData.get('notes') as string,
      // Vendor payment fields (only relevant for purchases)
      supplierId: isPurchase ? (formData.get('supplierId') as string || undefined) : undefined,
      paymentStatus: isPurchase ? (formData.get('paymentStatus') as string || 'Unpaid') : undefined,
      amountPaid: isPurchase ? Number(formData.get('amountPaid') || 0) : 0,
    };

    try {
      await inventoryApi.createTransaction(data);
      toast.success('Transaction recorded successfully');
      setShowTransactionModal(false);
      fetchData();
    } catch (error: any) {
      console.error('Transaction failure', error);
      const msg = error.response?.data?.title || error.message;
      toast.error('Transaction Failed: ' + msg);
    }
  };

  const totalSales = transactions.filter(t => t.type === InventoryTransactionType.Issue).reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const totalPurchases = transactions.filter(t => t.type === InventoryTransactionType.Purchase).reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  
  // Real profit calculation would use Weighted Average Cost, but we can do a simple estimate
  const estimatedProfit = transactions
    .filter(t => t.type === InventoryTransactionType.Issue && t.unitPrice > 0)
    .reduce((acc, t) => {
        const item = items.find(i => i.id === t.itemId);
        const costBasis = item?.unitPrice || 0; // Current base price as cost estimate
        return acc + (t.totalAmount - (costBasis * t.quantity));
    }, 0);

  const metrics = [
    { label: 'Stock Valuation', value: formatCurrency(items.reduce((acc, i) => acc + (i.currentStock * i.unitPrice), 0)), icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Low Stock Alerts', value: items.filter(i => i.currentStock <= i.minQuantity).length.toString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Monthly Sales', value: formatCurrency(totalSales), icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Est. Gross Profit', value: formatCurrency(estimatedProfit), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  if (loading && items.length === 0) {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 ring-4 ring-white">
                <Package className="h-7 w-7 text-white" />
             </div>
             Inventory & Store
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium ml-12 italic">Track assets, supplies, and item lifecycles with precision.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
                onClick={() => {
                    setTransactionType(InventoryTransactionType.Purchase);
                    setShowTransactionModal(true);
                }}
                className="btn-secondary flex items-center gap-2 px-5 py-2.5 shadow-sm rounded-xl hover:scale-[1.02] transition-transform"
            >
             <ShoppingCart className="h-4 w-4" /> New Acquisition
           </button>
           <button 
                onClick={() => {
                    setEditingItem(null);
                    setShowItemModal(true);
                }}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 shadow-lg shadow-indigo-200 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
             <Plus className="h-4 w-4" /> Add Item
           </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart3 },
          { id: 'items', label: 'Item Master', icon: Box },
          { id: 'transactions', label: 'Transactions', icon: History },
          { id: 'suppliers', label: 'Suppliers', icon: UserCheck },
          { id: 'categories', label: 'Categories', icon: Layers }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-1 pb-4 text-sm transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in slide-in-from-left duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Main Content Sections */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {metrics.map((m, i) => (
                <div key={i} className="glass-card p-6 flex flex-col justify-between group hover:shadow-xl transition-all border-none ring-1 ring-slate-100 hover:ring-indigo-100">
                   <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl ${m.bg}`}>
                         <m.icon className={`h-6 w-6 ${m.color}`} />
                      </div>
                      <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="mt-4">
                      <p className="text-sm font-medium text-slate-500">{m.label}</p>
                      <p className="text-3xl font-black text-slate-800 tracking-tight mt-0.5">{m.value}</p>
                   </div>
                </div>
             ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Critical Stocks Warning */}
              <div className="lg:col-span-4 space-y-4">
                 <div className="glass-card p-6 bg-amber-50/50 border-amber-100 ring-1 ring-amber-100">
                    <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 uppercase tracking-widest">
                       <AlertCircle className="h-4 w-4" /> Attention Required
                    </h3>
                    <div className="mt-4 space-y-3">
                       {items.filter(i => i.currentStock <= i.minQuantity).length > 0 ? (
                           items.filter(i => i.currentStock <= i.minQuantity).slice(0, 5).map(item => (
                            <div key={item.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center group">
                                <div>
                                   <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                   <p className="text-[10px] text-red-500 font-bold mt-0.5">Stock Left: {item.currentStock} {item.unit}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setTransactionType(InventoryTransactionType.Purchase);
                                        setShowTransactionModal(true);
                                    }}
                                    className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-600 hover:text-white"
                                >
                                   <Plus className="h-4 w-4" />
                                </button>
                             </div>
                           ))
                       ) : (
                           <div className="text-center py-6 text-slate-400 italic text-xs">
                               No critical stock issues detected.
                           </div>
                       )}
                    </div>
                 </div>

                 {/* Top Action Panel */}
                 <div className="glass-card p-6 border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Operations</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                       <button 
                        onClick={() => {
                            setTransactionType(InventoryTransactionType.Purchase);
                            setShowTransactionModal(true);
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100 group"
                       >
                          <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Purchase Order</span>
                       </button>
                       <button 
                        onClick={() => {
                            setTransactionType(InventoryTransactionType.Issue);
                            setShowTransactionModal(true);
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100 group"
                       >
                          <Send className="h-6 w-6 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Issue Item</span>
                       </button>
                    </div>
                 </div>
              </div>

              {/* Recent Activity List */}
              <div className="lg:col-span-8">
                 <div className="glass-card overflow-hidden h-full border-none ring-1 ring-slate-200 shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <h3 className="text-base font-bold text-slate-800">Operational Log</h3>
                       <button 
                        onClick={() => setActiveTab('transactions')}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                       >
                           View Historical Archive
                       </button>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left font-normal border-collapse">
                          <thead className="bg-slate-50/30">
                             <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Entity/Party</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Handler</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic text-right">Value</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic text-right">Qty</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {transactions.length > 0 ? (
                                 transactions.slice(0, 10).map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className={`h-1.5 w-1.5 rounded-full ${
                                                t.type === InventoryTransactionType.Purchase ? 'bg-emerald-500' : t.type === InventoryTransactionType.Issue ? 'bg-indigo-500' : 'bg-amber-500'
                                             }`} />
                                             <div>
                                                <p className="text-sm font-bold text-slate-800">{t.itemName}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{t.typeName} • {formatDate(t.transactionDate)}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4">
                                          <p className="text-sm text-slate-600 font-medium">{t.entity || '-'}</p>
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-1.5">
                                             <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">
                                                {t.handledBy?.substring(0, 2).toUpperCase() || 'AD'}
                                             </div>
                                             <span className="text-xs text-slate-500">{t.handledBy}</span>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <p className="text-sm font-bold text-slate-800">{formatCurrency(t.totalAmount || 0)}</p>
                                          <p className="text-[9px] text-slate-400">@{formatCurrency(t.unitPrice)}</p>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <span className={`text-sm font-bold ${
                                             t.type === InventoryTransactionType.Purchase ? 'text-emerald-600' : 'text-amber-600'
                                          }`}>
                                             {t.type === InventoryTransactionType.Purchase ? `+${t.quantity}` : `-${t.quantity}`}
                                          </span>
                                       </td>
                                    </tr>
                                 ))
                             ) : (
                                 <tr>
                                     <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic text-sm">
                                         No transactions found.
                                     </td>
                                 </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-500 border-none ring-1 ring-slate-100">
           <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md group">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                    type="text" 
                    placeholder="Search catalog by name or code..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 font-normal outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2">
                 <button className="flex items-center gap-2 p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                    <Filter className="h-4 w-4" />
                 </button>
                 <button 
                    onClick={() => {
                        setEditingItem(null);
                        setShowItemModal(true);
                    }}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-200"
                 >
                    <Plus className="h-4 w-4" /> Add Asset
                 </button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left font-normal border-collapse">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Item Identity</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Category</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic text-center">Current Stock</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Price/Unit</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                       <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="px-6 py-5">
                             <p className="text-sm font-bold text-slate-800">{item.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Code: {item.code || `IT-${item.id.substring(0, 4)}`}</p>
                          </td>
                          <td className="px-6 py-5">
                             <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {item.categoryName || 'Uncategorized'}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex flex-col items-center">
                                <span className={`text-sm font-black ${item.currentStock <= item.minQuantity ? 'text-red-500' : 'text-slate-800'}`}>
                                   {item.currentStock} {item.unit}
                                </span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden shadow-inner">
                                   <div 
                                      className={`h-full transition-all duration-1000 ${item.currentStock <= item.minQuantity ? 'bg-red-400' : 'bg-indigo-400'}`} 
                                      style={{ width: `${Math.min((item.currentStock / (item.minQuantity || 1)) * 50, 100)}%` }}
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 font-normal text-sm text-slate-600">
                             {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => {
                                        setEditingItem(item);
                                        setShowItemModal(true);
                                    }}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110"
                                >
                                   <Edit3 className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                                >
                                   <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                No items found in catalog.
                            </td>
                        </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
          <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-500 border-none ring-1 ring-slate-100">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h2 className="text-lg font-bold text-slate-800">Supplier Directory</h2>
               <button 
                    onClick={() => {
                        setEditingSupplier(null);
                        setShowSupplierModal(true);
                    }}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-200"
                >
                    <Plus className="h-4 w-4" /> Add Supplier
               </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-normal border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Supplier Details</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Contact</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {suppliers.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/40 transition-colors group">
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-slate-800">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{s.address || 'No address'}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {s.category || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm text-slate-600 font-medium">{s.contactPerson || '-'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{s.phone || '-'}</p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                setEditingSupplier(s);
                                                setShowSupplierModal(true);
                                            }}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if(confirm('Delete supplier?')) {
                                                    await inventoryApi.deleteSupplier(s.id);
                                                    fetchData();
                                                }
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {suppliers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                    No suppliers registered.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {activeTab === 'categories' && (
          <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-500 border-none ring-1 ring-slate-100">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h2 className="text-lg font-bold text-slate-800">Item Categories</h2>
               <button 
                    onClick={() => {
                        setEditingCategory(null);
                        setShowCategoryModal(true);
                    }}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-200"
                >
                    <Plus className="h-4 w-4" /> Add Category
               </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left font-normal border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Category Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic">Description</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest italic text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50/40 transition-colors group">
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm text-slate-400 italic">{c.description || 'No description'}</p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                setEditingCategory(c);
                                                setShowCategoryModal(true);
                                            }}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if(confirm('Delete category?')) {
                                                    await inventoryApi.deleteCategory(c.id);
                                                    fetchData();
                                                }
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}

       {activeTab === 'transactions' && (
        <div className="glass-card animate-in fade-in slide-in-from-right-4 duration-500 border-none ring-1 ring-slate-100">
           <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800">Operational History & Invoicing</h2>
              <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setTransactionType(InventoryTransactionType.Purchase);
                        setShowTransactionModal(true);
                    }}
                    className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm text-sm"
                >
                    <Plus className="h-4 w-4" /> New Acquisition
                </button>
                <button 
                    onClick={() => {
                        setTransactionType(InventoryTransactionType.Issue);
                        setShowTransactionModal(true);
                    }}
                    className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm text-sm"
                >
                    <Send className="h-4 w-4" /> Issue Item
                </button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left font-normal border-collapse">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Date & Type</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Item Details</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Reference/Source</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Transaction Value</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic text-right">Qty</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic text-right">Invoice</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {transactions.map(t => (
                       <tr key={t.id} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="px-6 py-4">
                             <p className="text-xs font-bold text-slate-800">{formatDate(t.transactionDate)}</p>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${
                                 t.type === InventoryTransactionType.Purchase ? 'text-emerald-600' : 'text-indigo-600'
                             }`}>
                                {t.typeName}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-sm font-bold text-slate-800">{t.itemName}</p>
                             <p className="text-[10px] text-slate-400 font-medium">Rate: {formatCurrency(t.unitPrice)}</p>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-sm text-slate-600 font-medium">{t.entity || '-'}</p>
                             <p className="text-[10px] text-slate-400 italic">Ref: {t.reference || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className={`text-sm font-black ${t.type === InventoryTransactionType.Purchase ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {t.type === InventoryTransactionType.Purchase ? '-' : '+'}{formatCurrency(t.totalAmount || 0)}
                                </span>
                                {t.type === InventoryTransactionType.Purchase && (
                                    <span className={`text-[10px] font-bold flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full w-fit ${
                                        t.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                                        t.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {t.paymentStatus === 'Paid' ? <CheckCircle className="h-2.5 w-2.5" /> : 
                                         t.paymentStatus === 'Partial' ? <Clock className="h-2.5 w-2.5" /> : <AlertCircleIcon className="h-2.5 w-2.5" />}
                                        {t.paymentStatus || 'Unpaid'}
                                    </span>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className={`text-sm font-bold ${
                                t.type === InventoryTransactionType.Purchase ? 'text-emerald-600' : 'text-amber-600'
                             }`}>
                                {t.type === InventoryTransactionType.Purchase ? `+${t.quantity}` : `-${t.quantity}`}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => {
                                    toast.success(`Downloading Invoice ${t.reference || t.id.substring(0,8)}...`);
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                             >
                                <FileText className="h-4 w-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Box className="h-5 w-5 text-indigo-600" />
                          {editingItem ? 'Edit Item' : 'Add New Item'}
                      </h2>
                      <button onClick={() => setShowItemModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                          <X className="h-5 w-5 text-slate-400" />
                      </button>
                  </div>
                  <form onSubmit={handleUpsertItem} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Item Name</label>
                            <input name="name" defaultValue={editingItem?.name} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Item Code</label>
                            <input name="code" defaultValue={editingItem?.code} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Category</label>
                            <select name="categoryId" defaultValue={editingItem?.categoryId} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Unit</label>
                            <input name="unit" defaultValue={editingItem?.unit || 'Pcs'} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Unit Price</label>
                            <input name="unitPrice" type="number" step="0.01" defaultValue={editingItem?.unitPrice} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Min Stock Alert</label>
                            <input name="minQuantity" type="number" defaultValue={editingItem?.minQuantity} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                          <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Save Item</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          {transactionType === InventoryTransactionType.Purchase ? <ShoppingCart className="h-5 w-5 text-emerald-600" /> : <Send className="h-5 w-5 text-indigo-600" />}
                          {transactionType === InventoryTransactionType.Purchase ? 'Record Purchase' : 'Issue Item'}
                      </h2>
                      <button onClick={() => setShowTransactionModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                          <X className="h-5 w-5 text-slate-400" />
                      </button>
                  </div>
                  <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Select Item</label>
                         <select name="itemId" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none">
                             <option value="">Select Item</option>
                             {items.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.currentStock})</option>)}
                         </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Quantity</label>
                             <input name="quantity" type="number" step="0.01" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Rate / Unit Price</label>
                             <input name="unitPrice" type="number" step="0.01" required placeholder="e.g. 250" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Reference No</label>
                             <input name="reference" placeholder="Bill/Slip No" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{transactionType === InventoryTransactionType.Purchase ? 'Issued To / Entity' : 'Issued To'}</label>
                             <input name="entity" placeholder="Recipient / Dept Name" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Handled By</label>
                             <input name="handledBy" defaultValue="Admin" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Notes</label>
                             <input name="notes" placeholder="Optional notes" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                         </div>
                       </div>

                       {/* Vendor Payment Section — only for Purchases */}
                       {transactionType === InventoryTransactionType.Purchase && (
                         <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                           <p className="text-xs font-bold text-amber-700 uppercase mb-3 flex items-center gap-1.5">
                             <Clock className="h-3.5 w-3.5" /> Vendor Payment (Internal Tracking Only)
                           </p>
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Supplier</label>
                                 <select name="supplierId" className="w-full px-4 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-100 outline-none">
                                     <option value="">Select Supplier</option>
                                     {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Payment Status</label>
                                 <select name="paymentStatus" defaultValue="Unpaid" className="w-full px-4 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-100 outline-none">
                                     <option value="Unpaid">Unpaid</option>
                                     <option value="Partial">Partial</option>
                                     <option value="Paid">Paid</option>
                                 </select>
                             </div>
                             <div className="col-span-2">
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Amount Paid to Vendor</label>
                                 <input name="amountPaid" type="number" step="0.01" defaultValue="0" placeholder="0.00" className="w-full px-4 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-100 outline-none" />
                             </div>
                           </div>
                         </div>
                       )}

                       <div className="pt-2 flex gap-3">
                           <button type="button" onClick={() => setShowTransactionModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                           <button type="submit" className={`flex-1 px-6 py-3 ${transactionType === InventoryTransactionType.Purchase ? 'bg-emerald-600' : 'bg-indigo-600'} text-white font-bold rounded-2xl shadow-lg transition-all`}>
                             {transactionType === InventoryTransactionType.Purchase ? 'Confirm Purchase' : 'Confirm Issue'}
                           </button>
                       </div>
                   </form>
              </div>
          </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-indigo-600" />
                          {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                      </h2>
                      <button onClick={() => setShowSupplierModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                          <X className="h-5 w-5 text-slate-400" />
                      </button>
                  </div>
                  <form onSubmit={handleUpsertSupplier} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Company/Name</label>
                            <input name="name" defaultValue={editingSupplier?.name} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Contact Person</label>
                            <input name="contactPerson" defaultValue={editingSupplier?.contactPerson} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone</label>
                            <input name="phone" defaultValue={editingSupplier?.phone} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Address</label>
                            <input name="address" defaultValue={editingSupplier?.address} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                      </div>
                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setShowSupplierModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                          <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Save Supplier</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Layers className="h-5 w-5 text-indigo-600" />
                          {editingCategory ? 'Edit Category' : 'New Category'}
                      </h2>
                      <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                          <X className="h-5 w-5 text-slate-400" />
                      </button>
                  </div>
                  <form onSubmit={handleUpsertCategory} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Category Name</label>
                            <input name="name" defaultValue={editingCategory?.name} required className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                            <textarea name="description" defaultValue={editingCategory?.description} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none h-24 resize-none" />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Save</button>
                        </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}
