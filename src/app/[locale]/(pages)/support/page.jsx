import Head from "next/head";
import Image from "next/image";
import { useTranslations } from 'next-intl';


export default function AfsSupport({ locale }) {
  const t = useTranslations("support");

  return (
    <>
      <Head>
        <title>{t("title")}</title>

        {/* Basic SEO */}
        <meta
          name="description"
          content="AFS Support – Contact our team for any technical issues, guidance, or assistance with your AFS products."
        />
        <meta name="robots" content="index, follow" />
        <meta
          name="keywords"
          content="AFS, support, foiling, help, SAV, assistance"
        />

        {/* OG / Social Preview */}
        <meta property="og:title" content="AFS Support" />
        <meta
          property="og:description"
          content="Reach out to AFS Support for technical help, product assistance, and expert guidance."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://afs-foiling.com/fr/wp-content/uploads/2024/03/imgs.png"
        />

        {/* Twitter Preview */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AFS Support" />
        <meta
          name="twitter:description"
          content="Need help with your AFS gear? We're here for you."
        />
        <meta
          name="twitter:image"
          content="https://afs-foiling.com/fr/wp-content/uploads/2024/03/imgs.png"
        />
      </Head>
      <div className="bg-[#F0F0F0] min-h-[calc(100vh - 80px)] global-margin pb-[40px]">
        <Image
          src="https://afs-foiling.com/fr/wp-content/uploads/2024/03/imgs.png"
          alt="AFS Support"
          loading="lazy"
          className="w-full h-auto object-cover sm:h-auto min-h-[150px] mb-[80px] md:mb-[120px]"
          width={1920}
          height={120}
        />

        <div className="global-padding flex items-center justify-center flex-col gap-[60px] md:gap-[80px] flex-wrap">
          <h1 className="global-h1">{t("title")}</h1>
          <ul className="w-full flex flex-wrap gap-[10px] items-center justify-center">
            <li>
              <a
                href="#Repaper"
                className="iconBox flex flex-col items-center justify-center gap-[10px] px-[20px] pb-[20px] group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="77"
                  height="76"
                  viewBox="0 0 77 76"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    width="76"
                    height="76"
                    rx="4"
                    fill="#E6E6E6"
                  ></rect>
                  <path
                    d="M30.9998 35H35.4998V30.5L30.2498 25.25C31.9292 24.4479 33.816 24.1862 35.6504 24.5009C37.4847 24.8156 39.1764 25.6913 40.4924 27.0073C41.8085 28.3234 42.6841 30.015 42.9988 31.8494C43.3136 33.6837 43.0519 35.5705 42.2498 37.25L51.2498 46.25C51.8465 46.8467 52.1818 47.656 52.1818 48.5C52.1818 49.3439 51.8465 50.1532 51.2498 50.75C50.653 51.3467 49.8437 51.6819 48.9998 51.6819C48.1559 51.6819 47.3465 51.3467 46.7498 50.75L37.7498 41.75C36.0703 42.5521 34.1835 42.8138 32.3492 42.499C30.5148 42.1843 28.8232 41.3086 27.5071 39.9926C26.1911 38.6766 25.3154 36.9849 25.0007 35.1506C24.686 33.3162 24.9477 31.4294 25.7498 29.75L30.9998 35Z"
                    stroke="#111111"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <div className="flex items-center gap-[4px] justify-center flex-col">
                  <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                    {t("repair")}
                  </p>
                  <icon className="arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M7.50016 1.16669V12.25M7.50016 12.25L12.1668 7.75002M7.50016 12.25L2.8335 7.75002"
                        stroke="#1D98FF"
                        stroke-width="2"
                      ></path>
                    </svg>
                  </icon>
                </div>
              </a>
            </li>

            <li>
              <a
                href="#Notice"
                className="iconBox flex flex-col items-center justify-center gap-[10px] px-[20px] pb-[20px] group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="77"
                  height="76"
                  viewBox="0 0 77 76"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    width="76"
                    height="76"
                    rx="4"
                    fill="#E6E6E6"
                  ></rect>
                  <path
                    d="M38.5 30.5C38.5 28.9087 39.1321 27.3826 40.2574 26.2574C41.3826 25.1321 42.9087 24.5 44.5 24.5H53.5V47H43C41.8065 47 40.6619 47.4741 39.818 48.318C38.9741 49.1619 38.5 50.3065 38.5 51.5M38.5 30.5V51.5M38.5 30.5C38.5 28.9087 37.8679 27.3826 36.7426 26.2574C35.6174 25.1321 34.0913 24.5 32.5 24.5H23.5V47H34C35.1935 47 36.3381 47.4741 37.182 48.318C38.0259 49.1619 38.5 50.3065 38.5 51.5M44.5 35H46V41H47.5M46 30.5H46.015"
                    stroke="#111111"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <div className="flex items-center gap-[4px] justify-center flex-col">
                  <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                    {t("user-manual")}
                  </p>
                  <icon className="arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M7.50016 1.16669V12.25M7.50016 12.25L12.1668 7.75002M7.50016 12.25L2.8335 7.75002"
                        stroke="#1D98FF"
                        stroke-width="2"
                      ></path>
                    </svg>
                  </icon>
                </div>
              </a>
            </li>

            <li>
              <a
                href="#Pieces"
                className="iconBox flex flex-col items-center justify-center gap-[10px] px-[20px] pb-[20px] group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="77"
                  height="76"
                  viewBox="0 0 77 76"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    width="76"
                    height="76"
                    rx="4"
                    fill="#E6E6E6"
                  ></rect>
                  <path
                    d="M31.7413 51.848C29.8051 49.0307 28 44.0782 28 38.7826C28 33.4871 29.8051 28.5345 31.7413 25.7172C33.2378 23.5397 35.732 25.2333 35.4826 27.1689C35.1085 30.0724 34.7344 36.6051 35.4826 38.7826C34.7344 40.9602 35.1085 47.4929 35.4826 50.3963C35.732 52.3319 33.2378 54.0256 31.7413 51.848Z"
                    stroke="#111111"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M41.5 45.9826V34.087V30.9565V46.6087"
                    stroke="#111111"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M49.9137 46.6087C49.9137 46.6087 48.7501 45.4883 48.2476 44.5895C47.1448 42.6171 47.588 41.0663 47.588 38.7827C47.588 36.4991 47.1449 34.9484 48.2476 32.9759C48.7501 32.077 49.9137 30.9565 49.9137 30.9565"
                    stroke="#111111"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <div className="flex items-center gap-[4px] justify-center flex-col">
                  <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                    {t("parts")}
                  </p>
                  <icon className="arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M7.50016 1.16669V12.25M7.50016 12.25L12.1668 7.75002M7.50016 12.25L2.8335 7.75002"
                        stroke="#1D98FF"
                        stroke-width="2"
                      ></path>
                    </svg>
                  </icon>
                </div>
              </a>
            </li>

            <li>
              <a
                href="#Reprise"
                className="iconBox flex flex-col items-center justify-center gap-[10px] px-[20px] pb-[20px] group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="77"
                  height="76"
                  viewBox="0 0 77 76"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    width="76"
                    height="76"
                    rx="4"
                    fill="#E6E6E6"
                  ></rect>
                  <path
                    d="M38.2665 35.8428C36.9505 35.4298 33.0026 35.6363 31.248 35.8428C30.0783 35.9804 29.0547 34.6038 30.3707 33.7779C32.0733 32.7093 35.0662 31.713 38.2665 31.713C41.4667 31.713 44.4597 32.7093 46.1623 33.7779C47.4782 34.6038 46.4547 35.9804 45.285 35.8428C43.5303 35.6363 39.5824 35.4298 38.2665 35.8428ZM38.2665 35.8428V43.5777M38.2665 43.5777C38.2665 43.5777 35.9592 43.462 34.7572 44.1023C33.9139 44.5517 33.1586 44.9192 33.1586 44.9192M38.2665 43.5777C38.2665 43.5777 40.5737 43.462 41.7757 44.1023C42.6191 44.5517 43.3744 44.9192 43.3744 44.9192M24.6489 40.8024C24.2575 37.6952 24.8637 34.5427 26.3741 31.8304C27.8845 29.1181 30.2153 26.9966 33.0075 25.7926C35.7996 24.5886 38.8983 24.3689 41.826 25.1674C44.7538 25.9659 47.3482 27.7383 49.2098 30.2115C49.2098 30.2115 50.5004 32.1099 51.0362 33.4737C51.52 34.7053 51.8841 36.7629 51.8841 36.7629C52.2755 39.87 51.6693 43.0226 50.1589 45.7349C48.6485 48.4472 46.3177 50.5687 43.5255 51.7727C40.7334 52.9767 37.6348 53.1964 34.707 52.3979C31.7793 51.5993 29.1848 49.827 27.3233 47.3537M21.25 37.2174L23.9116 41.2426L25.3862 40.3622L28.0507 38.7562"
                    stroke="#111111"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <div className="flex items-center gap-[4px] justify-center flex-col">
                  <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                    {t("equipement")}
                  </p>
                  <icon className="arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M7.50016 1.16669V12.25M7.50016 12.25L12.1668 7.75002M7.50016 12.25L2.8335 7.75002"
                        stroke="#1D98FF"
                        stroke-width="2"
                      ></path>
                    </svg>
                  </icon>
                </div>
              </a>
            </li>

            <li>
              <a
                href="#FAQ"
                className="iconBox flex flex-col items-center justify-center gap-[10px] px-[20px] pb-[20px] group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="77"
                  height="76"
                  viewBox="0 0 77 76"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    width="76"
                    height="76"
                    rx="4"
                    fill="#E6E6E6"
                  ></rect>
                  <path
                    d="M38.4999 45.5V45.515M38.4999 40.25C38.4723 39.763 38.6036 39.2803 38.8742 38.8745C39.1447 38.4687 39.5398 38.1618 39.9999 38C40.5637 37.7844 41.0698 37.4408 41.4782 36.9964C41.8867 36.552 42.1865 36.0188 42.3539 35.4388C42.5213 34.8589 42.5518 34.248 42.443 33.6543C42.3342 33.0605 42.089 32.5001 41.7269 32.0172C41.3647 31.5343 40.8953 31.1421 40.3558 30.8714C39.8163 30.6007 39.2213 30.4589 38.6177 30.4573C38.014 30.4556 37.4183 30.594 36.8772 30.8617C36.3362 31.1294 35.8647 31.5191 35.4999 32M35.4999 32.0172C35.4999 32.5963 35.4999 33.5 35.4999 33.5M52.1177 38C52.1177 45.4558 46.0735 51.5 38.6177 51.5C31.1618 51.5 25.1177 45.4558 25.1177 38C25.1177 30.5442 31.1618 24.5 38.6177 24.5C46.0735 24.5 52.1177 30.5442 52.1177 38Z"
                    stroke="#111111"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <div className="flex items-center gap-[4px] justify-center flex-col">
                  <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                    FAQ
                  </p>
                  <icon className="arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M7.50016 1.16669V12.25M7.50016 12.25L12.1668 7.75002M7.50016 12.25L2.8335 7.75002"
                        stroke="#1D98FF"
                        stroke-width="2"
                      ></path>
                    </svg>
                  </icon>
                </div>
              </a>
            </li>

            <li>
              <a
                href="/demande-sav/"
                className="iconBox flex flex-col items-center justify-center gap-[10px] px-[20px] pb-[20px] group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="77"
                  height="76"
                  viewBox="0 0 77 76"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    width="76"
                    height="76"
                    rx="4"
                    fill="#E6E6E6"
                  ></rect>
                  <path
                    d="M26.5 42.5V45.5C26.5 47.1569 27.8431 48.5 29.5 48.5C31.1569 48.5 32.5 47.1569 32.5 45.5V42.5C32.5 40.8431 31.1569 39.5 29.5 39.5C27.8431 39.5 26.5 40.8431 26.5 42.5ZM26.5 42.5V38C26.5 34.8174 27.7643 31.7652 30.0147 29.5147C32.2652 27.2643 35.3174 26 38.5 26C41.6826 26 44.7348 27.2643 46.9853 29.5147C49.2357 31.7652 50.5 34.8174 50.5 38V42.5M50.5 42.5C50.5 40.8431 49.1569 39.5 47.5 39.5C45.8431 39.5 44.5 40.8431 44.5 42.5V45.5C44.5 47.1569 45.8431 48.5 47.5 48.5M50.5 42.5V45.5C50.5 47.1569 49.1569 48.5 47.5 48.5M47.5 48.5C47.5 49.6935 46.5518 50.8381 44.864 51.682C43.1761 52.5259 40.8869 53 38.5 53"
                    stroke="#111111"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <div className="flex items-center gap-[4px] justify-center flex-col">
                  <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                    {t("service-req")}
                  </p>
                  <icon className="arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="14"
                      viewBox="0 0 15 14"
                      fill="none"
                    >
                      <path
                        d="M7.50016 1.16669V12.25M7.50016 12.25L12.1668 7.75002M7.50016 12.25L2.8335 7.75002"
                        stroke="#1D98FF"
                        stroke-width="2"
                      ></path>
                    </svg>
                  </icon>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        id="Repaper"
        className="flex flex-col gap-[80px] justify-center items-center global-margin global-padding"
      >
        <div className="flex flex-col gap-[20px] max-w-[680px]">
          <h2 className="global-h2 text-center">{t("repair-my")}</h2>
          <p className="global-p text-center">
            {t("repair-here")}{" "}
            <strong>
              {t("these")}
            </strong>
          </p>
        </div>

        <div className="flex gap-[20px] max-w-[1600px] w-[100%] flex-col sm:flex-row text-center">
          <div className="relative w-full sm:w-1/2 min-h-[clamp(30rem,26.0135rem+5.4054vw,32.5rem)] rounded p-[20px] md:p-[40px] overflow-hidden bg-[#f7f7f7]">
            {/* Blurred background image */}
            <div
              className="absolute inset-0 z-0 blur-xs"
              style={{
                backgroundImage:
                  "url('https://afs-foiling.com/fr/wp-content/uploads/2024/03/afs-diamond-UL-2-1.png')",
                backgroundPosition: "bottom",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
            ></div>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/05 z-0"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-[10px] justify-top items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M8.16666 11.6667H11.6667V8.16666L7.58333 4.08333C8.88956 3.45948 10.3571 3.25593 11.7838 3.50072C13.2105 3.7455 14.5262 4.42658 15.5498 5.45016C16.5734 6.47374 17.2545 7.78948 17.4993 9.21619C17.7441 10.6429 17.5405 12.1104 16.9167 13.4167L23.9167 20.4167C24.3808 20.8808 24.6415 21.5103 24.6415 22.1667C24.6415 22.823 24.3808 23.4525 23.9167 23.9167C23.4525 24.3808 22.823 24.6415 22.1667 24.6415C21.5103 24.6415 20.8808 24.3808 20.4167 23.9167L13.4167 16.9167C12.1104 17.5405 10.6429 17.7441 9.21619 17.4993C7.78948 17.2545 6.47374 16.5734 5.45016 15.5498C4.42658 14.5262 3.7455 13.2105 3.50072 11.7838C3.25593 10.3571 3.45948 8.88956 4.08333 7.58333L8.16666 11.6667Z"
                  stroke="#666666"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              <h2 className="global-h2">Wing</h2>
              <p className="text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)]">
                {t("contact")}
              </p>
              <ul>
                <li>
                  <a
                    href="https://www.jaicassemavoile.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-blue font-semibold"
                  >
                    {t("i-broke")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://leboudinfrancais.fr/fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-blue font-semibold"
                  >
                    Le boudin français
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.couturedelacote.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-blue font-semibold"
                  >
                    Couture de la Côte
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.veloce.fr/reparation-aile-kitesurf-wing.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="global-blue font-semibold"
                  >
                    Véloce Parachutisme
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative w-full sm:w-1/2 min-h-[clamp(30rem,26.0135rem+5.4054vw,32.5rem)] rounded p-[20px] md:p-[40px] overflow-hidden bg-[#111] text-[#fff]">
            {/* Blurred background image */}
            <div
              className="absolute inset-0 z-0 blur-xs"
              style={{
                backgroundImage:
                  "url('https://afs-foiling.com/fr/wp-content/uploads/2024/03/image-24-1.png')",
                backgroundPosition: "bottom",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
            ></div>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20 z-0"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-[10px] justify-top items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <path
                  d="M8.16666 11.6667H11.6667V8.16666L7.58333 4.08333C8.88956 3.45948 10.3571 3.25593 11.7838 3.50072C13.2105 3.7455 14.5262 4.42658 15.5498 5.45016C16.5734 6.47374 17.2545 7.78948 17.4993 9.21619C17.7441 10.6429 17.5405 12.1104 16.9167 13.4167L23.9167 20.4167C24.3808 20.8808 24.6415 21.5103 24.6415 22.1667C24.6415 22.823 24.3808 23.4525 23.9167 23.9167C23.4525 24.3808 22.823 24.6415 22.1667 24.6415C21.5103 24.6415 20.8808 24.3808 20.4167 23.9167L13.4167 16.9167C12.1104 17.5405 10.6429 17.7441 9.21619 17.4993C7.78948 17.2545 6.47374 16.5734 5.45016 15.5498C4.42658 14.5262 3.7455 13.2105 3.50072 11.7838C3.25593 10.3571 3.45948 8.88956 4.08333 7.58333L8.16666 11.6667Z"
                  stroke="#666666"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              <h2 className="global-h2">{t("foil")}</h2>
              <p className="max-w-[520px] text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] text-[#FFFFFFCC]">
                {t("our-repair")}
              </p>
              <ul>
                <li>
                  <a href="/demande-sav/" className="global-blue font-semibold">
                    {t("contact-us")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="text-center max-w-[680px] font-semibold">
          {t("in-addition")}
        </p>
      </div>

      <div
        id="Notice"
        className="flex flex-col gap-[40px] justify-center items-center global-margin global-padding"
      >
        <h2 className="global-h2">{t("user-manual")}</h2>
        <div className="flex flex-wrap gap-x-[40px] gap-y-[40px] justify-between w-[1080px] max-w-[100%]">
          <div className="group w-[calc(50%-20px)] md:w-[250px]">
            <a
              href="https://afs-foiling.com/fr/wp-content/uploads/2024/04/Guide-Hydrofoil.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-[10px]"
            >
              <Image
                src="https://afs-foiling.com/fr/wp-content/uploads/2024/03/image_wrap-6.png"
                className="w-full md:w-[250px] h-auto object-contain"
                alt="Guide PDF"
                width={1920}
                height={250}
              />

              <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                Foil — {t("user-manual")}
              </p>

              <span className="flex items-center gap-[4px] arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span class="text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold global-blue">
                  Read all
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="none"
                >
                  <path
                    d="M10.2857 4.71484L1.71429 13.2863M10.2857 4.71484H2.57144M10.2857 4.71484V12.4291"
                    stroke="#1D98FF"
                    stroke-width="1.5"
                  ></path>
                </svg>
              </span>
            </a>
          </div>

          <div className="group w-[calc(50%-20px)] md:w-[250px]">
            <a
              href="https://afs-foiling.com/fr/wp-content/uploads/2024/04/Guide-Board.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-[10px]"
            >
              <Image
                src="https://afs-foiling.com/fr/wp-content/uploads/2024/03/image_wrap-6.png"
                className="w-full md:w-[250px] h-auto object-contain"
                alt="Guide PDF"
                width={250}
                height={120}
              />

              <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                {t("board")} - {t("user-manual")}
              </p>

              <span className="flex items-center gap-[4px] arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span class="text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold global-blue">
                  Read all
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="none"
                >
                  <path
                    d="M10.2857 4.71484L1.71429 13.2863M10.2857 4.71484H2.57144M10.2857 4.71484V12.4291"
                    stroke="#1D98FF"
                    stroke-width="1.5"
                  ></path>
                </svg>
              </span>
            </a>
          </div>
          <div className="group w-[calc(50%-20px)] md:w-[250px]">
            <a
              href="https://afs-foiling.com/fr/wp-content/uploads/2024/04/Guide-Wing.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-[10px]"
            >
              <Image
                src="https://afs-foiling.com/fr/wp-content/uploads/2024/03/image_wrap-8.png"
                className="w-full md:w-[250px] h-auto object-contain"
                alt="Guide PDF"
                width={1920}
                height={120}
              />

              <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
                Wing — {t("user-manual")}
              </p>

              <span className="flex items-center gap-[4px] arrow block md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span class="text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold global-blue">
                  Read all
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="16"
                  viewBox="0 0 12 16"
                  fill="none"
                >
                  <path
                    d="M10.2857 4.71484L1.71429 13.2863M10.2857 4.71484H2.57144M10.2857 4.71484V12.4291"
                    stroke="#1D98FF"
                    stroke-width="1.5"
                  ></path>
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div
        id="Pieces"
        className="flex flex-col gap-[40px] justify-center items-center global-margin global-padding max-w-[1920px] mx-auto"
      >
        <h2 className="global-h2">{t("parts")}</h2>
        <div
          id="Reprise"
          className="flex gap-[10px] h-[auto] md:h-[clamp(37.5rem,18.3649rem+25.9459vw,49.5rem)] bg-[#dbdbdb] rounded w-full justify-between items-center flex-col md:flex-row"
        >
          <Image
            src="https://afs-foiling.com/fr/wp-content/uploads/2024/03/image-32-1.png"
            className="flex-[1_0_0%] object-contain max-w-[100%] md:max-w-[33.33%]"
            alt="Guide PDF"
            width={1920}
            height={120}
          />
          <div className="flex flex-[1_0_0%] items-center justify-center gap-[20px] flex-col px-[16px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
            >
              <path
                d="M21.5 7.5H3.5M21.5 7.5L18.5 10.5M21.5 7.5L18.5 4.5M6.5 20.5L3.5 17.5M3.5 17.5L6.5 14.5M3.5 17.5H21.5"
                stroke="#1D98FF"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
            <h2 className="global-h2 text-center">{t("recovery-equip")}</h2>
            <p className="text-center text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold">
              {t("we-will")}
            </p>
            <a
              className="flex gap-[4px] justify-center items-center"
              href="https://afs-foiling.com/fr/fr/reprise-materiel/"
            >
              <span className="text-[clamp(0.875rem,0.8024rem+0.3226vw,1.125rem)] font-semibold global-blue">
                {t("return")}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="16"
                viewBox="0 0 12 16"
                fill="none"
              >
                <path
                  d="M10.2857 4.71484L1.71429 13.2863M10.2857 4.71484H2.57144M10.2857 4.71484V12.4291"
                  stroke="#1D98FF"
                  stroke-width="1.5"
                ></path>
              </svg>
            </a>
          </div>
          <Image
            src="https://afs-foiling.com/fr/wp-content/uploads/2024/03/image-25-3.png"
            className="flex-[1_0_0%] object-contain max-w-[100%] md:max-w-[33.33%]"
            alt="Guide PDF"
            width={1920}
            height={120}
          />
        </div>
      </div>

      <div
        id="FAQ"
        className="flex flex-col gap-[40px] justify-center items-center global-margin global-padding"
      >
        <h1 className="global-h2">FAQ</h1>

        <div class="flex flex-col gap-[12px] w-[100%] max-w-[1060px]">
          <h3 className="text-[clamp(1.5rem,1.4274rem+0.3226vw,1.75rem)] font-bold">
            Foil
          </h3>
          <div class="relative">
            <input type="checkbox" id="acc1" class="hidden peer" />
            <label
              for="acc1"
              class="flex justify-between items-start py-[16px] border-y-2 border-[#d5d8dc] font-bold cursor-pointer transition-colors relative text-[clamp(1.125rem,1.0887rem+0.1613vw,1.25rem)] uppercase"
            >
              Mon foil siffle ?
              <span class="transform rotate-0 transition-transform duration-300 peer-checked:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6H12C12.7956 6 13.5587 6.31607 14.1213 6.87868C14.6839 7.44129 15 8.20435 15 9V19M15 19L11 15M15 19L19 15"
                    stroke="#333333"
                    stroke-width="2"
                    stroke-linecap="square"
                  ></path>
                </svg>
              </span>
            </label>
            <div class="max-h-0 overflow-hidden transition-[max-height,padding] duration-300 peer-checked:max-h-40 font-semibold text-[#404040]">
              <p class="py-[16px]">
                {t("consult")}{" "}
                <a
                  className="global-blue"
                  href="https://afs-foiling.com/fr/fr/votre-foil-fait-du-bruit-cela-en-devient-genant-il-existe-une-solution/"
                >
                  {t("article")}
                </a>{" "}
                {t("quicly")}{" "}
                <a className="global-blue" href="https://youtu.be/T0l2ZrmIXok">
                  or watch this video.
                </a>
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-[12px] w-[100%] max-w-[1060px]">
          <h3 className="text-[clamp(1.5rem,1.4274rem+0.3226vw,1.75rem)] font-bold">
            {t("board")}
          </h3>
          <div class="relative">
            <input type="checkbox" id="acc2" class="hidden peer" />
            <label
              for="acc2"
              class="flex justify-between items-start py-[16px] border-y-2 border-[#d5d8dc] font-bold cursor-pointer transition-colors relative text-[clamp(1.125rem,1.0887rem+0.1613vw,1.25rem)] uppercase"
            >
              {t("need")}
              <span class="transform rotate-0 transition-transform duration-300 peer-checked:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6H12C12.7956 6 13.5587 6.31607 14.1213 6.87868C14.6839 7.44129 15 8.20435 15 9V19M15 19L11 15M15 19L19 15"
                    stroke="#333333"
                    stroke-width="2"
                    stroke-linecap="square"
                  ></path>
                </svg>
              </span>
            </label>
            <div class="max-h-0 overflow-hidden transition-[max-height,padding] duration-300 peer-checked:max-h-[100%] font-semibold text-[#404040]">
              <p class="py-4">
                {t("need-please")}
              </p>

              <p class="py-2">
                {t("ahd")}
              </p>

              <p class="py-2">Colors for AFS Fire and Fly:</p>
              <ul class="py-2">
                {t.rich("size", {
                  li: (chunks) => <li>{chunks}</li>
                })}              </ul>

              <p class="py-2">{t("color")}</p>
              <ul class="py-2">
                <li>Navy blue rails: RAL 5013</li>
              </ul>

              <p class="py-2">Colors for the Sealion Rasta:</p>
              <ul class="py-2">
                {t.rich("color-size", {
                  li: (chunks) => <li>{chunks}</li>,
                  span: (chunks) => <span>{chunks}</span>
                })}
              </ul>

              <p class="py-2">Colors for AHD SL-S:</p>
              <ul class="py-2">
                {t.rich("black", {
                  li: (chunks) => <li>{chunks}</li>,
                })}
              </ul>

              {t.rich("ay", {
                p: (chunks) => <p className="py-4">{chunks}</p>,
                ul: (chunks) => <ul className="py-2 list-disc pl-5">{chunks}</ul>,
                li: (chunks) => <li>{chunks}</li>
              })}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-[12px] w-[100%] max-w-[1060px]">
          <h3 className="text-[clamp(1.5rem,1.4274rem+0.3226vw,1.75rem)] font-bold">
            Wing
          </h3>
          <div class="relative">
            <input type="checkbox" id="acc3" class="hidden peer" />
            <label
              for="acc3"
              class="flex justify-between items-start py-[16px] border-y-2 border-[#d5d8dc] font-bold cursor-pointer transition-colors relative text-[clamp(1.125rem,1.0887rem+0.1613vw,1.25rem)] uppercase"
            >
              {t("change")}
              <span class="transform rotate-0 transition-transform duration-300 peer-checked:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6H12C12.7956 6 13.5587 6.31607 14.1213 6.87868C14.6839 7.44129 15 8.20435 15 9V19M15 19L11 15M15 19L19 15"
                    stroke="#333333"
                    stroke-width="2"
                    stroke-linecap="square"
                  ></path>
                </svg>
              </span>
            </label>
            <div class="max-h-0 overflow-hidden transition-[max-height,padding] duration-300 peer-checked:max-h-[100%] font-semibold text-[#404040]">
              <p class="py-4">
                {t("wilf")}
                <ul class="py-2">
                  <li>{t("v1")}</li>
                </ul>
                <Image
                  class="py-2"
                  src="https://afs-foiling.com/fr/wp-content/uploads/2023/10/resize-169627230787765529Capetoile.jpeg"
                  alt="resize-169627230787765529Capetoile"
                  width={1920}
                  height={120}
                  className="max-w-[520px]"
                />
                <ul class="py-2">
                  <li>
                    {t("v2")}
                  </li>
                </ul>
                <Image
                  class="py-2"
                  src="https://afs-foiling.com/fr/wp-content/uploads/2023/10/Cap-rouge-e1696272591756.jpeg"
                  alt="Red cap"
                  width={1920}
                  height={120}
                  className="max-w-[520px]"
                />
                <ul class="py-2">
                  <li>
                    {t("v3")}
                  </li>
                </ul>
                {t('last')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
