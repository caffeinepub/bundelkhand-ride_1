import { LoginScreen } from "@/components/LoginScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Ride, type Transaction, useApp } from "@/context/AppContext";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  History,
  Home,
  MapPin,
  Navigation,
  Plus,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type UserTab = "home" | "history" | "wallet";
type BookingStep = "form" | "estimate" | "active" | "completed";

export function UserPanel() {
  const {
    loggedInUser,
    setLoggedInUser,
    users,
    setUsers,
    rides,
    setRides,
    transactions,
    setTransactions,
    activeRide,
    setActiveRide,
    drivers,
  } = useApp();
  const [tab, setTab] = useState<UserTab>("home");
  const [step, setStep] = useState<BookingStep>("form");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [fareEstimate, setFareEstimate] = useState<{
    fare: number;
    distance: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "wallet">("cash");
  const [rating, setRating] = useState(0);
  const [rideStatus, setRideStatus] = useState<
    "pending" | "accepted" | "on_ride" | "completed"
  >("pending");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleLogin(phone: string) {
    let u = users.find((x) => x.phone === phone);
    if (!u) {
      u = {
        id: `u${Date.now()}`,
        name: "New User",
        phone,
        walletBalance: 0,
        role: "user",
      };
      setUsers([...users, u]);
    }
    setLoggedInUser(u);
  }

  function handleGetEstimate() {
    if (!pickup.trim() || !drop.trim()) {
      toast.error("Enter pickup and drop locations");
      return;
    }
    const dist = Math.floor(Math.random() * 14) + 2;
    const fare = 30 + dist * 8;
    setFareEstimate({ fare, distance: dist });
    setStep("estimate");
  }

  function handleBookRide() {
    if (!loggedInUser || !fareEstimate) return;
    if (
      paymentMethod === "wallet" &&
      loggedInUser.walletBalance < fareEstimate.fare
    ) {
      toast.error("Insufficient wallet balance");
      return;
    }
    const approvedDriver = drivers.find((d) => d.approved && d.online);
    const newRide: Ride = {
      id: `r${Date.now()}`,
      userId: loggedInUser.id,
      userName: loggedInUser.name,
      driverId: approvedDriver?.id,
      driverName: approvedDriver?.name,
      bikeNumber: approvedDriver?.bikeNumber,
      pickup,
      drop,
      fare: fareEstimate.fare,
      distance: fareEstimate.distance,
      status: "pending",
      paymentMethod,
      createdAt: new Date(),
    };
    setRides([newRide, ...rides]);
    setActiveRide(newRide);
    setRideStatus("pending");
    setStep("active");
    toast.success("Ride booked! Finding driver...");

    // Simulate ride progression
    timerRef.current = setTimeout(() => {
      setRideStatus("accepted");
      setActiveRide({ ...newRide, status: "accepted" });
      toast.success("Driver accepted your ride!");
      timerRef.current = setTimeout(() => {
        setRideStatus("on_ride");
        setActiveRide({ ...newRide, status: "on_ride" });
        toast.success("Your ride has started!");
        timerRef.current = setTimeout(() => {
          setRideStatus("completed");
          setActiveRide({ ...newRide, status: "completed" });
          setStep("completed");
          if (paymentMethod === "wallet" && loggedInUser) {
            const updated = users.map((u) =>
              u.id === loggedInUser.id
                ? { ...u, walletBalance: u.walletBalance - fareEstimate.fare }
                : u,
            );
            setUsers(updated);
            setLoggedInUser({
              ...loggedInUser,
              walletBalance: loggedInUser.walletBalance - fareEstimate.fare,
            });
            setTransactions([
              {
                id: `t${Date.now()}`,
                userId: loggedInUser.id,
                amount: fareEstimate.fare,
                type: "debit",
                description: `Ride to ${drop}`,
                date: new Date(),
              },
              ...transactions,
            ]);
          }
          toast.success("Ride completed!");
        }, 15000);
      }, 10000);
    }, 5000);
  }

  function handleCancelRide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeRide) {
      const updated = rides.map((r) =>
        r.id === activeRide.id ? { ...r, status: "cancelled" as const } : r,
      );
      setRides(updated);
    }
    setActiveRide(null);
    setStep("form");
    setFareEstimate(null);
    setPickup("");
    setDrop("");
    toast.info("Ride cancelled");
  }

  function handleAddMoney(amount: number) {
    if (!loggedInUser) return;
    const updated = users.map((u) =>
      u.id === loggedInUser.id
        ? { ...u, walletBalance: u.walletBalance + amount }
        : u,
    );
    setUsers(updated);
    setLoggedInUser({
      ...loggedInUser,
      walletBalance: loggedInUser.walletBalance + amount,
    });
    setTransactions([
      {
        id: `t${Date.now()}`,
        userId: loggedInUser.id,
        amount,
        type: "credit",
        description: "Wallet top-up",
        date: new Date(),
      },
      ...transactions,
    ]);
    toast.success(`₹${amount} added to wallet!`);
  }

  function handleRebook() {
    setStep("form");
    setFareEstimate(null);
    setPickup("");
    setDrop("");
    setRating(0);
    setActiveRide(null);
  }

  function handleSubmitRating() {
    if (rating === 0) {
      toast.error("Please rate your driver");
      return;
    }
    toast.success("Thanks for your feedback!");
    handleRebook();
  }

  if (!loggedInUser) {
    return <LoginScreen loginRole="user" onLogin={handleLogin} />;
  }

  const userRides = rides.filter((r) => r.userId === loggedInUser.id);
  const userTransactions = transactions.filter(
    (t) => t.userId === loggedInUser.id,
  );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    accepted: "bg-blue-500/20 text-blue-400",
    on_ride: "bg-green-500/20 text-green-400",
    completed: "bg-gray-500/20 text-gray-300",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Finding Driver...",
    accepted: "Driver on the way",
    on_ride: "On Ride",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        {/* HOME TAB */}
        {tab === "home" && (
          <>
            {/* Header */}
            <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <img
                    src="/assets/generated/logo-transparent.dim_400x400.png"
                    alt=""
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <span className="font-display font-bold text-foreground text-lg">
                  Bundelkhand Ride
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                <Wallet className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  ₹{loggedInUser.walletBalance}
                </span>
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              {step === "form" && (
                <div className="animate-slide-up space-y-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground mb-1">
                      Book a Ride
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Hi {loggedInUser.name.split(" ")[0]}! Where to?
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                      <Input
                        data-ocid="booking.pickup_input"
                        placeholder="Pickup location"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground p-0 focus-visible:ring-0 font-medium"
                      />
                    </div>
                    <div className="ml-4 h-6 border-l border-dashed border-border" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-destructive" />
                      </div>
                      <Input
                        data-ocid="booking.drop_input"
                        placeholder="Drop location"
                        value={drop}
                        onChange={(e) => setDrop(e.target.value)}
                        className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground p-0 focus-visible:ring-0 font-medium"
                      />
                    </div>
                  </div>
                  <Button
                    data-ocid="booking.estimate_button"
                    className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3"
                    onClick={handleGetEstimate}
                  >
                    Get Fare Estimate
                  </Button>
                </div>
              )}

              {step === "estimate" && fareEstimate && (
                <div className="animate-slide-up space-y-4">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="flex items-center gap-1 text-sm text-muted-foreground"
                  >
                    <X className="w-4 h-4" /> Back
                  </button>
                  <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Pickup
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {pickup}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Drop
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {drop}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Distance
                      </span>
                      <span className="text-foreground font-semibold">
                        {fareEstimate.distance} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Estimated Fare
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{fareEstimate.fare}
                      </span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Payment Method
                    </p>
                    <div
                      className="flex gap-3"
                      data-ocid="booking.payment_select"
                    >
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          paymentMethod === "cash"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        💵 Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("wallet")}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          paymentMethod === "wallet"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        👛 Wallet (₹{loggedInUser.walletBalance})
                      </button>
                    </div>
                  </div>

                  <Button
                    data-ocid="booking.primary_button"
                    className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 text-base"
                    onClick={handleBookRide}
                  >
                    Book Ride · ₹{fareEstimate.fare}
                  </Button>
                </div>
              )}

              {step === "active" && activeRide && (
                <div className="animate-slide-up space-y-4">
                  {/* Status */}
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display font-bold text-foreground">
                        Ride Status
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[rideStatus]}`}
                      >
                        {statusLabels[rideStatus]}
                      </span>
                    </div>
                    {/* Progress dots */}
                    <div className="flex items-center gap-1 mb-4">
                      {["pending", "accepted", "on_ride", "completed"].map(
                        (s, i) => (
                          <div key={s} className="flex items-center flex-1">
                            <div
                              className={`w-3 h-3 rounded-full flex-shrink-0 transition-all ${
                                [
                                  "pending",
                                  "accepted",
                                  "on_ride",
                                  "completed",
                                ].indexOf(rideStatus) >= i
                                  ? "bg-primary"
                                  : "bg-border"
                              }`}
                            />
                            {i < 3 && (
                              <div
                                className={`flex-1 h-0.5 ${
                                  [
                                    "pending",
                                    "accepted",
                                    "on_ride",
                                    "completed",
                                  ].indexOf(rideStatus) > i
                                    ? "bg-primary"
                                    : "bg-border"
                                }`}
                              />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">
                          {activeRide.pickup}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-destructive" />
                        <span className="text-sm text-foreground">
                          {activeRide.drop}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Driver card */}
                  {activeRide.driverName && (
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">
                            {activeRide.driverName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {activeRide.driverName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activeRide.bikeNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 star-filled fill-current" />
                          <span className="text-sm font-semibold text-foreground">
                            4.7
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {rideStatus === "pending"
                            ? "Searching driver..."
                            : rideStatus === "accepted"
                              ? "Arriving in ~5 min"
                              : rideStatus === "on_ride"
                                ? "Heading to destination"
                                : ""}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SOS & Cancel */}
                  <div className="flex gap-3">
                    {rideStatus === "pending" && (
                      <Button
                        data-ocid="ride.cancel_button"
                        variant="outline"
                        className="flex-1 border-border text-foreground rounded-xl"
                        onClick={handleCancelRide}
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel Ride
                      </Button>
                    )}
                    <button
                      type="button"
                      data-ocid="ride.sos_button"
                      className="relative flex-1 bg-destructive text-destructive-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      onClick={() => {
                        toast.error("🆘 SOS sent to emergency contacts!", {
                          duration: 4000,
                        });
                      }}
                    >
                      <AlertTriangle className="w-5 h-5" />
                      SOS
                    </button>
                  </div>
                </div>
              )}

              {step === "completed" && activeRide && (
                <div className="animate-slide-up space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🎉</span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground mb-1">
                      Ride Completed!
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      {activeRide.pickup} → {activeRide.drop}
                    </p>
                    <div className="text-3xl font-bold text-primary mb-2">
                      ₹{activeRide.fare}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activeRide.distance} km ·{" "}
                      {activeRide.paymentMethod === "cash" ? "Cash" : "Wallet"}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="font-semibold text-foreground mb-3">
                      Rate your driver
                    </p>
                    <div
                      className="flex gap-2 justify-center mb-4"
                      data-ocid="ride.rating_select"
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setRating(s)}
                          className={`text-3xl transition-transform active:scale-110 ${
                            s <= rating ? "star-filled" : "star-empty"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <Button
                      data-ocid="ride.rebook_button"
                      className="w-full bg-primary text-primary-foreground font-semibold rounded-xl"
                      onClick={handleSubmitRating}
                    >
                      Book Another Ride
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="px-4 py-4">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Ride History
            </h2>
            {userRides.length === 0 ? (
              <div
                data-ocid="history.empty_state"
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Clock className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No rides yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userRides.map((ride, idx) => (
                  <div
                    key={ride.id}
                    data-ocid={`history.item.${idx + 1}`}
                    className="bg-card border border-border rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {ride.pickup}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" /> {ride.drop}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[ride.status]}`}
                      >
                        {statusLabels[ride.status] || ride.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ride.createdAt.toLocaleDateString("en-IN")}</span>
                      <span className="font-semibold text-foreground">
                        ₹{ride.fare}
                      </span>
                    </div>
                    {ride.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: ride.rating }, (_, i) => i).map(
                          (starIdx) => (
                            <span key={starIdx} className="star-filled text-sm">
                              ★
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WALLET TAB */}
        {tab === "wallet" && (
          <div className="px-4 py-4 space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Wallet
            </h2>
            <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
              <p className="text-sm opacity-80 mb-1">Available Balance</p>
              <p className="text-4xl font-bold font-display">
                ₹{loggedInUser.walletBalance}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                Add Money
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 500].map((amt) => (
                  <Button
                    key={amt}
                    data-ocid="wallet.add_button"
                    variant="outline"
                    className="border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary font-semibold rounded-xl"
                    onClick={() => handleAddMoney(amt)}
                  >
                    +₹{amt}
                  </Button>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                Transactions
              </p>
              {userTransactions.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {userTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-foreground">
                          {txn.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {txn.date.toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <span
                        className={`font-semibold text-sm ${
                          txn.type === "credit"
                            ? "text-green-400"
                            : "text-destructive"
                        }`}
                      >
                        {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border flex z-20">
        {(
          [
            { id: "home", label: "Home", icon: Home },
            { id: "history", label: "History", icon: History },
            { id: "wallet", label: "Wallet", icon: Wallet },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            data-ocid={`user.${id}.tab`}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
              tab === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
