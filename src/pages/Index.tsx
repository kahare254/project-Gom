import MemorialHero from "@/components/MemorialHero";
import MemorialFeatures from "@/components/MemorialFeatures";
import MemorialProcess from "@/components/MemorialProcess";
import MemorialTestimonials from "@/components/MemorialTestimonials";
import MemorialFooter from "@/components/MemorialFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <MemorialHero />
      <MemorialFeatures />
      <MemorialProcess />
      <MemorialTestimonials />
      <MemorialFooter />
    </div>
  );
};

export default Index;
