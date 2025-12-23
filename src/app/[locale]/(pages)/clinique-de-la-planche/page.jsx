import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-black">Clinique de la planche</span>
      </div>
    </div>
  );
};

export default function Clinique() {
  return (
    <>
      {/* HERO */}
      <div className="global-margin flex min-h-[calc(100vh-120px)] flex-col gap-[20px] lg:flex-row max-w-[1920px] mx-auto">
        {/* LEFT */}
        <div className="global-padding flex flex-1 flex-col justify-between gap-[40px] pt-[20px]">
          <div className="flex flex-col gap-[20px]">
            <BreadCums />

            <div className="flex flex-col gap-[20px]">
              <h1 className="global-h1">
                AFS products are available in the{" "}
                <span className="text-[#1e98ff]">Clinique de la planche</span>{" "}
                store.
              </h1>

              <p className="max-w-[360px] text-[18px] font-semibold text-[#111111B2] max-[1024px]:text-[16px]">
                One of France’s oldest marine equipment stores with AFS
                equipment
              </p>
            </div>
          </div>

          {/* HERO FOOTER */}
          <div className="flex flex-col gap-[20px] border-b border-black/40 pb-[20px] leading-[1.2] md:flex-row md:flex-wrap md:justify-between">
            <div className="flex flex-col gap-[4px]">
              <h4 className="font-bold text-[#111111]">Store</h4>
              <a
                href="https://www.cliniquedelaplanche.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[4px] font-semibold text-[#111111B2]"
              >
                Plan d’accès à la boutique
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M11 1L1 11M11 1H2M11 1V10"
                    stroke="#111111B2"
                    strokeWidth="2"
                  />
                </svg>
              </a>
            </div>

            <div className="flex flex-col gap-[4px]">
              <h4 className="font-bold text-[#111111]">Expert AFS</h4>
              <p className="font-semibold text-[#111111B2]">Pierre</p>
            </div>

            <div className="flex flex-col gap-[4px] md:basis-[210px] md:shrink-0">
              <h4 className="font-bold text-[#111111]">Address</h4>
              <p className="font-semibold text-[#111111B2]">
                11 rue de la dives, 14000 Caen, France
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT MAP */}
        <div className="relative min-h-[400px] w-full flex-1 overflow-hidden">
          <iframe
            src="https://maps.google.com/maps?q=Clinique%20De%20La%20Planche%2C%20Surf%2C%20Windsurf%2C%20Sup%20Et%20Wing%20Foil.&t=m&z=19&output=embed&iwloc=near"
            className="h-full min-h-[400px] w-full border-0"
            allowFullScreen
            loading="lazy"
          />

          <a
            href="https://maps.app.goo.gl/HE4KWjKLQ7fxziuQ6"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-[20px] left-[20px] z-[2] flex items-center justify-center gap-[4px] rounded-[4px] bg-[#1f1f1f] p-[12px] text-[14px] font-bold uppercase text-white"
          >
            Store access map
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M11 1L1 11M11 1H2M11 1V10"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* HISTOIRE */}
      <div className="global-margin global-padding flex flex-col gap-[40px] max-w-[1920px] mx-auto">
        <h2 className="global-h2">History</h2>

        <div className="flex flex-col gap-[40px] md:flex-row">
          <div className="flex basis-[25%] flex-col space-y-[12px] pt-[120px] max-[1024px]:pt-0">
            <img
              loading="lazy"
              decoding="async"
              src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-4-3.png"
              className="w-full"
            />
            <span>Store in Caen</span>
          </div>

          <div className="flex-1">
            <p className="max-w-[1024px] pb-[40px] text-[18px] font-semibold leading-[130%] text-[#111]/75">
              Established on May 2, 1982, the store sold and repaired boats. It
              was called the “Clinique du Bateau”. Gradually, they entered the
              windsurfing market. The practice exploded, and they renamed the
              store “Clinique du bateau et de la planche”.
            </p>

            <h2 className="mb-[40px] text-[32px] font-semibold uppercase leading-[105%] text-[#111]/70">
              <span className="text-[#1D98FF]">"</span>Backthen, the "Clinique"
              was a repair shop in a small garden. With the market flourishing,
              we bought a house to store the products, as well as a store 200m
              away, enabling us to officially launch the business. Later, the
              house also became a store.
              <span className="text-[#1D98FF]">"</span>
            </h2>

            <div className="flex flex-col gap-[20px] max-[1024px]:flex-col lg:flex-row lg:justify-between">
              <div className="max-w-[385px] space-y-[40px] pb-[20px] text-[18px] font-medium leading-[130%] text-[#111]/75">
                <p className="text-[#111111B2] text-4 leading-[1.3] font-semibold">
                  The relationship with Foil&Co began with AHD Boards and
                  continued with AFS Foils. The clinic wanted to offer carbon
                  products that were affordable and made in France.
                </p>
                <p className="text-[#111111B2] text-4 leading-[1.3] font-semibold">
                  La Clinique de la Planche is one of France’s oldest nautical
                  equipment stores, still in business today.
                </p>
              </div>

              <div className="flex basis-[50%] flex-col space-y-[12px]">
                <img
                  loading="lazy"
                  decoding="async"
                  src="https://afs-foiling.com/fr/wp-content/uploads/2024/01/image-1-7.png"
                  className="w-full"
                />
                <span>Equipe Clinique de la planche</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
