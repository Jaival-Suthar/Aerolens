import React from "react";
import { Dialog } from "primereact/dialog";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

const ChangeLogsDialog: React.FC<Props> = ({ isOpen, onClose, title = "Change Logs" }) => (
  <Dialog
    visible={isOpen}
    onHide={onClose}
    header={title}
    modal
    style={{ width: "90vw", maxWidth: "1200px" }}
  >
    <div className="text-center text-600 p-4">No change logs found</div>
  </Dialog>
);

export default ChangeLogsDialog;
