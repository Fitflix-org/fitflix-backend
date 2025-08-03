const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ConflictError, ValidationError } = require('../../common/errors');
const prisma = new PrismaClient();

async function getAllMembershipPlans(gymId = null) {
    try {
        const whereClause = {
            is_deleted: false
        };
        
        if (gymId) {
            whereClause.gym_id = gymId;
        }
        
        return await prisma.membership_plans.findMany({
            where: whereClause,
            include: {
                Gym: {
                    select: {
                        gym_id: true,
                        name: true,
                        address: true
                    }
                }
            },
            orderBy: [
                { gym_id: 'asc' },
                { price: 'asc' }
            ]
        });
    } catch (err) {
        console.error('MembershipRepository.getAllMembershipPlans:', err.message);
        throw new Error('Database error during membership plans lookup.');
    }
}

async function getMembershipPlanById(planId) {
    try {
        const plan = await prisma.membership_plans.findUnique({
            where: {
                plan_id: planId,
                is_deleted: false
            }
        });
        
        if (!plan) {
            throw new NotFoundError('Membership plan not found.');
        }
        
        return plan;
    } catch (err) {
        if (err instanceof NotFoundError) {
            throw err;
        }
        console.error('MembershipRepository.getMembershipPlanById:', err.message);
        throw new Error('Database error during membership plan lookup.');
    }
}

async function getUserMemberships(userId) {
    return await prisma.user_memberships.findMany({
        where: {
            user_id: userId,
            is_deleted: false
        },
        include: {
            membership_plans: {
                include: {
                    Gym: {
                        select: {
                            gym_id: true,
                            name: true,
                            address: true
                        }
                    }
                }
            },
            payments: true
        },
        orderBy: {
            created_at: 'desc'
        }
    });
}

async function getUserMembershipById(membershipId, userId) {
    return await prisma.user_memberships.findFirst({
        where: {
            user_membership_id: membershipId,
            user_id: userId,
            is_deleted: false
        },
        include: {
            membership_plans: true
        }
    });
}

async function createUserMembership(data) {
    const {
        userId,
        planId,
        paymentId,
        startDate,
        endDate,
        digitalPassCode,
        status,
        isActive,
        autoRenewalEnabled
    } = data;
    
    return await prisma.user_memberships.create({
        data: {
            user_id: userId,
            plan_id: planId,
            payment_id: paymentId,
            start_date: startDate,
            end_date: endDate,
            digital_pass_code: digitalPassCode,
            status,
            is_active: isActive,
            auto_renewal_enabled: autoRenewalEnabled
        },
        include: {
            membership_plans: {
                include: {
                    Gym: true
                }
            },
            payments: true
        }
    });
}

async function updateUserMembership(membershipId, updateData) {
    return await prisma.user_memberships.update({
        where: {
            user_membership_id: membershipId
        },
        data: {
            ...updateData,
            updated_at: new Date()
        },
        include: {
            membership_plans: {
                include: {
                    Gym: true
                }
            },
            payments: true
        }
    });
}

module.exports = {
    getAllMembershipPlans,
    getMembershipPlanById,
    getUserMemberships,
    getUserMembershipById,
    createUserMembership,
    updateUserMembership
};
