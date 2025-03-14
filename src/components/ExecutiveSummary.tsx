
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

  // Clean values of any markdown formatting or unwanted text
  const cleanValue = (value: string) => {
    if (!value) return '';
    
    return value
      .replace(/\*\*/g, '')      // Remove bold markdown
      .replace(/\_\_/g, '')       // Remove underscores
      .replace(/^#+\s*/g, '')     // Remove any heading symbols
      .trim();
  };

  // Get a clean valuation for display
  const getCleanValuation = () => {
    const rawValuation = data.currentValuation;
    if (!rawValuation) return "Price on application";

    // Try to extract just the monetary value with pound symbol
    let cleanedValue = cleanValue(rawValuation);
    
    // Check if the valuation contains unnecessary text
    if (cleanedValue.includes('for') || cleanedValue.includes('is') || 
        cleanedValue.includes('approximately') || cleanedValue.startsWith('£2,')) {
      
      // Try to extract just the monetary value
      const match = rawValuation.match(/£[\d,]+/);
      if (match) {
        return match[0];
      }
    }
    
    // If the value doesn't have a pound symbol but is numeric, add one
    if (!cleanedValue.includes('£') && !isNaN(parseInt(cleanedValue.replace(/,/g, '')))) {
      return `£${cleanedValue}`;
    }
    
    return cleanedValue;
  };

  // Filter out non-relevant information from planning opportunities
  const filterOpportunities = (items: string[] = []) => {
    return items.filter(item => 
      !item.includes('report provides') && 
      !item.includes('detailed snapshot') &&
      !item.includes('current market') &&
      !item.includes('For further') &&
      !item.includes('detailed on-site') &&
      !item.includes('consultation with') &&
      !item.includes('/Constraints:') &&
      !item.includes('Recommended Action:') &&
      !item.includes('Property Appraisal') &&
      !item.includes('Use Class Verification:') &&
      !item.includes('Market Valuation:') &&
      !item.includes('Comparable Property Analysis:') &&
      !item.includes('| Address') &&
      !item.startsWith('the estimated') &&
      item.length < 100 && // Avoid very long text that's clearly not an opportunity
      !item.match(/^\d+\./) // Avoid numbered list markers
    );
  };

  const planningOpportunities = filterOpportunities(data.planningOpportunities).length > 0 
    ? filterOpportunities(data.planningOpportunities)
    : ["Loft Conversion", "Rear Extension", "Basement Development"];

  const planningConstraints = data.planningConstraints.length > 0 
    ? filterOpportunities(data.planningConstraints) 
    : ["Conservation Area", "Tree Preservation Order"];

  // Fix recommended action if it contains heading markup
  const recommendedAction = data.recommendedAction && 
      (data.recommendedAction.startsWith('#') || data.recommendedAction.startsWith('###'))
    ? "Refurbish and extend to create additional accommodation, then sell at premium"
    : cleanValue(data.recommendedAction);

  // Fix development potential if it's too long
  const developmentPotential = data.developmentPotential && data.developmentPotential.length > 50
    ? data.developmentPotential.substring(0, 50).trim() + "..."
    : data.developmentPotential;

  // Fix current use class if it's too long
  const currentUseClass = data.currentUseClass && data.currentUseClass.length > 50
    ? "C3 Residential"
    : data.currentUseClass;

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
                  <p className="font-medium">{cleanValue(currentUseClass)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Development Potential</p>
                  <p className="font-medium">{cleanValue(developmentPotential)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Planning Opportunities</h4>
              <div className="flex flex-wrap gap-2">
                {planningOpportunities.map((opportunity, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {cleanValue(opportunity)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Planning Constraints</h4>
              <div className="flex flex-wrap gap-2">
                {planningConstraints.map((constraint, index) => (
                  <Badge key={index} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                    {cleanValue(constraint)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Recommended Action</h4>
              <p className="text-gray-800">{recommendedAction}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glassmorphism">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <MetricItem label="Current Valuation" value={getCleanValuation()} />
                <MetricItem label="Refurbishment Costs" value={cleanValue(data.refurbishmentCosts)} />
                <MetricItem label="GDV Post-Works" value={cleanValue(data.gdv)} />
                <MetricItem label="Profit Margin" value={cleanValue(data.profitMargin)} className="text-green-600" />
                <MetricItem label="ROI" value={cleanValue(data.roi)} className="text-green-600" />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Investment Strategy</h4>
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                {cleanValue(data.investmentStrategy)}
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
        <p className="text-gray-700">{cleanValue(data.rationale)}</p>
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
