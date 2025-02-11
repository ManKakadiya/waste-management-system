
import { useState } from "react";
import { Camera, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Report = () => {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Report Submitted",
      description: "Your waste report has been successfully submitted.",
    });
    
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Report Waste Issue
          </h1>
          <p className="text-text-secondary">
            Help keep our community clean by reporting waste-related issues.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 fade-in-up">
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text" htmlFor="location">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                <input
                  id="location"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                required
                rows={4}
                className="w-full px-4 py-2 rounded-xl border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe the waste issue"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text" htmlFor="image">
                Upload Image
              </label>
              <div className="relative">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors duration-300"
                >
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="mx-auto w-8 h-8 text-text-secondary mb-2" />
                      <span className="text-sm text-text-secondary">
                        Click to upload image
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;
