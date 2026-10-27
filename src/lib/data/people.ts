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
    d("bd1", "Ibinabo George", 4.8, "car", "black Honda Accord", "PHC 219 AE", 1),
    d("bd2", "Musa Bello", 4.7, "car", "grey Toyota Camry", "PHC 730 GA", 2),
    d("bd3", "Ngozi Amadi", 4.9, "car", "white Kia Rio", "PHC 115 KJ", 3),
    d("bd4", "Tamuno Briggs", 4.6, "car", "blue Toyota Sienna", "PHC 904 LS", 4),
    d("bd5", "Aisha Yusuf", 5.0, "car", "red Hyundai Elantra", "PHC 388 BD", 5),
    d("bd6", "Soye Jumbo", 4.8, "car", "black Lexus RX 350", "PHC 602 MZ", 6),
  ],
  bike: [
    d("bb1", "Chinedu Opara", 4.7, "bike", "TVS Star HLX", "PHC 207 VA", 7),
    d("bb2", "Blessing Akpan", 4.8, "bike", "Haojue Suzuki", "PHC 390 TC", 8),
    d("bb3", "Kelechi Wodi", 4.6, "bike", "Bajaj Boxer", "PHC 812 RN", 9),
    d("bb4", "Sani Musa", 4.9, "bike", "Honda Ace 125", "PHC 164 WD", 10),
    d("bb5", "Ebiere Harry", 4.8, "bike", "TVS Apache", "PHC 538 HP", 11),
  ],
};

export const BOT_CUSTOMERS: Person[] = [
  { id: "bc1", name: "Nengi Tobin", short: "Nengi T.", rating: 4.9 },
  { id: "bc2", name: "Halima Sule", short: "Halima S.", rating: 4.7 },
  { id: "bc3", name: "Ikechi Nwanodi", short: "Ikechi N.", rating: 4.8 },
  { id: "bc4", name: "Ifeoma Chukwu", short: "Ifeoma C.", rating: 5.0 },
  { id: "bc5", name: "David Okon", short: "David O.", rating: 4.6 },
  { id: "bc6", name: "Zainab Mohammed", short: "Zainab M.", rating: 4.9 },
  { id: "bc7", name: "Obinna Eze", short: "Obinna E.", rating: 4.8 },
  { id: "bc8", name: "Data Ihunda", short: "Data I.", rating: 4.7 },
];

export const shortName = (name: string) => {
  const [first, last] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0].toUpperCase()}.` : first ?? "";
};
