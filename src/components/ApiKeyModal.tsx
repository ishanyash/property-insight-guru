
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiConfig, initApiConfig } from '@/utils/propertyApi';
import { toast } from 'sonner';

export function ApiKeyModal() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Check if API key exists in localStorage
  const hasApiKey = !!localStorage.getItem('openai_api_key');
  
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    // Save API key to config (and localStorage)
    setApiConfig({ apiKey });
    toast.success("API key saved successfully");
    setOpen(false);
  };
  
  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setApiConfig({ apiKey: null, useRealApi: false });
    setApiKey('');
    toast.info("API key removed. Using mock data.");
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {hasApiKey ? "Update API Key" : "Set API Key"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable real property analysis.
            Your key is stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-500">
            Don't have an API key?{" "}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Get one from OpenAI
            </a>
          </p>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          {hasApiKey && (
            <Button variant="outline" onClick={handleClear}>
              Clear Key
            </Button>
          )}
          <Button type="submit" onClick={handleSaveApiKey}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
