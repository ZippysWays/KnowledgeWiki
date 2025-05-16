import React, { createContext, useState, useEffect, useContext } from 'react';
import { nanoid } from 'nanoid';
import { AuthContext } from './AuthContext';

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  path: string; // e.g., "main/sub1/sub2"
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  revisions: WikiRevision[];
}

export interface WikiRevision {
  id: string;
  content: string;
  editedBy: string;
  editedAt: string;
  comment: string;
}

interface WikiSettings {
  allowFreeEditing: boolean;
  requireApproval: boolean;
  allowAnonymousViewing: boolean;
}

interface WikiContextType {
  wikiPages: WikiPage[];
  getPageByPath: (path: string) => WikiPage | undefined;
  createPage: (title: string, content: string, path: string) => Promise<WikiPage>;
  updatePage: (pageId: string, content: string, comment: string) => Promise<boolean>;
  deletePage: (pageId: string) => Promise<boolean>;
  searchPages: (query: string) => WikiPage[];
  settings: WikiSettings;
  updateSettings: (newSettings: Partial<WikiSettings>) => void;
}

export const WikiContext = createContext<WikiContextType>({
  wikiPages: [],
  getPageByPath: () => undefined,
  createPage: async () => ({} as WikiPage),
  updatePage: async () => false,
  deletePage: async () => false,
  searchPages: () => [],
  settings: {
    allowFreeEditing: true,
    requireApproval: false,
    allowAnonymousViewing: true,
  },
  updateSettings: () => {},
});

interface WikiProviderProps {
  children: React.ReactNode;
}

export const WikiProvider: React.FC<WikiProviderProps> = ({ children }) => {
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
  const [settings, setSettings] = useState<WikiSettings>({
    allowFreeEditing: true,
    requireApproval: false,
    allowAnonymousViewing: true,
  });
  const { user } = useContext(AuthContext);

  // Load wiki pages and settings from localStorage on mount
  useEffect(() => {
    const storedPages = localStorage.getItem('wikiPages');
    if (storedPages) {
      try {
        setWikiPages(JSON.parse(storedPages));
      } catch (error) {
        console.error('Failed to parse stored wiki pages:', error);
      }
    }

    const storedSettings = localStorage.getItem('wikiSettings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error('Failed to parse stored wiki settings:', error);
      }
    }
  }, []);

  // Save wiki pages and settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('wikiPages', JSON.stringify(wikiPages));
  }, [wikiPages]);

  useEffect(() => {
    localStorage.setItem('wikiSettings', JSON.stringify(settings));
  }, [settings]);

  const getPageByPath = (path: string): WikiPage | undefined => {
    return wikiPages.find(page => page.path === path);
  };

  const createPage = async (title: string, content: string, path: string): Promise<WikiPage> => {
    if (!user) {
      throw new Error('You must be logged in to create a page');
    }

    const newPage: WikiPage = {
      id: nanoid(),
      title,
      content,
      path,
      createdBy: user.username,
      createdAt: new Date().toISOString(),
      updatedBy: user.username,
      updatedAt: new Date().toISOString(),
      revisions: [],
    };

    setWikiPages(prev => [...prev, newPage]);
    return newPage;
  };

  const updatePage = async (pageId: string, content: string, comment: string): Promise<boolean> => {
    if (!user) {
      throw new Error('You must be logged in to edit a page');
    }

    try {
      setWikiPages(prev => prev.map(page => {
        if (page.id === pageId) {
          // Create a new revision
          const newRevision: WikiRevision = {
            id: nanoid(),
            content: page.content, // Store the previous content
            editedBy: user.username,
            editedAt: new Date().toISOString(),
            comment,
          };

          return {
            ...page,
            content,
            updatedBy: user.username,
            updatedAt: new Date().toISOString(),
            revisions: [...page.revisions, newRevision],
          };
        }
        return page;
      }));
      return true;
    } catch (error) {
      console.error('Failed to update page:', error);
      return false;
    }
  };

  const deletePage = async (pageId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('You must be logged in to delete a page');
    }

    try {
      setWikiPages(prev => prev.filter(page => page.id !== pageId));
      return true;
    } catch (error) {
      console.error('Failed to delete page:', error);
      return false;
    }
  };

  const searchPages = (query: string): WikiPage[] => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return wikiPages.filter(page => 
      page.title.toLowerCase().includes(lowercaseQuery) || 
      page.content.toLowerCase().includes(lowercaseQuery)
    );
  };

  const updateSettings = (newSettings: Partial<WikiSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <WikiContext.Provider value={{
      wikiPages,
      getPageByPath,
      createPage,
      updatePage,
      deletePage,
      searchPages,
      settings,
      updateSettings,
    }}>
      {children}
    </WikiContext.Provider>
  );
};