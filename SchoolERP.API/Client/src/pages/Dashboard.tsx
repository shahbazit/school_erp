import { Users, BookOpen, CreditCard, Bell } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Content */}
      <div className="flex justify-end">
        <div className="flex gap-2">
          <button className="btn-secondary">Export Report</button>
          <button className="btn-primary">+ Register Student</button>
        </div>
      </div>

      {/* Metrics Grids */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Enrolled', value: '1,248', icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Active Classes', value: '42', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Fees Collected (Month)', value: '₹52,400', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Dues', value: '₹8,250', icon: Bell, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 flex items-start justify-between group">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 group-hover:text-primary-600 transition-colors">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Data Table Area */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Recent Registrations</h3>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 uppercase text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200">Student Name</th>
                <th className="px-6 py-3 border-b border-slate-200">Class & Section</th>
                <th className="px-6 py-3 border-b border-slate-200">Parent Info</th>
                <th className="px-6 py-3 border-b border-slate-200">Status</th>
                <th className="px-6 py-3 border-b border-slate-200 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {[
                { name: 'Alice Freeman', class: '10th', section: 'A', parent: '+1 (555) 0192', status: 'Active' },
                { name: 'Michael Chen', class: '8th', section: 'C', parent: '+1 (555) 8310', status: 'Pending Fees' },
                { name: 'Sarah Wilson', class: '12th', section: 'Science', parent: '+1 (555) 4322', status: 'Active' },
                { name: 'David Kim', class: '5th', section: 'B', parent: '+1 (555) 7592', status: 'Active' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                  <td className="px-6 py-4 text-slate-500">{row.class} - {row.section}</td>
                  <td className="px-6 py-4 text-slate-500">{row.parent}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                      row.status === 'Active' ? 'bg-emerald-100/50 text-emerald-700' : 'bg-amber-100/50 text-amber-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
