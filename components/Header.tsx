import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./Navbar"));

const Header = (): JSX.Element => {
  return (
    <>
      <Navbar />
    </>
  );
};

export default Header;
