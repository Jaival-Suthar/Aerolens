import React from "react";
import { Dialog } from "primereact/dialog";

interface Props {
  visible: boolean;
  title: string;
  onHide: () => void;
  children: React.ReactNode;
}

const PremiumDetailsDialog: React.FC<Props> = ({
  visible,
  title,
  onHide,
  children,
}) => {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={title}
      modal
      dismissableMask
      style={{ width: "72vw", maxWidth: 960 }}
      contentStyle={{
        padding: "0.75rem 1.25rem 1.25rem",
        background: "#f9fafb",
        ["--label-size" as any]: "0.8rem",
        ["--value-size" as any]: "1.05rem",
        ["--section-title-size" as any]: "0.95rem",
      }}
      headerStyle={{
        padding: "0.75rem 1.25rem",
        background: "linear-gradient(90deg, #072844, #55c62c)",
        color: "#ffffff",
        fontWeight: 600,
        fontSize: "1.25rem",
        borderRadius: "10px 10px 0 0",
      }}
    >
      {children}
    </Dialog>
  );
};

export default PremiumDetailsDialog;
