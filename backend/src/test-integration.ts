import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './lib/prisma';
import { signToken } from './lib/jwt';
import { LeadStatus, PaymentStatus, Role } from '@prisma/client';

async function run() {
  console.log('--- Starting Comprehensive E2E Integration Test ---');

  const userEmail = 'integration-test-user@example.com';
  const adminEmail = 'integration-test-admin@example.com';

  // 1. Clean up old test data from previous runs if any
  console.log('Cleaning up old integration test data...');
  const testUsers = await prisma.user.findMany({
    where: { email: { in: [userEmail, adminEmail] } },
  });

  for (const u of testUsers) {
    await prisma.mLResult.deleteMany({ where: { portfolio: { userId: u.id } } });
    await prisma.score.deleteMany({ where: { portfolio: { userId: u.id } } });
    await prisma.portfolioRow.deleteMany({ where: { portfolio: { userId: u.id } } });
    await prisma.portfolio.deleteMany({ where: { userId: u.id } });
    await prisma.lead.deleteMany({ where: { userId: u.id } });
    await prisma.payment.deleteMany({ where: { userId: u.id } });
    await prisma.client.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }
  console.log('Old test data cleaned.');

  // 2. Create user (GUEST) and admin (ADMIN)
  const user = await prisma.user.create({
    data: {
      email: userEmail,
      role: Role.GUEST,
      name: 'Test Guest',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      role: Role.ADMIN,
      name: 'Test Admin',
    },
  });

  console.log(`Created user: ${user.id} (${user.role})`);
  console.log(`Created admin: ${admin.id} (${admin.role})`);

  // 3. Generate JWT Tokens
  const userToken = signToken({
    userId: user.id,
    email: user.email || '',
    role: user.role,
  });

  const adminToken = signToken({
    userId: admin.id,
    email: admin.email || '',
    role: admin.role,
  });

  console.log('Tokens generated successfully.');

  // ==========================================
  // A. LEADS WORKFLOW
  // ==========================================
  console.log('\n--- Testing Leads Workflow ---');

  // A1. Create a lead (User)
  const leadPayload = {
    name: 'Test User Booking',
    phone: '+15551234567',
    slot: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  };

  console.log('Sending lead booking request...');
  const leadRes = await fetch('http://localhost:8000/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify(leadPayload),
  });

  const leadJson = (await leadRes.json()) as any;
  console.log('Lead Booking Response Status:', leadRes.status);
  console.log('Lead Booking Response:', JSON.stringify(leadJson, null, 2));

  if (!leadRes.ok || !leadJson.success) {
    throw new Error(`Failed to create lead: ${leadJson.error || leadRes.statusText}`);
  }
  const leadId = leadJson.data.leadId;

  // A2. Get all leads (Admin)
  console.log('Admin requesting leads list...');
  const getLeadsRes = await fetch('http://localhost:8000/api/leads?status=NEW', {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const getLeadsJson = (await getLeadsRes.json()) as any;
  console.log('Admin List Leads Status:', getLeadsRes.status);
  if (!getLeadsRes.ok || !getLeadsJson.success) {
    throw new Error('Admin failed to list leads');
  }

  const foundLead = getLeadsJson.data.leads.find((l: any) => l.id === leadId);
  if (!foundLead) {
    throw new Error('Created lead was not found in admin leads list!');
  }
  console.log('Successfully verified lead present in admin list.');

  // A3. Update lead status (Admin)
  console.log('Admin updating lead status to CONTACTED...');
  const updateLeadRes = await fetch(`http://localhost:8000/api/leads/${leadId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: LeadStatus.CONTACTED,
      notes: 'Spoke with client, scheduling presentation',
    }),
  });

  const updateLeadJson = (await updateLeadRes.json()) as any;
  console.log('Lead Update Status:', updateLeadRes.status);
  if (!updateLeadRes.ok || !updateLeadJson.success) {
    throw new Error('Failed to update lead status');
  }
  if (updateLeadJson.data.status !== LeadStatus.CONTACTED || updateLeadJson.data.notes !== 'Spoke with client, scheduling presentation') {
    throw new Error('Lead status or notes did not update correctly!');
  }
  console.log('Lead status successfully updated to CONTACTED.');

  // ==========================================
  // B. PAYMENTS WORKFLOW
  // ==========================================
  console.log('\n--- Testing Payments Workflow ---');

  // B1. Submit Payment (User)
  console.log('Creating multipart/form-data upload request...');
  const formData = new FormData();
  formData.append('amount', '499');
  formData.append('utrId', 'UTR9988776655');

  // Append dummy screenshot file
  const screenshotBlob = new Blob(['fake image binary content'], { type: 'image/png' });
  formData.append('screenshot', screenshotBlob, 'test-payment.png');

  const uploadRes = await fetch('http://localhost:8000/api/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    body: formData,
  });

  const uploadJson = (await uploadRes.json()) as any;
  console.log('Upload Payment Status:', uploadRes.status);
  console.log('Upload Payment Response:', JSON.stringify(uploadJson, null, 2));

  if (!uploadRes.ok || !uploadJson.success) {
    throw new Error(`Failed to upload payment: ${uploadJson.error || uploadRes.statusText}`);
  }
  const paymentId = uploadJson.data.paymentId;

  // B2. Get payments (Admin)
  console.log('Admin requesting pending payments list...');
  const getPaymentsRes = await fetch('http://localhost:8000/api/payments?status=PENDING', {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  const getPaymentsJson = (await getPaymentsRes.json()) as any;
  console.log('Admin List Payments Status:', getPaymentsRes.status);
  if (!getPaymentsRes.ok || !getPaymentsJson.success) {
    throw new Error('Admin failed to list payments');
  }

  const foundPayment = getPaymentsJson.data.payments.find((p: any) => p.id === paymentId);
  if (!foundPayment) {
    throw new Error('Uploaded payment not found in admin payments list!');
  }
  console.log(`Verified pending payment ${paymentId} is present. Screenshot URL is: ${foundPayment.screenshotUrl}`);

  // B3. Approve Payment (Admin)
  console.log('Admin approving payment...');
  const approveRes = await fetch(`http://localhost:8000/api/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      action: 'approve',
      reason: 'UTR verified and amount credited successfully',
    }),
  });

  const approveJson = (await approveRes.json()) as any;
  console.log('Approve Payment Status:', approveRes.status);
  console.log('Approve Payment Response:', JSON.stringify(approveJson, null, 2));

  if (!approveRes.ok || !approveJson.success) {
    throw new Error(`Failed to approve payment: ${approveJson.error || approveRes.statusText}`);
  }

  // B4. Verify Role elevation and Client record creation
  console.log('Verifying client profile activation and role changes in Neon DB...');
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { client: true },
  });

  if (!updatedUser) {
    throw new Error('User not found in DB after approval!');
  }

  console.log(`Updated User Role: ${updatedUser.role} (Expected: CLIENT)`);
  console.log('Client Record:', updatedUser.client);

  if (updatedUser.role !== Role.CLIENT) {
    throw new Error('User role was not elevated to CLIENT!');
  }

  if (!updatedUser.client) {
    throw new Error('Client activation record was not created!');
  }

  if (updatedUser.client.activePlan !== 'PREMIUM') {
    throw new Error(`Client active plan is incorrect: ${updatedUser.client.activePlan}`);
  }

  console.log('--- ALL LEADS & PAYMENTS TESTS PASSED SUCCESSFULLY ---');

  // 4. Clean up test records
  console.log('Cleaning up test records from database...');
  await prisma.client.deleteMany({ where: { userId: { in: [user.id, admin.id] } } });
  await prisma.payment.deleteMany({ where: { userId: { in: [user.id, admin.id] } } });
  await prisma.lead.deleteMany({ where: { userId: { in: [user.id, admin.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [user.id, admin.id] } } });
  console.log('Test clean up completed.');
}

run()
  .then(() => {
    console.log('Integration test script completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Integration test script failed:', err);
    process.exit(1);
  });
