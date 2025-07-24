import qrCode from "@/assets/qr-code.png";
import memorialPortrait from "@/assets/memorial-portrait.jpg";
import memorialBridge from "@/assets/memorial-bridge.jpg";

const MemorialCard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center p-8">
      <div className="flex items-center gap-12 max-w-5xl">
        {/* Memorial Card */}
        <div className="relative bg-gradient-to-b from-yellow-50 to-yellow-100 p-8 rounded-lg shadow-2xl border border-yellow-200 w-80">
          {/* Card Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-serif text-gray-800 tracking-wider">
              GATE OF
            </h1>
            <h1 className="text-3xl font-serif text-gray-800 tracking-wider">
              MEMORY
            </h1>
          </div>

          {/* Memorial Portrait with Bridge Background */}
          <div className="relative mb-6 mx-auto w-64 h-40 rounded-lg overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${memorialBridge})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-100/20 to-transparent" />
            </div>
            
            {/* Portrait with ethereal glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-radial from-yellow-200/60 via-yellow-100/40 to-transparent rounded-full blur-xl scale-150" />
                <img 
                  src={memorialPortrait}
                  alt="Memorial Portrait"
                  className="relative w-24 h-24 rounded-full object-cover border-2 border-yellow-200/50 shadow-lg"
                />
              </div>
            </div>
          </div>

          {/* Memorial Text */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-serif text-gray-800 mb-2">
              In Loving Memory
            </h2>
            <h2 className="text-xl font-serif text-gray-800 mb-4">
              of Naomi N.
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Scan with your<br />
              camera to view<br />
              the hologram
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <img 
              src={qrCode}
              alt="QR Code"
              className="w-16 h-16"
            />
          </div>
        </div>

        {/* Smartphone Display */}
        <div className="relative">
          <div className="bg-black rounded-3xl p-2 shadow-2xl w-64 h-[500px]">
            <div className="bg-black rounded-2xl overflow-hidden h-full relative">
              {/* Phone Screen Content */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${memorialBridge})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/60" />
              </div>

              {/* Speech Bubble */}
              <div className="absolute top-12 left-6 right-6">
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-400">
                  <p className="text-white text-sm leading-relaxed">
                    Scan the card<br />
                    for a holographic<br />
                    memorial
                  </p>
                  {/* Speech bubble tail */}
                  <div className="absolute bottom-0 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-400 translate-y-2" />
                </div>
              </div>

              {/* Holographic Portrait */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-radial from-yellow-200/60 via-yellow-100/40 to-transparent rounded-full blur-xl scale-150" />
                  <img 
                    src={memorialPortrait}
                    alt="Holographic Memorial"
                    className="relative w-20 h-20 rounded-full object-cover border-2 border-yellow-200/50 shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorialCard;