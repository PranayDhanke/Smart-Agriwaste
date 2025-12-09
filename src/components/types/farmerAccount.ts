type FarmUnit = "hectare" | "acre";

export interface FarmerAccount {
  farmerId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  aadharnumber: string;

  // Address
  state: string;
  district: string;
  taluka: string;
  village: string;
  houseBuildingName: string;
  roadarealandmarkName: string;

  // Files (store only URLs in MongoDB)
  aadharUrl: string; // Aadhaar photo
  farmDocUrl: string; // 7/12 or 8A document

  // Farm details
  farmNumber: string; // 7/12 or 8A number
  farmArea: string;
  farmUnit: FarmUnit;
}