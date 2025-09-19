'use client';

import { memo, useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Diagram } from '@/src/types/diagram';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface DiagramCardProps {
  diagram: Diagram;
  onDelete: (id: string) => Promise<void>;
}

const DiagramCard = memo(function DiagramCard({ 
  diagram, 
  onDelete 
}: DiagramCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(diagram.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete diagram:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        {/* Diagram Preview */}
        <Link href={`/editor/${diagram.id}`}>
          <div className="aspect-video bg-gray-50 rounded-t-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors">
            {diagram.thumbnail ? (
              <img
                src={diagram.thumbnail}
                alt={diagram.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Eye className="w-8 h-8" />
              </div>
            )}
          </div>
        </Link>

        {/* Card Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
              {diagram.title}
            </h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href={`/editor/${diagram.id}`} className="flex items-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {diagram.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {diagram.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Updated {formatDistanceToNow(new Date(diagram.updatedAt), { addSuffix: true })}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              {diagram.participantCount || 0} participants
            </span>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        diagramTitle={diagram.title}
        isDeleting={isDeleting}
      />
    </>
  );
});

export default DiagramCard;