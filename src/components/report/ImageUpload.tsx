
import { Camera } from "lucide-react";

interface ImageUploadProps {
  image: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload = ({ image, onImageChange }: ImageUploadProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text" htmlFor="image">
        Upload Image
      </label>
      <div className="relative">
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={onImageChange}
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
  );
};

export default ImageUpload;
