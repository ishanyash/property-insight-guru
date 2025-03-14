
import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Header from '@/components/Header';
import PropertyForm from '@/components/PropertyForm';
import { Button } from '@/components/ui/button';
import { ArrowDown, Building, Home, Star, Users } from 'lucide-react';

const Index = () => {
  const controls = useAnimation();
  const [scrollY, setScrollY] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.8 } });
  }, [controls]);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-70 z-0"></div>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50 rounded-full filter blur-3xl opacity-40 transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-50 rounded-full filter blur-3xl opacity-30 transform -translate-x-1/4 translate-y-1/4"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Unlock Your Property's True Potential
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Instant AI-powered property analysis to maximize your investment return. Get professional-grade insights for developers and investors.
              </p>
            </motion.div>
            
            <PropertyForm />
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-12"
            >
              <Button 
                variant="ghost" 
                onClick={scrollToFeatures}
                className="flex items-center gap-2 mx-auto text-gray-500 hover:text-gray-700 transition-colors duration-300"
              >
                Learn more
                <ArrowDown className="h-4 w-4 animate-bounce" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: scrollY > 100 ? 1 : 0, y: scrollY > 100 ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Property Intelligence</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes every aspect of your property to deliver actionable insights and maximize your ROI.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Building className="h-8 w-8 text-blue-500" />}
              title="Property Appraisal"
              description="Get accurate valuations, comparables analysis, and use class verification to understand your property's true value."
              scrollY={scrollY}
              threshold={200}
              delay={0}
            />
            
            <FeatureCard 
              icon={<Star className="h-8 w-8 text-blue-500" />}
              title="Feasibility Studies"
              description="Explore different development scenarios with detailed cost breakdowns, profit projections, and risk assessments."
              scrollY={scrollY}
              threshold={200}
              delay={0.2}
            />
            
            <FeatureCard 
              icon={<Home className="h-8 w-8 text-blue-500" />}
              title="Planning Opportunities"
              description="Discover potential for extensions, conversions, and change of use with local authority context and permitted development rights."
              scrollY={scrollY}
              threshold={200}
              delay={0.4}
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: scrollY > 300 ? 1 : 0, y: scrollY > 300 ? 0 : 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Property Professionals</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how our platform is helping developers and investors make better decisions.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="The detailed feasibility analysis saved me from a potentially costly investment mistake. The ROI projections were spot on."
              author="Sarah Johnson"
              role="Property Developer"
              scrollY={scrollY}
              threshold={400}
              delay={0}
            />
            
            <TestimonialCard 
              quote="I was able to identify permitted development opportunities I had completely overlooked. This tool paid for itself within a day."
              author="Mark Williams"
              role="Real Estate Investor"
              scrollY={scrollY}
              threshold={400}
              delay={0.2}
            />
            
            <TestimonialCard 
              quote="The planning insights are incredibly detailed and saved me weeks of research. A game-changer for my property portfolio."
              author="David Chen"
              role="Property Portfolio Manager"
              scrollY={scrollY}
              threshold={400}
              delay={0.4}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: scrollY > 600 ? 1 : 0, 
              scale: scrollY > 600 ? 1 : 0.95 
            }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-10 text-center text-white shadow-xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to maximize your property's potential?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Get instant, AI-powered property analysis and start making data-driven investment decisions today.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6 h-auto font-medium transition-all duration-300 hover:shadow-lg"
            >
              Analyze Your Property Now
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">PropertyInsight</h3>
              <p className="text-gray-400">
                AI-powered property analysis for developers and investors.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Case Studies</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} PropertyInsight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  scrollY, 
  threshold, 
  delay 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  scrollY: number;
  threshold: number;
  delay: number;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: scrollY > threshold ? 1 : 0, y: scrollY > threshold ? 0 : 20 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover-scale"
    >
      <div className="mb-4 p-3 bg-blue-50 inline-block rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const TestimonialCard = ({ 
  quote, 
  author, 
  role, 
  scrollY, 
  threshold, 
  delay 
}: { 
  quote: string; 
  author: string; 
  role: string;
  scrollY: number;
  threshold: number;
  delay: number;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: scrollY > threshold ? 1 : 0, y: scrollY > threshold ? 0 : 20 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="mb-6">
        <Users className="h-8 w-8 text-blue-400" />
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-medium">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </motion.div>
  );
};

export default Index;
