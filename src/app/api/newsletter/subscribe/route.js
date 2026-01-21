import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { getSelectedCountry } from "@/app/actions/Woo-Coommerce/getWooCommerce";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validation de l'email
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Récupération de la locale et du pays
        const locale = await getLocale(); // Retourne 'fr' ou 'en'
        const country = await getSelectedCountry();

        // Vérification de la variable d'environnement
        const webhookUrl = process.env.N8N_WEBHOOK_EMAILING;
        if (!webhookUrl) {
            console.error('[Newsletter] N8N_WEBHOOK_EMAILING environment variable is not set');
            return NextResponse.json(
                { success: false, error: "Newsletter service is not configured" },
                { status: 500 }
            );
        }

        // Préparation des données pour le webhook N8N
        const payload = {
            email: email.trim().toLowerCase(),
            language: locale || 'en', // Fallback sur 'en' si locale non disponible
            country: country || (locale === 'fr' ? 'FR' : 'US') // Fallback basé sur la locale
        };

        // Envoi vers le webhook N8N
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Newsletter] N8N webhook error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            return NextResponse.json(
                { success: false, error: "Failed to subscribe to newsletter" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Successfully subscribed to newsletter"
        });

    } catch (error) {
        console.error('[Newsletter] Error subscribing:', error);
        return NextResponse.json(
            { success: false, error: "An error occurred while subscribing" },
            { status: 500 }
        );
    }
}
