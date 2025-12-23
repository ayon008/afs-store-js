import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-black"> Legal notice</span>
      </div>
    </div>
  );
};

export default function legalNotice() {
  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />

          <h1 className="global-h2 text-center py-[80px]">
            GENERAL TERMS AND CONDITIONS OF SALE
          </h1>
        </div>
        {/*content */}
        <div className="text-[14px] font-semibold leading-[130%] space-y-[80px] max-w-[1320px] mx-auto">
          {/*sec-1 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <p>
              FOIL AND CO SAS, a French company with a capital of 110 250,00 €,
              represented by Mr. Tanguy LE BIHAN, and whose French head office
              is located in Pencran (29800), ZAE Correquer.
            </p>

            <p>
              Seller's contact details: Foil and co Registered office: ZA DE
              REUNVENGUEN 29450 LE TREHOU RCS:&nbsp;822&nbsp;822&nbsp;615 R.C.S
              Brest SIRET: 82282261500016 Tel: 02 98 19 29 03 Email:
              contact@foilandco.com We do our best to satisfy you. On this site,
              we present you with all the essential characteristics of the
              products. We will be attentive to any comments you send us. The
              customer must refer to the description of each product sold on the
              site to know its properties and essential features. The customer
              acknowledges having been informed, prior to placing their order,
              in a legible and comprehensible manner, of these General Terms and
              Conditions of Sale and of all the information listed in Article L.
              221-5 of the Consumer Code, and in particular the following
              information:
            </p>

            <ul className="list-disc pl-5">
              <li>Registered at the RCS of Brest under number 822 822 615</li>
              <li>VAT number : FR23822822615</li>
              <li>Siret number : 82282261500032</li>
              <li>APE Code: 7112B Engineering, technical studies</li>
            </ul>

            <p>
              Responsible for publication: Mr. Tanguy LE BIHAN, representative
              of the company FOIL AND CO.
            </p>
            <p>Contact: contact@foilandco.com</p>
            <p>Design, production and hosting</p>
            <p>Design and graphic creation : Foil and Co</p>
            <p>Director: Vlad Zamari</p>
            <p>
              Hosting: OVH – registered in the Lille Trade and Companies
              Register under the number: Lille Metropole B 424 761 419, whose
              headquarters are located at 2 rue Kellermann, 59100 ROUBAIX, with
              VAT number FR22424761419
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
