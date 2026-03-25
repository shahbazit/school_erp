import { useState, useEffect } from 'react';
import { 
  Package, TrendingDown, TrendingUp, Search, 
  Settings, Plus, FileText, Filter, Calendar, 
  ShoppingCart, Send, AlertCircle, CheckCircle2,
  Trash2, Edit3, DollarSign, UserCheck, BarChart3,
  Box, History, Layers
} from 'lucide-react';

export default function InventoryStore() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'suppliers' | 'transactions'>('dashboard');
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Data Mock (Module ready for backend binding)
  useEffect(() => {
    // Simulated initial data
    setItems([
      { id: '1', name: 'Standard Uniform (Set)', category: 'Uniform', stock: 42, unit: 'Set', min: 10, price: 1200 },
      { id: '2', name: 'Notebook (Single Line)', category: 'Stationery', stock: 156, unit: 'Pcs', min: 30, price: 50 },
      { id: '3', name: 'Graph Paper Pad', category: 'Lab Supplies', stock: 5, unit: 'Pad', min: 15, price: 85 },
      { id: '4', name: 'School Tie', category: 'Uniform', stock: 88, unit: 'Pcs', min: 10, price: 250 },
    ]);
    
    setTransactions([
      { id: 't1', date: '2024-03-21', type: 'Purchase', item: 'Notebook (Single Line)', qty: 100, entity: 'Bharat Paper Mill', user: 'Admin' },
      { id: 't2', date: '2024-03-21', type: 'Issue', item: 'Standard Uniform (Set)', qty: 1, entity: 'Rahul Sharma (10th-A)', user: 'Office' },
      { id: 't3', date: '2024-03-20', type: 'Adjustment', item: 'Graph Paper Pad', qty: -2, entity: 'Damaged In Transit', user: 'Lab Asst' },
    ]);

    setSuppliers([
      { id: 's1', name: 'Bharat Paper Mill', contact: 'Anil Kumar', phone: '9876543210', category: 'Stationery' },
      { id: 's2', name: 'Metro Textiles', contact: 'Rajesh Jain', phone: '9123456780', category: 'Uniform' },
    ]);
  }, []);

  const metrics = [
    { label: 'Total In-Stock Items', value: '241', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Low Stock Alerts', value: '5', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Monthly Purchases', value: '₹8,250', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Issuances', value: '1,420', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

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
           <button className="btn-secondary flex items-center gap-2 px-5 py-2.5 shadow-sm rounded-xl hover:scale-[1.02] transition-transform">
             <BarChart3 className="h-4 w-4" /> Reports
           </button>
           <button className="btn-primary flex items-center gap-2 px-5 py-2.5 shadow-lg shadow-indigo-200 rounded-xl hover:scale-[1.02] active:scale-95 transition-all">
             <Plus className="h-4 w-4" /> New Acquisition
           </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Overview', icon: BarChart3 },
          { id: 'items', label: 'Item Master', icon: Box },
          { id: 'transactions', label: 'Transactions', icon: History },
          { id: 'suppliers', label: 'Suppliers', icon: UserCheck }
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
                       {items.filter(i => i.stock <= i.min).map(item => (
                          <div key={item.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center group">
                             <div>
                                <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                <p className="text-[10px] text-red-500 font-bold mt-0.5">Stock Left: {item.stock} {item.unit}</p>
                             </div>
                             <button className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-amber-600 hover:text-white">
                                <Plus className="h-4 w-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Top Action Panel */}
                 <div className="glass-card p-6 border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Operations</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                       <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100 group">
                          <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold">Purchase Order</span>
                       </button>
                       <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100 group">
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
                       <button className="text-xs font-bold text-indigo-600 hover:underline">View Historical Archive</button>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left font-normal border-collapse">
                          <thead className="bg-slate-50/30">
                             <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Transaction</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Entity/Party</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic">Handler</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tight italic text-right">Qty</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {transactions.map((t, idx) => (
                                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className={`h-1.5 w-1.5 rounded-full ${
                                            t.type === 'Purchase' ? 'bg-emerald-500' : t.type === 'Issue' ? 'bg-indigo-500' : 'bg-amber-500'
                                         }`} />
                                         <div>
                                            <p className="text-sm font-bold text-slate-800">{t.item}</p>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{t.type} • {t.date}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <p className="text-sm text-slate-600 font-medium">{t.entity}</p>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-1.5">
                                         <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">
                                            {t.user.substring(0, 2)}
                                         </div>
                                         <span className="text-xs text-slate-500">{t.user}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <span className={`text-sm font-bold ${
                                         t.qty > 0 ? 'text-emerald-600' : 'text-amber-600'
                                      }`}>
                                         {t.qty > 0 ? `+${t.qty}` : t.qty}
                                      </span>
                                   </td>
                                </tr>
                             ))}
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
                 <button className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-200">
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
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Code: IT-{item.id.padStart(4, '0')}</p>
                          </td>
                          <td className="px-6 py-5">
                             <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {item.category}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex flex-col items-center">
                                <span className={`text-sm font-black ${item.stock <= item.min ? 'text-red-500' : 'text-slate-800'}`}>
                                   {item.stock} {item.unit}
                                </span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden shadow-inner">
                                   <div 
                                      className={`h-full transition-all duration-1000 ${item.stock <= item.min ? 'bg-red-400' : 'bg-indigo-400'}`} 
                                      style={{ width: `${Math.min((item.stock/item.min) * 50, 100)}%` }}
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 font-normal text-sm text-slate-600">
                             ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-5 text-right">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110">
                                   <Edit3 className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110">
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

      {/* Placeholder for Suppliers and Transactions Tabs */}
      {(activeTab === 'suppliers' || activeTab === 'transactions') && (
        <div className="glass-card p-20 flex flex-col items-center justify-center text-slate-400 border-none ring-1 ring-slate-100">
           <Layers className="h-16 w-16 opacity-10 animate-pulse mb-6" />
           <p className="text-sm font-bold uppercase tracking-widest">Sub-module Under Final Tuning</p>
           <p className="text-xs font-medium italic mt-2">Connecting to Real-time Stream Analytics...</p>
        </div>
      )}

    </div>
  );
}
