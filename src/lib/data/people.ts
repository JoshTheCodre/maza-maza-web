import type { DriverPublic, Person, VehicleType } from "../types";

// Other people on the platform. Until the backend exists, these drivers and
// customers are the ones who reply to offers and send requests.

const BANKS = ["Moniepoint Microfinance Bank", "OPay", "GTBank", "Kuda Microfinance Bank", "Access Bank", "PalmPay"];

const d = (id: string, name: string, rating: number, type: VehicleType, description: string, plate: string, n: number): DriverPublic => ({
  id,
  name,
  short: `${name.split(" ")[0]} ${name.split(" ")[1][0]}.`,
  rating,
  vehicle: { type, description, plate },
  payout: { bank: BANKS[n % BANKS.length], accountNumber: `81${String(23456789 + n * 1117).slice(0, 8)}`, accountName: name.toUpperCase() },
});

export const BOT_DRIVERS: Record<VehicleType, DriverPublic[]> = {
  car: [
    d("bd1", "Tunde Adeyemi", 4.8, "car", "black Honda Accord", "LND 219 AE", 1),
    d("bd2", "Musa Bello", 4.7, "car", "grey Toyota Camry", "EKY 730 GA", 2),
    d("bd3", "Ngozi Eze", 4.9, "car", "white Kia Rio", "APP 115 KJ", 3),
    d("bd4", "Emeka Uche", 4.6, "car", "blue Toyota Sienna", "FKJ 904 LS", 4),
    d("bd5", "Aisha Yusuf", 5.0, "car", "red Hyundai Elantra", "KTU 388 BD", 5),
    d("bd6", "Segun Fashola", 4.8, "car", "black Lexus RX 350", "AAA 602 MZ", 6),
  ],
  bike: [
    d("bb1", "Femi Ojo", 4.7, "bike", "TVS Star HLX", "MUS 207 VA", 7),
    d("bb2", "Blessing Akpan", 4.8, "bike", "Haojue Suzuki", "EPE 390 TC", 8),
    d("bb3", "Kelechi Nnamdi", 4.6, "bike", "Bajaj Boxer", "GGE 812 RN", 9),
    d("bb4", "Sani Musa", 4.9, "bike", "Honda Ace 125", "AGL 164 WD", 10),
    d("bb5", "Bola Taiwo", 4.8, "bike", "TVS Apache", "SMK 538 HP", 11),
  ],
};

export const BOT_CUSTOMERS: Person[] = [
  { id: "bc1", name: "Tolu Adebayo", short: "Tolu A.", rating: 4.9 },
  { id: "bc2", name: "Halima Sule", short: "Halima S.", rating: 4.7 },
  { id: "bc3", name: "Kunle Bakare", short: "Kunle B.", rating: 4.8 },
  { id: "bc4", name: "Ifeoma Chukwu", short: "Ifeoma C.", rating: 5.0 },
  { id: "bc5", name: "David Okon", short: "David O.", rating: 4.6 },
  { id: "bc6", name: "Zainab Mohammed", short: "Zainab M.", rating: 4.9 },
  { id: "bc7", name: "Obinna Eze", short: "Obinna E.", rating: 4.8 },
  { id: "bc8", name: "Funke Lawal", short: "Funke L.", rating: 4.7 },
];

export const shortName = (name: string) => {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0].toUpperCase()}.` : first ?? "";
};
