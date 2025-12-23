"use client";

import Link from "next/link";
import Image from "next/image";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-black">Made in france</span>
      </div>
    </div>
  );
};

export default function madeFr() {
  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />

          <h1 className="global-h1 text-center py-[80px]">
            Foil & Co, a fundamentally responsible company
          </h1>
          <div className="flex flex-col gap-[20] md:gap-[28px] global-margin">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/DSC07778.png"
              alt="AFS Foiling visual"
              width={1200}
              height={800}
              className="max-w-[960px] mx-auto h-auto mb-5 w-[100%]"
            />
            <p className="text-[20px] font-bold text-center max-w-[780px] mx-auto leading-[1.3]">
              Foil and Co is a company specialized in the manufacture and sale
              of equipment for wing foil, surf foil, sup foil, windfoil. We are
              experts in the design and manufacture of composite products.
            </p>

            <p className="text-[20px] font-bold text-center max-w-[780px] mx-auto leading-[1.3]">
              It is through our brand AFS, specialized in the field of foils,
              that we offer 100% carbon foils, manufactured from A to Z in our
              factory in Pencran, France.
            </p>
            <p className="text-[20px] font-bold text-center max-w-[780px] mx-auto leading-[1.3]">
              Sustainable development is one of the founding pillars of Foil and
              Co: our ambition was to succeed in reindustrializing in France, by
              gathering and controlling our production from A to Z: from the
              design office to production and shipping. This has allowed us to
              limit our impact on the environment by creating short circuits,
              and to be in constant improvement on the performance of our
              products, all by using sustainable materials.
            </p>
          </div>
        </div>
        {/*content */}
        <div className="grid grid-cols-1 min-[460px]:grid-cols-2 md:grid-cols-3 gap-4 global-margin max-w-[1080px] mx-auto">
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/carbon-nanotube.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              Choice of carbon
            </h3>
            <p className="text-white text-[16px]">
              We have privileged the use of a durable material, resistant to
              external aggressions and capable of being reworked and repaired,
              to maximize the life of our foils.
            </p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/circuit.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">Short circuit</h3>
            <p className="text-white text-[16px]">
              We have established our workshops in France to considerably reduce
              the carbon footprint of our products and to control their quality
              and performance on an ongoing basis.
            </p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/factory.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              Responsible production
            </h3>
            <p className="text-white text-[16px]">
              At Foil & Co there is no loss of raw material. All carbon off-cuts
              are reused to be reintegrated into the production cycle.
            </p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/Trace-1946.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              Low tech approach
            </h3>
            <p className="text-white text-[16px]">
              We manufacture some of our own production machines.
            </p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/money-structure.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">
              Circular economy
            </h3>
            <p className="text-white text-[16px]">
              Since this year we propose a buy-back - reconditioning - resale
              offer for our foils. The creation and mastery of a fleet of
              second-hand equipment allows us to significantly extend the life
              of our foils.
            </p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/path7.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">The human</h3>
            <p className="text-white text-[16px]">
              The well-being of our employees is our top priority. In
              particular, we use prepreg carbon because it is much less volatile
              than conventional resins.
            </p>
          </span>
          <span className="block bg-[#333] rounded-sm py-5 px-5 space-y-3">
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/Trace-1947.png"
              alt="Carbon nanotube"
              width={800}
              height={600}
              className="w-10 h-10"
            />
            <h3 className="text-white text-[20px] font-bold">Living space</h3>
            <p className="text-white text-[16px]">
              Our activity takes place in an eco-designed building, allowing us
              to be 90% autonomous in energy.
            </p>
          </span>
        </div>
        {/*content */}
        <div className="global-margin flex flex-col gap-10 max-w-[1080px] mx-auto">
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              The choice of carbon: an asset for the durability of foils
            </p>
            <div className="flex flex-col gap-5">
              <p>
                From the start, our ambition was to succeed in designing
                products that would last over time. Today we are able to say
                that our foils have an average life span of 10 years. As a
                comparison, the average life of an aluminum foil is 2 years
              </p>
              <p>
                In addition to its competitive advantages, such as its
                lightness, which make it the most efficient material for
                designing a foil, carbon is above all extremely strong and has
                an impressive rigidity.
              </p>
              <p>
                This material is ideal for use in the nautical field. It is also
                very resistant to external aggressions (salt, sea, corrosion)
                and can be repaired and reconditioned very well, unlike
                aluminum.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              Working in short circuits: the choice of made in France.
            </p>
            <div className="flex flex-col gap-5">
              <p>
                The choice of a “made in France” production has been a driving
                force in the construction of the company. At first glance, we
                often think of the constraints that this entails for a company:
                high production costs, need for employees, management, storage …
                etc..
              </p>
              <p>
                But we decided to take it as an opportunity. Beyond the fact
                that local production considerably reduces the carbon footprint
                of our products and that we are proud to create jobs and
                know-how, there is another major advantage: producing in France
                allows us to reach a higher level of requirement concerning the
                quality of our products.
              </p>
              <p>
                Indeed, our product lines are constantly tested (by our team
                members, our team of riders, by our customers). This proximity
                allows us to constantly improve our offer in a very short time.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              Implement a responsible production cycle
            </p>
            <div className="flex flex-col gap-5">
              <p>
                Designing responsible products also means taking into account
                their manufacturing and production process.
              </p>
              <p>
                At foil and Co our most successful example is the reuse of
                prepreg carbon scrap. They are recovered to form the plates,
                i.e. the base of the foils. Therefore, there is no more than a
                3% loss on raw materials during the production cycle.
              </p>
              <p>
                Indeed, our product lines are constantly tested (by our team
                members, our team of riders, by our customers). This proximity
                allows us to constantly improve our offer in a very short time.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              Low tech: Lean and know-how.
            </p>
            <div className="flex flex-col gap-5">
              <p>
                In our approach, we place the employee at the heart of the
                company’s processes to develop our internal know-how and to be
                as autonomous as possible. We have managed to design some of the
                machines used in the manufacture of the foils ourselves, such as
                the presses, which allows us to be more autonomous.
              </p>
              <p>
                We also promote existing local know-how that we develop through
                the training of new employees, in particular by encouraging
                apprenticeship and work-study contracts.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              Putting people at the heart of our operations
            </p>
            <div className="flex flex-col gap-5">
              <p>
                The well-being of our employees remains our main concern. In
                particular, we have closely studied the physical working
                conditions of the team members on the production line and have
                optimized and arranged each workstation in order to limit bad
                postures and repetitive gestures.
              </p>
              <p>
                We make the most of their know-how in the various core
                businesses within the company.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <p className="text-[28px] font-bold min-w-[35%]">
              Living in space responsibly.
            </p>
            <div className="flex flex-col gap-5">
              <p>
                We settled in Pencran, in a rural area, in order to promote the
                development of the local employment basin, rather than in a
                large metropolis where the industrial zones are already
                saturated. Our workshops are installed in an eco-designed
                building, we are 90% self-sufficient in energy thanks to the
                installation of solar panels and we encourage carpooling between
                employees.
              </p>
              <p>
                For us, it is all these commitments that will enable us to build
                tomorrow’s business world: committed to the environment and
                responsible.
              </p>
            </div>
          </div>
          <div>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/C0073.MP4.02_16-1.png"
              alt="AFS Foiling visual"
              width={1200}
              height={800}
              className="max-w-[960px] mx-auto h-auto w-[100%]"
            />
            <h2 className="global-h2 text-center pt-[80px]">
              Foil & Co has been in existence for 6 years now. We have always
              worked in the direction of ecology and sustainable development, in
              a serious and committed way.
            </h2>
          </div>
        </div>
      </div>
    </>
  );
}
