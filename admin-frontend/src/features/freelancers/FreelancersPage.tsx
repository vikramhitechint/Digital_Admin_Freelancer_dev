import React, { useState } from 'react';
import { 
  Search, Eye, Plus, CheckCircle, Mail, MapPin, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Mock Data
type Freelancer = {
  id: string; 
  name: string; 
  title: string; 
  location: string;
  email: string;
  status: 'Available' | 'Busy';
  rating: number;
  completedProjects: number;
  skills: string[];
};

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const res = await api.get('/admin/freelancers');
      if (res.data.success) {
        setFreelancers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load freelancers');
    }
  };

  // New Freelancer Form State
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSkills, setNewSkills] = useState(''); // Comma separated

  const filtered = freelancers.filter(f => {
    const term = search.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) || 
      f.title.toLowerCase().includes(term) ||
      f.skills.some(skill => skill.toLowerCase().includes(term))
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTitle || !newEmail || !newSkills) return;

    const parsedSkills = newSkills.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await api.post('/admin/freelancers', {
        name: newName,
        title: newTitle,
        email: newEmail,
        skills: parsedSkills.length > 0 ? parsedSkills : ['General']
      });

      if (res.data.success) {
        toast.success('Freelancer profile created successfully!');
        setIsModalOpen(false);
        setNewName('');
        setNewTitle('');
        setNewEmail('');
        setNewSkills('');
        // Reload freelancers list
        fetchFreelancers();
      } else {
        toast.error('Failed to create freelancer profile.');
      }
    } catch (err) {
      console.error('Error creating freelancer:', err);
      toast.error('Failed to create freelancer profile.');
    }
  };

  const handleView = (name: string) => {
    toast(`Viewing comprehensive profile: ${name}`, { icon: '👁️' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-[#F7F8FA] relative text-base">
      
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 z-20">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Freelancers</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">View, search, and onboard verified professional talent.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              className="w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 transition" 
              placeholder="Search by name, role, or skills..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-bold shadow-sm transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Freelancer</span>
          </button>
        </div>
      </header>

      {/* Main List */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(fl => (
            <div key={fl.id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl border border-blue-200">
                    {fl.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{fl.name}</h3>
                    <p className="text-sm text-slate-500 font-mono">{fl.id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${fl.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {fl.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="text-base font-bold text-slate-800">{fl.title}</div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" /> {fl.email}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400" /> {fl.location}
                </div>
                {/* Skills Section */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {fl.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-lg font-black text-slate-900">{fl.rating} <span className="text-sm text-amber-500">★</span></div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900">{fl.completedProjects}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Projects</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleView(fl.name)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold transition shadow-sm"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  View
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <Search className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No freelancers found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">Onboard New Freelancer</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-full p-2 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Professional Title / Role</label>
                <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="e.g. Senior Frontend Developer" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Core Skills (Comma Separated)</label>
                <input required type="text" value={newSkills} onChange={e => setNewSkills(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" placeholder="e.g. React, Node.js, GraphQL" />
              </div>
              <div className="pt-6 flex items-center gap-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-6 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-base font-bold hover:bg-slate-100 transition shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition shadow-md">Create Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
