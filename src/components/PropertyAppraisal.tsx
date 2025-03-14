
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PropertyAppraisalProps {
  data: {
    useClass: {
      current: string;
      source: string;
      verification: string;
    };
    valuation: {
      marketValue: string;
      valueUpliftPotential: string;
      refurbishmentCosts: {
        light: string;
        conversion: string;
        newBuild: string;
        hmoConversion: string;
      };
    };
    comparables: Array<{
      address: string;
      price: string;
      date: string;
      propertyType: string;
      size: string;
      rating: 'High' | 'Medium' | 'Low';
      reason: string;
      link: string;
    }>;
  };
}

const PropertyAppraisal = ({ data }: PropertyAppraisalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mb-10"
    >
      <div className="border-b pb-2 mb-6">
        <h2 className="text-2xl font-medium">Property Appraisal and Valuation</h2>
      </div>
      
      <div className="space-y-8">
        <Card className="p-6 glassmorphism">
          <h3 className="text-lg font-medium mb-4">Use Class Verification</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Use Class</p>
              <p className="font-medium">{data.useClass.current}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Source</p>
              <p className="font-medium">{data.useClass.source}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Verification</p>
              <p className="font-medium">{data.useClass.verification}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glassmorphism">
          <h3 className="text-lg font-medium mb-4">Market Valuation</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Market Value</p>
              <p className="text-xl font-medium">{data.valuation.marketValue}</p>
              
              <p className="text-sm text-gray-500 mt-4 mb-1">Value Uplift Potential</p>
              <p className="font-medium">{data.valuation.valueUpliftPotential}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-3">Standard Refurbishment Cost Benchmarks</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Light Refurbishment</span>
                  <span className="font-medium">{data.valuation.refurbishmentCosts.light}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion (office to residential)</span>
                  <span className="font-medium">{data.valuation.refurbishmentCosts.conversion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">New Build (ground-up)</span>
                  <span className="font-medium">{data.valuation.refurbishmentCosts.newBuild}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">HMO Conversion (per room)</span>
                  <span className="font-medium">{data.valuation.refurbishmentCosts.hmoConversion}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glassmorphism overflow-hidden">
          <h3 className="text-lg font-medium mb-4">Comparable Property Analysis</h3>
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Property Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.comparables.map((comp, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <a href={comp.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {comp.address}
                        </a>
                      </TableCell>
                      <TableCell>{comp.price}</TableCell>
                      <TableCell>{comp.date}</TableCell>
                      <TableCell>{comp.propertyType}</TableCell>
                      <TableCell>{comp.size}</TableCell>
                      <TableCell>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${
                            comp.rating === 'High' ? 'bg-green-100 text-green-800' : 
                            comp.rating === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {comp.rating}
                        </span>
                      </TableCell>
                      <TableCell>{comp.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default PropertyAppraisal;
