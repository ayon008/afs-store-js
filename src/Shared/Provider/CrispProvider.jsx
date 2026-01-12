"use client";

import { Crisp } from "crisp-sdk-web";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "./AuthProvider";
import { useLocale } from "next-intl";

export default function CrispProvider({ children }) {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const locale = useLocale();
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  const isConfigured = useRef(false);

  // Configuration initiale de Crisp (une seule fois)
  useEffect(() => {
    if (isConfigured.current || !websiteId) {
      if (!websiteId) {
        console.warn(
          "[Crisp] NEXT_PUBLIC_CRISP_WEBSITE_ID n'est pas configuré dans les variables d'environnement"
        );
      }
      return;
    }

    // Configurer Crisp avec la locale
    Crisp.configure(websiteId, {
      locale: locale === "fr" ? "fr" : "en",
      autoload: true,
    });

    isConfigured.current = true;
  }, [websiteId, locale]);

  // Mettre à jour la locale si elle change
  useEffect(() => {
    if (isConfigured.current && websiteId) {
      // Note: Crisp ne permet pas de changer la locale après configuration
      // La locale est définie lors de la configuration initiale
    }
  }, [locale, websiteId]);

  // Mettre à jour les informations utilisateur si elles changent
  useEffect(() => {
    if (isConfigured.current && websiteId) {
      if (user) {
        if (user.email) {
          Crisp.user.setEmail(user.email);
        }
        if (user.display_name || user.name) {
          Crisp.user.setNickname(user.display_name || user.name);
        }
      }
    }
  }, [user, websiteId]);

  return <>{children}</>;
}
