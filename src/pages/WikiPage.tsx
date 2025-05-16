import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Edit, Clock, ChevronDown, ArrowLeft } from 'lucide-react';
import { WikiContext, WikiPage as WikiPageType } from '../contexts/WikiContext';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';

const WikiPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { wikiPages, getPageByPath } = useContext(WikiContext);
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState<WikiPageType | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get the full path including any nested route
  const pathname = window.location.pathname;
  const path = pathname.replace('/wiki/', '');

  useEffect(() => {
    if (path) {
      setIsLoading(true);
      const page = getPageByPath(path);
      setCurrentPage(page);
      setIsLoading(false);
    }
  }, [path, getPageByPath, wikiPages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">The page you are looking for does not exist.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft size={16} className="mr-1" /> Return to Home
          </Link>
          {user && (
            <Link
              to={`/create?path=${encodeURIComponent(path)}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit size={16} className="mr-1" /> Create This Page
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Extract the parent path and depth for breadcrumb navigation
  const pathSegments = currentPage.path.split('/');
  const hasParent = pathSegments.length > 1;
  
  // Build breadcrumb data
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = pathSegments.slice(0, index + 1).join('/');
    const page = getPageByPath(path);
    return {
      name: page?.title || segment,
      path,
      current: index === pathSegments.length - 1
    };
  });

  return (
    <article className="space-y-4 pb-12">
      {/* Breadcrumb navigation */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          </li>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <li className="text-gray-400">/</li>
              <li>
                {crumb.current ? (
                  <span className="font-medium text-gray-900 dark:text-white">{crumb.name}</span>
                ) : (
                  <Link to={`/wiki/${crumb.path}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {crumb.name}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <header className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentPage.title}</h1>
          {user && (
            <Link
              to={`/edit/${currentPage.path}`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit size={16} className="mr-1.5" />
              Edit
            </Link>
          )}
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>
            Last updated by <span className="font-medium">{currentPage.updatedBy}</span> on{' '}
            {new Date(currentPage.updatedAt).toLocaleDateString()} 
          </span>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="ml-4 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            <Clock size={14} className="mr-1" />
            History <ChevronDown size={14} className={`ml-1 transition-transform duration-200 ${showHistory ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
      </header>

      {/* Revision history */}
      {showHistory && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 mt-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Revision History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Editor</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comment</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentPage.revisions.length > 0 ? (
                  <>
                    {currentPage.revisions.map((revision, index) => (
                      <tr key={revision.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                          {format(new Date(revision.editedAt), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{revision.editedBy}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{revision.comment || '(No comment)'}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                        {format(new Date(currentPage.createdAt), 'MMM d, yyyy HH:mm')} (Original)
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">{currentPage.createdBy}</td>
                      <td className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">Page created</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400" colSpan={3}>
                      No revisions yet. This is the original version created on {format(new Date(currentPage.createdAt), 'MMM d, yyyy')} by {currentPage.createdBy}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Article content */}
      <div className="prose dark:prose-invert prose-blue max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
        >
          {currentPage.content}
        </ReactMarkdown>
      </div>
    </article>
  );
};

export default WikiPage;