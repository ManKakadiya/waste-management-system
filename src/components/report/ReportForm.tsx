
import { MapPin, MapPinned, Send, CloudLightning } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface ReportFormProps {
  title: string;
  setTitle: (title: string) => void;
  location: string;
  setLocation: (location: string) => void;
  pincode: string;
  setPincode: (pincode: string) => void;
  description: string;
  setDescription: (description: string) => void;
  image: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isPending: boolean;
}

const ReportForm = ({
  title,
  setTitle,
  location,
  setLocation,
  pincode,
  setPincode,
  description,
  setDescription,
  image,
  handleImageUpload,
  handleSubmit,
  isLoading,
  isPending
}: ReportFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 fade-in-up">
      <div className="glass-card rounded-2xl p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text flex items-center" htmlFor="title">
            Title <span className="text-red-500 ml-1">*</span>
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
          <label className="text-sm font-medium text-text flex items-center" htmlFor="location">
            Location <span className="text-red-500 ml-1">*</span>
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
          <label className="text-sm font-medium text-text flex items-center" htmlFor="pincode">
            Pincode <span className="text-red-500 ml-1">*</span>
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
          <p className="text-xs text-text-secondary">
            The pincode helps assign your report to the responsible organization.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text flex items-center" htmlFor="description">
            Description <span className="text-red-500 ml-1">*</span>
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

        <ImageUpload image={image} onImageChange={handleImageUpload} required={true} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <CloudLightning size={14} className="mr-1" /> 
            <span>Images uploaded via Cloudinary</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isPending}
          className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isPending ? (
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
  );
};

export default ReportForm;
