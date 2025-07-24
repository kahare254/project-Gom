import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Edit, QrCode, Smartphone } from "lucide-react";

const MemorialProcess = () => {
  const steps = [
    {
      icon: Upload,
      step: "01",
      title: "Upload Photo",
      description: "Choose a beautiful photo of your loved one to create the memorial"
    },
    {
      icon: Edit,
      step: "02", 
      title: "Customize Memorial",
      description: "Add personal details, messages, and customize the holographic display"
    },
    {
      icon: QrCode,
      step: "03",
      title: "Generate QR Code",
      description: "Receive a unique QR code that links to the holographic memorial"
    },
    {
      icon: Smartphone,
      step: "04",
      title: "View Hologram",
      description: "Scan with any smartphone camera to view the beautiful holographic tribute"
    }
  ];

  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Creating a holographic memorial is simple and meaningful. 
            Follow these four easy steps to honor your loved one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-accent/50 to-memorial-glow/30 z-0" 
                     style={{ width: 'calc(100% - 2rem)', left: '2rem' }} />
              )}
              
              <Card className="relative z-10 text-center border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 relative">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-accent" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-memorial-glow text-memorial-shadow text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-primary">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            className="bg-memorial-glow hover:bg-memorial-glow/90 text-memorial-shadow font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Creating Memorial
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MemorialProcess;