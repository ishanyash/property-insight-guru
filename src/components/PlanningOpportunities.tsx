
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface PlanningOpportunitiesProps {
  data: {
    permittedDevelopment: {
      available: string[];
      restricted: string[];
      notes: string;
    };
    localAuthority: {
      restrictions: string[];
      policies: string[];
      upcoming: string;
    };
    potentials: {
      extensions: Array<{
        type: string;
        feasibility: 'High' | 'Medium' | 'Low';
        notes: string;
      }>;
      conversions: Array<{
        type: string;
        feasibility: 'High' | 'Medium' | 'Low';
        notes: string;
      }>;
      changeOfUse: Array<{
        from: string;
        to: string;
        feasibility: 'High' | 'Medium' | 'Low';
        notes: string;
      }>;
    };
  };
}

const PlanningOpportunities = ({ data }: PlanningOpportunitiesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-10"
    >
      <div className="border-b pb-2 mb-6">
        <h2 className="text-2xl font-medium">Planning Opportunities and Development Potential</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 glassmorphism">
          <h3 className="text-lg font-medium mb-4">Permitted Development Rights</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Available PD Rights
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.permittedDevelopment.available.map((item, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                Restricted PD Rights
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.permittedDevelopment.restricted.map((item, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Notes</h4>
              <p className="text-gray-600 mt-1">{data.permittedDevelopment.notes}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glassmorphism">
          <h3 className="text-lg font-medium mb-4">Local Authority Context</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Restrictions</h4>
              <ul className="mt-1 space-y-1">
                {data.localAuthority.restrictions.map((item, index) => (
                  <li key={index} className="text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Relevant Policies</h4>
              <ul className="mt-1 space-y-1">
                {data.localAuthority.policies.map((item, index) => (
                  <li key={index} className="text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Upcoming Changes</h4>
              <p className="text-gray-600 mt-1">{data.localAuthority.upcoming}</p>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6 glassmorphism">
        <h3 className="text-lg font-medium mb-6">Development Potential</h3>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-base font-medium mb-3 border-b pb-2">Extensions</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {data.potentials.extensions.map((item, index) => (
                <FeasibilityCard
                  key={index}
                  title={item.type}
                  feasibility={item.feasibility}
                  notes={item.notes}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3 border-b pb-2">Conversions</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {data.potentials.conversions.map((item, index) => (
                <FeasibilityCard
                  key={index}
                  title={item.type}
                  feasibility={item.feasibility}
                  notes={item.notes}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-medium mb-3 border-b pb-2">Change of Use</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {data.potentials.changeOfUse.map((item, index) => (
                <FeasibilityCard
                  key={index}
                  title={`${item.from} to ${item.to}`}
                  feasibility={item.feasibility}
                  notes={item.notes}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const FeasibilityCard = ({ 
  title, 
  feasibility, 
  notes 
}: { 
  title: string; 
  feasibility: 'High' | 'Medium' | 'Low'; 
  notes: string;
}) => {
  const getBgColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-green-50 border-green-200';
      case 'Medium': return 'bg-amber-50 border-amber-200';
      case 'Low': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  const getTextColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-800';
      case 'Medium': return 'text-amber-800';
      case 'Low': return 'text-gray-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBgColor(feasibility)}`}>
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-medium">{title}</h5>
        <Badge className={`${getTextColor(feasibility)} bg-white`}>
          {feasibility}
        </Badge>
      </div>
      <p className="text-sm text-gray-600">{notes}</p>
    </div>
  );
};

export default PlanningOpportunities;
