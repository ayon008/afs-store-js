import { getMoneticoConfig } from '@/lib/monetico-config';
import MoneticoPayment, { convertMoneticoFormData, logMoneticoResponse } from '@/lib/monetico';
import { getLocaleValue } from '@/app/actions/Woo-Coommerce/getWooCommerce';

const WP_BASE_URL = process.env.WP_BASE_URL || 'https://staging.afs-foiling.com/fr';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getAuthHeader() {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured');
  }
  const token = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

/**
 * Route CGI2 Monetico pour gérer les notifications de paiement fractionné et immédiat
 * Accessible via: /fr/wc-api/wc_gateway_monetico
 * Compatible avec les plugins WooCommerce Monetico
 */
export async function POST(req) {
  const localeValue = await getLocaleValue();
  let orderId = null;
  
  try {
    // Recevoir les données CGI2 de Monetico (format form-data)
    const formData = await req.formData();
    const responseData = convertMoneticoFormData(formData);

    logMoneticoResponse(responseData, 'CGI2 Confirmation');

    // Extraire l'ID de commande depuis la référence
    orderId = responseData.reference;
    
    if (!orderId) {
      console.error('[CGI2 Monetico] Réponse sans référence de commande');
      return new Response('version=2\ncdr=1\n', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Détecter le type de paiement (fractionné vs immédiat) via le TPE
    const receivedTpe = responseData.TPE;
    const immediateTpe = process.env.MONETICO_TPE_IMMEDIATE || process.env.MONETICO_TPE;
    const splitTpe = process.env.MONETICO_TPE_SPLIT;
    
    // Déterminer le type de paiement basé sur le TPE reçu
    let paymentType = 'immediate'; // par défaut
    if (splitTpe && receivedTpe === splitTpe) {
      paymentType = 'split';
    } else if (immediateTpe && receivedTpe === immediateTpe) {
      paymentType = 'immediate';
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [CGI2 Monetico] Type de paiement détecté', {
        receivedTpe,
        immediateTpe,
        splitTpe,
        paymentType,
        orderId
      });
    }
    
    // Obtenir la configuration Monetico appropriée selon le type de paiement
    const config = getMoneticoConfig(orderId, paymentType);
    const monetico = new MoneticoPayment(config);

    // Vérifier le MAC (Message Authentication Code)
    const isValid = monetico.verifyResponseMac(responseData);

    if (!isValid) {
      console.error('[CGI2 Monetico] MAC invalide reçu de Monetico pour la commande:', orderId);
      
      // Essayer de mettre à jour le statut de la commande même si le MAC est invalide
      // Cela aide à suivre les commandes qui ont échoué la validation
      try {
        const baseUrl = WP_BASE_URL.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;
        const url = new URL(apiUrl);
        url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
        url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

        await fetch(url.toString(), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            status: 'failed',
            customer_note: 'Paiement Monetico échoué - MAC invalide (CGI2)'
          }),
          cache: 'no-store',
        });
      } catch (updateError) {
        console.error('[CGI2 Monetico] Échec de la mise à jour du statut après échec de validation MAC:', updateError);
      }
      
      // Retourner une réponse CGI2 d'échec
      const confirmation = monetico.createConfirmationResponse(false);
      return new Response(confirmation.response, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Parser la réponse Monetico pour extraire les détails
    const details = monetico.parseResponse(responseData);

    // Construire l'URL de l'API WooCommerce
    const baseUrl = WP_BASE_URL.replace(/\/$/, '');
    const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;
    const url = new URL(apiUrl);
    url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
    url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

    if (details.isSuccess) {
      // Mettre à jour la commande dans WooCommerce - Paiement réussi
      console.log(`[CGI2 Monetico] Paiement réussi pour la commande ${orderId}, type: ${paymentType}`);
      
      await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          status: 'processing',
          set_paid: true,
          transaction_id: details.transactionId,
          customer_note: `Paiement Monetico réussi (CGI2). Type: ${paymentType === 'split' ? 'Fractionné' : 'Immédiat'}. Autorisation: ${details.authorizationNumber || 'N/A'}`
        }),
        cache: 'no-store',
      });
    } else {
      // Marquer comme échoué
      console.log(`[CGI2 Monetico] Paiement échoué pour la commande ${orderId}, code: ${details.returnCode}`);
      
      const updateResponse = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          status: 'failed',
          customer_note: `Paiement Monetico échoué (CGI2). Code: ${details.returnCode}`
        }),
        cache: 'no-store',
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`[CGI2 Monetico] Échec de la mise à jour de la commande ${orderId} au statut échoué:`, errorText);
      } else {
        console.log(`[CGI2 Monetico] Commande ${orderId} mise à jour avec succès au statut échoué`);
      }
    }

    // Retourner la réponse CGI2 de confirmation
    const confirmation = monetico.createConfirmationResponse(true);
    return new Response(confirmation.response, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('[CGI2 Monetico] Erreur lors du traitement de la réponse:', error);
    
    // Si nous avons un orderId depuis plus tôt dans la fonction, essayer de le mettre à jour au statut échoué
    if (orderId) {
      try {
        const baseUrl = WP_BASE_URL.replace(/\/$/, '');
        const apiUrl = `${baseUrl}/${localeValue}/wp-json/wc/v3/orders/${orderId}`;
        const url = new URL(apiUrl);
        url.searchParams.set('consumer_key', WC_CONSUMER_KEY);
        url.searchParams.set('consumer_secret', WC_CONSUMER_SECRET);

        const updateResponse = await fetch(url.toString(), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            status: 'failed',
            customer_note: `Erreur lors du traitement de la réponse Monetico CGI2: ${error.message || 'Erreur inconnue'}`
          }),
          cache: 'no-store',
        });
        
        if (updateResponse.ok) {
          console.log(`[CGI2 Monetico] Commande ${orderId} mise à jour à échoué en raison d'une erreur de traitement`);
        } else {
          const errorText = await updateResponse.text();
          console.error(`[CGI2 Monetico] Échec de la mise à jour de la commande ${orderId} à échoué:`, errorText);
        }
      } catch (updateError) {
        console.error('[CGI2 Monetico] Échec de la mise à jour du statut après erreur de réponse Monetico:', updateError);
      }
    } else {
      console.warn('[CGI2 Monetico] Aucun orderId disponible pour mettre à jour le statut');
    }
    
    // Retourner toujours une réponse CGI2 valide même en cas d'erreur
    return new Response('version=2\ncdr=1\n', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
