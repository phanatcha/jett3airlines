import { Link } from "react-router-dom";
import BlackLogo from "../components/BlackLogo";

const Home = () => {
  return (
    <div className="min-h-screen flex bg-[url('/home-page-bg.png')] bg-cover bg-center text-black">
      <div className="w-1/2 px-20 py-10 flex flex-col">
        <div>
          <BlackLogo />
        </div>

        <div className="flex-1 flex items-center">
          <div className="max-w-xl">
            <p className="tagline">Nothing beats a Jett3Airlines</p>
            <h1 className="text-black mb-4">Jett3Airlines</h1>
            <p className="subtitle text-gray-600">
              Welcome aboard Jett3Airline — your ultimate destination for seamless flight booking,
              personalized travel experiences, and effortless check-in management.
            </p>

            <div className="flex items-center space-x-4 mt-6">
              <Link
                to="/signup"
                className="bg-primary-300 text-white px-6 py-3 rounded-md font-medium shadow-md hover:bg-primary-500 transition"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="border border-gray-300 text-black px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition"
              >
                Log in
              </Link>
              <Link
                to="/admin"
                className="bg-gray-800 text-white px-6 py-3 rounded-md font-medium shadow-md hover:bg-gray-700 transition"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 relative overflow-visible">
        <img
          src="/plane.png"
          alt="plane"
          className="absolute bottom-[90px] right-[-60px] w-[700px] drop-shadow-2xl transform rotate-6"
        />
      </div>
    </div>
  );
};

export default Home;
