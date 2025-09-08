import { Navigation } from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import CallToAction from "@/components/CallToAction";
const LandingPage = () => {
  return <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <CallToAction />
      </main>
      
      <footer id="footer" className="bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center bg-[#92b692]">
                  <span className="text-primary-foreground font-bold text-sm">A</span>
                </div>
                <span className="font-bold text-lg">AayuTrace</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Never miss an expiry date or warranty claim again.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#solution" className="block hover:text-foreground transition-colors cursor-pointer">Features</a>
                <a href="#cta" className="block hover:text-foreground transition-colors cursor-pointer">Pricing</a>
                <a href="#solution" className="block hover:text-foreground transition-colors cursor-pointer">Demo</a>
                <a href="#cta" className="block hover:text-foreground transition-colors cursor-pointer">Support</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#hero" className="block hover:text-foreground transition-colors cursor-pointer">About</a>
                <a href="#cta" className="block hover:text-foreground transition-colors cursor-pointer">Careers</a>
                <a href="#cta" className="block hover:text-foreground transition-colors cursor-pointer">Contact</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#footer" className="block hover:text-foreground transition-colors cursor-pointer">Privacy</a>
                <a href="#footer" className="block hover:text-foreground transition-colors cursor-pointer">Terms</a>
                <a href="#footer" className="block hover:text-foreground transition-colors cursor-pointer">Security</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">© 2025 AayuTrace. All rights reserved.</div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;