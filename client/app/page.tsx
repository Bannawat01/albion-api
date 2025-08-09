'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';


interface SearchResult {
  id: number;
  title: string;
  category: string;
  url: string;
}

const SearchBar = () => {
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Tools',
    'Map',
    'Database'
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search data
  const mockResults = [
    { id: 1, title: 'Getting Started with Next.js', category: 'Documentation', url: '/docs/getting-started' },
    { id: 2, title: 'API Routes in Next.js', category: 'Tutorial', url: '/tutorials/api-routes' },
    { id: 3, title: 'Server-Side Rendering', category: 'Guide', url: '/guides/ssr' },
    { id: 4, title: 'Static Site Generation', category: 'Guide', url: '/guides/ssg' },
    { id: 5, title: 'Next.js Image Optimization', category: 'Feature', url: '/features/images' },
    { id: 6, title: 'Authentication with NextAuth', category: 'Tutorial', url: '/tutorials/auth' },
  ];

  // Simulate search with debouncing
  useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const filtered = mockResults.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSearch = (searchTerm = query) => {
    if (searchTerm.trim()) {
      // Add to recent searches
      const updatedRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updatedRecent);
      
      // Simulate navigation or API call
      console.log('Searching for:', searchTerm);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Search..."
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-slate-300 rounded-xl focus:border-slate-700 focus:outline-none focus:ring-0 transition-colors duration-200 bg-white shadow-sm text-slate-900"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          {query.length === 0 ? (
            /* Recent Searches */
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-3">
                <Clock className="h-4 w-4" />
                Albo Searches
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-slate-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearch(result.title)}
                      className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors">
                            {result.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">{result.category}</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
          
          {/* Search Footer */}
          {query && (
            <div className="border-t border-slate-100 p-3 bg-slate-50">
              <button
                onClick={() => handleSearch()}
                className="w-full text-left text-sm text-slate-700 hover:text-slate-900 font-medium"
              >
                Search for "{query}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Demo wrapper component
const SearchBarDemo = () => {
  return (
    <div>
    <div className="w-auto max-w-4xl mx-auto mt-16 mb-8 mx-4 p-8 border border-slate-700 rounded-2xl shadow-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
              Albo Search
          </h1>
          <p className="text-lg text-white/70 drop-shadow-lg">
            ค้นหาข้อมูลที่คุณต้องการได้อย่างรวดเร็วและง่ายดาย
          </p>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-2xl p-8">
          <SearchBar />
          </div>
  
      </div>
      </div>
    </div>
  );
};

export default SearchBarDemo;