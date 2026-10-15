const getRazorpayConfig = () => {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
        throw new Error('Razorpay test credentials are not configured')
    }

    return { keyId, keySecret }
}

export const createRazorpayOrder = async ({ amount, currency, receipt }) => {
    const { keyId, keySecret } = getRazorpayConfig()
    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, currency, receipt })
    })

    const data = await response.json()

    if (!response.ok) {
        const message = data?.error?.description || 'Unable to create Razorpay order'
        throw new Error(message)
    }

    return data
}

export const getRazorpayKeyId = () => getRazorpayConfig().keyId
