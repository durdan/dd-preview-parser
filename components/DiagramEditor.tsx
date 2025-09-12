import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Save, SaveAs, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { diagramService } from '@/services/diagramService';
import { useAuth } from '@/hooks/useAuth';

interface DiagramEditorProps {
  initialDiagram?: {
    id?: string;
    title: string;
    content: string;
  };
}

export function DiagramEditor({ initialDiagram }: DiagramEditorProps) {
  const [diagram, setDiagram] = useState({
    id: initialDiagram?.id,
    title: initialDiagram?.title || 'Untitled Diagram',
    content: initialDiagram?.content || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const handleSave = useCallback(async () => {
    if (authLoading) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save diagrams",
        variant: "destructive"
      });
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }

    if (!diagram.content.trim()) {
      toast({
        title: "Cannot Save Empty Diagram",
        description: "Please add some content before saving",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const savedDiagram = await diagramService.saveDiagram({
        id: diagram.id,
        title: diagram.title,
        content: diagram.content
      });
      
      setDiagram(prev => ({ ...prev, id: savedDiagram.id }));
      toast({
        title: "Diagram Saved",
        description: `"${diagram.title}" has been saved successfully`
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save diagram",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [diagram, user, authLoading, router, toast]);

  const handleSaveAs = useCallback(async () => {
    if (authLoading) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save diagrams",
        variant: "destructive"
      });
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
      return;
    }

    if (!saveAsTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the diagram",
        variant: "destructive"
      });
      return;
    }

    if (!diagram.content.trim()) {
      toast({
        title: "Cannot Save Empty Diagram",
        description: "Please add some content before saving",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const savedDiagram = await diagramService.saveDiagram({
        title: saveAsTitle.trim(),
        content: diagram.content
      });
      
      setDiagram(prev => ({ 
        ...prev, 
        id: savedDiagram.id, 
        title: saveAsTitle.trim() 
      }));
      setSaveAsDialogOpen(false);
      setSaveAsTitle('');
      toast({
        title: "Diagram Saved",
        description: `"${saveAsTitle}" has been saved successfully`
      });
    } catch (error) {
      console.error('Save As failed:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save diagram",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [saveAsTitle, diagram.content, user, authLoading, router, toast]);

  const handleContentChange = useCallback((newContent: string) => {
    setDiagram(prev => ({ ...prev, content: newContent }));
  }, []);

  const handleTitleChange = useCallback((newTitle: string) => {
    setDiagram(prev => ({ ...prev, title: newTitle }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Input
          value={diagram.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="max-w-xs"
          placeholder="Diagram title"
        />
        
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving || authLoading}
            variant="default"
            size="sm"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>

          <Dialog open={saveAsDialogOpen} onOpenChange={setSaveAsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={isSaving || authLoading}
                variant="outline"
                size="sm"
              >
                <SaveAs className="w-4 h-4 mr-2" />
                Save As
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Diagram As</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={saveAsTitle}
                  onChange={(e) => setSaveAsTitle(e.target.value)}
                  placeholder="Enter diagram title"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveAs();
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSaveAsDialogOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAs}
                    disabled={isSaving || !saveAsTitle.trim()}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4">
        <textarea
          value={diagram.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full h-full p-4 border rounded-md resize-none font-mono"
          placeholder="Enter your diagram content here..."
        />
      </div>
    </div>
  );
}