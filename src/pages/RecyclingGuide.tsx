import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Info, MapPin, AlertTriangle, Clock, Check, X } from "lucide-react";

const RecyclingGuide = () => {
  const recyclingCategories = [
    {
      title: "Paper & Cardboard",
      items: ["Newspapers", "Magazines", "Cardboard boxes", "Office paper"],
      tips: "Remove any plastic wrapping or tape before recycling",
    },
    {
      title: "Plastic",
      items: ["PET bottles", "HDPE containers", "Plastic bags", "Food containers"],
      tips: "Rinse containers and remove all food residue",
    },
    {
      title: "Glass",
      items: ["Bottles", "Jars", "Container glass"],
      tips: "Remove lids and rinse thoroughly",
    },
    {
      title: "Metal",
      items: ["Aluminum cans", "Steel cans", "Metal lids", "Foil"],
      tips: "Crush cans to save space",
    },
  ];

  const facilities = [
    {
      name: "Main Recycling Center",
      address: "123 Green Street",
      hours: "Mon-Sat: 8AM-6PM",
    },
    {
      name: "Community Collection Point",
      address: "456 Eco Avenue",
      hours: "24/7 Access",
    },
  ];

  const dosAndDonts = {
    dos: [
      "Clean containers before recycling",
      "Flatten cardboard boxes",
      "Remove caps and lids from bottles",
      "Sort items into correct categories",
      "Check local recycling guidelines"
    ],
    donts: [
      "Mix different types of materials",
      "Recycle contaminated items",
      "Include plastic bags with regular recycling",
      "Leave food residue in containers",
      "Recycle items with hazardous waste"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-secondary p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-block p-3 bg-primary/10 rounded-xl">
            <Recycle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Recycling Guide
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Learn how to properly sort and recycle different types of waste
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {recyclingCategories.map((category) => (
            <Card key={category.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside mb-4 text-gray-600">
                  {category.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <AlertTriangle className="h-4 w-4 mt-1 flex-shrink-0" />
                  <p>{category.tips}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            Recycling Do's and Don'ts
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  Do's
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {dosAndDonts.dos.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <X className="h-5 w-5" />
                  Don'ts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {dosAndDonts.donts.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <X className="h-4 w-4 mt-1 text-red-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Recycling Facilities
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {facilities.map((facility) => (
              <Card key={facility.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{facility.name}</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {facility.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {facility.hours}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclingGuide;
