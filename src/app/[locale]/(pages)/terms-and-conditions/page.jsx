"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const BreadCums = () => {
  const t = useTranslations("breadcum")
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          {t("home")}
        </Link>
        / <span className="text-black">Terms and Conditions</span>
      </div>
    </div>
  );
};

export default function TermsAndConditions() {
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
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              Preamble/Identity of the Seller
            </h2>
            <p>
              These General Terms and Conditions of Sale apply to sales made
              through the website www.foilandco.com, concluded between the
              company Foil and Co, a simplified joint-stock company with capital
              of €89,000, registered with the RCS of Brest under number 822 822
              615, whose registered office is located at ZA DE REUNVENGUEN 29450
              LE TREHOU and any buyer consumer having full legal capacity, or
              any non-professional buyer.
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
              <li>
                THE INFORMATION PROVIDED FOR IN ARTICLES&nbsp;
                <Link
                  href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006069565&amp;idArticle=LEGIARTI000032220903&amp;dateTexte=&amp;categorieLien=cid"
                  target="_blank"
                  rel="noopener"
                  className="text-[#1D98FF]"
                >
                  L. 111-1&nbsp;
                </Link>
                AND L. 111-2 (INCLUDING THE ESSENTIAL CHARACTERISTICS OF THE
                PRODUCTS AND THEIR PRICE);
              </li>
              <li>
                THE CONDITIONS, TIME LIMIT AND MODALITIES FOR EXERCISING THE
                RIGHT OF WITHDRAWAL AS WELL AS THE STANDARD FORM&nbsp;;
              </li>
              <li>
                THE FACT THAT THE CUSTOMER BEARS THE RETURN COSTS OF THE GOOD IN
                THE EVENT OF WITHDRAWAL&nbsp;;
              </li>
              <li>
                THE INFORMATION RELATING TO THE SELLER'S CONTACT DETAILS, THE
                METHODS OF SETTLING DISPUTES.
              </li>
            </ul>

            <p>
              These general terms and conditions are presented in the French
              language. The General Terms and Conditions of Sale may be subject
              to subsequent modifications; the applicable version will be the
              one in force on the site on the date the customer places the
              order.
            </p>
          </div>
          {/*sec-2 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              I. The different steps to follow for the conclusion of the online
              contract
            </h2>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Order
              </h3>
              <p>
                You make your selection by browsing the pages of our site. Your
                selections are added to your basket when you click on "add this
                product to the basket". At any time during your navigation on
                our site, you can validate your order by clicking on "validate
                my order". You can also order: By phone at 02 98 19 29 03 from
                mainland France. Monday to Friday from 9am to 6pm.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Contract validation
              </h3>
              <p>
                When you click on "validate my order", a confirmation message
                appears. It summarizes all the products and options selected.
                You must check in this order form all the information provided,
                and in particular all the details useful for delivery (delivery
                address, door code, phones...). If you do not need to modify the
                form, you must then read these terms and conditions. If you
                accept them, you must tick the box "I have read and accept the
                general terms and conditions of sale without reservation". Any
                order implies acceptance of these terms. To proceed with your
                order, you must click on "pay my order". After payment on our
                secure server (see "payment"), a receipt is displayed. It
                confirms the registration of your order and informs you that a
                confirmation email will be sent to you as soon as possible.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                C. Technical means for identifying and correcting errors
              </h3>
              <p>
                You have at all times the ability to identify and correct your
                errors made when entering your data. When you notice an error
                after the conclusion of the contract, you must contact us.
              </p>
            </div>
          </div>

          {/*sec-3 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              II. The terms of archiving and access to the contract
            </h2>
            <p>
              We will archive the contracts, order forms and invoices on a
              reliable and durable medium. You have a right to communication of
              these documents for orders with an amount greater than or equal to
              €120.
            </p>
          </div>

          {/*sec-4*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              III. Legal guarantees
            </h2>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Legal guarantees
              </h3>
              <p>
                The products sold on the site comply with the regulations in
                force in France and automatically benefit from:
              </p>
              <ul className="list-disc pl-5">
                <li>
                  THE LEGAL GUARANTEE OF CONFORMITY, FOR PRODUCTS THAT ARE
                  APPARENTLY DEFECTIVE, DAMAGED OR DO NOT CORRESPOND TO THE
                  ORDER,
                </li>
                <li>
                  THE LEGAL GUARANTEE AGAINST HIDDEN DEFECTS ARISING FROM A
                  DEFECT IN MATERIAL, DESIGN OR MANUFACTURING AFFECTING THE
                  PRODUCTS DELIVERED AND RENDERING THEM UNFIT FOR USE.
                </li>
              </ul>
              <div>
                Within the framework of the legal guarantee of conformity, the
                consumer customer: – Benefits from a period of two years from
                the delivery of the product to take action against the seller; –
                Can choose between repair or replacement of the ordered product,
                subject to the cost conditions provided for in Article L217-9 of
                the Consumer Code; – Is exempt from providing proof of the
                existence of the lack of conformity of the product during the 24
                months following the delivery of the product. – The legal
                guarantee of conformity applies independently of any commercial
                guarantee that may possibly cover the product. – The customer
                may decide to implement the guarantee against hidden defects in
                accordance with Article 1641 of the Civil Code; in this case,
                they can choose between the rescission of the sale or a
                reduction in the sale price in accordance with Article 1644 of
                the Civil Code.
              </div>
              <p>
                The seller will refund, replace or have repaired the products or
                parts under guarantee that are deemed non-compliant or
                defective.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Liability
              </h3>
              <p>
                We do our best to satisfy you. We are responsible for the proper
                execution of these General Terms and Conditions. Nevertheless,
                our liability cannot be engaged due to a fortuitous event, an
                event of force majeure, the unforeseeable and insurmountable act
                of a third party to the contract or due to the non-compliance of
                the product with foreign legislation in the event of delivery to
                a country other than France, use of the product for professional
                purposes, negligence or lack of maintenance on the part of the
                customer, or normal wear and tear of the product.
              </p>
            </div>
          </div>

          {/*sec-5*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              IV. Delivery times, costs and methods
            </h2>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Delivery methods
              </h3>
              <p>
                We will deliver the products to the address indicated in the
                order form.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Delivery time
              </h3>
              <p>
                We will deliver at the latest by the date indicated in the
                confirmation message of your order. In the event of a delay in
                delivery, we will inform you by email as soon as possible and we
                will propose a new date. In accordance with Article L. 216-2 of
                the Consumer Code, in the event of a failure to fulfill its
                delivery obligation upon expiry of the indicated delivery period
                or, failing that, at the latest thirty days after the order, the
                customer may cancel their order, by registered letter with
                acknowledgment of receipt or by a written document on another
                durable medium, if, after having enjoined, by the same means,
                the seller to effect delivery within an additional reasonable
                period, the latter has not done so within that period. In the
                event of cancellation of the order, the seller shall refund the
                customer for the sums paid, at the latest within fourteen days
                of the date of cancellation of the order, excluding any
                additional compensation.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                C. Delivery costs
              </h3>
              <p>
                The shipping costs for any deliverable order are calculated in
                your shopping basket.
              </p>
            </div>
          </div>

          {/*sec-6*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              V. Price
            </h2>
            <p>
              The prices of our products are indicated in euros inclusive of all
              taxes (French VAT and other applicable taxes). They include in
              particular the costs of processing your order. If you request
              delivery outside French territory, your order may be subject to
              possible taxes and customs duties when it arrives at its
              destination. The payment of these duties and taxes is your
              responsibility and we invite you to enquire with the competent
              authorities of your country. You must also check the possibilities
              of importing or using the products you order from us in the
              country of destination.
            </p>
          </div>

          {/*sec-7*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VI. Payment terms and security measures
            </h2>
            <p>
              We collect your payment upon conclusion of the online contract.
            </p>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Payment methods
              </h3>
              <p>
                You have several payment methods to pay for your purchases on
                Foil and co: – Either by credit card: Visa, Mastercard, Carte
                bleue. Payment is made on the secure bank server of our partner
                Crédit Mutuel de Bretagne. This implies that no banking
                information concerning you is transmitted via our site. Payment
                by credit card is therefore perfectly secure; your order will be
                recorded and validated as soon as the payment is accepted by the
                bank you have chosen. – Or by PayPal: With PayPal, your
                financial information is never communicated to Foil and co.
                Indeed, PayPal encrypts and protects your card number. Pay
                online simply by entering your email address and password. This
                implies the customer's acceptance of PayPal's terms of use.
              </p>
            </div>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Security
              </h3>
              <p>
                Payments via our site are subject to a security system.&nbsp;
                <a className="text-[#1D98FF]">
                  We have adopted the SSL (Secure Socket Layer) protocol to
                  encrypt credit card details
                </a>
                . To protect you against possible intrusion, we do not store
                credit card numbers on our computer servers. Credit card numbers
                are processed by Crédit Mutuel de Bretagne&nbsp;which returns an
                authorization number to us.
              </p>
            </div>
          </div>

          {/*sec-8*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VII. Modalities for exercising the right of withdrawal
            </h2>
            <p>
              In accordance with legal provisions, within 14 days of receiving
              your product, you may exercise your right of withdrawal. You do
              not have to give reasons or pay any penalty. Except for return
              costs, which remain your responsibility, we will refund you the
              total sums paid no later than&nbsp;<a>14 days</a> after your
              withdrawal. The product must be returned complete and in its
              original condition. In accordance with legal provisions, the right
              of withdrawal cannot be exercised for products&nbsp;
              <a className="text-[#1D98FF]">
                made to order, according to the consumer's specific
                specifications
              </a>
              . The right of withdrawal may be exercised online, by sending us
              an email to contact@foilandco.com, in which case an acknowledgment
              of receipt on a durable medium will be immediately communicated to
              the customer by the seller, or by any other unambiguous
              declaration expressing the customer's wish to withdraw.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
