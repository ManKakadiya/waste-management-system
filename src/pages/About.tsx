
import { GraduationCap, Users } from "lucide-react";

const About = () => {
  const team = [
    { name: "Jeet Ajudiya", id: "23DCE001" },
    { name: "Daxil Jodhani", id: "23DCE048" },
    { name: "Man Kakadiya", id: "23DCE051" },
    { name: "Jaimin Khatri", id: "23DCE057" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-6 fade-in">
          <div className="inline-block p-3 bg-primary/10 rounded-xl mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            About Our Team
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A group of enthusiastic college students working together to make a difference
            in waste management.
          </p>
        </header>

        <div className="glass-card rounded-2xl p-8 fade-in-up">
          <div className="flex items-center space-x-4 mb-6">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-primary">Our Mission</h2>
          </div>
          <p className="text-text-secondary leading-relaxed">
            As college students passionate about technology and environmental sustainability,
            we're applying our knowledge and creativity to build meaningful solutions.
            This project represents our commitment to combining academic learning with
            real-world impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-up" style={{ animationDelay: "200ms" }}>
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
  );
};

export default About;
