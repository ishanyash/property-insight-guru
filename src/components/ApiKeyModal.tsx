
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiConfig, initApiConfig } from '@/utils/propertyApi';
import { toast } from 'sonner';

export function ApiKeyModal() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiModel, setApiModel] = useState('gpt-4o');
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // Check if API key exists in localStorage on component mount
  useEffect(() => {
    const config = initApiConfig();
    setHasApiKey(!!config.apiKey);
    if (config.model) {
      setApiModel(config.model);
    }
  }, []);
  
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    // Save API key to config (and localStorage)
    setApiConfig({ apiKey, model: apiModel, useRealApi: true });
    setHasApiKey(true);
    toast.success("API key saved successfully");
    setOpen(false);
  };
  
  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('openai_model');
    setApiConfig({ apiKey: null, useRealApi: false });
    setApiKey('');
    setHasApiKey(false);
    toast.info("API key removed. Using mock data.");
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={hasApiKey ? "default" : "outline"} size="sm">
          {hasApiKey ? "API Key ✓" : "Set API Key"}
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
          
          <div className="space-y-2">
            <Label htmlFor="apiModel">OpenAI Model</Label>
            <select 
              id="apiModel"
              className="w-full p-2 border rounded"
              value={apiModel}
              onChange={(e) => setApiModel(e.target.value)}
            >
              <option value="gpt-4o">GPT-4o (Recommended)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, less accurate)</option>
            </select>
            <p className="text-xs text-gray-500">
              GPT-4o provides more detailed analysis but may cost more.
            </p>
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
