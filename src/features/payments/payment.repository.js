const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRazorpayOrder(data) {
    const { userId, razorpayOrderId, amount, currency, receipt, expiresAt, status } = data;
    
    return await prisma.razorpay_orders.create({
        data: {
            user_id: userId,
            razorpay_order_id: razorpayOrderId,
            amount,
            currency,
            receipt,
            expires_at: expiresAt,
            status
        }
    });
}

async function getRazorpayOrderByRazorpayId(razorpayOrderId) {
    return await prisma.razorpay_orders.findUnique({
        where: {
            razorpay_order_id: razorpayOrderId
        }
    });
}

async function updateRazorpayOrderStatus(orderId, status) {
    return await prisma.razorpay_orders.update({
        where: {
            order_id: orderId
        },
        data: {
            status
        }
    });
}

async function updateRazorpayOrderStatusByRazorpayId(razorpayOrderId, status) {
    return await prisma.razorpay_orders.update({
        where: {
            razorpay_order_id: razorpayOrderId
        },
        data: {
            status
        }
    });
}

async function createPayment(data) {
    const {
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount,
        status,
        method,
        notes
    } = data;
    
    return await prisma.payments.create({
        data: {
            user_id: userId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            amount,
            status,
            method,
            notes
        },
        include: {
            razorpay_order: true
        }
    });
}

async function updatePaymentStatusByRazorpayOrderId(razorpayOrderId, status) {
    // First find the internal order ID
    const order = await prisma.razorpay_orders.findUnique({
        where: {
            razorpay_order_id: razorpayOrderId
        }
    });
    
    if (!order) {
        throw new Error('Order not found');
    }
    
    return await prisma.payments.updateMany({
        where: {
            razorpay_order_id: order.order_id
        },
        data: {
            status
        }
    });
}

async function getUserPayments(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;
    
    let whereClause = {
        user_id: userId,
        is_deleted: false
    };
    
    if (status) {
        whereClause.status = status;
    }
    
    const [payments, total] = await Promise.all([
        prisma.payments.findMany({
            where: whereClause,
            include: {
                razorpay_order: true,
                user_memberships: {
                    include: {
                        membership_plans: {
                            include: {
                                Gym: {
                                    select: {
                                        gym_id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.payments.count({
            where: whereClause
        })
    ]);
    
    return {
        payments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

module.exports = {
    createRazorpayOrder,
    getRazorpayOrderByRazorpayId,
    updateRazorpayOrderStatus,
    updateRazorpayOrderStatusByRazorpayId,
    createPayment,
    updatePaymentStatusByRazorpayOrderId,
    getUserPayments
};
