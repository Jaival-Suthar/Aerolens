/* =======================
   Core Vendor Model
======================= */

export type VendorType = {
  vendorId: number;              // number (API uses number, not string)
  vendorName: string;
  vendorPhone: string | null;
  vendorEmail: string | null;
};

/* =======================
   Create Vendor
======================= */

export type CreateVendorPayload = {
  vendorName: string;
  vendorPhone?: string | null;
  vendorEmail?: string | null;
};

/* =======================
   Update Vendor (PATCH)
======================= */

export type UpdateVendorPayload = Partial<CreateVendorPayload>;

/* =======================
   Table Props (UI)
======================= */

export type VendorTableProps = {
  vendors: VendorType[];
  selectedVendor: VendorType | null;
  onSelectionChange: (vendor: VendorType | null) => void;
  onAdd: () => void;
  onEdit: (vendor: VendorType) => void;
  onDelete: (vendor: VendorType) => void;
  globalFilterValue?: string;
};

export type ApiError = {
  success?: false;
  code?: string;
  message?: string;
  details?: any;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

