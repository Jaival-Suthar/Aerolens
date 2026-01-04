import React from "react";
import SignupForm from "./components/SignupForm";

const SignupPage: React.FC = () => {
  return (
    <div className="p-2" style={{flex: 1, minHeight: 0, overflowY: "auto"}}>
      <SignupForm />
    </div>
  );
};

export default SignupPage;
