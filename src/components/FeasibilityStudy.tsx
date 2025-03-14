
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface FeasibilityStudyProps {
  data: {
    scenarios: Array<{
      name: string;
      description: string;
      costs: {
        acquisition: string;
        refurbishment: string;
        financing: string;
        selling: string;
        total: string;
      };
      gdv: string;
      profit: string;
      profitPercentage: string;
      maxAcquisitionPrice: string;
      timeline: string;
      risks: Array<{
        factor: string;
        impact: 'High' | 'Medium' | 'Low';
        mitigation: string;
      }>;
    }>;
    roi: {
      expected: string;
      riskAdjusted: string;
      holdingPeriod: string;
    };
  };
}

const FeasibilityStudy = ({ data }: FeasibilityStudyProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-10"
    >
      <div className="border-b pb-2 mb-6">
        <h2 className="text-2xl font-medium">Feasibility Study and Profitability Analysis</h2>
      </div>
      
      <div className="space-y-8">
        {data.scenarios.map((scenario, index) => (
          <Card key={index} className="p-6 glassmorphism">
            <h3 className="text-lg font-medium mb-2">
              Scenario {index + 1}: {scenario.name}
            </h3>
            <p className="text-gray-600 mb-6">{scenario.description}</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-base font-medium mb-3">Cost Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acquisition</span>
                    <span>{scenario.costs.acquisition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refurbishment</span>
                    <span>{scenario.costs.refurbishment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Financing</span>
                    <span>{scenario.costs.financing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selling Costs</span>
                    <span>{scenario.costs.selling}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-medium">
                    <span>Total Costs</span>
                    <span>{scenario.costs.total}</span>
                  </div>
                </div>
                
                <h4 className="text-base font-medium mt-6 mb-3">Profitability</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Development Value</span>
                    <span>{scenario.gdv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit</span>
                    <span className="text-green-600 font-medium">{scenario.profit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit on Cost</span>
                    <span className="text-green-600 font-medium">{scenario.profitPercentage}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-base font-medium mb-2">Key Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum Acquisition Price</span>
                      <span className="font-medium">{scenario.maxAcquisitionPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project Timeline</span>
                      <span>{scenario.timeline}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-medium mb-3">Risk Assessment</h4>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Factor</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Mitigation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scenario.risks.map((risk, riskIndex) => (
                        <TableRow key={riskIndex}>
                          <TableCell className="font-medium">{risk.factor}</TableCell>
                          <TableCell>
                            <Badge 
                              className={`${
                                risk.impact === 'High' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                                risk.impact === 'Medium' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                                'bg-green-100 text-green-800 hover:bg-green-100'
                              }`}
                            >
                              {risk.impact}
                            </Badge>
                          </TableCell>
                          <TableCell>{risk.mitigation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        <Card className="p-6 glassmorphism">
          <h3 className="text-lg font-medium mb-4">Risk-Adjusted ROI</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Expected ROI</p>
              <p className="text-xl font-medium text-green-600">{data.roi.expected}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Risk-Adjusted ROI</p>
              <p className="text-xl font-medium">{data.roi.riskAdjusted}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Estimated Holding Period</p>
              <p className="text-xl font-medium">{data.roi.holdingPeriod}</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default FeasibilityStudy;
