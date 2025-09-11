import { FileUpload } from '@/components/file-upload';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Diagram Parser Platform
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload and analyze diagrams with AI-powered parsing
          </p>
        </header>
        
        <div className="space-y-8">
          <FileUpload />
        </div>
      </div>
    </main>
  );
}