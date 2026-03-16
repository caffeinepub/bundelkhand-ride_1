import { type ReactNode, createContext, useContext, useState } from "react";

export type RideStatus =
  | "pending"
  | "accepted"
  | "on_ride"
  | "completed"
  | "cancelled";
export type PaymentMethod = "cash" | "wallet";

export interface User {
  id: string;
  name: string;
  phone: string;
  walletBalance: number;
  role: "user" | "driver";
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  bikeNumber: string;
  rating: number;
  approved: boolean;
  online: boolean;
  earnings: number;
}

export interface Ride {
  id: string;
  userId: string;
  userName: string;
  driverId?: string;
  driverName?: string;
  bikeNumber?: string;
  pickup: string;
  drop: string;
  fare: number;
  distance: number;
  status: RideStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  rating?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  date: Date;
}

interface AppState {
  currentRole: "user" | "driver" | "admin";
  setCurrentRole: (r: "user" | "driver" | "admin") => void;
  loggedInUser: User | null;
  setLoggedInUser: (u: User | null) => void;
  loggedInDriver: Driver | null;
  setLoggedInDriver: (d: Driver | null) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  drivers: Driver[];
  setDrivers: (d: Driver[]) => void;
  rides: Ride[];
  setRides: (r: Ride[]) => void;
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;
  activeRide: Ride | null;
  setActiveRide: (r: Ride | null) => void;
}

const sampleUsers: User[] = [
  {
    id: "u1",
    name: "Ramesh Kumar",
    phone: "9876543210",
    walletBalance: 250,
    role: "user",
  },
  {
    id: "u2",
    name: "Sunita Devi",
    phone: "9812345678",
    walletBalance: 150,
    role: "user",
  },
  {
    id: "u3",
    name: "Vikram Singh",
    phone: "9998887776",
    walletBalance: 80,
    role: "user",
  },
];

const sampleDrivers: Driver[] = [
  {
    id: "d1",
    name: "Mohan Lal",
    phone: "9111222333",
    bikeNumber: "MP10 AB 1234",
    rating: 4.7,
    approved: true,
    online: true,
    earnings: 1240,
  },
  {
    id: "d2",
    name: "Raju Patel",
    phone: "9444555666",
    bikeNumber: "MP10 CD 5678",
    rating: 4.3,
    approved: false,
    online: false,
    earnings: 0,
  },
];

const now = new Date();
const sampleRides: Ride[] = [
  {
    id: "r1",
    userId: "u1",
    userName: "Ramesh Kumar",
    driverId: "d1",
    driverName: "Mohan Lal",
    bikeNumber: "MP10 AB 1234",
    pickup: "Orchha Fort",
    drop: "Tikamgarh Bus Stand",
    fare: 85,
    distance: 7,
    status: "completed",
    paymentMethod: "cash",
    createdAt: new Date(now.getTime() - 86400000),
    rating: 5,
  },
  {
    id: "r2",
    userId: "u2",
    userName: "Sunita Devi",
    driverId: "d1",
    driverName: "Mohan Lal",
    bikeNumber: "MP10 AB 1234",
    pickup: "Ram Raja Temple",
    drop: "District Hospital",
    fare: 54,
    distance: 3,
    status: "completed",
    paymentMethod: "wallet",
    createdAt: new Date(now.getTime() - 172800000),
    rating: 4,
  },
  {
    id: "r3",
    userId: "u3",
    userName: "Vikram Singh",
    pickup: "Tikamgarh Market",
    drop: "Niwari Road",
    fare: 110,
    distance: 10,
    status: "pending",
    paymentMethod: "cash",
    createdAt: new Date(now.getTime() - 300000),
  },
  {
    id: "r4",
    userId: "u1",
    userName: "Ramesh Kumar",
    driverId: "d1",
    driverName: "Mohan Lal",
    bikeNumber: "MP10 AB 1234",
    pickup: "Orchha Palace",
    drop: "Railway Station",
    fare: 70,
    distance: 5,
    status: "on_ride",
    paymentMethod: "cash",
    createdAt: new Date(now.getTime() - 600000),
  },
  {
    id: "r5",
    userId: "u2",
    userName: "Sunita Devi",
    pickup: "Chanderi Gate",
    drop: "School Road",
    fare: 46,
    distance: 2,
    status: "cancelled",
    paymentMethod: "wallet",
    createdAt: new Date(now.getTime() - 259200000),
  },
];

const sampleTransactions: Transaction[] = [
  {
    id: "t1",
    userId: "u1",
    amount: 500,
    type: "credit",
    description: "Wallet top-up",
    date: new Date(now.getTime() - 432000000),
  },
  {
    id: "t2",
    userId: "u1",
    amount: 85,
    type: "debit",
    description: "Ride to Tikamgarh Bus Stand",
    date: new Date(now.getTime() - 86400000),
  },
  {
    id: "t3",
    userId: "u2",
    amount: 200,
    type: "credit",
    description: "Wallet top-up",
    date: new Date(now.getTime() - 259200000),
  },
  {
    id: "t4",
    userId: "u2",
    amount: 54,
    type: "debit",
    description: "Ride to District Hospital",
    date: new Date(now.getTime() - 172800000),
  },
];

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<"user" | "driver" | "admin">(
    "user",
  );
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loggedInDriver, setLoggedInDriver] = useState<Driver | null>(null);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [drivers, setDrivers] = useState<Driver[]>(sampleDrivers);
  const [rides, setRides] = useState<Ride[]>(sampleRides);
  const [transactions, setTransactions] =
    useState<Transaction[]>(sampleTransactions);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  return (
    <AppCtx.Provider
      value={{
        currentRole,
        setCurrentRole,
        loggedInUser,
        setLoggedInUser,
        loggedInDriver,
        setLoggedInDriver,
        users,
        setUsers,
        drivers,
        setDrivers,
        rides,
        setRides,
        transactions,
        setTransactions,
        activeRide,
        setActiveRide,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
