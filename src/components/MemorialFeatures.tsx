import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Smartphone, Heart, Users } from "lucide-react";

const MemorialFeatures = () => {
  const features = [
    {
      icon: QrCode,
      title: "QR Code Technology",
      description: "Generate unique QR codes that link to holographic memorial displays",
      badge: "Advanced"
    },
    {
      icon: Smartphone,
      title: "Mobile Viewing",
      description: "View holographic memorials on any smartphone camera with AR capabilities",
      badge: "Easy"
    },
    {
      icon: Heart,
      title: "Loving Memories",
      description: "Create beautiful, personalized tributes that honor your loved ones",
      badge: "Personal"
    },
    {
      icon: Users,
      title: "Share & Connect",
      description: "Share memorial cards with family and friends around the world",
      badge: "Social"
    }
  ];

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">
            Revolutionary Memorial Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Combining cutting-edge holographic technology with heartfelt remembrance, 
            Gate of Memory creates lasting tributes that transcend physical boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/50 to-memorial-glow/50" />
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 rounded-full bg-accent/10 w-16 h-16 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <Badge variant="secondary" className="mx-auto mb-2 text-xs">
                  {feature.badge}
                </Badge>
                <CardTitle className="text-xl font-semibold text-primary">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center">
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemorialFeatures;