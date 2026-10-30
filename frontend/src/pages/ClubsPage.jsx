import React, { useState, useEffect } from 'react';
import { getClubsApi } from '../services/api';
import ClubCard from '../components/ClubCard';
import { Users, Search, Filter } from 'lucide-react';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClubs();
  }, [category]);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await getClubsApi({ category: category || undefined, search: search || undefined });
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClubs();
  };

  const categories = [
    'All Categories',
    'Coding & Programming',
    'Robotics & Electronics',
    'Artificial Intelligence',
    'Entrepreneurship & Innovation',
    'Cultural & Arts',
    'Sports & Fitness',
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#290044]">College Clubs & Extracurricular Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Explore campus student organizations, technical societies, and extracurricular activities.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200 text-xs font-medium outline-none focus:ring-2 focus:ring-[#500071]/20 focus:border-[#8A2A78]"
          />
          <Search className="w-4 h-4 text-[#8A2A78] absolute left-3.5 top-2.5" />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const val = cat === 'All Categories' ? '' : cat;
            const isSelected = category === val;
            return (
              <button
                key={cat}
                onClick={() => setCategory(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] shadow-md shadow-[#500071]/25 border border-[#EEE3B0]/20' 
                    : 'bg-purple-50/70 text-[#290044] hover:bg-[#EEE3B0]/40 border border-purple-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#500071]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
}
