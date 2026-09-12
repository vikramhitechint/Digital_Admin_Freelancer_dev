import React, { useState } from 'react';
import { 
  Settings, UserCircle, Plus, Trash2, Mail, Shield, CheckCircle, UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Moderator' | 'Support';
  status: 'Active' | 'Invited';
};

const initialAdmins: AdminUser[] = [
  { id: '1', name: 'Elena Vance', email: 'elena@htge.in', role: 'Super Admin', status: 'Active' },
  { id: '2', name: 'Marcus Reed', email: 'marcus@htge.in', role: 'Moderator', status: 'Active' },
];

export default function SettingsPage() {
  const { admin } = useAuthStore();
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  
  // Form state for new admin
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Super Admin' | 'Moderator' | 'Support'>('Moderator');

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newAdmin: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'Invited'
    };

    setAdmins([...admins, newAdmin]);
    setNewName('');
    setNewEmail('');
    setNewRole('Moderator');
    toast.success('Admin invitation sent successfully!');
  };

  const handleRemoveAdmin = (id: string, name: string) => {
    if (id === '1') {
      toast.error('Cannot remove the primary Super Admin.');
      return;
    }
    setAdmins(admins.filter(a => a.id !== id));
    toast.success(`${name} has been removed from the admin team.`);
  };

  // Safe fallback if admin is not yet loaded or missing name
  const currentAdminEmail = admin?.email || 'adminhtge@gmail.org';
  const currentAdminName = 'Digital Freelancer Admin';
  const currentAdminRole = admin?.role || 'Super Admin';

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-[#F7F8FA]">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-20">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-400" />
            Platform Settings
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage platform configuration and administrator access.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Profile & Add New Admin */}
          <div className="xl:col-span-1 space-y-8">
            
            {/* 1. Current User Details Profile */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-3xl border-4 border-white shadow-md mb-4">
                  {currentAdminName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{currentAdminName}</h2>
                <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {currentAdminEmail}
                </div>
                <div className="mt-4 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  {currentAdminRole}
                </div>
                
                <div className="w-full mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Account Status</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Active
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Add New Admin Form (Inline) */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  Add New Admin
                </h3>
              </div>
              <form onSubmit={handleCreateAdmin} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                  <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="john@company.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Access Role</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white">
                    <option value="Super Admin">Super Admin</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4" /> Send Invite
                </button>
              </form>
            </section>
          </div>

          {/* Right Column: Admin List Table */}
          <div className="xl:col-span-2">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Administrator Accounts
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Total active and invited platform administrators.</p>
                </div>
                <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
                  Total: {admins.length} Admins
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-8">User Details</th>
                      <th className="py-4 px-8">Role</th>
                      <th className="py-4 px-8">Status</th>
                      <th className="py-4 px-8 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map(admin => (
                      <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200 shrink-0">
                              {admin.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{admin.name}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3.5 h-3.5" />
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            admin.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                            admin.role === 'Moderator' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            admin.status === 'Active' ? 'text-emerald-600' : 'text-amber-500'
                          }`}>
                            {admin.status === 'Active' ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-amber-500 ml-1" />}
                            {admin.status}
                          </span>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <button 
                            onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Remove Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

