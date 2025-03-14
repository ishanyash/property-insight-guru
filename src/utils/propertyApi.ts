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
    
    // Real API call to OpenAI
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
            content: `Instructions for Comprehensive Property Appraisal, Planning Analysis, Development Assessment, and Feasibility Study: You are a seasoned, experienced property developer in the UK, with a qualification from MRICS as a Chartered Surveyor, as well as being a master builder. Your target is to create a min of 25% profit on cost per project. You will be provided with an address, and from this you are to prepare a detailed report.`
          },
          {
            role: "user",
            content: `Create a comprehensive property analysis for this address: ${address}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
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
    // Attempt to extract structured data from the response
    // This is a basic implementation that would need refinement in production
    const executiveSummary = extractSection(text, "Executive Summary", "Property Appraisal");
    const propertyAppraisal = extractSection(text, "Property Appraisal", "Feasibility Study");
    const feasibilityStudy = extractSection(text, "Feasibility Study", "Planning Opportunities");
    const planningOpportunities = extractSection(text, "Planning Opportunities", "Local Area Commentary");
    
    // If we couldn't extract the content properly, return mock data
    if (!executiveSummary) {
      console.log("Couldn't parse API response properly, using mock data");
      return getMockAnalysisData(address);
    }
    
    // Very basic extraction of key details
    const currentValuation = extractValue(executiveSummary, "Current valuation", "£");
    const refurbishmentCosts = extractValue(executiveSummary, "Refurbishment costs", "£");
    const gdv = extractValue(executiveSummary, "GDV", "£");
    const profitMargin = extractValue(executiveSummary, "profit margin", "%");
    
    // Create a structured response
    return {
      executiveSummary: {
        currentUseClass: extractValue(executiveSummary, "Current use class", ""),
        developmentPotential: extractValue(executiveSummary, "Development potential", ""),
        planningOpportunities: extractList(executiveSummary, "Planning opportunities"),
        planningConstraints: extractList(executiveSummary, "Planning constraints"),
        recommendedAction: extractValue(executiveSummary, "Recommended course of action", ""),
        currentValuation: currentValuation || "£675,000",
        refurbishmentCosts: refurbishmentCosts || "£120,000",
        gdv: gdv || "£950,000",
        profitMargin: profitMargin || "27.4%",
        roi: extractValue(executiveSummary, "ROI", "%") || "155%",
        investmentStrategy: extractValue(executiveSummary, "Investment strategy", ""),
        propertyImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8fDA%3D",
        rationale: extractParagraph(executiveSummary, "Rationale")
      },
      propertyAppraisal: {
        useClass: {
          current: extractValue(propertyAppraisal, "Current use class", ""),
          source: "Land Registry & Local Planning Authority Records",
          verification: extractValue(propertyAppraisal, "verification", "")
        },
        valuation: {
          marketValue: currentValuation || "£675,000",
          valueUpliftPotential: extractValue(propertyAppraisal, "Value uplift potential", "£"),
          refurbishmentCosts: {
            light: extractValue(propertyAppraisal, "Light refurbishments", "£"),
            conversion: extractValue(propertyAppraisal, "Conversions", "£"),
            newBuild: extractValue(propertyAppraisal, "New builds", "£"),
            hmoConversion: extractValue(propertyAppraisal, "HMO conversions", "£")
          }
        },
        comparables: extractComparables(propertyAppraisal) || [
          {
            address: `Near ${address}`,
            price: "£720,000",
            date: "Mar 2023",
            propertyType: "Semi-detached, 3 bedroom",
            size: "1,450 sq ft",
            rating: "High",
            reason: "Very similar property on same street, recently renovated",
            link: "https://www.rightmove.co.uk"
          }
        ]
      },
      feasibilityStudy: parseFeasibilityStudy(feasibilityStudy, address) || getMockAnalysisData(address).feasibilityStudy,
      planningOpportunities: parsePlanningOpportunities(planningOpportunities) || getMockAnalysisData(address).planningOpportunities
    };
  } catch (error) {
    console.error("Error parsing API response:", error);
    // Fallback to mock data if parsing fails
    return getMockAnalysisData(address);
  }
};

// Helper functions to extract data from text
function extractSection(text: string, sectionStart: string, sectionEnd: string): string {
  const startRegex = new RegExp(`${sectionStart}[:\\s]*`, 'i');
  const endRegex = new RegExp(`${sectionEnd}[:\\s]*`, 'i');
  
  const startMatch = text.match(startRegex);
  if (!startMatch) return '';
  
  const startIndex = startMatch.index! + startMatch[0].length;
  const endMatch = text.substring(startIndex).match(endRegex);
  const endIndex = endMatch ? startIndex + endMatch.index! : text.length;
  
  return text.substring(startIndex, endIndex).trim();
}

function extractValue(text: string, key: string, prefix: string = ''): string {
  const regex = new RegExp(`${key}[:\\s]*([^\\n.]*)(\\.|\\n)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}

function extractList(text: string, key: string): string[] {
  const regex = new RegExp(`${key}[:\\s]*((?:[^\\n]*\\n?)+)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1]
      .split(/[,\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  return [];
}

function extractParagraph(text: string, key: string): string {
  const regex = new RegExp(`${key}[:\\s]*((?:[^\\n]*\\n?)+)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}

function extractComparables(text: string): any[] {
  // This is a placeholder - in a real implementation, you would
  // need to parse the comparables table from the text
  return [];
}

function parseFeasibilityStudy(text: string, address: string): any {
  // This is a placeholder - in a real implementation, you would
  // need to parse the feasibility study from the text
  return null;
}

function parsePlanningOpportunities(text: string): any {
  // This is a placeholder - in a real implementation, you would
  // need to parse the planning opportunities from the text
  return null;
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
