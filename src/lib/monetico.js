import crypto from 'crypto'

/**
 * Monetico Payment Gateway Utility Library
 * Handles MAC generation, form data creation, and response verification
 */

class MoneticoPayment {
    constructor({
        tpe,           // Terminal number (provided by Monetico)
        key,           // Secret key (provided by Monetico) - must be 40 hex chars
        company,       // Company name
        urlOk,         // Success return URL
        urlKo,         // Error return URL
        urlResponse,   // Server response URL for confirmation
        version = '3.0',
        currency = 'EUR',
        environment = 'test' // 'test' or 'production'
    }) {
        this.tpe = tpe
        this.key = key
        this.company = company
        this.urlOk = urlOk
        this.urlKo = urlKo
        this.urlResponse = urlResponse
        this.version = version
        this.currency = currency
        this.environment = environment

        // Monetico URLs
        this.paymentUrls = {
            test: 'https://p.monetico-services.com/test/paiement.cgi',
            production: 'https://p.monetico-services.com/paiement.cgi'
        }

        // Validate secret key format on initialization
        console.log('🔑 Monetico Secret Key Validation:')
        console.log('  Length:', this.key ? this.key.length : 'undefined', '(expected: 40)')
        console.log('  Format:', this.key ? (this.key.match(/^[0-9A-Fa-f]+$/) ? 'hex ✓' : 'not hex ❌') : 'missing')
        console.log('  Sample:', this.key ? `${this.key.substring(0, 6)}...${this.key.substring(this.key.length - 6)}` : 'N/A')

        if (this.key && this.key.length !== 40) {
            console.error('❌ CRITICAL: Your Monetico secret key is not 40 characters!')
            console.error('   Current length:', this.key.length)
            console.error('   Required length: 40 hexadecimal characters')
            console.error('   Please check your Monetico merchant dashboard for the correct key')
        }
    }

    /**
     * Validate and convert hex key to binary (usable key)
     * The Monetico security key is represented externally by 40 hexadecimal characters
     * This must be converted into a string of 20 bytes (operational representation) prior to use
     */
    getUsableKey() {
        // Validate key format
        if (!this.key || typeof this.key !== 'string') {
            throw new Error('Monetico secret key is required and must be a string')
        }

        // Check if this is a proper 40-character hex key
        const hexRegex = /^[0-9A-Fa-f]{40}$/
        if (this.key.length === 40 && hexRegex.test(this.key)) {
            // Proper hex key - convert to binary
            console.log('✅ Using proper 40-character hex key format')
            return Buffer.from(this.key, 'hex')
        } else {
            // Legacy/incorrect format key - use as string but warn
            console.warn('⚠️  WARNING: Secret key is not in proper 40-character hex format!')
            console.warn('⚠️  Current format may not work correctly with Monetico.')
            console.warn('⚠️  Please get the correct 40-character hex key from your Monetico dashboard.')
            console.warn(`⚠️  Current key: ${this.key.length} chars, format: ${this.key.substring(0, 6)}...${this.key.substring(this.key.length - 6)}`)
            console.warn('⚠️  Using key as-is for backward compatibility - this may cause MAC verification failures.')

            // Use the key as-is for backward compatibility
            return this.key
        }
    }

    /**
     * Generate MAC (Message Authentication Code) for securing the payment request
     */
    generateMac(data) {
        // Convert data object to MAC string format
        const macString = this.createMacString(data)

        // CRITICAL: Convert hex key to binary before HMAC calculation
        const usableKey = this.getUsableKey()

        // Generate HMAC-SHA1 hash with binary key
        const hmac = crypto.createHmac('sha1', usableKey)
        hmac.update(macString, 'utf8')
        const hash = hmac.digest('hex').toLowerCase()

        console.log('Generated MAC:', hash)
        console.log('MAC first 6 chars:', hash.substring(0, 6))
        console.log('MAC last 6 chars:', hash.substring(hash.length - 6))
        console.log('💡 Expected from Monetico error: 6180d1...ee3cd7')
        console.log('💡 Key converted from hex to binary:', this.key.length, 'hex chars →', usableKey.length, 'bytes')

        return hash
    }

    /**
     * Create the MAC string from payment data
     * Field order MUST match Monetico's expected format exactly
     */
    createMacString(data) {
        // This is the exact field order that Monetico expects for MAC calculation
        const fields = [
            'TPE',
            'date',
            'lgue',
            'mail',
            'montant',
            'reference',
            'societe',
            'texte-libre',
            'url_retour',
            'url_retour_err',
            'url_retour_ok',
            'version'
        ]

        let macString = ''
        fields.forEach(field => {
            if (data[field] !== undefined && data[field] !== null) {
                macString += `${field}=${data[field]}*`
            }
        })

        // Remove the trailing asterisk
        macString = macString.slice(0, -1)

        console.log('MAC calculation string (payment):', macString)

        return macString
    }

    /**
     * Create MAC string for Monetico response verification
     * Response fields have a different structure than payment initiation
     */
    createResponseMacString(responseData) {
        const fields = [
            'TPE',
            'date',
            'montant',
            'reference',
            'texte-libre',
            'version',
            'code-retour'
        ]

        let macString = ''
        fields.forEach(field => {
            if (responseData[field] !== undefined && responseData[field] !== null) {
                // URL decode the value to match Monetico's MAC calculation
                const value = typeof responseData[field] === 'string'
                    ? decodeURIComponent(responseData[field])
                    : responseData[field]
                macString += `${field}=${value}*`
            }
        })

        // Remove the trailing asterisk
        macString = macString.slice(0, -1)

        return macString
    }

    /**
     * Create payment form data for Monetico
     */
    createPaymentData({
        amount,           // Amount in euros (string format like "19.99")
        reference,        // Order reference
        customerEmail,    // Customer email
        description = '', // Optional description
        customerData = {} // Additional customer data
    }) {
        // Format amount to have 2 decimal places
        const formattedAmount = parseFloat(amount).toFixed(2) + this.currency

        // Generate current date in dd/MM/yyyy:HH:mm:ss format
        const now = new Date()
        const date = this.formatDate(now)

        // Prepare payment data
        const paymentData = {
            'TPE': this.tpe,
            'date': date,
            'montant': formattedAmount,
            'reference': reference,
            'texte-libre': description,
            'version': this.version,
            'lgue': 'FR', // Language
            'societe': this.company,
            'mail': customerEmail,
            'url_retour_ok': this.urlOk,
            'url_retour_err': this.urlKo,
            'url_retour': this.urlResponse
        }

        console.log('Payment data before MAC generation:', paymentData)

        // Generate MAC
        const mac = this.generateMac(paymentData)
        paymentData['MAC'] = mac

        console.log('Final payment data with MAC:', {
            ...paymentData,
            MAC: `${mac.substring(0, 6)}****************************${mac.substring(mac.length - 6)}`
        })

        return {
            formData: paymentData,
            actionUrl: this.paymentUrls[this.environment]
        }
    }

    /**
     * Verify MAC from Monetico response
     */
    verifyResponseMac(responseData) {
        const receivedMac = responseData.MAC
        if (!receivedMac) {
            console.error('No MAC received in response data')
            return false
        }

        // Create a copy to avoid modifying original data
        const dataForMac = { ...responseData }
        delete dataForMac.MAC // Remove MAC from data before calculating

        // Use specialized response MAC string creation
        const macString = this.createResponseMacString(dataForMac)
        console.log('MAC calculation string:', macString)

        // CRITICAL: Use binary key for verification too
        const usableKey = this.getUsableKey()
        const hmac = crypto.createHmac('sha1', usableKey)
        hmac.update(macString, 'utf8')
        const calculatedMac = hmac.digest('hex').toLowerCase()

        console.log('Calculated MAC:', calculatedMac)
        console.log('Received MAC:', receivedMac.toLowerCase())
        console.log('MAC match:', receivedMac.toLowerCase() === calculatedMac)

        return receivedMac.toLowerCase() === calculatedMac
    }

    /**
     * Format date for Monetico (dd/MM/yyyy:HH:mm:ss)
     */
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${day}/${month}/${year}:${hours}:${minutes}:${seconds}`
    }

    /**
     * Parse Monetico response and extract payment details
     */
    parseResponse(responseData) {
        return {
            isSuccess: responseData.code_retour === 'payetest' || responseData.code_retour === 'paye',
            transactionId: responseData.reference,
            amount: responseData.montant,
            date: responseData.date,
            authorizationNumber: responseData.numero_autorisation,
            returnCode: responseData.code_retour,
            cvv: responseData.cvx,
            visa2: responseData.visa2,
            originCb: responseData.originecb,
            bincb: responseData.bincb,
            hpancb: responseData.hpancb,
            ipclient: responseData.ipclient,
            originetr: responseData.originetr,
            veres: responseData.veres,
            pares: responseData.pares
        }
    }

    /**
     * Create the response that should be sent back to Monetico
     * This confirms receipt of the payment notification
     */
    createConfirmationResponse(isValid = true) {
        return {
            status: isValid ? 'OK' : 'KO',
            response: isValid ?
                'version=2\ncdr=0\n' :
                'version=2\ncdr=1\n'
        }
    }
}

/**
 * Safely convert FormData to object while preserving Monetico field structure
 * This is critical for MAC verification as field encoding matters
 */
export function convertMoneticoFormData(formData) {
    const responseData = {}

    // Preserve order and handle special characters properly
    for (const [key, value] of formData.entries()) {
        // Store the value as-is, without additional encoding/decoding
        responseData[key] = value
    }

    return responseData
}

/**
 * Log Monetico response data for debugging
 */
export function logMoneticoResponse(responseData, context = 'Response') {
    console.log(`Monetico ${context} Data:`, {
        keys: Object.keys(responseData),
        MAC: responseData.MAC ? `${responseData.MAC.substring(0, 8)}...` : 'missing',
        TPE: responseData.TPE,
        date: responseData.date,
        montant: responseData.montant,
        reference: responseData.reference,
        'texte-libre': responseData['texte-libre'],
        version: responseData.version,
        'code-retour': responseData['code-retour']
    })
}

// Export singleton instances for different environments
export const createMoneticoClient = (config) => new MoneticoPayment(config)

export default MoneticoPayment