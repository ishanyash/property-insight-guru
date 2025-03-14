
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExecutiveSummaryProps {
  data: {
    currentUseClass: string;
    developmentPotential: string;
    planningOpportunities: string[];
    planningConstraints: string[];
    recommendedAction: string;
    currentValuation: string;
    refurbishmentCosts: string;
    gdv: string;
    profitMargin: string;
    roi: string;
    investmentStrategy: string;
    propertyImage?: string;
    rationale: string;
  };
}

const ExecutiveSummary = ({ data }: ExecutiveSummaryProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-10"
    >
      <div className="border-b pb-2 mb-6">
        <h2 className="text-2xl font-medium">Executive Summary</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 glassmorphism">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Property Overview</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Current Use Class</p>
                  <p className="font-medium">{data.currentUseClass}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Development Potential</p>
                  <p className="font-medium">{data.developmentPotential}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Planning Opportunities</h4>
              <div className="flex flex-wrap gap-2">
                {data.planningOpportunities.map((opportunity, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {opportunity}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Planning Constraints</h4>
              <div className="flex flex-wrap gap-2">
                {data.planningConstraints.map((constraint, index) => (
                  <Badge key={index} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                    {constraint}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Recommended Action</h4>
              <p className="text-gray-800">{data.recommendedAction}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glassmorphism">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <MetricItem label="Current Valuation" value={data.currentValuation} />
                <MetricItem label="Refurbishment Costs" value={data.refurbishmentCosts} />
                <MetricItem label="GDV Post-Works" value={data.gdv} />
                <MetricItem label="Profit Margin" value={data.profitMargin} className="text-green-600" />
                <MetricItem label="ROI" value={data.roi} className="text-green-600" />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Investment Strategy</h4>
              <Badge className="bg-blue-500 hover:bg-blue-600">
                {data.investmentStrategy}
              </Badge>
            </div>
            
            {data.propertyImage && (
              <div className="mt-4">
                <div className="relative rounded-md overflow-hidden aspect-video bg-gray-100">
                  <div className={`absolute inset-0 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="animate-pulse w-full h-full bg-gray-200"></div>
                  </div>
                  <img
                    src={data.propertyImage}
                    alt="Property"
                    className={`object-cover w-full h-full transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <Card className="mt-6 p-6 glassmorphism">
        <h3 className="text-lg font-medium mb-2">Rationale</h3>
        <p className="text-gray-700">{data.rationale}</p>
      </Card>
    </motion.div>
  );
};

const MetricItem = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{label}</span>
    <span className={`font-medium ${className}`}>{value}</span>
  </div>
);

export default ExecutiveSummary;
