'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface SharePanelProps {
  diagramId: string;
  isPublic: boolean;
  shareUrl?: string;
  onClose: () => void;
  onSharingChange: (isPublic: boolean, shareUrl?: string) => void;
}

export function SharePanel({ 
  diagramId, 
  isPublic: initialIsPublic, 
  shareUrl: initialShareUrl,
  onClose,
  onSharingChange 
}: SharePanelProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareUrl, setShareUrl] = useState(initialShareUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSharingToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/diagrams/${diagramId}/sharing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update sharing settings');
      }

      const data = await response.json();
      setIsPublic(enabled);
      setShareUrl(data.shareUrl);
      onSharingChange(enabled, data.shareUrl);
      
      toast.success(enabled ? 'Diagram is now public' : 'Diagram is now private');
    } catch (error) {
      toast.error('Failed to update sharing settings');
      console.error('Sharing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Share Diagram</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-toggle">Make Public</Label>
              <p className="text-sm text-gray-500">
                Anyone with the link can view this diagram
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleSharingToggle}
              disabled={isLoading}
            />
          </div>

          {isPublic && shareUrl && (
            <div className="space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="px-3"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            {isPublic ? (
              'This diagram is publicly accessible. Anyone with the link can view it.'
            ) : (
              'This diagram is private. Only you can access it.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}