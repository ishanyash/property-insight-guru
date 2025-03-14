
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { searchProperty, initApiConfig } from '@/utils/propertyApi';
import { toast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { ApiKeyModal } from './ApiKeyModal';

const PropertyForm = () => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const navigate = useNavigate();

  // Check for API key on component mount
  useEffect(() => {
    const config = initApiConfig();
    setHasApiKey(!!config.apiKey);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a property address to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await searchProperty(address);
      
      if (response.success) {
        navigate('/analysis', { state: { analysis: response.data, address } });
      } else {
        toast({
          title: "Analysis Failed",
          description: response.error || "Failed to analyze property. Please try again.",
          variant: "destructive",
        });
        sonnerToast.error(response.error || "Analysis failed");
      }
    } catch (error) {
      console.error('Property search error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      sonnerToast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="glassmorphism p-8 max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-lg font-medium">
              Enter Property Address
            </Label>
            <Input
              id="address"
              placeholder="e.g. 123 High Street, London, SW1A 1AA"
              className="h-14 px-4 text-base bg-white/50 backdrop-blur-sm border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-200"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Property...
              </div>
            ) : (
              "Analyze Property"
            )}
          </Button>
          
          <div className="text-center space-y-2">
            {!hasApiKey && (
              <div className="flex flex-col items-center space-y-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Using demo mode without an API key. For real analysis:
                </p>
                <ApiKeyModal />
              </div>
            )}
            <p className="text-sm text-gray-500">
              Instant AI-powered property analysis for developers and investors
            </p>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default PropertyForm;
