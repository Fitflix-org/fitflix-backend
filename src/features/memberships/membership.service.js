const membershipRepository = require('./membership.repository');
const { generateDigitalPassCode } = require('../../common/helpers');

async function getAllMembershipPlans(gymId = null) {
    return await membershipRepository.getAllMembershipPlans(gymId);
}

async function getUserMemberships(userId) {
    return await membershipRepository.getUserMemberships(userId);
}

async function createUserMembership(data) {
    const { userId, planId, paymentId } = data;
    
    // Get the membership plan details
    const plan = await membershipRepository.getMembershipPlanById(planId);
    if (!plan) {
        throw new Error('Membership plan not found');
    }
    
    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration_months);
    
    // Generate digital pass code
    const digitalPassCode = generateDigitalPassCode();
    
    const membershipData = {
        userId,
        planId,
        paymentId,
        startDate,
        endDate,
        digitalPassCode,
        status: 'active',
        isActive: true,
        autoRenewalEnabled: true
    };
    
    return await membershipRepository.createUserMembership(membershipData);
}

async function updateUserMembership(data) {
    const { userId, membershipId, action, autoRenewalEnabled } = data;
    
    // Verify membership belongs to user
    const membership = await membershipRepository.getUserMembershipById(membershipId, userId);
    if (!membership) {
        throw new Error('Membership not found or access denied');
    }
    
    let updateData = {};
    
    if (action === 'cancel') {
        updateData.status = 'cancelled';
        updateData.isActive = false;
        updateData.autoRenewalEnabled = false;
    } else if (action === 'renew') {
        updateData.status = 'active';
        updateData.isActive = true;
        // Extend end date by plan duration
        const newEndDate = new Date(membership.end_date);
        newEndDate.setMonth(newEndDate.getMonth() + membership.membership_plans.duration_months);
        updateData.endDate = newEndDate;
    }
    
    if (autoRenewalEnabled !== undefined) {
        updateData.autoRenewalEnabled = autoRenewalEnabled;
    }
    
    return await membershipRepository.updateUserMembership(membershipId, updateData);
}

module.exports = {
    getAllMembershipPlans,
    getUserMemberships,
    createUserMembership,
    updateUserMembership
};
