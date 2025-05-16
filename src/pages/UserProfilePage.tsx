import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarDays, Clock, FileText, Edit3 } from 'lucide-react';
import { WikiContext, WikiPage } from '../contexts/WikiContext';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { wikiPages } = useContext(WikiContext);
  const { user } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPages, setUserPages] = useState<WikiPage[]>([]);
  const [userEdits, setUserEdits] = useState<{page: WikiPage, date: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll get from localStorage
        const storedUsers = localStorage.getItem('users') || '[]';
        const users = JSON.parse(storedUsers) as User[];
        const foundUser = users.find(u => u.username === username);
        
        if (foundUser) {
          setProfileUser(foundUser);
          
          // Find pages created by this user
          const pagesCreated = wikiPages.filter(page => page.createdBy === username);
          setUserPages(pagesCreated);
          
          // Find edits by this user (excluding pages they created)
          const edits: {page: WikiPage, date: string}[] = [];
          
          wikiPages.forEach(page => {
            // Skip pages they created (already counted above)
            if (page.createdBy === username) return;
            
            // Check if they ever edited this page
            if (page.updatedBy === username) {
              edits.push({
                page,
                date: page.updatedAt
              });
            }
            
            // Check revision history
            page.revisions.forEach(rev => {
              if (rev.editedBy === username) {
                edits.push({
                  page,
                  date: rev.editedAt
                });
              }
            });
          });
          
          // Sort edits by date, newest first
          edits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Remove duplicates (keep only most recent edit for each page)
          const uniqueEdits = edits.filter((edit, index, self) => 
            index === self.findIndex(e => e.page.id === edit.page.id)
          );
          
          setUserEdits(uniqueEdits);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [username, wikiPages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">User Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The user "{username}" does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-white">
            <div className="bg-white dark:bg-gray-800 rounded-full h-20 w-20 flex items-center justify-center text-3xl font-bold text-blue-600">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{username}</h1>
              <div className="flex items-center justify-center md:justify-start mt-2 text-blue-100">
                <CalendarDays size={16} className="mr-1" />
                <span className="text-sm">
                  Member since {format(new Date(profileUser.createdAt), 'MMMM yyyy')}
                </span>
                {profileUser.isAdmin && (
                  <span className="ml-3 px-2 py-0.5 text-xs bg-white bg-opacity-20 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center flex-1 min-w-[150px]">
              <FileText size={24} className="text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="text-2xl font-bold">{userPages.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Pages Created</div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center flex-1 min-w-[150px]">
              <Edit3 size={24} className="text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="text-2xl font-bold">{userEdits.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Pages Edited</div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center flex-1 min-w-[150px]">
              <Clock size={24} className="text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {userPages.length + userEdits.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Contributions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pages Created */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FileText size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
          Pages Created
        </h2>
        
        {userPages.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {userPages.map(page => (
              <Link 
                key={page.id}
                to={`/wiki/${page.path}`}
                className="block py-3 hover:bg-gray-50 dark:hover:bg-gray-700 -mx-2 px-2 rounded transition-colors duration-150"
              >
                <div className="font-medium text-blue-600 dark:text-blue-400">{page.title}</div>
                <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{page.path}</span>
                  <span>Created on {format(new Date(page.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-2">
            This user hasn't created any pages yet.
          </p>
        )}
      </div>

      {/* Pages Edited */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Edit3 size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
          Pages Edited
        </h2>
        
        {userEdits.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {userEdits.map(({page, date}) => (
              <Link 
                key={page.id}
                to={`/wiki/${page.path}`}
                className="block py-3 hover:bg-gray-50 dark:hover:bg-gray-700 -mx-2 px-2 rounded transition-colors duration-150"
              >
                <div className="font-medium text-blue-600 dark:text-blue-400">{page.title}</div>
                <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{page.path}</span>
                  <span>Edited on {format(new Date(date), 'MMM d, yyyy')}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-2">
            This user hasn't edited any pages yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;