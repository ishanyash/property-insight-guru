
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExecutiveSummary from './ExecutiveSummary';
import PropertyAppraisal from './PropertyAppraisal';
import FeasibilityStudy from './FeasibilityStudy';
import PlanningOpportunities from './PlanningOpportunities';
import { Button } from '@/components/ui/button';
import { DownloadIcon, PrinterIcon, ShareIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AnalysisResultsProps {
  data: any;
  address: string;
}

const AnalysisResults = ({ data, address }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState("executive-summary");

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
            <h1 className="text-3xl font-semibold mb-2">{address}</h1>
            <p className="text-gray-500">
              Property analysis completed on {new Date().toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
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
          </div>
        </div>
      </motion.div>
      
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
    </div>
  );
};

export default AnalysisResults;
