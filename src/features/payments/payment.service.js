const paymentRepository = require('./payment.repository');
const crypto = require('crypto');

// Mock Razorpay instance - In production, use actual Razorpay SDK
const mockRazorpay = {
    orders: {
        create: async (options) => {
            return {
                id: `order_${generateRandomId()}`,
                entity: 'order',
                amount: options.amount,
                amount_paid: 0,
                amount_due: options.amount,
                currency: options.currency,
                receipt: options.receipt,
                status: 'created',
                attempts: 0,
                notes: options.notes || {},
                created_at: Math.floor(Date.now() / 1000)
            };
        }
    }
};

async function createRazorpayOrder(data) {
    const { userId, amount, currency, receipt, notes } = data;
    
    // Create Razorpay order
    const razorpayOrder = await mockRazorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {}
    });
    
    // Calculate expiry (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Store order in database
    const order = await paymentRepository.createRazorpayOrder({
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        currency,
        receipt: razorpayOrder.receipt,
        expiresAt,
        status: 'created'
    });
    
    return {
        order_id: order.order_id,
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
    };
}

async function verifyPayment(data) {
    const { userId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;
    
    // Verify signature
    const isValidSignature = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    );
    
    if (!isValidSignature) {
        throw new Error('Invalid payment signature');
    }
    
    // Get the order from database
    const order = await paymentRepository.getRazorpayOrderByRazorpayId(razorpayOrderId);
    if (!order) {
        throw new Error('Order not found');
    }
    
    if (order.user_id !== userId) {
        throw new Error('Unauthorized access to order');
    }
    
    // Create payment record
    const payment = await paymentRepository.createPayment({
        userId,
        razorpayOrderId: order.order_id,
        razorpayPaymentId,
        razorpaySignature,
        amount: order.amount,
        status: 'success',
        method: 'razorpay'
    });
    
    // Update order status
    await paymentRepository.updateRazorpayOrderStatus(order.order_id, 'paid');
    
    return payment;
}

async function handleWebhook(body, signature) {
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
    }
    
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');
    
    if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
    }
    
    const { event, payload } = body;
    
    // Handle different webhook events
    switch (event) {
        case 'payment.captured':
            await handlePaymentCaptured(payload.payment.entity);
            break;
        case 'payment.failed':
            await handlePaymentFailed(payload.payment.entity);
            break;
        case 'order.paid':
            await handleOrderPaid(payload.order.entity);
            break;
        default:
            console.log(`Unhandled webhook event: ${event}`);
    }
    
    return { event, processed: true };
}

async function getUserPayments(data) {
    const { userId, page, limit, status } = data;
    return await paymentRepository.getUserPayments(userId, { page, limit, status });
}

// Helper functions
function verifyRazorpaySignature(orderId, paymentId, signature) {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    
    return signature === expectedSignature;
}

function generateRandomId() {
    return crypto.randomBytes(12).toString('hex');
}

async function handlePaymentCaptured(paymentEntity) {
    // Update payment status to captured
    const orderId = paymentEntity.order_id;
    await paymentRepository.updatePaymentStatusByRazorpayOrderId(orderId, 'success');
}

async function handlePaymentFailed(paymentEntity) {
    // Update payment status to failed
    const orderId = paymentEntity.order_id;
    await paymentRepository.updatePaymentStatusByRazorpayOrderId(orderId, 'failed');
}

async function handleOrderPaid(orderEntity) {
    // Update order status to paid
    await paymentRepository.updateRazorpayOrderStatusByRazorpayId(orderEntity.id, 'paid');
}

module.exports = {
    createRazorpayOrder,
    verifyPayment,
    handleWebhook,
    getUserPayments
};
