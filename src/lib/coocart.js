const COCART_API_URL = process.env.NEXT_PUBLIC_COCART_URL;


export const getCartKey = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('cocart_cart_key') || '';
    }
    return '';
};

export const setCartKey = (key) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('cocart_cart_key', key);
    }
};

export const getCart = async (cartKey = '') => {
    const key = cartKey || getCartKey();
    const url = key ? `${COCART_API_URL}/cart?cart_key=${key}` : `${COCART_API_URL}/cart`;

    const response = await fetch(url);
    const data = await response.json();

    // Save cart key if returned
    if (data.cart_key) {
        setCartKey(data.cart_key);
    }

    return data;
};