import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const MemorialTestimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      initials: "SJ",
      location: "California, USA",
      text: "The holographic memorial of my mother was absolutely beautiful. It brought our family so much comfort during a difficult time.",
      rating: 5
    },
    {
      name: "Michael Chen",
      initials: "MC", 
      location: "Toronto, Canada",
      text: "Gate of Memory helped us create something truly special for my father. The technology is amazing and the process was so thoughtful.",
      rating: 5
    },
    {
      name: "Emma Williams",
      initials: "EW",
      location: "London, UK", 
      text: "Being able to share the QR code with family around the world meant everyone could experience the memorial together.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">
            Stories of Remembrance
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Families around the world have found comfort and connection through 
            our holographic memorial services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-memorial-glow text-memorial-glow" />
                  ))}
                </div>
                
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-primary">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemorialTestimonials;