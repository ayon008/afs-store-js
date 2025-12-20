import Link from "next/link";

const BreadCums = () => {
  return (
    <div className="mb-[20px] uppercase">
      <div className="text-sm font-bold text-[#999999]">
        <Link className="inline" href="/">
          Accueil
        </Link>
        / <span className="text-black">Conditions générales de vente</span>
      </div>
    </div>
  );
};

export default function Clinique() {
  return (
    <>
      {/* HERO */}
      <div className="global-padding pt-[20px] global-margin max-w-[1920px] mx-auto">
        <div>
          <BreadCums />

          <h1 className="global-h2 text-center py-[80px]">
            CONDITIONS GÉNÉRALES DE VENTE
          </h1>
        </div>
        {/*content */}
        <div className="text-[14px] font-semibold leading-[130%] space-y-[80px]">
          {/*sec-1 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              Préambule/Identité du vendeur
            </h2>
            <p>
              Les présentes Conditions Générales de Vente s’appliquent aux
              ventes réalisées par l’intermédiaire du site www.foilandco.com,
              conclues entre la société Foil and Co, Société par actions
              simplifiée au capital de 89.000 euros, immatriculée au RCS de
              Brest sous le n° 822 822 615, dont le siège social est situé ZA DE
              REUNVENGUEN 29450 LE TREHOU et tout acheteur consommateur
              disposant de sa pleine capacité juridique, ou tout acheteur non
              professionnel.
            </p>

            <p>
              Coordonnées du vendeur : Foil and co Siège social : ZA DE
              REUNVENGUEN 29450 LE TREHOU RCS :&nbsp;822&nbsp;822&nbsp;615 R.C.S
              Brest SIRET : 82282261500016 Tél : 02 98 19 29 03 Courriel :
              contact@foilandco.com Nous faisons tout notre possible pour vous
              satisfaire. Sur ce site, nous vous présentons l’ensemble des
              caractéristiques essentielles des produits. Nous serons attentifs
              aux remarques que vous nous transmettrez. Le client est tenu de se
              reporter au descriptif de chaque produit vendu sur le site afin
              d’en connaître les propriétés et les particularités essentielles.
              Le client reconnaît avoir eu communication, préalablement à la
              passation de sa commande, d’une manière lisible et compréhensible,
              des présentes Conditions Générales de Vente et de toutes les
              informations listées à l’article L. 221-5 du Code de la
              consommation et notamment les informations suivantes :
            </p>

            <ul className="list-disc pl-5">
              <li>
                LES INFORMATIONS PRÉVUES AUX ARTICLES&nbsp;
                <Link
                  href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006069565&amp;idArticle=LEGIARTI000032220903&amp;dateTexte=&amp;categorieLien=cid"
                  target="_blank"
                  rel="noopener"
                  className="text-[#1D98FF]"
                >
                  L. 111-1&nbsp;
                </Link>
                ET L. 111-2 (INCLUANT LES CARACTÉRISTIQUES ESSENTIELLES DES
                PRODUITS ET LEUR PRIX) ;
              </li>
              <li>
                LES CONDITIONS, LE DÉLAI ET LES MODALITÉS D’EXERCICE DU DROIT DE
                RÉTRACTATION AINSI QUE LE FORMULAIRE TYPE&nbsp;;
              </li>
              <li>
                LE FAIT QUE LE CLIENT SUPPORTE LES FRAIS DE RENVOI DU BIEN EN
                CAS DE RÉTRACTATION&nbsp;;
              </li>
              <li>
                LES INFORMATIONS RELATIVES AUX COORDONNÉES DU VENDEUR, AUX MODES
                DE RÈGLEMENT DES LITIGES.
              </li>
            </ul>

            <p>
              Les présentes conditions générales sont présentées en langue
              française. Les Conditions Générales de Vente peuvent faire l’objet
              de modifications ultérieures, la version applicable sera celle en
              vigueur sur le site à la date de passation de la commande par le
              client.
            </p>
          </div>
          {/*sec-2 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              I. Les différentes étapes à suivre pour la conclusion du contrat
              en ligne
            </h2>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Commande
              </h3>
              <p>
                Vous effectuez votre sélection en parcourant les pages de notre
                site. Vos sélections sont ajoutées dans votre panier lorsque
                vous cliquez sur ”ajouter ce produit au panier”. À tout moment
                de votre navigation sur notre site, vous pouvez valider votre
                commande en cliquant sur ”valider ma commande”. Vous pouvez
                également commander : Par téléphone au 02 98 19 29 03 depuis la
                France métropolitaine. Du lundi au vendredi de 9h à 18h.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Validation du contrat
              </h3>
              <p>
                Lorsque vous cliquez sur ”valider ma commande’’, un message de
                confirmation apparaît. Il récapitule l’ensemble des produits et
                options sélectionnés. Vous devez vérifier dans ce formulaire de
                commande l’ensemble des renseignements transmis, et notamment
                tous les éléments utiles à la livraison (adresse de livraison,
                digicode, téléphones…). Si vous n’avez pas à modifier le
                formulaire, vous devez alors prendre connaissance des présentes
                conditions. Si vous les acceptez, vous devez cocher la case «
                j’ai pris connaissance des conditions générales de vente et je
                les accepte sans réserve ». Toute commande implique
                l’acceptation des présentes. Pour poursuivre votre commande,
                vous devez cliquer sur ”payer ma commande”. Après paiement sur
                notre serveur sécurisé (voir ”paiement”), un accusé de réception
                s’affiche. Il confirme l’enregistrement de votre commande et
                vous informe qu’un message électronique de confirmation vous
                sera transmis dans les meilleurs délais.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                C. Les moyens techniques d’identification et de correction des
                erreurs
              </h3>
              <p>
                Vous disposez à tout moment de la faculté d’identifier et de
                corriger vos erreurs commises lors de la saisie de vos données.
                Lorsque vous vous apercevez d’une erreur postérieurement à la
                conclusion du contrat, vous devez nous contacter.
              </p>
            </div>
          </div>

          {/*sec-3 */}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              II. Les modalités d’archivage et d’accès au contrat
            </h2>
            <p>
              Nous réaliserons un archivage des contrats, bons de commandes et
              factures sur un support fiable et durable. Vous disposez d’un
              droit de communication de ces documents pour les commandes d’un
              montant supérieur ou égal à 120 €.
            </p>
          </div>

          {/*sec-4*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              III. Les garanties légales
            </h2>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Garanties légales
              </h3>
              <p>
                Les produits vendus sur le site sont conformes à la
                réglementation en vigueur en France et bénéficient de plein
                droit&nbsp;:
              </p>
              <ul className="list-disc pl-5">
                <li>
                  DE LA GARANTIE LÉGALE DE CONFORMITÉ, POUR LES PRODUITS
                  APPAREMMENT DÉFECTUEUX, ABÎMÉS OU ENDOMMAGÉS OU NE
                  CORRESPONDANT PAS À LA COMMANDE,
                </li>
                <li>
                  DE LA GARANTIE LÉGALE CONTRE LES VICES CACHÉS PROVENANT D’UN
                  DÉFAUT DE MATIÈRE, DE CONCEPTION OU DE FABRICATION AFFECTANT
                  LES PRODUITS LIVRÉS ET LES RENDANT IMPROPRES À L’UTILISATION.
                </li>
              </ul>
              <div>
                Dans le cadre de la garantie légale de conformité, le client
                consommateur&nbsp;: – Bénéficie d’un délai de deux ans à compter
                de la délivrance du bien pour agir à l’encontre du
                vendeur&nbsp;; – Peut choisir entre la réparation ou le
                remplacement du produit commandé, sous réserve des conditions de
                coût prévues par l’article&nbsp;L217-9 du Code de la
                consommation&nbsp;; – Est dispensé de rapporter la preuve de
                l’existence du défaut de conformité du produit durant les 24
                mois suivant la délivrance du produit. – La garantie légale de
                conformité s’applique indépendamment de la garantie commerciale
                pouvant éventuellement couvrir le produit. – Le client peut
                décider de mettre en œuvre la garantie contre les défauts cachés
                conformément à&nbsp;l’article 1641 du Code Civil&nbsp;; dans ce
                cas, il peut choisir entre la résolution de la vente ou une
                réduction du prix de vente conformément à&nbsp;1644 du Code
                Civil.
              </div>
              <p>
                Le vendeur remboursera, remplacera ou fera réparer les produits
                ou pièces sous garantie jugés non conformes ou défectueux.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Garanties légales
              </h3>
              <p>
                Les produits vendus sur le site sont conformes à la
                réglementation en vigueur en France et bénéficient de plein
                droit&nbsp;:
              </p>
              <ul className="list-disc pl-5">
                <li>
                  DE LA GARANTIE LÉGALE DE CONFORMITÉ, POUR LES PRODUITS
                  APPAREMMENT DÉFECTUEUX, ABÎMÉS OU ENDOMMAGÉS OU NE
                  CORRESPONDANT PAS À LA COMMANDE,
                </li>
                <li>
                  DE LA GARANTIE LÉGALE CONTRE LES VICES CACHÉS PROVENANT D’UN
                  DÉFAUT DE MATIÈRE, DE CONCEPTION OU DE FABRICATION AFFECTANT
                  LES PRODUITS LIVRÉS ET LES RENDANT IMPROPRES À L’UTILISATION.
                </li>
              </ul>
              <p>
                Dans le cadre de la garantie légale de conformité, le client
                consommateur&nbsp;: – Bénéficie d’un délai de deux ans à compter
                de la délivrance du bien pour agir à l’encontre du
                vendeur&nbsp;; – Peut choisir entre la réparation ou le
                remplacement du produit commandé, sous réserve des conditions de
                coût prévues par l’article&nbsp;L217-9 du Code de la
                consommation&nbsp;; – Est dispensé de rapporter la preuve de
                l’existence du défaut de conformité du produit durant les 24
                mois suivant la délivrance du produit. – La garantie légale de
                conformité s’applique indépendamment de la garantie commerciale
                pouvant éventuellement couvrir le produit. – Le client peut
                décider de mettre en œuvre la garantie contre les défauts cachés
                conformément à&nbsp;l’article 1641 du Code Civil&nbsp;; dans ce
                cas, il peut choisir entre la résolution de la vente ou une
                réduction du prix de vente conformément à&nbsp;1644 du Code
                Civil.
              </p>
              <p>
                Le vendeur remboursera, remplacera ou fera réparer les produits
                ou pièces sous garantie jugés non conformes ou défectueux.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Responsabilité
              </h3>
              <p>
                Nous faisons tout notre possible pour vous satisfaire. Nous
                sommes responsables de la bonne exécution des présentes
                Conditions Générales. Néanmoins notre responsabilité ne pourra
                être engagée du fait d’un cas fortuit, d’un cas de force
                majeure, du fait imprévisible et insurmontable d’un tiers au
                contrat ou du fait de la non-conformité du produit à une
                législation étrangère en cas de livraison dans un pays autre que
                la France, d’utilisation du produit à des fins professionnelles,
                de négligence ou défaut d’entretien de la part du client ou
                d’usure normale du produit.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                C. Les moyens techniques d’identification et de correction des
                erreurs
              </h3>
              <p>
                Vous disposez à tout moment de la faculté d’identifier et de
                corriger vos erreurs commises lors de la saisie de vos données.
                Lorsque vous vous apercevez d’une erreur postérieurement à la
                conclusion du contrat, vous devez nous contacter.
              </p>
            </div>
          </div>
          {/*sec-4*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              II. Les modalités d’archivage et d’accès au contrat
            </h2>
            <p>
              Nous réaliserons un archivage des contrats, bons de commandes et
              factures sur un support fiable et durable. Vous disposez d’un
              droit de communication de ces documents pour les commandes d’un
              montant supérieur ou égal à 120 €.
            </p>
          </div>

          {/*sec-5*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              III. Les garanties légales
            </h2>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Garanties légales
              </h3>
              <p>
                Les produits vendus sur le site sont conformes à la
                réglementation en vigueur en France et bénéficient de plein
                droit&nbsp;:
              </p>
              <ul className="list-disc pl-5">
                <li>
                  DE LA GARANTIE LÉGALE DE CONFORMITÉ, POUR LES PRODUITS
                  APPAREMMENT DÉFECTUEUX, ABÎMÉS OU ENDOMMAGÉS OU NE
                  CORRESPONDANT PAS À LA COMMANDE,
                </li>
                <li>
                  DE LA GARANTIE LÉGALE CONTRE LES VICES CACHÉS PROVENANT D’UN
                  DÉFAUT DE MATIÈRE, DE CONCEPTION OU DE FABRICATION AFFECTANT
                  LES PRODUITS LIVRÉS ET LES RENDANT IMPROPRES À L’UTILISATION.
                </li>
              </ul>
              <p>
                Dans le cadre de la garantie légale de conformité, le client
                consommateur&nbsp;: – Bénéficie d’un délai de deux ans à compter
                de la délivrance du bien pour agir à l’encontre du
                vendeur&nbsp;; – Peut choisir entre la réparation ou le
                remplacement du produit commandé, sous réserve des conditions de
                coût prévues par l’article&nbsp;L217-9 du Code de la
                consommation&nbsp;; – Est dispensé de rapporter la preuve de
                l’existence du défaut de conformité du produit durant les 24
                mois suivant la délivrance du produit. – La garantie légale de
                conformité s’applique indépendamment de la garantie commerciale
                pouvant éventuellement couvrir le produit. – Le client peut
                décider de mettre en œuvre la garantie contre les défauts cachés
                conformément à&nbsp;l’article 1641 du Code Civil&nbsp;; dans ce
                cas, il peut choisir entre la résolution de la vente ou une
                réduction du prix de vente conformément à&nbsp;1644 du Code
                Civil.
              </p>
              <p>
                Le vendeur remboursera, remplacera ou fera réparer les produits
                ou pièces sous garantie jugés non conformes ou défectueux.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Responsabilité
              </h3>
              <p>
                Nous faisons tout notre possible pour vous satisfaire. Nous
                sommes responsables de la bonne exécution des présentes
                Conditions Générales. Néanmoins notre responsabilité ne pourra
                être engagée du fait d’un cas fortuit, d’un cas de force
                majeure, du fait imprévisible et insurmontable d’un tiers au
                contrat ou du fait de la non-conformité du produit à une
                législation étrangère en cas de livraison dans un pays autre que
                la France, d’utilisation du produit à des fins professionnelles,
                de négligence ou défaut d’entretien de la part du client ou
                d’usure normale du produit.
              </p>
            </div>
          </div>

          {/*sec-6*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              IV. Les délais, frais et modalités de livraison
            </h2>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Modalités de livraison
              </h3>
              <p>
                Nous vous livrerons les produits à l’adresse indiquée dans le
                formulaire de commande.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Délai de livraison
              </h3>
              <p>
                Nous vous livrerons au plus tard à la date indiquée dans le
                message de confirmation de votre commande. En cas de retard dans
                la livraison, nous vous en informerons par courrier électronique
                dans les meilleurs délais et nous vous proposerons une nouvelle
                date. Conformément à l’article L. 216-2 du code de la
                consommation, en cas de manquement à son obligation de livraison
                à l’expiration du délai de livraison indiqué ou, à défaut, au
                plus tard trente jours après la commande, le client peut
                résoudre sa commande, par lettre recommandée avec demande d’avis
                de réception ou par un écrit sur un autre support durable, si,
                après avoir enjoint, selon les mêmes modalités, le vendeur
                d’effectuer la livraison dans un délai supplémentaire
                raisonnable, ce dernier ne s’est pas exécuté dans ce délai. En
                cas de résolution de la commande, le vendeur remboursera le
                client des sommes versées, au plus tard dans les quatorze jours
                qui suivent la date de dénonciation de la commande, à
                l’exclusion de toute indemnisation supplémentaire.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                C. Frais de livraison
              </h3>
              <p>
                Les frais de port pour toute commande livrable sont calculés
                dans votre panier d’achat.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                D. Le suivi de la livraison
              </h3>
              <p>
                Vous pouvez nous contacter par téléphone pour toute question
                relative à votre livraison
              </p>
            </div>
          </div>

          {/*sec-7*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              V. Le prix
            </h2>
            <p>
              Les prix de nos produits sont indiqués en euros toutes taxes
              comprises (TVA française et autres taxes applicables). Ils
              comprennent notamment les frais de traitement de votre commande.
              Si vous demandez une livraison hors du territoire français, votre
              commande pourra être soumise à des taxes éventuelles et à des
              droits de douane lorsqu’elle arrivera à destination. Le paiement
              de ces droits et de ces taxes relèvent de votre responsabilité et
              nous vous invitons à vous renseigner auprès des autorités
              compétentes de votre pays. Vous devez également vérifier les
              possibilités d’importation ou d’utilisation des produits que vous
              nous commandez dans le pays de destination.
            </p>
          </div>

          {/*sec-8*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VI. Les modalités de paiement et les moyens de sécurisation
            </h2>
            <p>
              Nous encaissons votre paiement à la conclusion du contrat en
              ligne.
            </p>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                A. Moyens de paiement
              </h3>
              <p>
                Vous disposez de plusieurs moyens de paiement pour régler vos
                achats sur Foil and co : – Soit par cartes bancaires : Visa,
                Mastercard, Carte bleue. Le paiement s’effectue sur le serveur
                bancaire sécurisé de notre partenaire Crédit Mutuel de Bretagne.
                Ceci implique qu’aucune information bancaire vous concernant ne
                transite via notre site. Le paiement par carte bancaire est donc
                parfaitement sécurisé ; votre commande sera ainsi enregistrée et
                validée dès l’acceptation du paiement par la banque que vous
                aurez choisie. – Soit par PayPal : Avec PayPal vos informations
                financières ne sont jamais communiquées à Foil and co. En effet,
                PayPal crypte et protège votre numéro de carte. Payez en ligne
                en indiquant simplement votre adresse électronique et votre mot
                de passe. Ceci implique l’acceptation par le client des
                conditions d’utilisation de PayPal.
              </p>
            </div>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                B. Sécurité
              </h3>
              <p>
                Les paiements via notre site font l’objet d´un système de
                sécurisation.&nbsp;
                <a className="text-[#1D98FF]">
                  Nous avons adopté le protocole SSL (Secure Socket Layer) pour
                  crypter les coordonnées de cartes de crédit
                </a>
                . Pour vous protéger contre une éventuelle intrusion, nous ne
                stockons pas les numéros de carte bancaire sur nos serveurs
                informatiques. Les numéros de carte bancaire sont traités par le
                Crédit Mutuel de Bretagne&nbsp;qui nous retourne un numéro
                d´autorisation.
              </p>
            </div>
          </div>

          {/*sec-9*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VII. Modalités d’exercice du droit de rétractation
            </h2>
            <p>
              Conformément aux dispositions légales, dans les 14 jours qui
              suivent la réception de votre produit, vous pouvez exercer votre
              droit de rétractation. Vous n’avez pas à justifier de motifs ni à
              payer de pénalité. A l’exception des frais de retour, qui restent
              à votre charge, nous vous rembourserons la totalité des sommes
              versés au plus tard dans les&nbsp;<a>14 jour</a>s qui suivent
              votre rétractation. Le produit devra être retourné complet et dans
              l’état d’origine. Conformément aux dispositions légales, le droit
              de rétractation ne peut être exercé pour des produits&nbsp;
              <a className="text-[#1D98FF]">
                confectionnés sur commande, selon les spécifications
                particulières du consommateur
              </a>
              . Le droit de rétractation peut être exercé en ligne, en nous
              envoyant un mail à contact@foilandco.com, auquel cas un accusé de
              réception sur un support durable sera immédiatement communiqué au
              client par le vendeur, ou de toute autre déclaration, dénuée
              d’ambiguïté, exprimant la volonté du client de se rétracter.
            </p>
          </div>

          {/*sec-10*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              VIII. Durée du contrat et validité du prix
            </h2>
            <p>
              Les prix tiennent compte de la T.V.A. applicable au jour de la
              commande et tout changement du taux applicable de T.V.A. sera
              automatiquement répercuté sur le prix des produits en vente sur
              Foil and co. Les produits demeurent l’entière propriété d’Foil and
              co jusqu’au complet encaissement du prix par Foil and co. Nos
              offres de prix ne sont valables que dans la double limite de la
              durée de validité de l’offre concernée et des stocks disponibles.
              Nos offres de biens et de prix sont valables s’ils figurent en
              ligne sur le site au jour de la commande.
            </p>
          </div>

          {/*sec-11*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              IX. Service après vente
            </h2>
            <p>
              Si vous souhaitez nous contacter, notre service clientèle est à
              votre disposition. Pour une information sur nos offres ou pour
              passer une commande : par téléphone au 02 98 34 89 38 depuis la
              France métropolitaine. Du lundi au vendredi de 9h à 18h. Pour
              suivre l’exécution d’une commande, pour exercer son droit de
              rétractation ou pour faire jouer la garantie : nous mettons à
              votre disposition un numéro de téléphone indiqué dans votre
              courrier électronique de confirmation de commande.
            </p>
          </div>

          {/*sec-12*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              X. Propriété intellectuelle
            </h2>
            <p>
              Tous les éléments du site shop.foilandco.com, qu’ils soient&nbsp;
              <a className="text-[#1D98FF]">visuels o</a>u sonores, y compris la
              technologie sous-jacente, sont protégés par le droit d’auteur, des
              marques ou des brevets. Ils sont la propriété exclusive d’Foil and
              co ou de leurs propriétaires respectifs. Tout lien hypertexte
              renvoyant au site shop.foilandco.com&nbsp;et utilisant notamment
              la technique du framing, du&nbsp;<em>deep-linking</em>, du&nbsp;
              <em>in-line linking</em>&nbsp;ou toute autre technique de lien
              profond est en tout état de cause formellement interdit. Dans tous
              les cas, tout lien, même tacitement autorisé, devra être retiré
              sur simple demande.
            </p>
          </div>

          {/*sec-13*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              XI. Informations nominatives
            </h2>
            <p>
              Nous collectons vos informations nominatives pour la gestion de
              vos commandes et le suivi de nos relations commerciales. Elles
              peuvent être retransmises à nos partenaires exclusivement pour
              l’exécution de vos commandes, conformément aux présentes
              Conditions Générales. Conformément à la loi informatique et
              libertés du 6 janvier 1978, vous disposez d’un droit d’accès, de
              suppression, de rectification et d’opposition aux données
              personnelles vous concernant. Il vous suffit de nous écrire en
              ligne à Service clientèle ou par courrier, en nous indiquant vos
              nom, prénom, adresse électronique, adresse et si possible votre
              référence client.
            </p>
          </div>

          {/*sec-14*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              XII. Preuve des transactions
            </h2>
            <p>
              Sauf preuve contraire, les données enregistrées dans le système
              informatique du vendeur constituent la preuve de l’ensemble des
              transactions conclues avec le client.
            </p>
          </div>

          {/*sec-15*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              XIII. Force majeure
            </h2>
            <p>
              Les parties ne pourront être tenues pour responsables si la
              non-exécution ou le retard dans l’exécution de l’une quelconque de
              leurs obligations, telles que décrites aux présentes découle d’un
              cas de force majeure, tel que défini à l’article 1218 du Code
              civil.
            </p>
          </div>

          {/*sec-15*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              XIV. Droit applicable, juridiction compétente et médiation
            </h2>
            <p>
              Les présentes Conditions Générales de Vente et les opérations qui
              en découlent sont régies et soumises au droit français. Tous les
              litiges auxquels les opérations de vente conclues en application
              des présentes Conditions pourraient donner lieu, concernant tant
              leur validité, leur interprétation, leur exécution, leur
              résiliation, leurs conséquences et leurs suites et qui n’auraient
              pu être résolues entre Foil and co et le client seront soumis aux
              tribunaux compétents dans les conditions de droit commun.
              Conformément à l’article L. 612-1 du code de la consommation, le
              Client est informé qu’il peut en tout état de cause recourir à une
              médiation conventionnelle, notamment auprès de la Commission de la
              médiation de la consommation ou auprès des instances de médiation
              sectorielles existantes, et dont les références figurent sur le
              site ou à tout mode alternatif de règlement des différends
              (conciliation, par exemple) en cas de contestation.
            </p>
          </div>

          {/*sec-15*/}
          <div className="flex flex-col gap-[20] md:gap-[28px]">
            <h2 className="text-[28px] text-[#111)] font-bold leading-[1]">
              Annexe 1 : Dispositions du Code de la consommation concernant la
              garantie légale de conformité
            </h2>
            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                Article L. 217-4 du Code de la consommation
              </h3>
              <p>
                Le vendeur livre un bien conforme au contrat et répond des
                défauts de conformité existant lors de la délivrance. Il répond
                également des défauts de conformité résultant de l’emballage,
                des instructions de montage ou de l’installation lorsque
                celle-ci a été mise à sa charge par le contrat ou a été réalisée
                sous sa responsabilité.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                Article L. 217-5 du Code de la consommation
              </h3>
              <p>
                Le bien est conforme au contrat : 1° S’il est propre à l’usage
                habituellement attendu d’un bien semblable et, le cas échéant :
                – s’il correspond à la description donnée par le vendeur et
                possède les qualités que celui-ci a présentées à l’acheteur sous
                forme d’échantillon ou de modèle ; – s’il présente les qualités
                qu’un acheteur peut légitimement attendre eu égard aux
                déclarations publiques faites par le vendeur, par le producteur
                ou par son représentant, notamment dans la publicité ou
                l’étiquetage ; 2° Ou s’il présente les caractéristiques définies
                d’un commun accord par les parties ou est propre à tout usage
                spécial recherché par l’acheteur, porté à la connaissance du
                vendeur et que ce dernier a accepté.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                Article L. 217-12 du Code de la consommation
              </h3>
              <p>
                L’action résultant du défaut de conformité se prescrit par deux
                ans à compter de la délivrance du bien.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                Article L. 217-16 du Code de la consommation
              </h3>
              <p>
                Lorsque l’acheteur demande au vendeur, pendant le cours de la
                garantie commerciale qui lui a été consentie lors de
                l’acquisition ou de la réparation d’un bien meuble, une remise
                en état couverte par la garantie, toute période d’immobilisation
                d’au moins sept jours vient s’ajouter à la durée de la garantie
                qui restait à courir. Cette période court à compter de la
                demande d’intervention de l’acheteur ou de la mise à disposition
                pour réparation du bien en cause, si cette mise à disposition
                est postérieure à la demande d’intervention.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                Article 1641 du Code civil
              </h3>
              <p>
                Le vendeur est tenu de la garantie à raison des défauts cachés
                de la chose vendue qui la rendent impropre à l’usage auquel on
                la destine, ou qui diminuent tellement cet usage que l’acheteur
                ne l’aurait pas acquise, ou n’en aurait donné qu’un moindre
                prix, s’il les avait connus.
              </p>
            </div>

            <div className="flex flex-col gap-[20] md:gap-[20px]">
              <h3 className="text-[20px] text-[#111)] font-bold leading-[1]">
                Article 1648 alinéa 1er du Code civil
              </h3>
              <p>
                L’action résultant des vices rédhibitoires doit être intentée
                par l’acquéreur dans un délai de deux ans à compter de la
                découverte du vice
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
