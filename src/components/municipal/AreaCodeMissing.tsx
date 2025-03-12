
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AreaCodeMissing = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-8 text-center">
      <h3 className="text-xl font-bold mb-2">Missing Area Code</h3>
      <p className="text-gray-500 mb-4">
        Your account doesn't have an area code assigned. Please update your profile
        or contact the administrator.
      </p>
      <Button 
        variant="default"
        onClick={() => navigate('/profile')}
      >
        Update Profile
      </Button>
    </Card>
  );
};

export default AreaCodeMissing;
