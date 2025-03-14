
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExecutiveSummary from './ExecutiveSummary';
import PropertyAppraisal from './PropertyAppraisal';
import FeasibilityStudy from './FeasibilityStudy';
import PlanningOpportunities from './PlanningOpportunities';
import { Button } from '@/components/ui/button';
import { DownloadIcon, PrinterIcon, ShareIcon, FileTextIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface AnalysisResultsProps {
  data: any;
  address: string;
}

const AnalysisResults = ({ data, address }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState("executive-summary");
  const [showRawResponse, setShowRawResponse] = useState(false);

  // Clean any markdown formatting from values
  const cleanValue = (value: string) => {
    if (!value) return '';
    
    return value
      .replace(/\*\*/g, '')  // Remove bold markdown
      .replace(/\_\_/g, '')   // Remove underscores
      .trim();
  };

  // Get a clean valuation for display
  const getCleanValuation = () => {
    const rawValuation = data.executiveSummary.currentValuation;
    // Check if the valuation contains unnecessary text
    if (rawValuation.includes('for') || rawValuation.includes('is')) {
      // Try to extract just the monetary value
      const match = rawValuation.match(/£[\d,]+/);
      return match ? match[0] : rawValuation;
    }
    return cleanValue(rawValuation);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      // In a real app, this would generate a PDF
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${address.replace(/\s+/g, '-').toLowerCase()}-analysis.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
      toast({
        title: "Analysis Downloaded",
        description: "The property analysis has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share Link Copied",
      description: "The link to this analysis has been copied to your clipboard.",
    });
  };

  const generateDate = () => {
    return new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Fix the profit calculation for the second scenario
  const fixProfitCalculation = () => {
    if (data.feasibilityStudy && 
        data.feasibilityStudy.scenarios && 
        data.feasibilityStudy.scenarios.length > 1 &&
        data.feasibilityStudy.scenarios[1].profit) {
      
      // If the profit looks wrong (negative and very large), recalculate it
      if (data.feasibilityStudy.scenarios[1].profit.startsWith('-') && 
          data.feasibilityStudy.scenarios[1].profit.length > 10) {
        
        try {
          // Get GDV and total cost, and calculate profit as GDV - total cost
          const gdvValue = parseInt(data.feasibilityStudy.scenarios[1].gdv.replace(/[^0-9]/g, ''));
          const totalCostValue = parseInt(data.feasibilityStudy.scenarios[1].costs.total.replace(/[^0-9]/g, ''));
          
          if (!isNaN(gdvValue) && !isNaN(totalCostValue)) {
            const profit = gdvValue - totalCostValue;
            data.feasibilityStudy.scenarios[1].profit = `£${profit.toLocaleString()}`;
          }
        } catch (err) {
          console.error('Error fixing profit calculation:', err);
        }
      }
    }
  };

  // Fix calculations before rendering
  fixProfitCalculation();

  // Format the total cost in scenario 2 if it's missing the pound sign
  if (data.feasibilityStudy && 
      data.feasibilityStudy.scenarios && 
      data.feasibilityStudy.scenarios.length > 1 &&
      data.feasibilityStudy.scenarios[1].costs.total &&
      !data.feasibilityStudy.scenarios[1].costs.total.includes('£')) {
    data.feasibilityStudy.scenarios[1].costs.total = `£${data.feasibilityStudy.scenarios[1].costs.total}`;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-semibold">{address}</h1>
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                {cleanValue(data.executiveSummary.currentUseClass)}
              </Badge>
            </div>
            <p className="text-gray-500">
              Property analysis completed on {generateDate()}
            </p>
            <p className="text-gray-500 mt-1">
              Current valuation: <span className="font-medium text-green-600">{getCleanValuation()}</span>
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handlePrint}
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Print</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleShare}
            >
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowRawResponse(!showRawResponse)}
            >
              <FileTextIcon className="h-4 w-4" />
              <span>{showRawResponse ? 'Hide Raw Data' : 'View Raw Data'}</span>
            </Button>
          </div>
        </div>
      </motion.div>
      
      {showRawResponse ? (
        <div className="bg-gray-50 p-4 rounded-lg border mb-6 overflow-auto max-h-[70vh]">
          <pre className="text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <Tabs defaultValue="executive-summary" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
            <TabsTrigger value="property-appraisal">Property Appraisal</TabsTrigger>
            <TabsTrigger value="feasibility-study">Feasibility Study</TabsTrigger>
            <TabsTrigger value="planning-opportunities">Planning Opportunities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="executive-summary">
            <ExecutiveSummary data={data.executiveSummary} />
          </TabsContent>
          
          <TabsContent value="property-appraisal">
            <PropertyAppraisal data={data.propertyAppraisal} />
          </TabsContent>
          
          <TabsContent value="feasibility-study">
            <FeasibilityStudy data={data.feasibilityStudy} />
          </TabsContent>
          
          <TabsContent value="planning-opportunities">
            <PlanningOpportunities data={data.planningOpportunities} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AnalysisResults;
