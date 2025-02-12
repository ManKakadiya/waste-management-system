
import { useState } from "react";
import { MapPin, Recycle, Clock, Users, GraduationCap } from "lucide-react";
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

  const team = [
    { name: "Jeet Ajudiya", id: "23DCE001" },
    { name: "Daxil Jodhani", id: "23DCE048" },
    { name: "Man Kakadiya", id: "23DCE051" },
    { name: "Jaimin Khatri", id: "23DCE057" },
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

        {/* About Us Section */}
        <div className="space-y-12 py-16 border-t border-gray-200">
          <header className="text-center space-y-6">
            <div className="inline-block p-3 bg-primary/10 rounded-xl">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-text tracking-tight">
              About Our Team
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              A group of enthusiastic college students working together to make a difference
              in waste management.
            </p>
          </header>

          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center space-x-4 mb-6">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-semibold text-primary">Our Mission</h3>
            </div>
            <p className="text-text-secondary leading-relaxed">
              As college students passionate about technology and environmental sustainability,
              we're applying our knowledge and creativity to build meaningful solutions.
              This project represents our commitment to combining academic learning with
              real-world impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.id} className="glass-card hover-lift rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {member.name}
                </h3>
                <p className="text-text-secondary text-sm">
                  Student ID: {member.id}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
