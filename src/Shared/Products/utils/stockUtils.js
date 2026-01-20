export const WAREHOUSES = {
    EUROPE: 2682,
    USA: 2683
};

/**
 * Determines stock status for a specific location based on WCMLIM meta data.
 *
 * @param {Object} product - The product or variation object
 * @param {number|string} locationId - The location ID (2682 for EU, 2683 for US)
 * @returns {Object} status - { isInStock, stockQuantity, backordersAllowed, message }
 */
export const getStockStatusForLocation = (product, locationId) => {
    if (!product || !locationId) {
        return { isInStock: false, stockQuantity: 0, backordersAllowed: false };
    }

    const locId = parseInt(locationId);


    // 1. Get stock level for location from meta_data
    // Meta keys are typically "wcmlim_stock_at_{id}" (sometimes with underscore prefix in DB, but API usually exposes it clean or as matches)
    // We check both "_wcmlim_stock_at_..." and "wcmlim_stock_at_..." just in case.
    const stockMetaKey = `wcmlim_stock_at_${locId}`;
    const stockMetaKeyUnderscore = `_wcmlim_stock_at_${locId}`; // DB format often exposed as well

    const findMeta = (key) => product.meta_data?.find(m => m.key === key)?.value;

    // Check various places where meta might be stored
    let stockValue = findMeta(stockMetaKey) ?? findMeta(stockMetaKeyUnderscore);

    // If not found in meta_data, it might be in top-level props if customized (unlikely but safe)
    if (stockValue === undefined && product[stockMetaKey]) stockValue = product[stockMetaKey];

    const stockQuantity = stockValue !== undefined && stockValue !== null && stockValue !== '' ? parseInt(stockValue) : 0;

    // 2. Check Backorders
    // Strict WCMLIM logic: Only check location specific backorder.
    // Do NOT fallback to standard WC backorders (as per user request).

    let backordersAllowed = false;

    const backorderLocKey = `wcmlim_allow_backorder_at_${locId}`;
    let backorderMeta = findMeta(backorderLocKey) ?? findMeta(`_${backorderLocKey}`);

    if (backorderMeta) {
        // specific string 'Yes' or 'yes'
        const val = backorderMeta.toString().toLowerCase();
        if (val === 'yes') {
            backordersAllowed = true;
        }
    }
    // If "No" or missing, backordersAllowed remains false.
    // No fallback to global settings.

    // 3. Determine "In Stock"
    // In stock if quantity > 0 OR backorders are allowed
    const isInStock = stockQuantity > 0 || backordersAllowed;

    return {
        isInStock,
        stockQuantity,
        backordersAllowed
    };
};

/**
 * Gets the display message for the stock status based on location rules.
 *
 * @param {Object} product - The product or variation object
 * @param {number|string} locationId - The location ID
 * @returns {string|null} - The message to display or null
 */
export const getStockDisplayMessage = (product, locationId) => {
    if (!product || !locationId) return null;

    const locId = parseInt(locationId);
    const acf = product.acf || {};

    // Rule:
    // If Location = 2683 (America) -> use acf.stock_for_usa
    // If Location = 2682 (Europe) -> use acf.date_de_livraison_estimee_from_dolibarr

    if (locId === WAREHOUSES.USA) {
        return acf.stock_for_usa || null;
    } else if (locId === WAREHOUSES.EUROPE) {
        return acf.date_de_livraison_estimee_from_dolibarr || null;
    }

    return null;
};
