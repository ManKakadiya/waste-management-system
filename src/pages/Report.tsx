
import { useState } from "react";
import { Camera, MapPin, Send, MapPinned } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const Report = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your report.",
        variant: "destructive",
      });
      return;
    }
    
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please specify the location of the waste issue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!pincode.trim()) {
      toast({
        title: "Pincode Required",
        description: "Please provide the pincode for better tracking.",
        variant: "destructive",
      });
      return;
    }
    
    if (!/^\d{6}$/.test(pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode.",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of the waste issue.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Report Submitted",
      description: "Your waste report has been successfully submitted.",
    });
    
    // Reset form
    setTitle("");
    setLocation("");
    setPincode("");
    setDescription("");
    setImage(null);
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
              <label className="text-sm font-medium text-text" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter report title"
              />
            </div>

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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter location (street, landmark, etc.)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text" htmlFor="pincode">
                Pincode
              </label>
              <div className="relative">
                <MapPinned className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                <input
                  id="pincode"
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter 6-digit pincode"
                  pattern="[0-9]{6}"
                  maxLength={6}
                />
              </div>
              {user?.role === 'municipal' || user?.role === 'ngo' ? (
                <p className="text-xs text-text-secondary">
                  This report will be assigned to your organization based on the pincode.
                </p>
              ) : (
                <p className="text-xs text-text-secondary">
                  The pincode helps assign your report to the responsible organization.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
