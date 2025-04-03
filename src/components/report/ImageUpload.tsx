
import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  image: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const ImageUpload = ({ image, onImageChange, required = false }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

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
  
  // Start camera capture
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(mediaStream);
      setIsCapturingPhoto(true);
      
      // Connect the stream to video element
      const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = mediaStream;
        videoElement.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access your device camera. Please check permissions.");
    }
  };
  
  // Take photo from camera
  const takePhoto = () => {
    try {
      const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Create a file from the data URL
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], "camera-photo.jpg", { type: mime });
        
        // Create a fake event to trigger the onChange
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        const event = {
          target: {
            files: dataTransfer.files
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        
        onImageChange(event);
        
        // Stop camera after taking photo
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        setIsCapturingPhoto(false);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Failed to capture photo. Please try again.");
    }
  };
  
  // Cancel camera capture
  const cancelCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCapturingPhoto(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text flex items-center" htmlFor="image">
        Upload Image {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {isCapturingPhoto ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-border bg-black aspect-video">
            <video 
              id="camera-preview" 
              className="w-full h-full object-cover"
              playsInline
              autoPlay
            />
          </div>
          <div className="flex justify-center gap-2">
            <Button 
              type="button" 
              onClick={takePhoto}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Take Photo
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={cancelCamera}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : image ? (
        <div className="relative">
          <img
            src={image}
            alt="Preview"
            className="rounded-lg h-48 w-full object-cover"
          />
          <Button 
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => {
              const fileInput = document.getElementById("image") as HTMLInputElement;
              if (fileInput) {
                fileInput.value = "";
                const event = { target: { files: null } } as unknown as React.ChangeEvent<HTMLInputElement>;
                onImageChange(event);
              }
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
              required={required && !image}
            />
            <label
              htmlFor="image"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
              ${dragActive ? "border-primary" : "border-border"} 
              rounded-lg cursor-pointer hover:border-primary transition-colors duration-300 bg-white`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="mx-auto w-8 h-8 text-primary mb-1" />
                <span className="text-xs text-text-secondary block">
                  Upload Photo
                </span>
              </div>
            </label>
          </div>
          
          <Button 
            type="button" 
            onClick={startCamera}
            className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border
            rounded-lg hover:border-primary transition-colors duration-300 bg-white text-primary"
          >
            <Camera className="w-8 h-8 mb-1" />
            <span className="text-xs">Take Photo</span>
          </Button>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-1">
        {required ? "Photo is required" : "Upload a clear photo of the issue"}
      </p>
    </div>
  );
};

export default ImageUpload;
