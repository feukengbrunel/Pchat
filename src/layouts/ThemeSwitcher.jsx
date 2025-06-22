import { useTheme } from "../context/ThemeProvider";

const ThemeSwitcher = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <div className="form-group d-flex align-items-center">
      <div className="switch m-r-10">
        <input
          type="checkbox"
         onClick={() => setDarkMode(!darkMode)}
          id="switch-theme"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />
        <label htmlFor="switch-theme"></label>
      </div>
      <label className="mb-0">{darkMode ? "Mode sombre" : "Mode clair"}</label>
    </div>
  );
};

export default ThemeSwitcher;