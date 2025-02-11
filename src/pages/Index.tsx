
import { useState } from "react";
import { MapPin, Recycle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [isHovered, setIsHovered] = useState("");

  const features = [
    {
      icon: MapPin,
      title: "Report Issues",
      description: "Easily report waste problems in your area",
      link: "/report",
    },
    {
      icon: Clock,
      title: "Track Status",
      description: "Monitor the progress of your complaints",
      link: "/track",
    },
    {
      icon: Recycle,
      title: "Recycling Guide",
      description: "Learn about waste recycling best practices",
      link: "/guide",
    },
  ];

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <header className="text-center space-y-6 fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-text tracking-tight">
            Waste Management System
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A modern platform for reporting and tracking waste-related issues in your community.
            Together, let's build a cleaner environment.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in-up">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group"
              onMouseEnter={() => setIsHovered(feature.title)}
              onMouseLeave={() => setIsHovered("")}
            >
              <div className="glass-card hover-lift rounded-2xl p-8 h-full">
                <div className="space-y-4">
                  <div className="inline-block p-3 bg-primary/10 rounded-xl">
                    <feature.icon
                      className={`w-6 h-6 text-primary transition-colors duration-300 ${
                        isHovered === feature.title ? "text-primary-hover" : ""
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-text group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center space-y-6 fade-in-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-2xl md:text-3xl font-semibold text-text">
            Making a Difference Together
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Join us in our mission to create cleaner, healthier communities through efficient
            waste management and environmental consciousness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
