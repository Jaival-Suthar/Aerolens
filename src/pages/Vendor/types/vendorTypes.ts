export type VendorType = {
    vendorId: string;
    organisationName: string;
    phone?: string;
    email?: string;
  };
  
  export type VendorTableProps = {
    vendors: VendorType[];
    selectedVendor: VendorType | null;
    onSelectionChange: (vendor: VendorType | null) => void;
    onAdd: () => void;
    onEdit: (vendor: VendorType) => void;
    onDelete: (vendor: VendorType) => void;
    globalFilterValue?: string;
  };
  