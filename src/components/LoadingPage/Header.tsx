import { ConnectButtonSection } from "./ConnectButtonSection";
import { LoadingPageLogo } from "./LoadingPageLogo";

export const Header = () => {
    return (
      <header className="flex justify-between items-center py-6 bg-white md:px-20">
      <LoadingPageLogo/>
      </header>
    );
  };