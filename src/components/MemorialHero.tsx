import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import memorialBridge from "@/assets/memorial-bridge.jpg";

const MemorialHero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${memorialBridge})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>
      
      {/* Floating Light Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-memorial-glow/20 blur-xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-memorial-light/30 blur-lg animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-full bg-accent/40 blur-md animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-serif text-memorial-light mb-4 animate-glow-pulse">
            GATE OF
          </h1>
          <h1 className="text-6xl md:text-8xl font-serif text-memorial-light mb-8 animate-glow-pulse">
            MEMORY
          </h1>
          <p className="text-xl md:text-2xl text-memorial-light/90 mb-12 font-light">
            Preserving precious memories through holographic technology
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-memorial-glow hover:bg-memorial-glow/90 text-memorial-shadow font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Create Memorial
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-memorial-light text-memorial-light hover:bg-memorial-light/10 px-8 py-6 text-lg backdrop-blur-sm"
          >
            View Gallery
          </Button>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default MemorialHero;