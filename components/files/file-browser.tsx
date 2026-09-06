'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  RefreshCw,
  Upload as UploadIcon,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FileUpload } from './file-upload';
import { FileCard } from './file-card';
import { FilePreview } from './file-preview';

interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  s3Key: string;
  s3Url: string;
  uploadedAt: Date;
  uploadedBy: string;
  isActive: boolean;
}

const PAGE_SIZES = [12, 24, 48];

export function FileBrowser() {
  const { user, logout, token } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to fetch files');
        setFiles([]);
      }
    } catch (err) {
      console.error('Network error while fetching files:', err);
      setError('Network error while fetching files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = (uploadedFiles: FileRecord[]) => {
    setFiles(prev => [...uploadedFiles, ...prev]);
    setPage(1);
    setActiveTab('browse');
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        setError('Failed to delete file');
      }
    } catch (err) {
      console.error('Network error while deleting file:', err);
      setError('Network error while deleting file');
    }
  };

  const handleFilePreview = (file: FileRecord) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const filteredFiles = useMemo(() => {
    if (!Array.isArray(files)) return [];

    const query = searchQuery.toLowerCase().trim();
    if (!query) return files;

    return files.filter(file =>
      (file.originalName?.toLowerCase() || '').includes(query) ||
      (file.mimeType?.toLowerCase() || '').includes(query)
    );
  }, [files, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredFiles.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filteredFiles.length);
  const paginatedFiles = filteredFiles.slice(pageStart, pageEnd);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Files</h1>
            <p className="text-muted-foreground">
              Signed in as {user?.username}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFiles}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <FileUpload onUploadComplete={handleFileUpload} />
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {filteredFiles.length === 0
                    ? '0 files'
                    : `${pageStart + 1}-${pageEnd} of ${filteredFiles.length}`}
                </span>
                <label className="flex items-center gap-2">
                  <span>Per page</span>
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="h-9 rounded-md border border-input bg-background px-2 text-foreground"
                  >
                    {PAGE_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <UploadIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">No files found</h3>
                  <p className="mb-4 text-muted-foreground">
                    {searchQuery
                      ? 'No files match your search.'
                      : 'Upload your first file.'
                    }
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDelete={handleFileDelete}
                      onPreview={handleFilePreview}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row">
                  <span>
                    Page {currentPage} of {pageCount}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(prev => Math.min(pageCount, prev + 1))}
                      disabled={currentPage >= pageCount}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <FilePreview
          file={selectedFile}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      </div>
    </div>
  );
}
