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
        <span className="text-black">Wind Foil 2023 Guide</span>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */

export default function Wind() {
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
            "url('https://afs-foiling.com/wp-content/uploads/2024/09/AFS_Wind_Aile_S.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col gap-[20px] justify-between global-padding pt-5 pb-20 min-h-[calc(100vh-120px)] max-w-[1920px] mx-auto">
          <BreadCums />

          <div className="flex gap-[20px] justify-between flex-wrap flex-col md:flex-row">
            <h1 className="global-h1 text-white flex-1">
              Windfoil: a complete guide to getting started and progressing in
              the discipline
            </h1>
            <p className="text-white font-semibold">
              #Windfoil
              <br />
              March 27, 2023 <br />
              Antonin
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="flex gap-30 global-padding mx-auto max-w-[1920px] items-start flex-col sm:flex-row global-margin">
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
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%]">
              If you already practice a water sport like windsurfing, wing
              foiling, kite foiling or perhaps surf foiling, you’ve probably
              heard of <strong>wind foiling</strong>: a variant of windsurfing
              where the main objective is to glide over the water thanks to a
              foil, offering a sensation of flight.{" "}
              <a
                href="https://staging.afs-foiling.com/categorie-produit/foiling/windfoil/"
                className="text-[#1D98FF]"
              >
                Windfoil
              </a>{" "}
              is a less physical discipline than windsurfing, provided, of
              course, that you have mastered it to some degree.{" "}
            </p>

            <Image
              src="https://afs-foiling.com/wp-content/uploads/2021/03/nahskwell-fluid-stand-up-paddle-cruising.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">What's in it for me?</h2>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Firstly, stand-up paddling is a super all-round water sport.
              Generally speaking, it not only stimulates your cardio, but also
              the muscles of your upper body, legs and abdominal muscles. It’s
              also the perfect way to improve your balance!
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Secondly, the sup is very versatile. All-around paddling for
              adventure or pleasure, competitive racing, family use, surfing and
              SUP foiling: you can do it all with this discipline, in all
              conditions, and that’s what we love about it. More than just
              kayaking and canoeing, you can take advantage of all the best the
              sea and whitewater have to offer.
            </p>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">How to choose the right paddle?</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Depending on my level of paddling
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              If you’re a beginner and you’ve never really taken part in water
              sports, the first thing to consider is not so much what you do,
              but your level. It’s important to select an easy board to discover
              this sport. It would be a shame to give up on stand-up paddling as
              soon as you’ve made your first runs with equipment that’s too
              small. Width is particularly important, as it determines your
              stability.
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              For intermediate riders, or those who already practice other board
              sports such as kitesurfing or windsurfing, you can already start
              to orientate yourself according to your chosen sport (surfing,
              cruising…), but the best thing is to go for boards that offer a
              minimum of versatility and comfort, so as not to get into
              difficulty.
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              For SUP experts, practice defines your needs, and we’ll explain in
              detail which board is perfect for each activity, so you can get
              the most out of it!
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              What size and shape for my stand-up paddle?
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Generally speaking, these are the parameters we’ll use to define
              the SUP’s shape. Note that for the same level, the bigger you are,
              the more width and length you’ll need to make life easier.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">The length</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              GThe longer your paddle, the more it “glides”. In other words, an
              oar stroke is more efficient. Length also reduces the “row”
              phenomenon. If your sup is very short, it will tend to swivel to
              the right if you paddle to the left. It’s great in surfing to be
              agile on the wave, but not so great in competition or over long
              distances when you want to change sides as little as possible…
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">The width</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              It provides comfort and stability. On the other hand, it will make
              you slower and require more effort to maintain speed. If you’re
              just starting out, it’s very important to have a consistent width
              so as not to get into trouble.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">Thickness</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              More important for inflatable paddles, which must have spread
              skins to guarantee minimum rigidity. As you increase, you reduce
              the feeling of gliding as you move further away from the water. A
              greater thickness also reduces balance, as you find yourself
              tossed about like a cork on the water past the 5-inch mark.
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">Nose shape</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Pointed noses are ideal for racing or for distance work, as they
              can easily split the wave. In surfing or for beginners, noses
              become rounder, losing glide but gaining grip on waves. On rigid
              paddles, you can also work on the shape of the bow, hull and deck
              to make them more resistant to chop, for example.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              The shape of the tail
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              They come in a variety of forms, but to put it simply, the more
              the tail is pinched, the more you gain in manoeuvrability and lose
              in stability. The wider it is, the less manoeuvrable you are on
              the wave, but the better your start and the more stable you are.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Choice according to your practice
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Combined, these can be used to create sup shapes that are more or
              less suited to your level of practice. Here are the main shapes
              found on the market, and found in all the brands on sale.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Paddles for beginners
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              What you need is an intermediate length for versatility (in the
              9/11 foot range), a generous, round nose and tail, and above all,
              good width!
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Allround paddles
            </h3>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/nahskwell-fluid.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              It’s a compromise between the wave and the promenade. Relatively
              short, between 9 and 11 feet, it is often rather wide, with a
              round nose and a comfortable tail. Ideal if you’re just starting
              out, for family use or for an intermediate user who wants to do
              everything without getting in over your head.
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              Touring paddles
            </h3>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2022/07/nahskwell-fit-stand-up-paddle-cruising.jpeg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Longer than all-rounders, between 11 and 12 feet, with a more
              pointed nose, they often retain a little width. The longer length
              allows you to cover greater distances and row more efficiently,
              while keeping the shape affordable. They’re no longer relevant for
              waves, as they’re too long, but they’re still great at sea, even
              with a little chop. The larger models are ideal if you’re just
              starting out and don’t intend to surf with them. Note that there
              are even some for making doubles! These ranges are often available
              on rental sites, so don’t hesitate to consult our network of
              partners in France to find out more; the adventure may be worth
              the detour.
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">
              Paddles race
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Long, often 12’6″ or more, they are also (very) slender, with
              pointed noses. If their balance is precarious, they are speed
              machines, especially on flat spots and long distances. For
              experienced users only.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">
              Paddles for surfing
            </h3>
            <Image
              src="https://afs-foiling.com/wp-content/uploads/2023/02/nahskwell-sup-min-min.jpg"
              alt="Foiling downwind"
              width={800}
              height={600}
              className="rounded-sm mb-5"
            />
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              These are generally the shortest, under 10 feet, with a round
              nose. Very maneuverable, they have widths and tails specific to
              each model for different uses: a very pinched and thin tail for
              maximum agility to an almost rectangular tail for greater
              stability and power in soft waves.
            </p>
            <div className="compatibilite">
              <table>
                <tbody>
                  <tr>
                    <th>Practical walk</th>
                    <th>~ 50-60 KG</th>
                    <th>~ 70-80 KG</th>
                    <th>+ 90 KG</th>
                  </tr>
                  <tr>
                    <th>All round</th>
                    <td>Length 30′ to 31′ – Width 10′ to 11’6 “</td>
                    <td>Length 31′ to 32′ – Width 10′ to 11’6 ”</td>
                    <td>Length 32-36′ – Width 10’5 “ to 11’6 ”</td>
                  </tr>
                  <tr>
                    <th>Touring / exploring</th>
                    <td>Length 11’6 “ to 12’6 ” – Width 28′ to 30′</td>
                    <td>Length 12’6 “ to 14′ – Width 29′ to 32′</td>
                    <td>Length 12’6 ” to 14′ – Width 32′ to 34′</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="compatibilite">
              <table>
                <tbody>
                  <tr>
                    <th>Wave practice</th>
                    <th>~ 50-60 KG</th>
                    <th>~ 70-80 KG</th>
                    <th>+ 90 KG</th>
                  </tr>
                  <tr>
                    <th>Beginner</th>
                    <td>Length 8’5“ to 9′ Width 30” to 31″</td>
                    <td>Length 9′ to 10′ Width 31″ to 33″</td>
                    <td>Length 10′ to 11′ Width 32″ to 36″</td>
                  </tr>
                  <tr>
                    <th>Intermediate</th>
                    <td>
                      Same size – Minimum volume = your weight + 35 to 40 L
                    </td>
                    <td>
                      Same size – Minimum volume = your weight + 35 to 40 L
                    </td>
                    <td>
                      Same size – Minimum volume = your weight + 35 to 40 L
                    </td>
                  </tr>
                  <tr>
                    <th>Expert</th>
                    <td>
                      Largeur 25″ à 28″ Volume = votre poids à votre poids + 30
                      L
                    </td>
                    <td>
                      Largeur 26″ à 29″ Volume = votre poids à votre poids + 30
                      L
                    </td>
                    <td>
                      Largeur 28″ à 32″ Volume = votre poids à votre poids + 30
                      L
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h3 className="text-[28px] text-[#111111] font-bold mt-5">
              Paddles for foiling
            </h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              One discipline that is becoming increasingly popular is sup
              foiling. We’ve put together a{" "}
              <Link
                href="https://afs-foiling.com/fr/categorie-produit/foiling/sup-foil-foiling/"
                className="text-[#1d98ff] underline"
              >
                guide specifically for stand-up paddle foils
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">Essential SUP accessories</h2>
            <h3 className="text-[28px] text-[#111111] font-bold">The leash</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Safety first! As with most water sports, a leash is essential. It
              attaches to the rear of the tail, on the deck, and is worn on the
              ankle. We recommend the leash coiled – or telephone, which is the
              most common because it’s more comfortable.
            </p>

            <h3 className="text-[28px] text-[#111111] font-bold">The paddle</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              <strong className="text-[#111]">
                In downwind, the choice of starting bump is crucial.
              </strong>{" "}
              It’s your engine, and it’s essential that this equipment is good.
              There’s no point riding in a beautiful body if you have to push it
              by hand! So you’d better pay the price and enjoy the best of the
              discipline. Originally made of wood, today they’re either aluminum
              or composite (fiberglass and carbon). Aluminum requires
              maintenance, and although it’s very shock-resistant, it’s heavy
              and can’t be repaired if you bend the handle. This material is
              reserved for schools or very first prizes. We recommend either a
              mix of fiberglass and carbon, which can be good value for money,
              or 100% carbon if you use it regularly. And beware of removable
              oars: the more parts they have, the less rigid they are. If you’re
              planning to do some wave riding, downwind or distance work, go for
              a one-piece shaft, possibly with an adjustable olive, but avoid
              three-piece shafts.
            </p>
            <Link
              class="py-[10px] px-[14px] bg-[#1d98ff] text-white font-bold text-4 w-fit rounded-sm mx-auto mt-4"
              href="https://afs-foiling.com/fr/categorie-produit/stand-up-paddle/"
            >
              Discover our stand up paddles
            </Link>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">
              Buying an inflatable or rigid paddle?
            </h2>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              The advantages of hard surfaces in terms of feel, longevity and
              performance are absolutely indisputable, and very quickly outweigh
              the few disadvantages. If you want to use your equipment for
              something else, for very limited seasonal use, and if you want to
              prioritize quality (because inflatable prices often reach those of
              the hard stuff as soon as you want a minimum of performance, so
              it’s sometimes better to wait for the right promotion…), the
              inflatable may not be the solution, even if it’s common to read
              the opposite.
            </p>
          </div>

          <div className="flex flex-col gap-[14.4px]">
            <h2 className="global-h2 mb-5">Paddle spots</h2>

            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              The French spots are particularly varied, and it’s common for some
              of them to be cited as the best in the world!
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">Stroll</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              When it comes to hiking, as long as the conditions are right, the
              only choice is the landscape. From the Calanques in Marseille to
              the gorges of the Var, from the Dordogne to Lake Annecy and the
              Breton coastline, all you have to do is take your equipment with
              you to enjoy a whole new viewpoint in complete peace and quiet.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">Breed</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              A wide range of race formats are available throughout France. The
              Tawara (in the Tarn region of France) and the full Dordogne run
              alongside races in the Atlantic Ocean, such as the Beach Race in
              Crozon, or The Race in Guadeloupe.
            </p>
            <h3 className="text-[28px] text-[#111111] font-bold">Supsurf</h3>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              All the surf spots are waiting for you, from Brittany to the
              Basque Country. You can take off on the slightest ripple, so make
              the most of it.
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              Less common, downwind sailing is emerging in Brittany and the
              south of France, with foiling in full swing.
            </p>
            <p className="text-[clamp(1rem,0.6547rem+0.7203vw,1.375rem)] leading-[120%] text-[#111111BF]">
              We told you: the French landscape is as rich as the discipline
              itself, and it’s this freedom that we love!
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
