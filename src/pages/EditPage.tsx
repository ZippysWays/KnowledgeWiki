import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, EyeIcon } from 'lucide-react';
import { WikiContext } from '../contexts/WikiContext';
import { AuthContext } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const EditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getPageByPath, updatePage } = useContext(WikiContext);
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [editComment, setEditComment] = useState('');
  const [pageId, setPageId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get the full path including any nested route
  const pathname = window.location.pathname;
  const path = pathname.replace('/edit/', '');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: pathname } });
      return;
    }

    if (path) {
      const page = getPageByPath(path);
      if (page) {
        setContent(page.content);
        setPageId(page.id);
      } else {
        setError('Page not found');
      }
      setIsLoading(false);
    }
  }, [path, getPageByPath, user, navigate, pathname]);

  const handleSave = async () => {
    if (!pageId) return;
    
    try {
      setIsSaving(true);
      const success = await updatePage(pageId, content, editComment);
      if (success) {
        navigate(`/wiki/${path}`);
      } else {
        setError('Failed to save changes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Error</h2>
        <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editing Page</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EyeIcon size={16} className="mr-1.5" />
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => navigate(`/wiki/${path}`)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {showPreview ? (
          <div className="p-6">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Preview</h2>
            <div className="prose dark:prose-invert prose-blue max-w-none border-t border-gray-200 dark:border-gray-700 pt-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Editor</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-mono text-sm"
              placeholder="Write your content using Markdown..."
            />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">Edit Summary</h2>
        <input
          type="text"
          value={editComment}
          onChange={(e) => setEditComment(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          placeholder="Briefly describe your changes (optional)"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 text-blue-800 dark:text-blue-300 text-sm">
        <h3 className="font-medium mb-1">Markdown Tips</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded"># Heading 1</code> for main headings</li>
          <li><code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">## Heading 2</code> for section headings</li>
          <li><code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">**bold**</code> for <strong>bold text</strong></li>
          <li><code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">*italic*</code> for <em>italic text</em></li>
          <li><code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">[link text](URL)</code> for links</li>
          <li><code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded">![alt text](image-url)</code> for images</li>
        </ul>
      </div>
    </div>
  );
};

export default EditPage;