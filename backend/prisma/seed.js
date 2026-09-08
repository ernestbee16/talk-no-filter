const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean old entries
  await prisma.webinarRegistration.deleteMany();
  await prisma.webinar.deleteMany();
  await prisma.mythFact.deleteMany();
  await prisma.anonymousQuestion.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.expert.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared database.');

  // Create experts
  const expert1 = await prisma.expert.create({
    data: {
      name: 'Dr. Keza Aline',
      specialty: 'HIV Prevention & Care Specialist',
      verified: true,
    },
  });

  const expert2 = await prisma.expert.create({
    data: {
      name: 'Dr. Ntwari Jean',
      specialty: 'Youth SRH Consultant',
      verified: true,
    },
  });

  const expert3 = await prisma.expert.create({
    data: {
      name: 'Dr. Uwase Marie',
      specialty: 'Adolescent Gynaecologist',
      verified: true,
    },
  });

  console.log('Created Experts.');

  // Helper to generate hours
  const createDate = (daysAhead, hour, minute) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  // Add availability slots
  const slotsData = [
    // Today slots
    { expertId: expert1.id, startTime: createDate(0, 9, 0), endTime: createDate(0, 9, 30) },
    { expertId: expert1.id, startTime: createDate(0, 10, 0), endTime: createDate(0, 10, 30) },
    { expertId: expert1.id, startTime: createDate(0, 14, 0), endTime: createDate(0, 14, 30) },

    { expertId: expert2.id, startTime: createDate(0, 11, 0), endTime: createDate(0, 11, 30) },
    { expertId: expert2.id, startTime: createDate(0, 15, 0), endTime: createDate(0, 15, 30) },

    { expertId: expert3.id, startTime: createDate(0, 13, 0), endTime: createDate(0, 13, 30) },
    { expertId: expert3.id, startTime: createDate(0, 16, 0), endTime: createDate(0, 16, 30) },

    // Tomorrow slots
    { expertId: expert1.id, startTime: createDate(1, 9, 0), endTime: createDate(1, 9, 30) },
    { expertId: expert2.id, startTime: createDate(1, 10, 0), endTime: createDate(1, 10, 30) },
    { expertId: expert3.id, startTime: createDate(1, 14, 0), endTime: createDate(1, 14, 30) },
  ];

  for (const slot of slotsData) {
    await prisma.availabilitySlot.create({ data: slot });
  }
  console.log('Created Availability Slots.');

  // Create MythFacts
  await prisma.mythFact.createMany({
    data: [
      {
        claim: 'HIV can be transmitted by sharing food, cups, or hugging.',
        verifiedFact: 'HIV is NOT transmitted through saliva, sweat, tears, casual physical contact, or sharing utensils. The virus cannot survive outside the human body.',
        sourceName: 'World Health Organization (WHO)',
        sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/hiv-aids',
        status: 'published',
        viewCount: 142,
        shareCount: 56,
        publishedAt: new Date(),
      },
      {
        claim: 'PEP is a daily preventative medication you take long term.',
        verifiedFact: 'PEP (Post-Exposure Prophylaxis) is an EMERGENCY treatment taken within 72 hours of exposure, daily for 28 days. Long-term daily prevention is called PrEP (Pre-Exposure Prophylaxis).',
        sourceName: 'Rwanda Biomedical Centre (RBC)',
        sourceUrl: 'https://www.rbc.gov.rw',
        status: 'published',
        viewCount: 98,
        shareCount: 22,
        publishedAt: new Date(),
      },
      {
        claim: 'If your partner looks healthy, they do not have HIV.',
        verifiedFact: 'Many people with HIV show no symptoms for years. The ONLY way to know someone\'s status is through a medical HIV test.',
        sourceName: 'Centers for Disease Control and Prevention (CDC)',
        sourceUrl: 'https://www.cdc.gov/hiv',
        status: 'published',
        viewCount: 215,
        shareCount: 89,
        publishedAt: new Date(),
      },
    ],
  });
  console.log('Created Myth vs Fact Entries.');

  // Create Webinars
  await prisma.webinar.create({
    data: {
      title: 'Youth HIV Prevention Masterclass: Understanding PEP & PrEP',
      description: 'Join Rwanda Biomedical Centre experts as they break down when to use PEP, who should be on PrEP, and answer all your questions live and with absolute confidentiality.',
      scheduledAt: createDate(3, 18, 0), // 3 days ahead at 6 PM
    },
  });

  await prisma.webinar.create({
    data: {
      title: 'Talk No Filter: Debunking TikTok & WhatsApp SRH Rumours',
      description: 'Our annual unfiltered review of the most popular sexual health claims spreading on Rwandan social media. Real science, direct answers.',
      scheduledAt: createDate(7, 15, 0), // 7 days ahead at 3 PM
    },
  });

  console.log('Created Webinars.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
