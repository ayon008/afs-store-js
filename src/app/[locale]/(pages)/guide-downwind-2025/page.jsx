"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

/* ---------------- Breadcrumbs ---------------- */

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999]">
        <Link href="/" className="inline">
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-black">Downwind guide</span>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function Clinique() {
  const articleRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tocOpen, setTocOpen] = useState(false);

  /* -------- Generate IDs & collect H2 -------- */
  useEffect(() => {
    if (!articleRef.current) return;

    const h2Elements = Array.from(articleRef.current.querySelectorAll("h2"));

    const items = h2Elements.map((h2, index) => {
      const id =
        h2.id ||
        `${h2.textContent
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "")}-${index}`;
      h2.id = id;
      h2.style.scrollMarginTop = "160px";
      return { id, title: h2.textContent || "" };
    });

    setHeadings(items);

    if (items.length > 0) {
      setActiveId(items[0].id); // First item active by default
    }
  }, []);

  /* -------- Active section observer -------- */
  useEffect(() => {
    if (!headings.length) return;

    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      let currentId = null;

      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const elTop = el.getBoundingClientRect().bottom;

          // Activate when top of h2 enters the viewport (bottom to top)
          if (elTop <= viewportHeight) {
            currentId = headings[i].id;
          }
        }
      }

      if (currentId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize on load

    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  /* -------- Scroll handler -------- */
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTocOpen(false);
  };

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <div
        className="global-margin"
        style={{
          backgroundImage:
            "url('https://afs-foiling.com/fr/wp-content/uploads/2024/02/bg_image-4.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col gap-[20px] justify-between global-padding pt-5 pb-20 min-h-[calc(100vh-120px)] max-w-[1920px] mx-auto">
          <BreadCums />

          <div className="flex gap-[20px] justify-between flex-wrap flex-col md:flex-row">
            <h1 className="global-h1 text-white flex-1">
              All you need to know about downwind: endless gliding moments
            </h1>
            <p className="text-white font-semibold">#DOWNWIND</p>
          </div>
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="flex gap-10 global-padding mx-auto max-w-[1920px] items-start flex-col sm:flex-row global-margin">
        {/* -------- TOC -------- */}
        <aside className="w-full md:w-[260px] md:sticky md:top-[160px] font-bold uppercase leading-[120%]">
          <button
            className="md:hidden w-full border-b py-3 flex justify-between text-[18px]"
            onClick={() => setTocOpen((prev) => !prev)}
          >
            Table of contents
            <span>{tocOpen ? "−" : "+"}</span>
          </button>

          <div
            className={`${
              tocOpen ? "block" : "hidden"
            } md:block mt-4 space-y-[18px] md:space-y-[28px]`}
          >
            {headings.map((item) => {
              const isActive = activeId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`cursor-pointer transition-colors`}
                >
                  <span
                    className={`flex items-start gap-2 ${
                      isActive ? "text-black" : "text-gray-400 hover:text-black"
                    }`}
                  >
                    {isActive && (
                      <ArrowRight width={24} height={15} stroke-width={3} />
                    )}
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* -------- ARTICLE -------- */}
        <article
          ref={articleRef}
          className="flex-1 max-w-[790px] flex flex-col gap-[40px]"
        >
          <div className="flex flex-col gap-[14.4px]">
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] font-bold leading-[120%]">
              Downwind sailing is the practice of sailing from point A to point
              B in the direction of the wind. In other words, sailing on the
              open sea and downwind, using the swell, currents and wind at your
              back. You can do this with a wingfoil or SUP foil.
            </p>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Downwind sailing is not a recent phenomenon, but it has been
              revolutionized by the arrival of the foil. Combined with a wing,
              parafoil or paddle, the foil allows the rider to generate the
              propulsive force needed to take off and let the elements carry him
              or her along. During downwind, the sensation of gliding is
              amplified… It’s simply incredible!
            </p>
          </div>

          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/uPGeGuHwB6M"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">
              What are the ideal conditions for downwind sailing?
            </h2>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                For downwind Stand up paddle foiling, the ideal first experience
                is to have a fairly steady wind between 15 and 25 knots, blowing
                in the same direction as the swell.
              </strong>{" "}
              The latter should not be too tight to promote glide and speed.
              With more technique, practice and pumping mastery, you’ll then be
              able to go out in lighter wind conditions.
            </p>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">
              What equipment should you use for a downwind?
            </h2>
            <h3 className="text-[28px] text-[#111111] font-bold">The board</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                In SUP foil (with an oar and without the wing), opt for a stiff,
                long and narrow board, specially designed for downwind.
              </strong>{" "}
              Generally speaking, these boards measure between 7′ and 9′. This
              depends on the type of water you’re used to riding on. Their shape
              makes take-off quicker and easier than with a standard wingfoil
              board or a mid-length, which is a little less taut and wider. On
              the other hand, for a downwind wingfoil, these two types of boards
              are perfectly suited and even recommended.
            </p>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2024/02/image-21.png"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <h3 className="text-[28px] text-[#111111] font-bold">The foil</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                If you want to learn how to downwind with a SUP foil, it’s best
                to choose a front foil with a large surface area to support and
                promote take-off.
              </strong>{" "}
              And avoid fatigue too quickly. This is both the most important and
              the most technical part of this type of discipline. Then, once
              you’ve got the hang of it, you can concentrate on the glide – in
              other words, a fluid glide that allows you to accelerate, refine
              your trajectories and make nice curves over the water.
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              For beginners, we recommend a front wing between 1400 and 2000
              cm², depending on your size and the weather conditions. As you
              progress, and after you’ve completed several downwind runs, you’ll
              be able to move on to a more high-performance, glide-oriented foil
              with a higher aspect ratio. Like the Pure range from AFS, for
              example.
            </p>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2024/02/image-22.png"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm"
            />
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2024/02/image-23.png"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              For the foil mast, the recommended size is between 75 and 85 cm,
              which reduces drag in the water and optimizes take-off. For the
              fuselage, prefer a medium-length model, around 65cm, to ensure
              greater stability when you start out. The shorter the foil, the
              more responsive it will be, but the aim is to stay on the board as
              long as possible. Finally, the stab shouldn’t be too small either,
              to be comfortable in flight.
            </p>
          </div>
          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/LSqvVW_HlOQ?si=qpjHdorKh7QrCaIa"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">
              Basic SUP foil downwind techniques
            </h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Rowing technique
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                Efficient take-off requires practice! Start on flat or slightly
                choppy water, always rowing on the same side and trying to keep
                as straight as possible, in the same trajectory.
              </strong>{" "}
              This gives you more power to lift your board out of the water. On
              the other hand, position yourself slightly sideways, in surf mode,
              and row on the side of your toes. This helps you to better control
              the inclination, direction and trim of your board, and thus to
              catch the swell more easily. Finally, accompany your rowing
              strokes with pumping: your legs push up and down on the board
              rhythmically and evenly, without sudden movements. This will help
              you generate speed.
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              Choosing the right slope for SUP foil launch
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                In downwind, the choice of starting bump is crucial.
              </strong>{" "}
              It’s a small wave or micro-clap that’s straighter than the others.
              Not always easy to visualize when you’re just starting out. Bumps
              often appear as small series of waves or swell trains, with a more
              pronounced thrust than the marine environment around you. Although
              short-lived, this push is quite powerful and is accompanied by a
              suction effect followed by a “push” lasting 2 to 3 seconds. To
              take advantage of the power of this famous “bump” to reach the
              speed needed to take off, you need to row continuously and
              explosively during this suction effect.
            </p>
          </div>

          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/FPYktXAqdUI?si=1EXBMh_ZdV96uFhZ"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">Downwind safety tips</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Rowing technique
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                Safety is paramount in long-distance downwind sailing.
              </strong>{" "}
              Every rider should inform his family and friends of his outing
              (place and approximate time of departure and arrival + itinerary +
              number of people), and why not also notify the CROSS (Centre
              régional opérationnel de surveillance et de sauvetage). And don’t
              ever go out alone – at least two of you!
            </p>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF] mb-5">
              Safety equipment should not be neglected. It is highly recommended
              to take the following additional equipment:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  The VHF
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  It’s a marine radio that lets you communicate directly with
                  the shore or other people at sea.
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  The Sécumar belt
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  This belt includes a lifejacket containing a CO2 cartridge + a
                  distress flare.
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  Fluorescent Lycra
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  It makes it easier to see from afar.
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  The impact vest
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  It protects against knocks in the event of a fall, and helps
                  you float more easily when you fall.
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  The helmet
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  It’s undeniable protection for your head.
                </p>
              </div>

              <div className="flex flex-col bg-[#1F1F1F] flex-[100%] py-[30px] px-5 rounded-sm gap-5 justify-between">
                <h3 className="text-[22px] md:text-[28px] text-[#fff] font-bold uppercase">
                  Water
                </h3>
                <p className="text-16px leading-[120%] text-[#FFFFFFCC] mb-5">
                  Because it’s important to stay well hydrated when you’re
                  sailing for a long time.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full aspect-video rounded-sm overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/bb1Xt7hJPz0?si=8tv6DfnHPtTZ25P0"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">
              Turn your wingfoil session into a rowing downwind!
            </h2>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                To make a downwind accessible and start it, of course you have
                to go upwind!
              </strong>{" "}
              And it’s clear that using your wing is much less tiring than
              rowing. So why not strap your paddle to your wing handles and don
              a waterproof backpack? Once you’re far enough out to sea, you can
              stow your wing in the bag, unhook the paddle and do the SUP foil
              downwind! And if you’ve overestimated yourself because it’s your
              first time, there’s always the option of freeflying back down. A
              word of advice: use a relatively large board (minimum 85-90
              liters, so you can stand up comfortably on the water).
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
