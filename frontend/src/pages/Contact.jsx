import MainHeaderVer1 from "../components/MainHeaderVer1";
import Back from "../components/BackBlack";
import office from "/buero.png";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="bg-white min-h-screen">
      <MainHeaderVer1 />

      {/* Back button */}
      <div className="flex px-10 pt-10">
        <Back to="/flights" />
      </div>

      {/* Title */}
      <h2 className="text-4xl font-bold px-20 pt-5">Contact Us</h2>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-between px-20 py-10 gap-8">
        {/* Contact Info Section */}
        <div className=" p-8 flex-1">
          <h3 className="text-xl font-semibold mb-6">Contact Info</h3>
          <div className="space-y-5">
            {/* Email */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl shadow-sm">
              <Mail className="w-6 h-6 text-gray-700" />
              <p className="font-medium">Jett3Airlines@support.gmail.com</p>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl shadow-sm">
              <Phone className="w-6 h-6 text-gray-700" />
              <p className="font-medium">+49 151 1234 5678</p>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl shadow-sm">
              <MapPin className="w-6 h-6 text-gray-700" />
              <p className="font-medium">Berlin, Germany</p>
            </div>
          </div>
        </div>

        {/* Office Image */}
        <div className="relative flex-1 rounded-3xl overflow-hidden shadow-md">
          <img
            src={office}
            alt="Jett3Airlines Office"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-5 text-white text-sm font-medium drop-shadow-md">
            Kastanienallee 91, 10435 Berlin, Germany
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
