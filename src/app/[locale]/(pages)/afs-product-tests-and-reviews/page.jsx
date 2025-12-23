import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-5 uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-black">AFS product tests and reviews</span>
      </div>
    </div>
  );
};

export default function testReviews() {
  return (
    <>
      {/* HERO */}
      <div className="global-margin flex min-h-[calc(100vh-120px)] flex-col gap-5 lg:flex-row max-w-[1920px] mx-auto">
        {/* LEFT */}
        <div className="global-padding flex flex-1 flex-col justify-between gap-[40px] pt-5">
          <div className="flex flex-col gap-5">
            <BreadCums />

            <div className="flex flex-col gap-4 justify-center items-center mt-[160px]">
              <h1 className="global-h1 text-center">Tests and reviews</h1>
              <p className="max-w-[360px] text-[18px] font-semibold text-[#111111B2] max-[1024px]:text-[16px] text-center">
                Find out what the trade press has to say about our products
              </p>
            </div>
          </div>

          {/* filter FOOTER */}
          <div>
            <u>
              <li>All</li>
              <li>Foiling</li>
            </u>
          </div>
        </div>
      </div>

      <div>
        <div>
          <p>items </p>
        </div>
        <div>
          <p>items </p>
        </div>
        <div>
          <p>items </p>
        </div>
      </div>
    </>
  );
}
