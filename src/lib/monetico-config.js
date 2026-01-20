/**
 * Shared Monetico Configuration Utility
 * Ensures both initiate and response endpoints use identical configuration
 * 
 * Environment Variables:
 * 
 * For Immediate Payment (Paiement immédiat):
 * - MONETICO_TPE_IMMEDIATE: Terminal number (7 characters)
 * - MONETICO_SECRET_KEY_IMMEDIATE: Secret key (40 hexadecimal characters)
 * - MONETICO_COMPANY_IMMEDIATE: Company/merchant identifier
 * - MONETICO_ENVIRONMENT_IMMEDIATE: 'test' or 'production'
 * 
 * For Split Payment (Paiement fractionné):
 * - MONETICO_TPE_SPLIT: Terminal number (7 characters)
 * - MONETICO_SECRET_KEY_SPLIT: Secret key (40 hexadecimal characters)
 * - MONETICO_COMPANY_SPLIT: Company/merchant identifier
 * - MONETICO_ENVIRONMENT_SPLIT: 'test' or 'production'
 * 
 * Common:
 * - NEXT_PUBLIC_SITE_URL: React site URL (e.g., https://react.afs-foiling.com)
 *   ⚠️ CRITICAL: Must point to React site, NOT WordPress (e.g., NOT https://staging.afs-foiling.com)
 *   This is used for Monetico return URLs (urlOk, urlKo, urlResponse)
 *   Fallback: NEXT_PUBLIC_APP_URL if NEXT_PUBLIC_SITE_URL is not set
 * 
 * Legacy (fallback):
 * - MONETICO_TPE, MONETICO_SECRET_KEY, MONETICO_COMPANY, MONETICO_ENVIRONMENT
 */

/**
 * Get centralized Monetico configuration
 * @param {string|null} orderId - Order ID for URL generation
 * @param {string} paymentType - 'immediate' or 'split' (default: 'immediate')
 * @returns {Object} Monetico configuration object
 */
export function getMoneticoConfig(orderId = null, paymentType = 'immediate') {
    // Determine which environment variables to use based on payment type
    const isSplit = paymentType === 'split' || paymentType === 'x4';
    
    const config = {
        tpe: isSplit 
            ? (process.env.MONETICO_TPE_SPLIT || process.env.MONETICO_TPE)
            : (process.env.MONETICO_TPE_IMMEDIATE || process.env.MONETICO_TPE),
        key: isSplit
            ? (process.env.MONETICO_SECRET_KEY_SPLIT || process.env.MONETICO_SECRET_KEY)
            : (process.env.MONETICO_SECRET_KEY_IMMEDIATE || process.env.MONETICO_SECRET_KEY),
        company: isSplit
            ? (process.env.MONETICO_COMPANY_SPLIT || process.env.MONETICO_COMPANY)
            : (process.env.MONETICO_COMPANY_IMMEDIATE || process.env.MONETICO_COMPANY),
        environment: isSplit
            ? (process.env.MONETICO_ENVIRONMENT_SPLIT || process.env.MONETICO_ENVIRONMENT || 'test')
            : (process.env.MONETICO_ENVIRONMENT_IMMEDIATE || process.env.MONETICO_ENVIRONMENT || 'test')
    }
    
    // Log which configuration is being used
    if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Monetico Config: Using ${isSplit ? 'SPLIT' : 'IMMEDIATE'} payment configuration`, {
            paymentType,
            tpe: config.tpe,
            company: config.company,
            environment: config.environment,
            hasKey: !!config.key,
            keyLength: config.key ? config.key.length : 0
        });
    }

    // Add URL configuration
    // IMPORTANT: NEXT_PUBLIC_SITE_URL must point to the React site (e.g., https://react.afs-foiling.com)
    // NOT to WordPress (e.g., https://staging.afs-foiling.com)
    // Fallback to NEXT_PUBLIC_APP_URL if NEXT_PUBLIC_SITE_URL is not set
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL

    if (!baseUrl) {
        console.error('❌ Monetico: NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL must be set')
        throw new Error('NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL must be configured for Monetico return URLs')
    }

    // Validate that baseUrl points to React site, not WordPress
    if (baseUrl.includes('staging.afs-foiling.com') && !baseUrl.includes('react')) {
        console.warn('⚠️ Monetico: baseUrl appears to point to WordPress instead of React site')
        console.warn('   Current baseUrl:', baseUrl)
        console.warn('   Expected format: https://react.afs-foiling.com or similar')
    }

    config.urlOk = orderId
        ? `${baseUrl}/checkout/payment-success?order_id=${orderId}`
        : `${baseUrl}/checkout/payment-success`

    config.urlKo = orderId
        ? `${baseUrl}/checkout/payment-error?order_id=${orderId}`
        : `${baseUrl}/checkout/payment-error`

    config.urlResponse = `${baseUrl}/api/payments/monetico/response`

    // Log URLs for debugging (without sensitive data)
    if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Monetico URLs configured:', {
            baseUrl,
            urlOk: config.urlOk,
            urlKo: config.urlKo,
            urlResponse: config.urlResponse,
            orderId: orderId || 'none'
        })
    }

    return config
}

/**
 * Validate Monetico configuration
 * Performs comprehensive validation of all required fields and formats
 */
export function validateMoneticoConfig(config) {
    const requiredFields = ['tpe', 'key', 'company', 'urlOk', 'urlKo', 'urlResponse']

    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Missing required Monetico configuration: ${field}`)
        }
    }

    // Validate TPE format (should be 7 characters)
    if (config.tpe && config.tpe.length !== 7) {
        console.warn(`⚠️ Monetico TPE length is ${config.tpe.length}, expected 7 characters`)
        console.warn(`   Current TPE: ${config.tpe}`)
    }

    // Validate secret key format (should be 40 hexadecimal characters)
    if (config.key) {
        if (config.key.length !== 40) {
            console.error(`❌ Monetico secret key length is ${config.key.length}, expected 40 characters`)
            throw new Error(`Invalid Monetico secret key length: expected 40 hexadecimal characters, got ${config.key.length}`)
        }
        if (!/^[0-9A-Fa-f]+$/.test(config.key)) {
            console.error('❌ Monetico secret key is not hexadecimal')
            throw new Error('Invalid Monetico secret key format: must be 40 hexadecimal characters')
        }
    }

    // Validate environment
    if (config.environment && !['test', 'production'].includes(config.environment)) {
        throw new Error(`Invalid Monetico environment: ${config.environment}. Must be 'test' or 'production'`)
    }

    // Validate URLs point to React site, not WordPress
    const urlFields = ['urlOk', 'urlKo', 'urlResponse']
    for (const urlField of urlFields) {
        const url = config[urlField]
        if (url && url.includes('staging.afs-foiling.com') && !url.includes('react')) {
            console.warn(`⚠️ Monetico ${urlField} appears to point to WordPress: ${url}`)
            console.warn('   Expected: React site URL (e.g., https://react.afs-foiling.com)')
        }
    }

    return true
}

/**
 * Log configuration for debugging (without sensitive data)
 */
export function logMoneticoConfig(config, context = '') {
    console.log(`Monetico Config ${context}:`, {
        tpe: config.tpe,
        company: config.company,
        environment: config.environment,
        hasKey: !!config.key,
        keyLength: config.key ? config.key.length : 0,
        urlOk: config.urlOk,
        urlKo: config.urlKo,
        urlResponse: config.urlResponse
    })
}