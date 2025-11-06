import MainHeaderVer1 from "../components/MainHeaderVer1";
import Back from "../components/BackBlack";
import firstClassExperience from "/first-class-experience.png";
import onFlightDiner from "/on-flight-diner.png";
import service from "/complementary-service.png";
import { useNavigate } from "react-router-dom";

const Experience = () => {
  const navigate = useNavigate();

  const experiences = [
    {
      title: "First-Class Experience",
      image: firstClassExperience,
      path: "/experience/first-class",
      size: "row-span-2 h-[520px]",
    },
    {
      title: "On flight diner",
      image: onFlightDiner,
      path: "/experience/diner",
      size: "h-[250px]",
    },
    {
      title: "Our complementary services",
      image: service,
      path: "/experience/services",
      size: "h-[250px]",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <MainHeaderVer1 />

      {/* Back button */}
      <div className="flex px-10 pt-10">
        <Back to="/flights" />
      </div>

      {/* Title */}
      <h2 className="text-4xl font-bold px-20 pt-5">Experiences</h2>

      {/* Experience Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-20 py-10 items-stretch">
        {/* Left large card */}
        <div
          onClick={() => navigate(experiences[0].path)}
          className={`relative rounded-3xl overflow-hidden cursor-pointer ${experiences[0].size} transition-transform duration-500 hover:scale-[1.02]`}
        >
          <img
            src={experiences[0].image}
            alt={experiences[0].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-5 text-white font-semibold text-base drop-shadow-md">
            {experiences[0].title}
          </div>
        </div>

        {/* Right side stacked cards */}
        <div className="flex flex-col justify-between gap-6">
          {experiences.slice(1).map((exp, index) => (
            <div
              key={index}
              onClick={() => navigate(exp.path)}
              className={`relative rounded-3xl overflow-hidden cursor-pointer ${exp.size} transition-transform duration-500 hover:scale-[1.02]`}
            >
              <img
                src={exp.image}
                alt={exp.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-5 text-white font-semibold text-base drop-shadow-md">
                {exp.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experience;

