
import { useState } from "react";
import { Camera } from "lucide-react";

interface ImageUploadProps {
  image: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const ImageUpload = ({ image, onImageChange, required = false }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInput = document.getElementById("image") as HTMLInputElement;
      if (fileInput) {
        fileInput.files = e.dataTransfer.files;
        const event = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
        onImageChange(event);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text flex items-center" htmlFor="image">
        Upload Image {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
          required={required}
        />
        <label
          htmlFor="image"
          className={`flex items-center justify-center w-full h-32 border-2 border-dashed 
          ${dragActive ? "border-primary" : "border-border"} 
          rounded-xl cursor-pointer hover:border-primary transition-colors duration-300 bg-white`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
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
                {required ? "Click or drag to upload image (required)" : "Click or drag to upload image"}
              </span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
