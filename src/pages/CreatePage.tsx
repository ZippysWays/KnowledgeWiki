import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, EyeIcon } from 'lucide-react';
import { WikiContext } from '../contexts/WikiContext';
import { AuthContext } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createPage, wikiPages } = useContext(WikiContext);
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [path, setPath] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Check if path was provided in URL
    const searchParams = new URLSearchParams(location.search);
    const suggestedPath = searchParams.get('path');
    if (suggestedPath) {
      setPath(suggestedPath);
    }
  }, [user, navigate, location]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (!path.trim()) {
      setError('Path is required');
      return false;
    }

    // Check for valid path format
    if (!/^[a-zA-Z0-9]+(\/[a-zA-Z0-9]+)*$/.test(path)) {
      setError('Path must only contain letters, numbers, and forward slashes');
      return false;
    }

    // Check if page already exists
    if (wikiPages.some(page => page.path === path)) {
      setError('A page with this path already exists');
      return false;
    }

    setError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setIsCreating(true);
      const newPage = await createPage(title, content, path);
      navigate(`/wiki/${newPage.path}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Page</h1>
        <div className="flex space-x-2">
          {content && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <EyeIcon size={16} className="mr-1.5" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1.5" />
                Create Page
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Page Title</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Title of your page"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Page Path</h2>
          <div className="relative">
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="main/section/page"
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use format: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">main/section/page</code> (no spaces or special characters)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {showPreview ? (
          <div className="p-6">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Preview</h2>
            <div className="prose dark:prose-invert prose-blue max-w-none border-t border-gray-200 dark:border-gray-700 pt-4">
              <h1>{title}</h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Content</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-mono text-sm"
              placeholder="Write your content using Markdown..."
            />
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 text-blue-800 dark:text-blue-300 text-sm">
        <h3 className="font-medium mb-1">Getting Started</h3>
        <p className="mb-2">
          Create your page by filling out the form above. Here are some tips:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Title:</strong> Choose a descriptive title for your page</li>
          <li><strong>Path:</strong> Use a hierarchical structure like <code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">category/subcategory/page-name</code></li>
          <li><strong>Content:</strong> Write using Markdown - you can use headings, lists, links, images, and more</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatePage;