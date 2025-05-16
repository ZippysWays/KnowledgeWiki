import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronDown, Plus, Settings, Search } from 'lucide-react';
import { WikiContext } from '../../contexts/WikiContext';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wikiPages } = useContext(WikiContext);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    // Close sidebar on navigation on mobile
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        closeSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, closeSidebar]);

  // Group pages by their main section
  const groupedPages = wikiPages.reduce((acc, page) => {
    const mainSection = page.path.split('/')[0];
    if (!acc[mainSection]) {
      acc[mainSection] = [];
    }
    acc[mainSection].push(page);
    return acc;
  }, {} as Record<string, typeof wikiPages>);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCreatePage = () => {
    navigate('/create');
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out z-30 md:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h2 className="text-lg font-bold">Wiki Navigation</h2>
          <button 
            onClick={closeSidebar}
            className="p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Wiki Pages</h3>
            <button 
              onClick={handleCreatePage}
              className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Create new page"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Wiki Structure */}
          <nav className="space-y-1">
            {Object.keys(groupedPages).length > 0 ? (
              Object.entries(groupedPages).map(([section, pages]) => (
                <div key={section} className="mb-2">
                  <button
                    onClick={() => toggleSection(section)}
                    className="flex items-center justify-between w-full px-2 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="font-medium">{section}</span>
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform ${
                        expandedSections.includes(section) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedSections.includes(section) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {pages.map(page => (
                        <Link
                          key={page.id}
                          to={`/wiki/${page.path}`}
                          className={`block px-2 py-1.5 rounded-md ${
                            location.pathname === `/wiki/${page.path}`
                              ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic text-sm py-2">
                No pages created yet. Create your first page!
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link 
            to="/search" 
            className="flex items-center px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Search size={18} className="mr-2" />
            <span>Advanced Search</span>
          </Link>
          <Link 
            to="/settings" 
            className="flex items-center px-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <Settings size={18} className="mr-2" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;