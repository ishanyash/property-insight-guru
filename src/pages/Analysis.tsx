
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import AnalysisResults from '@/components/AnalysisResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis, address } = location.state || {};
  
  useEffect(() => {
    // If no analysis data, redirect to homepage
    if (!analysis) {
      navigate('/');
    }
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [analysis, navigate]);

  if (!analysis) {
    return null; // Don't render anything if no data (will redirect)
  }

  // Clean any addresses that might be provided with additional information
  const formattedAddress = () => {
    if (!address) return "";
    
    // If the address includes any instructions like "analyze this property"
    // try to extract just the address part
    if (address.toLowerCase().includes('analyze') || 
        address.toLowerCase().includes('property') ||
        address.toLowerCase().includes('valuation')) {
      
      // Try to find the address based on common patterns
      const ukPostcodePattern = /[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}/i;
      const postcodeMatch = address.match(ukPostcodePattern);
      
      if (postcodeMatch) {
        // Extract a reasonable portion of text around the postcode
        const postcodeIndex = address.indexOf(postcodeMatch[0]);
        const startIndex = Math.max(0, address.lastIndexOf(',', postcodeIndex) - 20);
        return address.substring(startIndex, postcodeIndex + postcodeMatch[0].length).trim();
      }
      
      // If no postcode, look for a street name pattern
      const streetPattern = /\d+\s+[A-Za-z\s]+(Street|Road|Avenue|Lane|Drive|Place|Court|Way)/i;
      const streetMatch = address.match(streetPattern);
      
      if (streetMatch) {
        return streetMatch[0].trim();
      }
    }
    
    return address;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-28 pb-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 flex justify-between items-center"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Analyze Another Property
            </Button>
          </motion.div>
          
          <AnalysisResults data={analysis} address={formattedAddress()} />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
