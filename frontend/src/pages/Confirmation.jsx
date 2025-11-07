import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import MainHeaderVer2 from "../components/MainHeaderVer2";
import Back from "../components/BackBlack";
import { useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import airplaneIcon from "/icons/airplane-v2-icon.svg";

const Confirmation = () => {
  const navigate = useNavigate();
  const ticketRef = useRef(null);

    const handleDownloadPDF = async () => {
    const original = ticketRef.current;
    if (!original) return;

    // Clone ticket for clean capture
    const clone = original.cloneNode(true);
    clone.style.backgroundColor = "#ffffff";
    clone.style.color = "#000000";
    clone.style.filter = "grayscale(100%) contrast(120%)";
    clone.className = "p-6 bg-white text-black border border-gray-300 rounded-xl";

    // ✅ center layout
    clone.style.display = "flex";
    clone.style.flexDirection = "column";
    clone.style.alignItems = "center";
    clone.style.justifyContent = "center";
    clone.style.width = "40%";
    clone.style.textAlign = "center";
    clone.style.gap = "20px"; // space between tickets

    document.body.appendChild(clone);
    await new Promise((r) => setTimeout(r, 200));

    // Render to canvas
    const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
    });

    // Convert to image
    const imgData = canvas.toDataURL("image/png");

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width * 0.264583;
    const imgHeight = canvas.height * 0.264583;

    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;

    const x = (pageWidth - newWidth) / 2;
    const y = (pageHeight - newHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, newWidth, newHeight);
    pdf.save("E-Ticket.pdf");

    document.body.removeChild(clone);
    };



  return (
    <>
        <style>
        {`
            .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
            .text-gray-500 { color: rgb(107, 114, 128) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
            .bg-blue-900 { background-color: rgb(30, 58, 138) !important; }
            .hover\\:bg-blue-800:hover { background-color: rgb(30, 64, 175) !important; }
            .shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important; }
        `}
        </style>

        <div className="bg-gray-50 min-h-screen">
        <MainHeaderVer2 />

        <div className="p-10 flex justify-between items-start gap-8">
            {/* LEFT SIDE */}
            <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">Flight Details</h1>
            <p className="text-gray-500 text-sm mb-6">
                *Your e-ticket has been sent to your email address.
            </p>

            <div className="flex gap-10">
                {/* Departure Flight */}
                <div className="flex gap-6">
                <div className="border rounded-2xl shadow-sm bg-white p-4 w-64">
                    <p className="mb-3 font-medium text-base">Departure Flight</p>
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">BKK</span>
                    <img
                        src={airplaneIcon}
                        alt="Airplane"
                        className="w-7 h-7 opacity-80"
                    />
                    <span className="font-bold text-lg">BER</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>14:00</span>
                    <span>22:15</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">6 Dec 2025</p>
                    <p className="text-sm font-light text-gray-500 mb-2">2 stops</p>
                    <div className="border rounded-md px-3 py-2 flex justify-between items-center bg-blue-50">
                    <span className="text-sm font-medium">Flight: JT234</span>
                    <span className="bg-blue-900 text-white text-xs px-3 py-1 rounded-md">
                        GATE: J1A
                    </span>
                    </div>
                </div>
                </div>

                {/* Return Flight */}
                <div className="flex gap-6">
                <div className="border rounded-2xl shadow-sm bg-white p-4 w-64">
                    <p className="mb-3 font-medium text-base">Return Flight</p>
                    <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">BER</span>
                    <img
                        src={airplaneIcon}
                        alt="Airplane"
                        className="w-7 h-7 opacity-80"
                    />
                    <span className="font-bold text-lg">BKK</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>22:15</span>
                    <span>15:15</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                    13 Dec 2025 - 14 Dec 2025
                    </p>
                    <p className="text-sm font-light text-gray-500 mb-2">1 stop</p>
                    <div className="border rounded-md px-3 py-2 flex justify-between items-center bg-blue-50">
                    <span className="text-sm font-medium">Flight: JT251</span>
                    <span className="bg-blue-900 text-white text-xs px-3 py-1 rounded-md">
                        GATE: J3B
                    </span>
                    </div>
                </div>
                </div>
            </div>
            </div>
     
            {/* RIGHT SIDE */}
            <div>
                <div ref={ticketRef}>
                    <div
                    className="bg-white rounded-2xl shadow-md p-6 w-[350px] text-center mb-7"
                    >


                    <h2 className="text-2xl font-semibold mb-4">Your E-Ticket</h2>

                    {/* Barcode */}
                    <div className="flex justify-center mb-4">
                        <Barcode
                        value="JT234"
                        displayValue={false}
                        height={60}
                        width={1.5}
                        />
                    </div>

                    {/* Route */}
                    <div className="flex justify-between items-center text-xl font-semibold mb-4">
                        <span>BKK</span>
                        <img
                        src={airplaneIcon}
                        alt="Airplane"
                        className="w-8 h-8 opacity-80"
                        />
                        <span>BER</span>
                    </div>

                    {/* City & Info Rows */}
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <div className="text-left">
                        <p className="font-medium text-black">Bangkok</p>
                        <p>14:00</p>
                        </div>
                        <div className="text-center">
                        <p className="font-medium text-black">Booking No.</p>
                        <p>JT234</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">Berlin</p>
                        <p>22:15</p>
                        </div>
                    </div>

                    {/* Date Row */}
                    <div className="flex justify-between text-sm text-gray-600 mt-4">
                        <div className="text-left">
                        <p className="font-medium text-black">Date</p>
                        <p>6 Dec 2025</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">Boarding Time</p>
                        <p>13:30</p>
                        </div>
                    </div>

                    </div>
                    <div
                    className="bg-white rounded-2xl shadow-md p-6 w-[350px] text-center mb-7"
                    >


                    <h2 className="text-2xl font-semibold mb-4">Your E-Ticket</h2>

                    {/* Barcode */}
                    <div className="flex justify-center mb-4">
                        <Barcode
                        value="JT251"
                        displayValue={false}
                        height={60}
                        width={1.5}
                        />
                    </div>

                    {/* Route */}
                    <div className="flex justify-between items-center text-xl font-semibold mb-4">
                        <span>BER</span>
                        <img
                        src={airplaneIcon}
                        alt="Airplane"
                        className="w-8 h-8 opacity-80"
                        />
                        <span>BKK</span>
                    </div>

                    {/* City & Info Rows */}
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <div className="text-left">
                        <p className="font-medium text-black">Bangkok</p>
                        <p>22:15</p>
                        </div>
                        <div className="text-center">
                        <p className="font-medium text-black">Booking No.</p>
                        <p>JT251</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">Berlin</p>
                        <p>15:15</p>
                        </div>
                    </div>

                    {/* Date Row */}
                    <div className="flex justify-between text-sm text-gray-600 mt-4">
                        <div className="text-left">
                        <p className="font-medium text-black">Date</p>
                        <p>13 Dec 2025</p>
                        </div>
                        <div className="text-right">
                        <p className="font-medium text-black">Boarding Time</p>
                        <p>21:45</p>
                        </div>
                    </div>

                    </div>

                </div>
                    <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition"
                    >
                    Download E-Ticket (PDF)
                    </button>
            </div>
        </div>
        </div>
    </>
  );
};

export default Confirmation;
