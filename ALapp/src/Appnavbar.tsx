import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router-dom";
// import { Button } from "primereact/button";
// { label: "Clients", command: () => navigate("/clients") }

const Navbar = () => {
  const navigate = useNavigate();

  // Menu items
  const items = [
    {
      label: "Home",
      icon: "pi pi-home",
      command: () => navigate("/"), 
    },
    {
      label: "Clients",
      icon: "pi pi-users",
      command: () => navigate("/clients"), 
    //   When the user clicks this, go to /clients".
    },
    {
      label: "Reports",
      icon: "pi pi-chart-bar",
      command: () => navigate("/reports"), 
    },
  ];

  // Right-side content (profile/logout)
//   const end = (
//     <div className="flex align-items-center gap-2">
//       <Button
//         label="Profile"
//         icon="pi pi-user"
//         className="p-button-text"
//         onClick={() => console.log("Go to Profile")}
//       />
//       <Button
//         label="Logout"
//         icon="pi pi-sign-out"
//         className="p-button-danger"
//         onClick={() => console.log("Logout")}
//       />
//     </div>
//   );

  return (
    <Menubar
      model={items}
      start={<span className="font-bold text-xl">Aerolens</span>}
    //   end={end}
    />
  );
};

export default Navbar;
