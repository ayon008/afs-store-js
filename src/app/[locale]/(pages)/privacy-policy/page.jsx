"use client";

import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Home
        </Link>
        / <span className="text-black">PRIVACY POLICY</span>
      </div>
    </div>
  );
};

export default function privacyPolicy() {
  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />

          <h1 className="global-h2 text-center py-[80px]">PRIVACY POLICY</h1>
        </div>
        {/*content */}
        <div className="text-[14px] font-semibold leading-[130%] space-y-[80px] max-w-[1320px] mx-auto">
          {/*sec-1 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <p>
              Foil and Co, registered under no.822 822 615 R.C.S. BREST,
              attaches great importance to the protection of your personal data
              and carefully monitors compliance with the protective provisions
              relating to privacy and the processing of personal data, in
              particular the European Regulation on the protection of
              individuals with regard to the processing of personal data and on
              the free movement of such data (EU Regulation 2016/679 of 26 April
              2016), the law of 6 January 1978 known as the “Data Protection
              Act” as amended in 2018, as well as the recommendations emanating
              from the CNIL (hereinafter the “Legislation in force”). The
              purpose of this personal data protection charter (hereinafter the
              “Charter”) is to describe how and when Foil and Co, as data
              controller, collects, uses and communicates certain personal data
              (hereinafter the “Data”) that you send to us in order to meet your
              needs but also to optimize and improve the quality of the services
              we offer you.
            </p>
          </div>
          {/*sec-2 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              I. IN WHAT CASES DOES THIS CHARTER APPLY?
            </h2>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <p>
                This Charter informs you on the methods of collection, treatment
                and use of your Data when :
                <ul className="mb-2 list-disc pl-5">
                  <li>You are visiting one of the Foil and Co websites</li>
                  <li>You buy items on one of the Foil and Co stores</li>
                  <li>
                    You subscribe to one of the newsletters of Foil and Co and
                    its personalized contents
                  </li>
                  <li>You contact our customer service</li>
                  <li>You participate in our contests</li>
                </ul>
              </p>
            </div>
          </div>

          {/*sec-3 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              II. WHAT DATA IS COLLECTED BY FOIL AND CO?
            </h2>

            <p>
              This Charter informs you on the methods of collection, treatment
              and use of your Data when :
              <ul className="mb-2 list-disc pl-5">
                <li>
                  when you register on one of the Foil and Co sites by filling
                  out various forms related to your account or by uploading data
                </li>
                <li>when you buy an item on one of the Foil and Co stores</li>
                <li>when you participate in a contest</li>
                <li>when you complete a Foil and Co questionnaire</li>
                <li>when you contact our customer relations department.</li>
              </ul>
            </p>
            <p>
              This information may contain, for example:
              <ul className="mb-2 list-disc pl-5">
                <li>your name(s) and surname(s)</li>
                <li>your date of birth,</li>
                <li>your gender,</li>
                <li>your mailing address,</li>
                <li>your e-mail address,</li>
                <li>your telephone number(s),</li>
                <li>your means of payment,</li>
                <li>your purchase history</li>
              </ul>
              You may choose not to provide us with certain information;
              however, this decision may deprive you of some of the services and
              features we offer. Information that is essential to the provision
              of our services and features is identified by an asterisk on our
              collection forms.
            </p>

            <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
              A. DATA COLLECTED AUTOMATICALLY
            </h3>
            <p>
              During your navigation on one of our sites, Foil And Co is likely
              to collect, in the strict respect of the Legislation in force and
              of your rights, data relating to:
              <ul className="mb-2 list-disc pl-5">
                <li>
                  the characteristics of the operating system, browser or
                  devices (computer, tablet, smartphone) that you use to access
                  our services;
                </li>
                <li>to your location such as your IP address;</li>
                <li>
                  your browsing habits and your interactions with the content of
                  the Site, such as the pages you visit, the search terms you
                  use, the frequency of your visits to the Site, the
                  advertisements you click on.
                </li>
              </ul>
              Browsing data is collected in particular by means of cookies.
            </p>

            <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
              B. DATA FROM OTHER SOURCES
            </h3>
            <p>
              We may also collect data through third parties, including social
              networks, when you use your account with those third parties to
              register or log in to our services. When you use this service, you
              will be informed of the data that the third party in question
              sends to us. We use, store and process your data to process your
              requests, manage our business relationship, optimize our services
              and tools to create and maintain a more secure and trustworthy
              environment, and to comply with our legal obligations as specified
              below.
            </p>
          </div>

          {/*sec-4*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              III. WHAT DO WE USE YOUR DATA FOR?
            </h2>

            <p>Your personal data is used for :</p>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. TO PERFORM THE CONTRACTS ENTERED INTO BETWEEN US
              </h3>
              <p>
                We use your personal data to process your order and provide you
                with the related services. In particular, your data will be used
                to collect your payments and to inform you by SMS, email or any
                other means of communication about the terms and conditions of
                the contract between us. In the course of our business, we may
                use commercial partners to provide certain services on our
                behalf. However, our business partners may not use your data for
                any purposes other than those necessary to perform the services
                you have requested. Finally, they are obliged to treat them in
                strict compliance with the legislation in force.
              </p>
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. PROVIDING YOU WITH ACCESS TO THE SITE AND CERTAIN SERVICES
              </h3>
              <p>
                The data you provide allows us to identify you in order to
                access your Customer Area, access to which is reserved to
                authenticated persons.
              </p>
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                C. SEND YOU OUR FOIL AND CO NEWS AND PERSONALIZED CONTENT
              </h3>
              <p>
                If, at the time of purchasing a product, creating your account
                on one of the sites or subsequently, you have checked the box or
                filled out the form that allows you to receive Foil and Co news
                and personalized content, then we may use your data to
                communicate to you, according to your preferences (including by
                email, SMS, telephone or postal mail):
                <ul className="mb-2 list-disc pl-5">
                  <li>information about one of the sites;</li>
                  <li>
                    invitations to Foil and Co events that may be of interest to
                    you;
                  </li>
                  <li>information about our offers;</li>
                  <li>
                    information about updates to the Charter or security
                    measures.
                  </li>
                </ul>
                You can, at any time, object to commercial communications from
                Foil and Co (i) by clicking on the unsubscribe link or following
                the opt-out procedure set forth in such communications, or (ii)
                by contacting us as described in Section 6 below. We may also
                use your data to send you advertising messages that may be of
                interest to you on third party sites or social networking
                platforms. For more information on this subject, we invite you
                to read the conditions relating to the use of your data directly
                on these sites and/or third-party platforms.
              </p>
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                D. FOR PROFILING PURPOSES
              </h3>
              <p>
                We may also process your data for profiling purposes. Profiling
                consists of automated processing of your data in order to
                analyze, anticipate and evaluate your interests and preferences
                in order to send you personalized content and commercial offers
                adapted to your specific needs. Foil and Co will only share your
                data with third party service providers to determine your
                profile and preferences with greater accuracy and thus send you
                more relevant Foil and Co content. In no case, the company Foil
                and Co will not communicate your data to commercial partners.
                You may, at any time, object to the use of your data for
                profiling purposes by contacting us in the manner described in
                the article on the categories of recipients of your data.
              </p>
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                E. OPTIMIZING THE SITE AND OUR SERVICES
              </h3>
              <p>
                We use your data for research, technical testing (including
                anonymization of your data), deduplication, which allows us to
                improve and optimize the site and to customize our tools and
                services. For example, it will ensure that the display of our
                various contents is adapted to the terminal you are using, or
                allow us to host your data on even more secure servers, etc.
              </p>
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                F. HANDLING YOUR CLAIMS
              </h3>
              <p>
                When you contact our customer relations department by telephone,
                via the contact form available on one of the sites or via any
                other means made available to you by Foil and Co (social
                networks, chat, etc.), we use your data to :
                <ul className="mb-2 list-disc pl-5">
                  <li>
                    respond to you and provide a solution to your complaint;
                  </li>
                  <li>ensure and manage the follow-up of your claim;</li>
                  <li>improve customer service.</li>
                </ul>
              </p>

              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                G. FOR INTERNAL STATISTICAL AND SURVEY PURPOSES
              </h3>
              <p>
                We may use your data to conduct various statistical studies
                and/or solicit you to participate in our own surveys.
              </p>

              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                H. ENSURING COMPLIANCE WITH THE LAW AND COURT DECISIONS
              </h3>
              <p>
                Your data may be used to:
                <ul className="mb-2 list-disc pl-5">
                  <li>
                    respond to a request from an administrative or judicial
                    authority, a representative of the law, a court officer or
                    comply with a court order;
                  </li>
                  <li>
                    ensure compliance with our general terms and conditions of
                    sale and the Charter;
                  </li>
                  <li>
                    to protect our rights and/or obtain compensation for damages
                    that we may suffer or limit the consequences thereof;
                  </li>
                  <li>
                    prevent any action contrary to the laws in force, in
                    particular within the framework of the prevention of the
                    risks of fraud.
                  </li>
                </ul>
              </p>
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                I. MANAGING YOUR PARTICIPATION IN CONTESTS
              </h3>
              <p>
                When you participate in a contest, you provide us with a certain
                amount of information. They are essential to the consideration
                of your participation, and if necessary, to the delivery of the
                prize. Furthermore, with your prior and express consent, we may
                use this data to send you Foil and Co news (product information
                and promotional offers) and personalized content.
              </p>
            </div>
          </div>
          {/*sec-4*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              IV. WHICH COOKIES ARE USED BY FOIL AND CO?
            </h2>
            <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
              A. WHAT IS A COOKIE?
            </h3>
            <p>
              When you use one of its sites, Foil and Co may place a file called
              a “cookie” on your terminal (e.g. computer, tablet), thanks to
              your browser. It allows, during its recording period, to identify
              your computer during your next visits. Thus, each time you visit
              one of the sites, data from your previous visit may be retained.
            </p>
            <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
              B. WHICH COOKIES ARE USED BY FOIL AND CO?
            </h3>
            <p>
              The Foil and Co group uses, in particular, the cookies listed in
              the appendix of the present document.
            </p>
            <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
              C. COOKIES REQUIRED TO PROVIDE THE REQUESTED SERVICES
            </h3>
            <p>
              Foil and Co may use cookies that are strictly necessary to provide
              the services or information you have requested, including:
              <ul className="mb-2 list-disc pl-5">
                <li>cookies “session identifiers to your Customer Area”;</li>
                <li>shopping cart” cookies;</li>
                <li>authentication cookies;</li>
                <li>load balancing session cookies;</li>
                <li>persistent user interface personalization cookies;</li>
                <li>
                  audience measurement analysis cookies (“statistical cookies”).
                </li>
              </ul>
              The data collected by statistical cookies is not cross-referenced
              with other processing (or previously anonymized) and is only used
              to produce anonymous statistics. These cookies do not allow us to
              track your navigation to other sites, nor do they allow us to
              geolocate you precisely. You can simply object to cookies,
              including statistical cookies (see “Disabling Cookies” below).
            </p>

            <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
              D. TRACKING AND PERSONALIZATION COOKIES
            </h3>
            <p>
              Some cookies allow us to analyze, optimize and personalize your
              navigation on the site. They may also allow automated processing
              operations to be carried out on your Data in accordance with the
              terms and conditions specified in Article 4.3. These are only
              installed with your prior and express consent. During your
              navigation on the site, cookies issued by third parties
              (communication agency, audience measurement company, targeted
              advertising provider, etc…) may allow the latter, during the
              validity period of these cookies, (i) to collect navigation
              information relating to the terminals consulting the Site and (ii)
              to determine what advertising content may be relevant to your
              interests. The issuance and use of cookies by third parties is
              subject to the cookie policies of those third parties.
            </p>
          </div>

          {/*sec-5*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              V. HOW LONG DO WE KEEP YOUR DATA?
            </h2>

            <p>
              In general, your data is kept only as long as necessary to carry
              out the operations for which it was collected. Here are the
              different retention periods of the data collected by Foil and Co:
              <ul className="mb-2 list-disc pl-5">
                <li>
                  the data transmitted directly to us as detailed in article 2.1
                  are kept for the time necessary for the purpose of their
                  processing;
                </li>
                <li>
                  the navigation data are kept for a maximum of 13 months;
                </li>
                <li>
                  Data relating to prospects are kept for a maximum of 3 years
                  from the last contact you have initiated with Foil and Co;
                </li>
                <li>
                  the data relating to the identity documents that you send us
                  when you exercise your right of access or rectification are
                  kept for a maximum period of 12 months;
                </li>
                <li>
                  the information allowing to take into account the rights of
                  the persons concerned to oppose to receive commercial
                  prospecting is kept for a maximum period of 3 years as from
                  the exercise of this right.
                </li>
              </ul>
              We may also delete your data at your request. However, at the end
              of the above-mentioned periods, including your request for
              deletion, your data may be retained in order to meet our legal,
              accounting and tax obligations (e.g.: obligation to retain
              invoices for 10 years in accordance with article L.123-22 of the
              French Commercial Code) and/or during the applicable limitation
              period and/or in the event of legal proceedings for the duration
              of said proceedings.
            </p>
          </div>

          {/*sec-6*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VI. WHAT ARE THE CATEGORIES OF RECIPIENTS OF YOUR DATA?
            </h2>

            <p>
              We may share your data with various third parties, including:
              <ul className="mb-2 list-disc pl-5">
                <li>
                  with our affiliated entities in order to provide you with the
                  requested services or acting as a subcontractor in accordance
                  with applicable law;
                </li>
                <li>
                  our business partners, suppliers and/or subcontractors who
                  process your data on our behalf, according to our
                  instructions, for the purposes detailed in article 2 (in
                  particular transport companies, insurance companies, customs
                  authorities, receptive service providers, financial
                  institutions, technical subcontractors, etc.) We take
                  particular care to ensure that these third parties provide
                  sufficient guarantees to ensure the protection and security of
                  your data;
                </li>
                <li>
                  to duly authorized French or foreign authorities, in
                  particular in the context of a legal action or a request for
                  communication of information.
                </li>
              </ul>
            </p>
          </div>

          {/*sec-7*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VII. ON WHAT LEGAL BASIS IS YOUR DATA PROCESSED?
            </h2>
            <p>
              In accordance with the legislation in force, we rely on various
              legal bases to process your data, including
              <ul className="mb-2 list-disc pl-5">
                <li>
                  your prior and express consent to the processing of your data
                  for one of the purposes referred to in Article 3 ;
                </li>
                <li>the execution of the contract between us;</li>
                <li>
                  the need to comply with a legal obligation or to defend
                  ourselves in the event of legal proceedings;
                </li>
                <li>
                  the achievement of the legitimate interest that Foil and Co
                  pursues;
                </li>
                <li>the safeguarding of your vital interest.</li>
              </ul>
            </p>
          </div>

          {/*sec-8*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VIII. WHAT ARE YOUR RIGHTS?
            </h2>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. YOUR RIGHTS OF ACCESS, RECTIFICATION, DELETION AND OPPOSITION
              </h3>
              <p>
                You can ask us to access, correct, update or delete your
                personal information. You also have the right to object to the
                processing of your data.
              </p>
            </div>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. THE RIGHT TO PORTABILITY OF YOUR DATA
              </h3>
              <p>
                The right to portability offers you the possibility of
                recovering part of your data, namely:
                <ul className="mb-2 list-disc pl-5">
                  <li>
                    the data that you have transmitted directly to us as
                    detailed in article 2;
                  </li>
                  <li>
                    data generated by your activities on the site as detailed in
                    article 2.
                  </li>
                </ul>
                We will endeavour to respond to your request within a reasonable
                period of time and, in any event, within the time limits set by
                the applicable legislation.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. THE RIGHT TO PORTABILITY OF YOUR DATA
              </h3>
              <p>
                The right to portability offers you the possibility of
                recovering part of your data, namely:
                <ul className="mb-2 list-disc pl-5">
                  <li>
                    the data that you have transmitted directly to us as
                    detailed in article 2;
                  </li>
                  <li>
                    data generated by your activities on the site as detailed in
                    article 2.
                  </li>
                </ul>
                We will endeavour to respond to your request within a reasonable
                period of time and, in any event, within the time limits set by
                the applicable legislation.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. THE RIGHT TO PORTABILITY OF YOUR DATA
              </h3>
              <p>
                The right to portability offers you the possibility of
                recovering part of your data, namely:
                <ul className="mb-2 list-disc pl-5">
                  <li>
                    the data that you have transmitted directly to us as
                    detailed in article 2;
                  </li>
                  <li>
                    data generated by your activities on the site as detailed in
                    article 2.
                  </li>
                </ul>
                <div className="flex flex-col gap-[20] md:gap-[20px]">
                  <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                    B. THE RIGHT TO PORTABILITY OF YOUR DATA
                  </h3>
                  <p>
                    The right to portability offers you the possibility of
                    recovering part of your data, namely:
                    <ul className="mb-2 list-disc pl-5">
                      <li>
                        the data that you have transmitted directly to us as
                        detailed in article 2;
                      </li>
                      <li>
                        data generated by your activities on the site as
                        detailed in article 2.
                      </li>
                    </ul>
                    We will endeavour to respond to your request within a
                    reasonable period of time and, in any event, within the time
                    limits set by the applicable legislation.
                  </p>
                </div>
                <div className="flex flex-col gap-[20] md:gap-[20px]">
                  <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                    C. SETTING GUIDELINES FOR WHAT HAPPENS TO YOUR DATA
                  </h3>
                  <p>
                    You have the right to define general or specific directives
                    relating to the conservation, deletion and communication of
                    your post-mortem data.
                  </p>
                </div>
                <div className="flex flex-col gap-[20] md:gap-[20px]">
                  <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                    D. CONTACT
                  </h3>
                  <p>
                    To exercise all these rights, you must send a letter to the
                    following address Company FOIL AND CO, 29450 LE TREHOU,
                    FRANCE with a copy of your identity card. At any time, if
                    you feel that your rights have not been respected, you have
                    the right to make a complaint to the Data Protection Officer
                    (DPO) of Foil and Co whose contact details are Company FOIL
                    AND CO, 29450 LE TREHOU, FRANCE. You may, at any time, file
                    a complaint with the competent control authority (in France,
                    the CNIL: www.cnil.fr ).
                  </p>
                </div>
              </p>
            </div>
          </div>

          {/*sec-9*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              IX. IS YOUR DATA TRANSFERRED OUTSIDE THE EUROPEAN UNION?
            </h2>
            <p>
              We may transfer your data to countries outside the European Union
              for the purposes described in this Policy. For each of these
              transfers, we ensure that your data benefits from a level of
              protection equivalent to that offered in Europe. Transfers are
              made only to countries that are recognized as providing an
              adequate level of data protection by the European Commission. In
              the event that data is transferred to a country that does not
              offer an adequate level of protection, Foil and Co and its
              partners or service providers undertake to frame the transfer by
              means of appropriate guarantees (such as the European Commission’s
              standard contractual clauses) which you can request from the DPO’s
              address indicated above.
            </p>
          </div>

          {/*sec-10*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              X. PROTECTION OF YOUR DATA BY FOIL AND CO
            </h2>
            <p>
              Foil and Co undertakes to guarantee the integrity and reliability
              of the data entrusted to it, in particular by taking all the
              physical, organizational and logistical measures necessary to
              prevent any alteration or destruction of the said data, in
              particular by ensuring secure access only to persons authorized to
              process them.
            </p>
          </div>

          {/*sec-11*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              XI. REVISION OF THE CHARTER
            </h2>
            <p>
              Foil and Co may have to modify this charter, in particular, if the
              legislation in force evolves. Any changes will be posted on this
              page.
            </p>
          </div>

          {/*sec-12*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              XII. HOW TO BLOCK COOKIES?
            </h2>
            <p>
              You can set your browser to change your consent or to refuse
              cookies. You can either accept all cookies, be notified when a
              cookie is set, or reject all cookies. If you refuse all or part of
              the cookies, some features of the Site may be compromised or some
              pages may be inaccessible.
            </p>
          </div>

          {/*sec-13*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              XIII. TO DISABLE COOKIES:
            </h2>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. IF YOU ARE USING INTERNET EXPLORER 11. AND FOLLOWING :
              </h3>
              <p>
                <ol className="list-disc pl-5">
                  <li>
                    Go to “Tools” in the menu bar and click on “Internet
                    Options”.
                  </li>
                  <li>Click on the “Privacy” tab at the top</li>
                  <li>
                    Drag the slider up to the “Block All Cookies” setting to
                    block all cookies, or down to the “Accept All Cookies”
                    setting to accept all cookies.
                  </li>
                </ol>
                <a
                  tabindex="0"
                  title="Microsoft Support"
                  href="http://windows.microsoft.com/fr-fr/internet-explorer/delete-manage-cookies"
                  target="_blank"
                  rel="noopener"
                  className="text-[#1d98ff]"
                >
                  http://windows.microsoft.com/fr-fr/internet-explorer/delete-manage-cookies
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. IF YOU ARE USING FIREFOX 72. AND FOLLOWING :
              </h3>
              <p>
                <ol className="list-disc pl-5">
                  <li>Click on the “menu” button and select “Options”.</li>
                  <li>Select the “Privacy” panel.</li>
                  <li>
                    In the History area, for the “Retention Rules” option,
                    select “use custom settings for history”.
                  </li>
                  <li>
                    Check the “Accept Cookies” box to enable cookies, or uncheck
                    it to disable them. If you have problems with cookies, make
                    sure that the “Accept third-party cookies” option is not set
                    to Never.
                  </li>
                  <li>
                    Choose how long cookies can be kept. – Keep them until :
                    “Their expiration”: Each cookie will be deleted on its
                    expiration date, which is set by the cookie issuing site. –
                    Keep them until : “Closing Firefox”: the cookies stored on
                    your computer will be deleted when you close Firefox. – Keep
                    them until : “Ask me every time”: a warning is displayed
                    every time a website wants to send a cookie, asking you if
                    you agree to save the cookie or not.
                  </li>
                  <li>Click on OK to close the “Options” window</li>
                </ol>
                For more information, visit
                <a
                  tabindex="0"
                  title="Mozilla support"
                  href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent#w_parametres-des-cookies"
                  target="_blank"
                  rel="noopener"
                  className="text-[#1d98ff]"
                >
                  https://support.mozilla.org/fr/products/firefox/privacy-and-security/cookies
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                C. IF YOU USE GOOGLE CHROME :
              </h3>
              <p>
                <ol className="list-disc pl-5">
                  <li>Go to the “Tools” menu</li>
                  <li>Click on “Settings</li>
                  <li>Click on “Advanced Settings</li>
                  <li>Click on “Privacy/Content Settings</li>
                  <li>
                    “Cookies” must be selected. Then select “Block cookies and
                    data from third party sites”.
                  </li>
                </ol>
                For more information, visit
                <a
                  tabindex="0"
                  title="Google Support"
                  href="https://support.google.com/chrome/answer/95647?hl=fr"
                  target="_blank"
                  rel="noopener"
                  className="text-[#1d98ff]"
                >
                  https://support.google.com/chrome/answer/95647?hl=fr
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                D. IF YOU ARE USING SAFARI 14.0 :
              </h3>
              <p>
                <ol className="list-disc pl-5">
                  <li>
                    Choose Safari &gt; Preferences and click on “Security”.
                  </li>
                  <li>
                    In the “Accept Cookies” section, specify if and when Safari
                    should accept cookies from websites. To see an explanation
                    of the options, click on the help button (looks like a
                    question mark). If you have set Safari to block cookies, you
                    may need to temporarily accept cookies to open a page.
                    Repeat the above steps, selecting “Always”. When you are
                    finished with the page, disable cookies again and delete the
                    cookies from the page.
                  </li>
                </ol>
                For more information, visit
                <a
                  tabindex="0"
                  title="Apple Support"
                  href="https://support.apple.com/kb/ht1677?viewlocale=fr_FR"
                  target="_blank"
                  rel="noopener"
                  className="text-[#1d98ff]"
                >
                  http://support.apple.com/kb/ht1677?viewlocale=fr_FR
                </a>
                If you have a different type or version of browser, you are
                invited to consult the “Help” menu of your browser.
              </p>

              <p>
                The action resulting from the defect of conformity is prescribed
                by two years as from the delivery of the good.
              </p>
              <p>
                The action resulting from redhibitory defects must be brought by
                the purchaser within two years from the discovery of the defect
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
