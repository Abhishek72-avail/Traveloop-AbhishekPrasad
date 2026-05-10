import { db, citiesTable, activitiesTable, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const CITIES = [
  {
    name: "Paris",
    country: "France",
    region: "Europe",
    description: "The city of light, known for its cafe culture, Eiffel Tower, and art museums like the Louvre.",
    imageUrl: "https://images.unsplash.com/photo-1502602881226-2299000be024",
    costIndex: 85.5,
    popularityScore: 9.8,
    currency: "EUR",
    timezone: "Europe/Paris",
  },
  {
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "A bustling metropolis that mixes the ultramodern with traditional temples and shrines.",
    imageUrl: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc",
    costIndex: 80.2,
    popularityScore: 9.9,
    currency: "JPY",
    timezone: "Asia/Tokyo",
  },
  {
    name: "Rome",
    country: "Italy",
    region: "Europe",
    description: "The Eternal City, home to ancient ruins like the Colosseum, the Pantheon, and the Vatican.",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    costIndex: 78.0,
    popularityScore: 9.7,
    currency: "EUR",
    timezone: "Europe/Rome",
  },
  {
    name: "New York City",
    country: "USA",
    region: "North America",
    description: "The city that never sleeps, famous for Times Square, Central Park, and Broadway shows.",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
    costIndex: 100.0,
    popularityScore: 9.6,
    currency: "USD",
    timezone: "America/New_York",
  },
  {
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    description: "A city of skyscrapers, luxury shopping, and modern architecture including the Burj Khalifa.",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
    costIndex: 90.5,
    popularityScore: 9.5,
    currency: "AED",
    timezone: "Asia/Dubai",
  },
  {
    name: "London",
    country: "UK",
    region: "Europe",
    description: "Historic capital city known for the Big Ben, London Eye, and the British Museum.",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-5969336cdac0",
    costIndex: 92.0,
    popularityScore: 9.6,
    currency: "GBP",
    timezone: "Europe/London",
  },
  {
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    description: "An island paradise known for its forested volcanic mountains, iconic rice paddies, and beaches.",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    costIndex: 40.0,
    popularityScore: 9.8,
    currency: "IDR",
    timezone: "Asia/Makassar",
  },
  {
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: "Famous for its outstanding football team and the unique architectural works of Antoni Gaudí.",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded",
    costIndex: 70.5,
    popularityScore: 9.4,
    currency: "EUR",
    timezone: "Europe/Madrid",
  },
  {
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "A coastal city known for its spectacular Sydney Opera House and Harbour Bridge.",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9",
    costIndex: 88.0,
    popularityScore: 9.3,
    currency: "AUD",
    timezone: "Australia/Sydney",
  },
  {
    name: "Rio de Janeiro",
    country: "Brazil",
    region: "South America",
    description: "Famous for its Copacabana beach, Christ the Redeemer statue, and vibrant Carnival festival.",
    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325",
    costIndex: 60.0,
    popularityScore: 9.2,
    currency: "BRL",
    timezone: "America/Sao_Paulo",
  }
];

const ACTIVITIES = [
  { cityIndex: 0, name: "Eiffel Tower Tour", description: "Skip the line tour to the summit of the iconic Eiffel Tower.", type: "sightseeing", estimatedCost: 40, durationHours: 2, rating: 4.8 },
  { cityIndex: 1, name: "Tsukiji Outer Market Food Tour", description: "Taste fresh sushi and Japanese street food.", type: "food", estimatedCost: 60, durationHours: 3, rating: 4.7 },
  { cityIndex: 2, name: "Colosseum & Roman Forum", description: "Guided walking tour through ancient Rome's most famous ruins.", type: "sightseeing", estimatedCost: 55, durationHours: 3.5, rating: 4.9 },
  { cityIndex: 3, name: "Statue of Liberty Cruise", description: "Scenic boat cruise passing the Statue of Liberty and Ellis Island.", type: "sightseeing", estimatedCost: 35, durationHours: 1.5, rating: 4.6 },
  { cityIndex: 4, name: "Desert Safari & BBQ Dinner", description: "Dune bashing, camel riding, and a traditional BBQ dinner in the desert.", type: "adventure", estimatedCost: 80, durationHours: 6, rating: 4.8 },
  { cityIndex: 5, name: "London Eye Flight", description: "Enjoy panoramic views of London from a glass capsule.", type: "sightseeing", estimatedCost: 30, durationHours: 1, rating: 4.5 },
  { cityIndex: 6, name: "Ubud Monkey Forest & Rice Terraces", description: "Explore the sacred monkey forest and Tegalalang rice paddies.", type: "nature", estimatedCost: 25, durationHours: 4, rating: 4.7 },
  { cityIndex: 7, name: "Sagrada Familia Guided Tour", description: "Skip the line tour of Gaudí's unfinished masterpiece.", type: "sightseeing", estimatedCost: 45, durationHours: 2, rating: 4.9 },
  { cityIndex: 8, name: "Sydney Harbour Bridge Climb", description: "Climb to the top of the bridge for ultimate 360-degree views.", type: "adventure", estimatedCost: 200, durationHours: 3.5, rating: 4.9 },
  { cityIndex: 9, name: "Christ the Redeemer & Sugarloaf Mountain", description: "Visit the iconic statue and take a cable car up the mountain.", type: "sightseeing", estimatedCost: 75, durationHours: 5, rating: 4.8 },
];

async function main() {
  console.log("Seeding database with 10 famous places...");

  // Create cities
  const insertedCities = [];
  for (const city of CITIES) {
    const [inserted] = await db.insert(citiesTable).values(city).returning();
    insertedCities.push(inserted);
    console.log(`Added city: ${inserted.name}`);
  }

  // Create activities for the cities
  for (const activity of ACTIVITIES) {
    const cityId = insertedCities[activity.cityIndex].id;
    await db.insert(activitiesTable).values({
      cityId,
      name: activity.name,
      description: activity.description,
      type: activity.type,
      estimatedCost: activity.estimatedCost,
      durationHours: activity.durationHours,
      rating: activity.rating,
      imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800" // Generic travel image
    });
    console.log(`Added activity: ${activity.name} in ${insertedCities[activity.cityIndex].name}`);
  }

  // Also make an admin user so you don't get blocked
  const passwordHash = await bcrypt.hash("admin", 10);
  try {
    await db.insert(usersTable).values({
      name: "Admin User",
      email: "admin@traveloop.com",
      passwordHash,
      role: "admin123",
    });
    console.log("Added Admin user (email: admin@traveloop.com, password: admin)");
  } catch (e) {
    console.log("Admin user might already exist, skipping.");
  }

  console.log("Seed completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
