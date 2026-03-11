import React, { useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { registerGlobalToast } from "./services/globalToastService";

const GlobalToastHost: React.FC = () => {
  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    registerGlobalToast(toastRef.current);

    return () => {
      registerGlobalToast(null);
    };
  }, []);

  return <Toast ref={toastRef} position="top-right" />;
};

export default GlobalToastHost;
