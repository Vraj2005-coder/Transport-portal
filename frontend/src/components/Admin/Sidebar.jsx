import { useNavigate } from "react-router-dom";

function Sidebar({ sidebarOpen }) {

  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
    },
    {
      name: "Vehicles",
      path: "/vehicles",
    },
    {
      name: "Drivers",
      path: "/drivers",
    },
    {
      name: "Trips",
      path: "/trips",
    },
    {
      name: "Documents",
      path: "/documents",
    },
    {
      name: "Settings",
      path: "/settings",
    },
  ];

  return (

    <div
      className={`sidebar ${
        sidebarOpen
          ? "sidebar-show"
          : "sidebar-hide"
      }`}
    >

      <ul>

        {menuItems.map((item, index) => (

          <li
            key={index}
            onClick={() =>
              navigate(item.path)
            }
          >
            {item.name}
          </li>

        ))}

      </ul>

    </div>
  );
}

export default Sidebar;