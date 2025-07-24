import { Button } from "@/components/ui/button";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const MemorialFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif mb-4">Gate of Memory</h3>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Preserving precious memories through innovative holographic technology, 
              creating lasting tributes that bring comfort and connection.
            </p>
            <div className="flex items-center text-primary-foreground/60">
              <Heart className="w-4 h-4 mr-2" />
              <span className="text-sm">Made with love and remembrance</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Holographic Memorials</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">QR Code Generation</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Memorial Cards</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Custom Tributes</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">support@gateofmemory.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">1-800-MEMORY</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Available Worldwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-primary-foreground/60 text-sm mb-4 md:mb-0">
            © 2024 Gate of Memory. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MemorialFooter;