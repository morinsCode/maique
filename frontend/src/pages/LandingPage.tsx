import { Link } from "react-router";

function LandingPage() {
  return (
    <>
      <Link to="/guest">Guest</Link>
      <Link to="/dj">DJ</Link>
    </>
  );
}

export default LandingPage;
