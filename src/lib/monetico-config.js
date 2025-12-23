/**
 * Shared Monetico Configuration Utility
 * Ensures both initiate and response endpoints use identical configuration
 */

/**
 * Get centralized Monetico configuration
 * This ensures both payment initiation and response handling use the same configuration
 */
export function getMoneticoConfig(orderId = null) {
    const config = {
        tpe: process.env.MONETICO_TPE,
        key: process.env.MONETICO_SECRET_KEY,
        company: process.env.MONETICO_COMPANY,
        environment: process.env.MONETICO_ENVIRONMENT || 'test'
    }

    // Add URL configuration
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    config.urlOk = orderId
        ? `${baseUrl}/checkout/payment-success?order_id=${orderId}`
        : `${baseUrl}/checkout/payment-success`

    config.urlKo = orderId
        ? `${baseUrl}/checkout/payment-error?order_id=${orderId}`
        : `${baseUrl}/checkout/payment-error`

    config.urlResponse = `${baseUrl}/api/payments/monetico/response`

    return config
}

/**
 * Validate Monetico configuration
 */
export function validateMoneticoConfig(config) {
    const requiredFields = ['tpe', 'key', 'company', 'urlOk', 'urlKo', 'urlResponse']

    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Missing required Monetico configuration: ${field}`)
        }
    }

    // Validate environment
    if (config.environment && !['test', 'production'].includes(config.environment)) {
        throw new Error(`Invalid Monetico environment: ${config.environment}`)
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