
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import AnalysisResults from '@/components/AnalysisResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-28 pb-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </motion.div>
          
          <AnalysisResults data={analysis} address={address} />
        </div>
      </div>
    </div>
  );
};

export default Analysis;
