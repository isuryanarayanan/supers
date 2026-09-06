'use client';

/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  File,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  MoreHorizontal,
  Eye,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { URLCopier } from './url-copier';

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

interface FileCardProps {
  file: FileRecord;
  onDelete?: (fileId: string) => void;
  onPreview?: (file: FileRecord) => void;
}

export function FileCard({ file, onDelete, onPreview }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const type = typeof file.mimeType === 'string' ? file.mimeType : '';
  const isImage = type.startsWith('image/');
  const isVideo = type.startsWith('video/');
  const isAudio = type.startsWith('audio/');
  const isPdf = type === 'application/pdf';
  const isText = type.startsWith('text/') || type.includes('json') || type.includes('xml');

  const getFileIcon = (mimeType: string) => {
    if (typeof mimeType !== 'string') {
      return <File className="h-7 w-7 text-muted-foreground" />;
    }
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-7 w-7 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-7 w-7 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-7 w-7 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.startsWith('text/')) return <FileText className="h-7 w-7 text-red-500" />;
    return <File className="h-7 w-7 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    const toastId = toast.loading(`Deleting "${file.originalName}"`, {
      description: 'Removing file from storage...'
    });

    try {
      await onDelete(file.id);
      toast.success('File deleted successfully', {
        id: toastId,
        description: file.originalName
      });
    } catch (err) {
      console.error('Failed to delete file:', err);
      toast.error('Failed to delete file', {
        id: toastId,
        description: `Could not delete "${file.originalName}". Please try again.`
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(file);
    }
  };

  const handleOpenInNewTab = () => {
    toast('Opening file in new tab', {
      description: file.originalName,
      icon: '↗️'
    });
    window.open(file.s3Url, '_blank');
  };

  const renderInlinePreview = () => {
    if (previewFailed) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
          {getFileIcon(type)}
          <span className="max-w-[80%] truncate text-xs">Preview unavailable</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <img
          src={file.s3Url}
          alt={file.originalName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          onError={() => setPreviewFailed(true)}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          className="h-full w-full object-cover"
          muted
          playsInline
          controls
          preload="metadata"
          onError={() => setPreviewFailed(true)}
        >
          <source src={file.s3Url} type={type} />
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="flex h-full flex-col justify-center gap-4 p-4">
          <Music className="h-8 w-8 text-green-500" />
          <audio controls className="w-full" preload="metadata" onError={() => setPreviewFailed(true)}>
            <source src={file.s3Url} type={type} />
          </audio>
        </div>
      );
    }

    if (isPdf || isText) {
      return (
        <iframe
          title={file.originalName}
          src={file.s3Url}
          className="h-full w-full bg-white"
          loading="lazy"
          onError={() => setPreviewFailed(true)}
        />
      );
    }

    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        {getFileIcon(type)}
        <span className="max-w-[80%] truncate text-xs">{type || 'file'}</span>
      </div>
    );
  };

  return (
    <Card className="group w-full overflow-hidden transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={handlePreview}
        className="block h-44 w-full overflow-hidden border-b border-border bg-muted/40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Preview ${file.originalName}`}
      >
        {renderInlinePreview()}
      </button>

      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex-shrink-0">
              {getFileIcon(type)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="block truncate text-sm font-medium" title={file.originalName}>
                {file.originalName}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenInNewTab}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="truncate">Uploaded {formatDate(file.uploadedAt)}</span>
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              {(type.split('/')[0] || 'file')}
            </Badge>
          </div>

          <div className="w-full overflow-hidden">
            <URLCopier url={file.s3Url} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
