import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { WikiContext, WikiPage } from '../contexts/WikiContext';
import { Search, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchPages, wikiPages } = useContext(WikiContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiPage[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Parse query from URL on page load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q') || '';
    setQuery(queryParam);
    
    if (queryParam) {
      performSearch(queryParam);
    } else {
      // Show recent pages when no query is provided
      setResults(
        [...wikiPages]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
      );
    }
  }, [location.search, wikiPages]);

  const performSearch = (searchQuery: string) => {
    setIsSearching(true);
    // Small delay to give a searching effect
    setTimeout(() => {
      const searchResults = searchPages(searchQuery);
      setResults(searchResults);
      setIsSearching(false);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    
    // Update URL with search query
    navigate({
      pathname: '/search',
      search: trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '',
    });
    
    if (trimmedQuery) {
      performSearch(trimmedQuery);
    } else {
      // Show recent pages when query is empty
      setResults(
        [...wikiPages]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {query ? 'Search Results' : 'Search Wiki'}
        </h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Search for pages, topics, or content..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-2">
          {query && (
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              {isSearching ? 'Searching...' : `${results.length} ${results.length === 1 ? 'result' : 'results'} for "${query}"`}
            </h2>
          )}
          
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {results.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map(page => (
                    <li key={page.id} className="py-4">
                      <Link 
                        to={`/wiki/${page.path}`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150 -mx-2 px-2 py-1"
                      >
                        <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-1">
                          {page.title}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                          {page.content.substring(0, 200)}
                          {page.content.length > 200 ? '...' : ''}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center mr-4">
                            <Calendar size={14} className="mr-1" />
                            <span>Updated {format(new Date(page.updatedAt), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center">
                            <User size={14} className="mr-1" />
                            <span>{page.updatedBy}</span>
                          </div>
                          <div className="ml-4 text-gray-600 dark:text-gray-300">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                              {page.path}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  {query ? (
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">No pages match your search query.</p>
                      <Link 
                        to="/create" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create a new page
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">
                      No pages found. Start by creating your first wiki page.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {!query && wikiPages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browse All Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(
              wikiPages.reduce((acc, page) => {
                const mainSection = page.path.split('/')[0];
                if (!acc[mainSection]) {
                  acc[mainSection] = [];
                }
                acc[mainSection].push(page);
                return acc;
              }, {} as Record<string, WikiPage[]>)
            ).map(([section, pages]) => (
              <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">{section}</h3>
                <ul className="space-y-1">
                  {pages.map(page => (
                    <li key={page.id}>
                      <Link
                        to={`/wiki/${page.path}`}
                        className="block text-blue-600 dark:text-blue-400 hover:underline py-1"
                      >
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;