import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, FileText, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const HomePage = () => {
  const services = [
    {
      icon: Calculator,
      title: "Tax Preparation",
      description: "Professional tax preparation services for individuals and businesses with guaranteed accuracy."
    },
    {
      icon: FileText,
      title: "Tax Planning",
      description: "Strategic tax planning to minimize your tax liability and maximize your savings year-round."
    },
    {
      icon: Shield,
      title: "IRS Representation",
      description: "Expert representation during IRS audits and disputes to protect your interests."
    },
    {
      icon: Users,
      title: "Business Consulting",
      description: "Comprehensive business tax consulting to help your company grow while staying compliant."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center bg-no-repeat flex items-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Professional Tax Services
            <span className="block text-2xl md:text-3xl font-normal mt-2 opacity-90">
              You Can Trust
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Expert tax consultation, preparation, and planning services to maximize your savings and ensure compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg">
                Get Started Today
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tax solutions tailored to your unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose TaxPro Consulting?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  With over 15 years of experience in tax preparation and planning, our certified professionals 
                  provide personalized service to help you navigate complex tax regulations.
                </p>
                <p className="text-lg">
                  We serve both individual and business clients, ensuring accurate filing, maximum deductions, 
                  and comprehensive year-round tax planning strategies.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">15+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-card p-8 rounded-lg shadow-medium">
              <h3 className="text-2xl font-bold text-foreground mb-6">Client Portal Benefits</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Secure document upload and storage
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Create and manage invoices
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Track your tax preparation progress
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  24/7 access to your tax documents
                </li>
              </ul>
              <Link to="/signup" className="inline-block mt-6">
                <Button className="w-full">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and discover how we can help optimize your tax situation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground">(555) 123-4567</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground">info@taxproconsulting.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Office Hours</h3>
              <p className="text-muted-foreground">Mon-Fri: 9AM-6PM</p>
            </div>
          </div>
          <Link to="/signup">
            <Button size="lg" className="px-8 py-3 text-lg">
              Schedule Consultation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;