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
        <h1 className="text-2xl font-bold text-slate-900">College Clubs & Extracurricular Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Explore campus student organizations, technical societies, and extracurricular activities.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
