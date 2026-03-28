import { NavLink } from "react-router-dom";
import athenaLogo from "../assets/athena-logo.png";

const links = [
  { label: "Demo Mode", to: "/" },
  { label: "Truth Report", to: "/truth-report" },
  { label: "Scenario Lab", to: "/scenario-lab" },
  { label: "Decision Engine", to: "/decision-engine" },
  { label: "Invest Shift", to: "/invest-shift" },
  { label: "Future Simulation", to: "/future-simulation" },
  { label: "Bank Perspective", to: "/bank-perspective" },
  { label: "Export Report", to: "/report-export" }
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-[#1f1f1f] bg-[rgba(12,12,12,0.78)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <div className="flex min-w-[14rem] items-center gap-3">
          <img
            src={athenaLogo}
            alt="Athena logo"
            className="h-14 w-14 rounded-2xl object-cover shadow-[0_10px_28px_rgba(212,175,55,0.14)]"
          />
          <h1 className="font-yeseva text-[1.9rem] tracking-[-0.02em] text-[#fefce8]">
            Athena
          </h1>
        </div>

        <nav className="hidden rounded-full border border-[#1f1f1f] bg-[rgba(22,22,22,0.82)] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] xl:flex xl:items-center xl:gap-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2.5 text-[0.96rem] font-medium tracking-[-0.02em] transition duration-300 ${
                  isActive
                    ? "border border-[#3a3215] bg-[linear-gradient(180deg,#352b08_0%,#1f1a00_100%)] text-[#fefce8] shadow-[inset_0_1px_0_rgba(254,252,232,0.08),0_10px_24px_rgba(212,175,55,0.08)]"
                    : "border border-transparent text-[#a3a3a3] hover:border-[#252525] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#fefce8]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};
