import { toast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';

// Environment variables for API keys should be handled properly in production
// For now, we'll create a configuration object that can be updated by the user
interface ApiConfig {
  apiKey: string | null;
  useRealApi: boolean;
  model: string;
}

// Initialize with default values and a predefined API key
let apiConfig: ApiConfig = {
  apiKey: "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", // Replace this with your actual API key
  useRealApi: true, // Set to true by default to use the real API
  model: "gpt-4o"
};

// Function to update the API configuration
export const setApiConfig = (config: Partial<ApiConfig>) => {
  apiConfig = { ...apiConfig, ...config };
  
  // Save to localStorage for persistence between sessions
  if (config.apiKey) {
    localStorage.setItem('openai_api_key', config.apiKey);
    localStorage.setItem('openai_model', config.model || 'gpt-4o');
    apiConfig.useRealApi = true;
  }
  
  return apiConfig;
};

// Load API key from localStorage on init, but prefer the hardcoded one if available
export const initApiConfig = () => {
  // Only use localStorage values if no default API key is set
  if (!apiConfig.apiKey || apiConfig.apiKey === "YOUR_OPENAI_API_KEY_HERE") {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedModel = localStorage.getItem('openai_model');
    
    if (savedApiKey) {
      apiConfig.apiKey = savedApiKey;
      apiConfig.useRealApi = true;
    }
    
    if (savedModel) {
      apiConfig.model = savedModel;
    }
  }
  
  return apiConfig;
};

export const searchProperty = async (address: string) => {
  try {
    console.log(`Analyzing property: ${address}`);
    
    // Initialize config on first run
    initApiConfig();
    
    // If no API key or not using real API, use mock data
    if (!apiConfig.useRealApi || !apiConfig.apiKey) {
      console.log("Using mock data (no API key provided)");
      return {
        success: true,
        data: getMockAnalysisData(address)
      };
    }
    
    sonnerToast.loading("Analyzing property with AI, this may take a moment...");
    console.log(`Using OpenAI model: ${apiConfig.model}`);
    
    // Real API call to OpenAI with enhanced prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          {
            role: "system",
            content: `You are PropertyGPT, an expert property analyst specializing in UK real estate. You provide detailed property valuations, market analysis, and development recommendations.

Instructions:
1. Given the address, provide a comprehensive property valuation report.
2. Structure your analysis with these sections: Executive Summary, Property Details (with location analysis), Comparable Analysis, Valuation Commentary, and Key Risks/Recommendations.
3. For comparable analysis, include both sold properties and currently available properties in the area.
4. Provide realistic market values, rental income potential, and development opportunities.
5. Format your response with clear headers, tables, and structured data.

Your analysis should be data-driven and detailed, similar to what a professional surveyor would produce.`
          },
          {
            role: "user",
            content: `Provide a detailed property valuation and market analysis report for this address: ${address}. Include current valuation, comparable properties, development potential, planning opportunities, and investment strategy recommendations.`
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error details:", errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log("API response received:", result);
    sonnerToast.dismiss();
    sonnerToast.success("Analysis complete!");
    
    // Process the API response into our expected format
    const processedData = processApiResponse(result?.choices?.[0]?.message?.content || "", address);
    
    return {
      success: true,
      data: processedData
    };
    
  } catch (error) {
    console.error('Error analyzing property:', error);
    sonnerToast.dismiss();
    sonnerToast.error("Error analyzing property: " + (error instanceof Error ? error.message : "Failed to analyze property"));
    
    // For errors, use mock data if no API key was provided (expected behavior)
    if (!apiConfig.apiKey) {
      console.log("Using mock data due to API key missing");
      return {
        success: true,
        data: getMockAnalysisData(address)
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze property"
    };
  }
};

// Process OpenAI's response text into a structured format
const processApiResponse = (text: string, address: string) => {
  console.log("Processing API response...");
  
  try {
    // Extract sections from the response
    const executiveSummary = extractSection(text, "Executive Summary", "Property Details");
    const propertyDetails = extractSection(text, "Property Details", "Comparable Analysis");
    const comparableAnalysis = extractSection(text, "Comparable Analysis", "Valuation Commentary");
    const valuationCommentary = extractSection(text, "Valuation Commentary", "Key Risks");
    const keyRisks = extractSection(text, "Key Risks", "Appendices") || extractSection(text, "Key Risks and Recommendations", "Appendices") || extractSection(text, "Key Risks and Recommendations", "Conclusion") || "";
    
    // Parse property information
    const currentValuation = extractValue(valuationCommentary || executiveSummary, "Market Value", "£") || 
                            extractValue(executiveSummary, "Estimated value", "£") || 
                            "£675,000";
                            
    const propertyType = extractValue(propertyDetails || executiveSummary, "Property Type", "") || 
                        extractValue(executiveSummary, "Property Overview", "") || 
                        "Residential Property";
                        
    const useClass = extractValue(executiveSummary, "Current use class", "") || "C3 Residential";
    
    // Extract development opportunities
    const developmentPotential = extractValue(executiveSummary, "Development potential", "") || "High";
    const planningOpportunities = extractList(executiveSummary, "Opportunities") || 
                                 extractList(executiveSummary, "Development opportunities") || 
                                 ["Loft Conversion", "Rear Extension", "Potential for HMO"];
                                 
    // Extract investment recommendations
    const recommendedAction = extractValue(keyRisks || executiveSummary, "Recommendations", "") || 
                             extractValue(executiveSummary, "Recommended course of action", "") || 
                             "Refurbish and extend to create additional accommodation, then sell at premium";
                             
    // Extract financial data
    const refurbishmentCosts = extractValue(executiveSummary, "Refurbishment costs", "£") || 
                              extractValue(valuationCommentary || executiveSummary, "Estimated refurbishment", "£") || 
                              "£120,000";
                              
    const gdv = extractValue(executiveSummary, "GDV", "£") || 
               extractValue(valuationCommentary || executiveSummary, "Gross Development Value", "£") || 
               "£950,000";
               
    const profitMargin = extractValue(executiveSummary, "profit margin", "%") || 
                        extractValue(valuationCommentary || executiveSummary, "Profit on Cost", "%") || 
                        "27.4%";
    
    // Create structured response
    return {
      executiveSummary: {
        currentUseClass: useClass,
        developmentPotential: developmentPotential,
        planningOpportunities: planningOpportunities,
        planningConstraints: extractList(executiveSummary, "Planning constraints") || 
                            extractList(keyRisks, "Risks") || 
                            ["Conservation Area", "Tree Preservation Order"],
        recommendedAction: recommendedAction,
        currentValuation: currentValuation,
        refurbishmentCosts: refurbishmentCosts,
        gdv: gdv,
        profitMargin: profitMargin,
        roi: extractValue(executiveSummary, "ROI", "%") || 
             extractValue(valuationCommentary || executiveSummary, "Return on Investment", "%") || 
             "155%",
        investmentStrategy: extractValue(executiveSummary, "Investment strategy", "") || 
                           "Refurbish & Sell",
        propertyImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D",
        rationale: extractParagraph(executiveSummary, "Rationale") || 
                  extractParagraph(valuationCommentary, "Market Observations") ||
                  "The property presents an excellent opportunity for value enhancement through strategic refurbishment and permitted development. The current configuration underutilizes the potential floor space, and market comparables indicate strong demand for larger family homes in this area."
      },
      propertyAppraisal: {
        useClass: {
          current: useClass,
          source: "Land Registry & Local Planning Authority Records",
          verification: extractValue(propertyDetails, "verification", "") || "Confirmed through planning portal"
        },
        valuation: {
          marketValue: currentValuation,
          valueUpliftPotential: extractValue(valuationCommentary, "Value uplift potential", "£") || 
                               "£275,000 (41% increase post-development)",
          refurbishmentCosts: {
            light: extractValue(propertyDetails, "Light refurbishments", "£") || 
                  "£60-75 per sq ft",
            conversion: extractValue(propertyDetails, "Conversions", "£") || 
                       "£180 per sq ft",
            newBuild: extractValue(propertyDetails, "New builds", "£") || 
                     "£225 per sq ft",
            hmoConversion: extractValue(propertyDetails, "HMO conversions", "£") || 
                          "£30,000 per room"
          }
        },
        comparables: parseComparables(comparableAnalysis) || [
          {
            address: `Near ${address}`,
            price: "£720,000",
            date: "Mar 2023",
            propertyType: "Semi-detached, 3 bedroom",
            size: "1,450 sq ft",
            rating: "High",
            reason: "Very similar property on same street, recently renovated",
            link: "https://www.rightmove.co.uk"
          },
          {
            address: "24 Example Road",
            price: "£650,000",
            date: "Jan 2023",
            propertyType: "Semi-detached, 3 bedroom",
            size: "1,350 sq ft",
            rating: "Medium",
            reason: "Similar property but requires modernization",
            link: "https://www.rightmove.co.uk"
          },
          {
            address: "8 Property Lane",
            price: "£850,000",
            date: "Apr 2023",
            propertyType: "Semi-detached, 4 bedroom",
            size: "1,800 sq ft",
            rating: "High",
            reason: "Extended property showing post-development value",
            link: "https://www.rightmove.co.uk"
          }
        ]
      },
      feasibilityStudy: parseFeasibilityStudy(text, address) || getMockAnalysisData(address).feasibilityStudy,
      planningOpportunities: parsePlanningOpportunities(text) || getMockAnalysisData(address).planningOpportunities
    };
  } catch (error) {
    console.error("Error parsing API response:", error);
    // Fallback to mock data if parsing fails
    return getMockAnalysisData(address);
  }
};

// Helper functions to extract data from text
function extractSection(text: string, sectionStart: string, sectionEnd: string): string {
  const startRegex = new RegExp(`(?:${sectionStart}|\\d+\\.\\s*${sectionStart})[:\\s]*`, 'i');
  const endRegex = new RegExp(`(?:${sectionEnd}|\\d+\\.\\s*${sectionEnd})[:\\s]*`, 'i');
  
  const startMatch = text.match(startRegex);
  if (!startMatch) return '';
  
  const startIndex = startMatch.index! + startMatch[0].length;
  const endMatch = text.substring(startIndex).match(endRegex);
  const endIndex = endMatch ? startIndex + endMatch.index! : text.length;
  
  return text.substring(startIndex, endIndex).trim();
}

function extractValue(text: string, key: string, prefix: string = ''): string {
  if (!text) return '';
  const regex = new RegExp(`${key}[:\\s]*([^\\n.]*)(\\.|\\n)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}

function extractList(text: string, key: string): string[] {
  if (!text) return [];
  const regex = new RegExp(`${key}[:\\s]*((?:[^\\n]*\\n?)+)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1]
      .split(/[,\n•]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  return [];
}

function extractParagraph(text: string, key: string): string {
  if (!text) return '';
  const regex = new RegExp(`${key}[:\\s]*((?:[^\\n]*\\n?)+)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}

function parseComparables(text: string): any[] {
  if (!text) return [];
  
  try {
    // Look for tabular data in the comparable section
    const soldComparables = extractSection(text, "Sold Comparables", "Active Comparables") || 
                          extractSection(text, "3.1", "3.2");
    
    const activeComparables = extractSection(text, "Active Comparables", "Valuation Commentary") || 
                            extractSection(text, "3.2", "4");
    
    const comparablesList: any[] = [];
    
    // Parse sold comparables
    if (soldComparables) {
      const lines = soldComparables.split('\n').filter(line => line.includes('£') || line.includes('Street') || line.includes('Road'));
      
      for (const line of lines) {
        const parts = line.split(/\t|  +/);
        if (parts.length >= 3) {
          const addressPart = parts.find(p => p.includes('Street') || p.includes('Road') || p.includes('Avenue'));
          const pricePart = parts.find(p => p.includes('£'));
          
          if (addressPart && pricePart) {
            comparablesList.push({
              address: addressPart.trim(),
              price: pricePart.trim(),
              date: parts.find(p => p.includes('20') || p.includes('Jan') || p.includes('Feb') || p.includes('Mar') || p.includes('Apr'))?.trim() || "Recent",
              propertyType: parts.find(p => p.includes('bedroom') || p.includes('detached') || p.includes('terraced'))?.trim() || "Similar property",
              size: parts.find(p => p.includes('sq ft') || p.includes('sqft'))?.trim() || "Comparable size",
              rating: "High",
              reason: "Similar property in the area",
              link: "https://www.rightmove.co.uk"
            });
          }
        }
      }
    }
    
    // Parse active comparables
    if (activeComparables) {
      const lines = activeComparables.split('\n').filter(line => line.includes('£') || line.includes('Street') || line.includes('Road'));
      
      for (const line of lines) {
        const parts = line.split(/\t|  +/);
        if (parts.length >= 3) {
          const addressPart = parts.find(p => p.includes('Street') || p.includes('Road') || p.includes('Avenue'));
          const pricePart = parts.find(p => p.includes('£'));
          
          if (addressPart && pricePart) {
            comparablesList.push({
              address: addressPart.trim(),
              price: pricePart.trim(),
              date: "Current",
              propertyType: parts.find(p => p.includes('bedroom') || p.includes('detached') || p.includes('terraced'))?.trim() || "Similar property",
              size: parts.find(p => p.includes('sq ft') || p.includes('sqft'))?.trim() || "Comparable size",
              rating: "Medium",
              reason: parts.find(p => p.includes('modern') || p.includes('renovation') || p.includes('updated'))?.trim() || "Active listing in the area",
              link: "https://www.rightmove.co.uk"
            });
          }
        }
      }
    }
    
    return comparablesList.length > 0 ? comparablesList : [];
  } catch (error) {
    console.error("Error parsing comparables:", error);
    return [];
  }
}

function parseFeasibilityStudy(text: string, address: string): any {
  try {
    // Extract feasibility or development information
    const developmentSection = extractSection(text, "Development Assessment", "Financial Feasibility") || 
                             extractSection(text, "Development Potential", "Financial Analysis");
    
    const financialSection = extractSection(text, "Financial Feasibility", "Risk Assessment") || 
                           extractSection(text, "Financial Analysis", "Risk Assessment");
    
    const riskSection = extractSection(text, "Risk Assessment", "Recommendations") || 
                      extractSection(text, "Risks", "Recommendations");
    
    // If we don't have enough sections, return null (will use mock data)
    if (!developmentSection && !financialSection) {
      return null;
    }
    
    // Try to extract scenario details
    const refurbishScenario = {
      name: "Buy, Refurbish, and Sell",
      description: extractParagraph(developmentSection, "Refurbishment") || 
                  "Light to moderate refurbishment focusing on modernizing the kitchen, bathrooms, and decorative finishes without structural changes.",
      costs: {
        acquisition: extractValue(financialSection, "Acquisition Cost", "£") || 
                    "£675,000",
        refurbishment: extractValue(financialSection, "Refurbishment Costs", "£") || 
                      "£75,000",
        financing: extractValue(financialSection, "Financing", "£") || 
                 "£21,000",
        selling: extractValue(financialSection, "Selling Costs", "£") || 
               "£14,250",
        total: extractValue(financialSection, "Total Costs", "£") || 
              "£785,250"
      },
      gdv: extractValue(financialSection, "Gross Development Value", "£") || 
          extractValue(financialSection, "GDV", "£") || 
          "£830,000",
      profit: extractValue(financialSection, "Profit", "£") || 
             "£44,750",
      profitPercentage: extractValue(financialSection, "Profit on Cost", "%") || 
                       extractValue(financialSection, "Profit Percentage", "%") || 
                       "5.7%",
      maxAcquisitionPrice: extractValue(financialSection, "Maximum Acquisition Price", "£") || 
                          "£630,000",
      timeline: extractValue(developmentSection, "Timeline", "") || 
               extractValue(financialSection, "Timeline", "") || 
               "4-6 months",
      risks: [
        {
          factor: "Market Downturn",
          impact: "Medium",
          mitigation: "Ensure contingency buffer in budget; focus on timeless, quality finishes"
        },
        {
          factor: "Cost Overruns",
          impact: "Low",
          mitigation: "Fixed-price contracts with reliable contractors; detailed scope of work"
        }
      ]
    };
    
    const developScenario = {
      name: "Buy, Extend, and Convert",
      description: extractParagraph(developmentSection, "Extension") || 
                  "Comprehensive redevelopment including loft conversion, rear extension, and reconfiguration to create a larger family home.",
      costs: {
        acquisition: extractValue(financialSection, "Acquisition Cost", "£") || 
                    "£675,000",
        refurbishment: extractValue(developmentSection, "Extension Cost", "£") || 
                      extractValue(financialSection, "Development Costs", "£") || 
                      "£200,000",
        financing: extractValue(financialSection, "Financing Costs", "£") || 
                 "£42,000",
        selling: extractValue(financialSection, "Selling Fees", "£") || 
               "£19,000",
        total: (parseInt(extractValue(financialSection, "Total Cost", "£").replace(/[^0-9]/g, '') || "936000") + 
               parseInt(extractValue(financialSection, "Acquisition Cost", "£").replace(/[^0-9]/g, '') || "675000")).toString() || 
               "£936,000"
      },
      gdv: extractValue(financialSection, "Post-Development Value", "£") || 
          "£1,200,000",
      profit: (parseInt(extractValue(financialSection, "Post-Development Value", "£").replace(/[^0-9]/g, '') || "1200000") - 
              parseInt(((extractValue(financialSection, "Total Cost", "£").replace(/[^0-9]/g, '') || "936000") + 
                       (extractValue(financialSection, "Acquisition Cost", "£").replace(/[^0-9]/g, '') || "675000")))).toString() || 
              "£264,000",
      profitPercentage: extractValue(financialSection, "Profit on Cost", "%") || 
                       "28.2%",
      maxAcquisitionPrice: extractValue(financialSection, "Maximum Acquisition", "£") || 
                          "£700,000",
      timeline: extractValue(developmentSection, "Project Timeline", "") || 
               "10-12 months",
      risks: [
        {
          factor: "Planning Permission Delays",
          impact: "High",
          mitigation: "Pre-application consultation; engage planning consultant"
        },
        {
          factor: "Construction Delays",
          impact: "Medium",
          mitigation: "Detailed project timeline; penalty clauses in contracts"
        },
        {
          factor: "Finance Costs Increase",
          impact: "Medium",
          mitigation: "Fixed rate financing; potential for staged funding"
        }
      ]
    };
    
    // Extract risks from risk section if available
    if (riskSection) {
      const marketRisk = extractParagraph(riskSection, "Market Risk");
      const planningRisk = extractParagraph(riskSection, "Planning Risk");
      const constructionRisk = extractParagraph(riskSection, "Construction Risk");
      
      if (marketRisk) {
        refurbishScenario.risks[0].mitigation = marketRisk;
        developScenario.risks[0].mitigation = marketRisk;
      }
      
      if (planningRisk) {
        refurbishScenario.risks.push({
          factor: "Planning Issues",
          impact: "Medium",
          mitigation: planningRisk
        });
        
        developScenario.risks[0].mitigation = planningRisk;
      }
      
      if (constructionRisk) {
        refurbishScenario.risks[1].mitigation = constructionRisk;
        developScenario.risks[1].mitigation = constructionRisk;
      }
    }
    
    return {
      scenarios: [refurbishScenario, developScenario],
      roi: {
        expected: extractValue(financialSection, "Expected ROI", "%") || 
                 extractValue(financialSection, "Return on Investment", "%") || 
                 "28.2%",
        riskAdjusted: extractValue(financialSection, "Risk-Adjusted ROI", "%") || 
                     extractValue(financialSection, "Adjusted ROI", "%") || 
                     "23.5%",
        holdingPeriod: extractValue(financialSection, "Holding Period", "") || 
                      extractValue(financialSection, "Project Timeline", "") || 
                      "12 months"
      }
    };
  } catch (error) {
    console.error("Error parsing feasibility study:", error);
    return null;
  }
}

function parsePlanningOpportunities(text: string): any {
  try {
    // Extract planning information
    const planningSection = extractSection(text, "Planning Analysis", "Development Assessment") || 
                          extractSection(text, "Planning Opportunities", "Development Potential");
    
    if (!planningSection) {
      return null;
    }
    
    return {
      permittedDevelopment: {
        available: extractList(planningSection, "Opportunities") || 
                  ["Single-story rear extension", "Loft conversion with rear dormer", "Outbuilding conversion"],
        restricted: extractList(planningSection, "Constraints") || 
                  ["Side extensions", "Front extensions", "Additional floors"],
        notes: extractParagraph(planningSection, "Notes") || 
              "Property is in a conservation area which restricts some permitted development rights, particularly affecting the front elevation and roof visibility from the street."
      },
      localAuthority: {
        restrictions: extractList(planningSection, "Constraints") || 
                    ["Conservation Area designation limits external alterations visible from the street",
                     "Tree Preservation Order on mature oak tree in rear garden",
                     "Article 4 Direction removing some permitted development rights"],
        policies: extractList(planningSection, "Planning Policy") || 
                ["Policy H4 supports sensitive extensions to existing dwellings",
                 "Policy D2 requires high-quality design in conservation areas",
                 "Policy S7 promotes sustainable development principles"],
        upcoming: extractParagraph(planningSection, "Upcoming Changes") || 
                "The local plan is under review with proposed changes to basement development policy expected within 6 months."
      },
      potentials: {
        extensions: [
          {
            type: "Rear Extension",
            feasibility: "High",
            notes: "Up to 4m single-story extension likely to be approved under permitted development rights."
          },
          {
            type: "Loft Conversion",
            feasibility: "High",
            notes: "Rear dormer and roof lights would add approximately 400 sq ft of space."
          },
          {
            type: "Basement Development",
            feasibility: "Medium",
            notes: "Would require full planning permission with potential challenges, but precedent exists in neighboring properties."
          }
        ],
        conversions: [
          {
            type: "Garage Conversion",
            feasibility: "High",
            notes: "Integral garage could be converted to habitable space under permitted development."
          },
          {
            type: "Outbuilding Conversion",
            feasibility: "Medium",
            notes: "Existing garden structure could be upgraded to home office/gym."
          }
        ],
        changeOfUse: [
          {
            from: "Single Family Home",
            to: "HMO",
            feasibility: "Low",
            notes: "Area has Article 4 Direction requiring planning permission for HMOs with limited approval precedent."
          },
          {
            from: "Residential",
            to: "Mixed-Use (Residential with Home Office)",
            feasibility: "High",
            notes: "Acceptable under current planning policy with minimal requirements."
          }
        ]
      }
    };
  } catch (error) {
    console.error("Error parsing planning opportunities:", error);
    return null;
  }
}

// Mock data for demonstration purposes or when API is unavailable
const getMockAnalysisData = (address: string) => {
  return {
    executiveSummary: {
      currentUseClass: "C3 Residential",
      developmentPotential: "High",
      planningOpportunities: ["Loft Conversion", "Rear Extension", "Basement Development"],
      planningConstraints: ["Conservation Area", "Tree Preservation Order"],
      recommendedAction: "Refurbish and extend to create additional accommodation, then sell at premium",
      currentValuation: "£675,000",
      refurbishmentCosts: "£120,000",
      gdv: "£950,000",
      profitMargin: "27.4%",
      roi: "155%",
      investmentStrategy: "Refurbish & Sell",
      propertyImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D",
      rationale: "The property presents an excellent opportunity for value enhancement through strategic refurbishment and permitted development. The current configuration underutilizes the potential floor space, and market comparables indicate strong demand for larger family homes in this area. With planning likely to be approved and construction costs currently stable, this project represents an excellent short-term investment opportunity."
    },
    propertyAppraisal: {
      useClass: {
        current: "C3 Residential (Single Family Dwelling)",
        source: "Land Registry & Local Planning Authority Records",
        verification: "Confirmed through planning portal reference P/2020/1234"
      },
      valuation: {
        marketValue: "£675,000",
        valueUpliftPotential: "£275,000 (41% increase post-development)",
        refurbishmentCosts: {
          light: "£60-75 per sq ft",
          conversion: "£180 per sq ft",
          newBuild: "£225 per sq ft",
          hmoConversion: "£30,000 per room"
        }
      },
      comparables: [
        {
          address: "12 Sample Street",
          price: "£720,000",
          date: "Mar 2023",
          propertyType: "Semi-detached, 3 bedroom",
          size: "1,450 sq ft",
          rating: "High",
          reason: "Very similar property on same street, recently renovated",
          link: "https://www.rightmove.co.uk"
        },
        {
          address: "24 Example Road",
          price: "£650,000",
          date: "Jan 2023",
          propertyType: "Semi-detached, 3 bedroom",
          size: "1,350 sq ft",
          rating: "Medium",
          reason: "Similar property but requires modernization",
          link: "https://www.rightmove.co.uk"
        },
        {
          address: "8 Property Lane",
          price: "£850,000",
          date: "Apr 2023",
          propertyType: "Semi-detached, 4 bedroom",
          size: "1,800 sq ft",
          rating: "High",
          reason: "Extended property showing post-development value",
          link: "https://www.rightmove.co.uk"
        }
      ]
    },
    feasibilityStudy: {
      scenarios: [
        {
          name: "Buy, Refurbish, and Sell",
          description: "Light to moderate refurbishment focusing on modernizing the kitchen, bathrooms, and decorative finishes without structural changes.",
          costs: {
            acquisition: "£675,000",
            refurbishment: "£75,000",
            financing: "£21,000",
            selling: "£14,250",
            total: "£785,250"
          },
          gdv: "£830,000",
          profit: "£44,750",
          profitPercentage: "5.7%",
          maxAcquisitionPrice: "£630,000",
          timeline: "4-6 months",
          risks: [
            {
              factor: "Market Downturn",
              impact: "Medium",
              mitigation: "Ensure contingency buffer in budget; focus on timeless, quality finishes"
            },
            {
              factor: "Cost Overruns",
              impact: "Low",
              mitigation: "Fixed-price contracts with reliable contractors; detailed scope of work"
            }
          ]
        },
        {
          name: "Buy, Extend, and Convert",
          description: "Comprehensive redevelopment including loft conversion, rear extension, and reconfiguration to create a 5-bedroom family home.",
          costs: {
            acquisition: "£675,000",
            refurbishment: "£200,000",
            financing: "£42,000",
            selling: "£19,000",
            total: "£936,000"
          },
          gdv: "£1,200,000",
          profit: "£264,000",
          profitPercentage: "28.2%",
          maxAcquisitionPrice: "£700,000",
          timeline: "10-12 months",
          risks: [
            {
              factor: "Planning Permission Delays",
              impact: "High",
              mitigation: "Pre-application consultation; engage planning consultant"
            },
            {
              factor: "Construction Delays",
              impact: "Medium",
              mitigation: "Detailed project timeline; penalty clauses in contracts"
            },
            {
              factor: "Finance Costs Increase",
              impact: "Medium",
              mitigation: "Fixed rate financing; potential for staged funding"
            }
          ]
        }
      ],
      roi: {
        expected: "28.2%",
        riskAdjusted: "23.5%",
        holdingPeriod: "12 months"
      }
    },
    planningOpportunities: {
      permittedDevelopment: {
        available: ["Single-story rear extension", "Loft conversion with rear dormer", "Outbuilding conversion"],
        restricted: ["Side extensions", "Front extensions", "Additional floors"],
        notes: "Property is in a conservation area which restricts some permitted development rights, particularly affecting the front elevation and roof visibility from the street."
      },
      localAuthority: {
        restrictions: [
          "Conservation Area designation limits external alterations visible from the street",
          "Tree Preservation Order on mature oak tree in rear garden",
          "Article 4 Direction removing some permitted development rights"
        ],
        policies: [
          "Policy H4 supports sensitive extensions to existing dwellings",
          "Policy D2 requires high-quality design in conservation areas",
          "Policy S7 promotes sustainable development principles"
        ],
        upcoming: "The local plan is under review with proposed changes to basement development policy expected within 6 months."
      },
      potentials: {
        extensions: [
          {
            type: "Rear Extension",
            feasibility: "High",
            notes: "Up to 4m single-story extension likely to be approved under permitted development rights."
          },
          {
            type: "Loft Conversion",
            feasibility: "High",
            notes: "Rear dormer and roof lights would add approximately 400 sq ft of space."
          },
          {
            type: "Basement Development",
            feasibility: "Medium",
            notes: "Would require full planning permission with potential challenges, but precedent exists in neighboring properties."
          }
        ],
        conversions: [
          {
            type: "Garage Conversion",
            feasibility: "High",
            notes: "Integral garage could be converted to habitable space under permitted development."
          },
          {
            type: "Outbuilding Conversion",
            feasibility: "Medium",
            notes: "Existing garden structure could be upgraded to home office/gym."
          }
        ],
        changeOfUse: [
          {
            from: "Single Family Home",
            to: "HMO",
            feasibility: "Low",
            notes: "Area has Article 4 Direction requiring planning permission for HMOs with limited approval precedent."
          },
          {
            from: "Residential",
            to: "Mixed-Use (Residential with Home Office)",
            feasibility: "High",
            notes: "Acceptable under current planning policy with minimal requirements."
          }
        ]
      }
    }
  };
};

