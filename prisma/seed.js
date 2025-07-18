// prisma/seed.js or scripts/seed.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const gyms = [
    {
      name: "Fitflix Gym - ITI Layout, Bangalore",
      address:
        "No. 294, 1st Floor, Above Bhagayalakshmi Super Market, 5th Main, 4th Cross Road, Iti Layout-560050, Bangalore",
      latitude: "12.9423",
      longitude: "77.5649",
      phone_number: "+91 75103 82782",
      email: "info@fitflix.in",
      opening_time: "1970-01-01T06:00:00.000Z",
      closing_time: "1970-01-01T22:00:00.000Z",
      holiday_dates: [],
      description:
        "Fitflix Gym in ITI Layout, Bangalore is known for its commitment to helping members achieve their health and fitness goals. Offers Gym, Cardio, Crossfit, Strengthening Exercises, and Personal Trainers.",
    },
    {
      name: "Fitflix Gym - Electronic City Phase I, Bengaluru",
      address:
        "94, 3rd floor above Domino's, Opp- Ajmera Infinity, Neeladri Road, EC Phase, 1, Bengaluru, Karnataka 560100",
      latitude: "12.8441",
      longitude: "77.6675",
      phone_number: "+91 75103 82782",
      email: "info@fitflix.in",
      opening_time: "1970-01-01T06:30:00.000Z",
      closing_time: "1970-01-01T22:30:00.000Z",
      holiday_dates: [],
      description:
        "Fitflix Gym Electronic City Phase I offers facilities like Parking, Personal Training, Group Classes, Free Trial, Shower, Nutritional Support, Locker room, Certified Trainers.",
    },
    {
      name: "Fitflix Gym - Whitefield, Bengaluru",
      address:
        "2nd FLOOR, THULIP SPA, FITFLIX GYMS, ITPL Main Rd, opp. to SHERATON HOTEL, above HYDERABAD HOUSE, Bengaluru, Karnataka 560048",
      latitude: "12.9728",
      longitude: "77.7499",
      phone_number: "+91 75103 82782",
      email: "info@fitflix.in",
      opening_time: "1970-01-01T05:00:00.000Z",
      closing_time: "1970-01-01T22:30:00.000Z",
      holiday_dates: [],
      description:
        "Fitflix Gym Whitefield offers various fitness options including Gym. Known for top-notch amenities and experienced professionals.",
    },
    {
      name: "Fitflix Gym - Anna Nagar, Chennai",
      address:
        "FITFLIX GYM ANNANAGAR, Karuna conclave, 4th Ave, Shanthi Colony, Anna Nagar, Chennai, Tamil Nadu, 600040",
      latitude: "13.0874",
      longitude: "80.2171",
      phone_number: "+91 75103 82782",
      email: "info@fitflix.in",
      opening_time: "1970-01-01T05:30:00.000Z",
      closing_time: "1970-01-01T23:00:00.000Z",
      holiday_dates: [],
      description:
        "Fitflix Gym Anna Nagar is a premium gym in Chennai, praised for its spaciousness, good equipment, ambiance, friendly trainers, and variety of classes.",
    },
  ];

  for (const gym of gyms) {
    await prisma.gym.create({ data: gym });
  }

  console.log("✅ Gyms seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });













// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// async function main() {
//   const gyms = [
//     {
//       name: "Fitflix Gym - ITI Layout, Bangalore",
//       address: "No. 294, 1st Floor, Above Bhagayalakshmi Super Market, 5th Main, 4th Cross Road, Iti Layout-560050, Bangalore",
//       latitude: "12.9423",
//       longitude: "77.5649",
//       phone_number: "+91 75103 82782",
//       email: "info@fitflix.in",
//       opening_time: "1970-01-01T06:00:00.000Z",
//       closing_time: "1970-01-01T22:00:00.000Z",
//       holiday_dates: [],
//       description: "Fitflix Gym in ITI Layout, Bangalore is known for its commitment to helping members achieve their health and fitness goals. Offers Gym, Cardio, Crossfit, Strengthening Exercises, and Personal Trainers.",
//       gym_amenities: {
//         create: [
//           {
//             name: "Cardio Area",
//             icon_url: "https://example.com/icons/cardio.svg"
//           },
//           {
//             name: "Crossfit Zone",
//             icon_url: "https://example.com/icons/crossfit.svg"
//           },
//           {
//             name: "Personal Training",
//             icon_url: "https://example.com/icons/pt.svg"
//           },
//           {
//             name: "Strength Training",
//             icon_url: "https://example.com/icons/strength.svg"
//           }
//         ]
//       }
//     },
//   ];

//   for (const gym of gyms) {
//     await prisma.gym.create({
//       data: gym,
//       include: {
//         gym_amenities: true
//       }
//     });
//   }

//   console.log("✅ Gyms seeded successfully.");
// }

// main()
//   .catch((e) => {
//     console.error("❌ Seeding failed:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });