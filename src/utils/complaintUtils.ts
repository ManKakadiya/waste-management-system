
// Helper function to decode base64
export const decode = (dataString: string) => {
  return Buffer.from(dataString, 'base64');
};

// Helper function to get status color
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "text-green-600 bg-green-50";
    case "in progress":
      return "text-orange-600 bg-orange-50";
    case "pending":
      return "text-red-600 bg-red-50";
    case "under review":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

// Helper function to get status icon
export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "✓";
    case "in progress":
      return "⟳";
    case "pending":
      return "!";
    default:
      return "?";
  }
};
