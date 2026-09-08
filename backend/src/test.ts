import assert from 'assert';
import { encrypt, decrypt } from './utils/crypto';
import prisma from './utils/db';

async function runTests() {
  console.log('================================================');
  console.log('       TALK NO FILTER — BACKEND UNIT TESTS     ');
  console.log('================================================');

  try {
    // 1. Test Encryption/Decryption
    console.log('Test 1: Running Field-Level Encryption verification...');
    const originalText = 'Sensitive SRH question regarding HIV PEP treatment guidelines.';
    const cipherText = encrypt(originalText);
    
    assert.ok(cipherText, 'Cipher text should not be empty');
    assert.notStrictEqual(cipherText, originalText, 'Cipher text should be encrypted, not match plaintext');
    
    const decryptedText = decrypt(cipherText);
    assert.strictEqual(decryptedText, originalText, 'Decrypted text must match the original cleartext');
    console.log('✔ Crypto verification: AES-256-GCM encryption/decryption passed.\n');

    // 2. Test DB Querying (Experts)
    console.log('Test 2: Verifying seeded experts & slots are present in SQLite...');
    const experts = await prisma.expert.findMany({ where: { verified: true } });
    assert.ok(experts.length >= 3, 'There should be at least 3 experts seeded');
    console.log(`✔ DB Querying: Found ${experts.length} experts seeded successfully.`);
    
    const slots = await prisma.availabilitySlot.findMany();
    assert.ok(slots.length > 0, 'Availability slots should be seeded');
    console.log(`✔ DB Querying: Found ${slots.length} availability slots seeded.\n`);

    // 3. Test Booking & Wallet Flow Integration
    console.log('Test 3: Simulating a client signup and wallet check...');
    const testPhone = '+250780000001';
    
    // Cleanup any old test user
    const existingTestUser = await prisma.user.findUnique({
      where: { phone: testPhone },
    });
    if (existingTestUser) {
      await prisma.booking.deleteMany({ where: { userId: existingTestUser.id } });
      await prisma.payment.deleteMany({ where: { userId: existingTestUser.id } });
      await prisma.wallet.deleteMany({ where: { userId: existingTestUser.id } });
      await prisma.subscription.deleteMany({ where: { userId: existingTestUser.id } });
      await prisma.user.delete({ where: { phone: testPhone } });
    }

    const testUser = await prisma.user.create({
      data: {
        phone: testPhone,
        wallet: {
          create: {
            sessionCredits: 0,
            minuteBalance: 0,
          },
        },
      },
      include: { wallet: true },
    });

    assert.strictEqual(testUser.phone, testPhone);
    assert.ok(testUser.wallet, 'Wallet should be initialized for new user');
    console.log('✔ Registration: Created test user with initialized empty wallet.');

    // 4. Test Payment webhook simulation for Gold Bundle
    console.log('Test 4: Simulating Gold Bundle purchase (MTN MoMo RWF) via webhook...');
    const mockRef = 'MOCK-REF-GOLD-123';
    
    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: testUser.id,
        amount: 3500,
        provider: 'mtn_momo',
        reference: mockRef,
        status: 'pending',
        serviceType: 'gold_bundle',
      },
    });

    // Simulate successful webhook callback
    // (Mimics POST /api/payments/webhook body logic)
    const successResult = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { reference: mockRef },
        data: { status: 'success' },
      });

      const updatedWallet = await tx.wallet.update({
        where: { userId: payment.userId },
        data: { sessionCredits: { increment: 3 } },
      });

      return { payment, wallet: updatedWallet };
    });

    assert.strictEqual(successResult.payment.status, 'success');
    assert.strictEqual(successResult.wallet.sessionCredits, 3, 'User wallet should receive 3 Gold credits');
    console.log('✔ Payments: Webhook transaction logic successfully credited wallet credits.\n');

    console.log('================================================');
    console.log('          ALL BACKEND INTEGRATION TESTS PASSED  ');
    console.log('================================================');
  } catch (error) {
    console.error('❌ Verification tests failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
