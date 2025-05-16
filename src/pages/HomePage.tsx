import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Users, Clock, Settings } from 'lucide-react';
import { WikiContext } from '../contexts/WikiContext';
import { AuthContext } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { wikiPages } = useContext(WikiContext);
  const { user } = useContext(AuthContext);
  
  // Get recent pages (up to 5)
  const recentPages = [...wikiPages]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to <span className="text-blue-600 dark:text-blue-400">KnowledgeWiki</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Create, share, and explore knowledge in a collaborative environment.
        </p>
        {user ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/create" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md font-semibold text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={18} className="mr-2" />
              Create New Page
            </Link>
            <Link 
              to="/search" 
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <BookOpen size={18} className="mr-2" />
              Browse Pages
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md font-semibold text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {wikiPages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Clock size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-bold">Recently Updated</h2>
            </div>
            <ul className="space-y-2">
              {recentPages.map(page => (
                <li key={page.id}>
                  <Link 
                    to={`/wiki/${page.path}`}
                    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                  >
                    <div className="font-medium text-blue-600 dark:text-blue-400">{page.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between mt-1">
                      <span>Updated by {page.updatedBy}</span>
                      <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link 
              to="/search"
              className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all pages →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users size={24} className="text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-bold">Wiki Features</h2>
            </div>
            <ul className="space-y-2">
              <li className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="font-medium">📝 Create and Edit Pages</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Create content with Markdown formatting, images, and more
                </div>
              </li>
              <li className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="font-medium">🔍 Search and Discover</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Find content quickly with powerful search functionality
                </div>
              </li>
              <li className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="font-medium">📊 Version History</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Track changes and revert to previous versions when needed
                </div>
              </li>
              <li className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="font-medium">🔒 Permission Controls</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Manage who can edit your wiki to prevent unwanted changes
                </div>
              </li>
            </ul>
            {user?.isAdmin && (
              <Link 
                to="/settings"
                className="mt-4 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Settings size={16} className="mr-1" />
                Configure wiki settings
              </Link>
            )}
          </div>
        </div>
      )}

      {wikiPages.length === 0 && user && (
        <div className="bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-blue-900 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Get Started With Your Wiki</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your wiki is empty. Create your first page to get started!
          </p>
          <Link 
            to="/create" 
            className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={18} className="mr-2" />
            Create First Page
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;