import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { templateData, templateCategories, DiagramTemplate, TemplateCategory } from './templates/templateData';

interface DiagramTemplatesProps {
  onTemplateSelect: (template: DiagramTemplate) => void;
  onClose: () => void;
}

export const DiagramTemplates: React.FC<DiagramTemplatesProps> = ({
  onTemplateSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('sequence');

  const currentTemplates = templateData.filter(template => template.category === selectedCategory);

  const handleTemplateSelect = (template: DiagramTemplate) => {
    onTemplateSelect(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Diagram Templates</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-4">
                {/* Category Sidebar */}
                <div className="w-48 space-y-2">
                  <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                    Categories
                  </h3>
                  {templateCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* Templates Grid */}
                <div className="flex-1">
                  <ScrollArea className="h-[500px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                      {currentTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={() => handleTemplateSelect(template)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: DiagramTemplate;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{template.description}</p>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded p-3 mb-3">
          <pre className="text-xs overflow-x-auto">
            <code>{template.content.substring(0, 200)}...</code>
          </pre>
        </div>
        <Button onClick={onSelect} className="w-full">
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};