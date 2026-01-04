import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    const defaultMessages = (await import(`../../locales/${locale}/default.json`)).default;
    const checkoutMessages = (await import(`../../locales/${locale}/checkout.json`)).default;
    const cartMessages = (await import(`../../locales/${locale}/cart.json`)).default;

    return {
        locale,
        messages: {
            ...defaultMessages,
            checkout: checkoutMessages.checkout || checkoutMessages,
            cart: cartMessages.cart || cartMessages,
        },
    }
});