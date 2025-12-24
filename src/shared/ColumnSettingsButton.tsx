import React, { useRef } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { FaColumns } from "react-icons/fa";

type ColumnSettingsButtonProps<T> = {
  value: T[];
  options: T[];
  optionLabel: string;
  onChange: (value: T[]) => void;
  onReset: () => void;
};

function ColumnSettingsButton<T>({
  value,
  options,
  optionLabel,
  onChange,
  onReset,
}: ColumnSettingsButtonProps<T>) {
  const overlayRef = useRef<OverlayPanel>(null);

  return (
    <>
      {/* Action Icon Button */}
      <Button
        type="button"
        aria-label="Column Settings"
        tooltip="Select Columns"
        tooltipOptions={{ position: "bottom" }}
        rounded
        className="font-medium mr-1"
        style={{
            backgroundColor: "#e2e8f0", // 🔥 subtle neutral tint
            color: "#334155",           // slate-700
            border: "none",
            boxShadow: "none",
            width: 40,
            height: 40,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
        }}
        onClick={(e) => overlayRef.current?.toggle(e)}
        >
        <FaColumns style={{ fontSize: 16 }} />
      </Button>

      {/* Overlay anchored to button */}
      <OverlayPanel
        ref={overlayRef}
        style={{ width: "260px" }}
        dismissable
        showCloseIcon
      >
        <div className="flex flex-column gap-2">
          <MultiSelect
            value={value}
            options={options}
            optionLabel={optionLabel}
            display="chip"
            className="w-full"
            onChange={(e) => {
              if (e.value.length === 0) return;
              onChange(e.value);
            }}
          />

          <div className="flex justify-content-end mt-2">
            <Button
              label="Reset to Default"
              icon="pi pi-refresh"
              className="p-button-text p-button-sm"
              onClick={() => {
                onReset();
                overlayRef.current?.hide();
              }}
            />
          </div>
        </div>
      </OverlayPanel>
    </>
  );
}

export default ColumnSettingsButton;
