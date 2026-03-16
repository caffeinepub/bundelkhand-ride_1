import { LoginScreen } from "@/components/LoginScreen";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { type Ride, useApp } from "@/context/AppContext";
import {
  CheckCircle,
  ChevronRight,
  Home,
  MapPin,
  Navigation,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DriverTab = "home" | "earnings";
type DriverRideStep = "list" | "active";

export function DriverPanel() {
  const {
    loggedInDriver,
    setLoggedInDriver,
    drivers,
    setDrivers,
    rides,
    setRides,
  } = useApp();
  const [tab, setTab] = useState<DriverTab>("home");
  const [rideStep, setRideStep] = useState<DriverRideStep>("list");
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [earningsFilter, setEarningsFilter] = useState<
    "today" | "week" | "month"
  >("today");

  function handleLogin(phone: string) {
    let d = drivers.find((x) => x.phone === phone);
    if (!d) {
      d = {
        id: `d${Date.now()}`,
        name: "New Driver",
        phone,
        bikeNumber: "MP10 XX 0000",
        rating: 5.0,
        approved: false,
        online: false,
        earnings: 0,
      };
      setDrivers([...drivers, d]);
    }
    setLoggedInDriver(d);
  }

  function handleToggleOnline(val: boolean) {
    if (!loggedInDriver) return;
    if (!loggedInDriver.approved) {
      toast.error("Your account is pending approval");
      return;
    }
    const updated = drivers.map((d) =>
      d.id === loggedInDriver.id ? { ...d, online: val } : d,
    );
    setDrivers(updated);
    setLoggedInDriver({ ...loggedInDriver, online: val });
    toast.info(val ? "You are now Online" : "You are now Offline");
  }

  function handleAcceptRide(ride: Ride) {
    const updated = rides.map((r) =>
      r.id === ride.id
        ? {
            ...r,
            status: "accepted" as const,
            driverId: loggedInDriver?.id,
            driverName: loggedInDriver?.name,
            bikeNumber: loggedInDriver?.bikeNumber,
          }
        : r,
    );
    setRides(updated);
    setActiveRide({
      ...ride,
      status: "accepted",
      driverId: loggedInDriver?.id,
      driverName: loggedInDriver?.name,
      bikeNumber: loggedInDriver?.bikeNumber,
    });
    setRideStep("active");
    toast.success("Ride accepted!");
  }

  function handleStartRide() {
    if (!activeRide) return;
    const updated = rides.map((r) =>
      r.id === activeRide.id ? { ...r, status: "on_ride" as const } : r,
    );
    setRides(updated);
    setActiveRide({ ...activeRide, status: "on_ride" });
    toast.success("Ride started!");
  }

  function handleCompleteRide() {
    if (!activeRide || !loggedInDriver) return;
    const updated = rides.map((r) =>
      r.id === activeRide.id ? { ...r, status: "completed" as const } : r,
    );
    setRides(updated);
    const updatedDrivers = drivers.map((d) =>
      d.id === loggedInDriver.id
        ? { ...d, earnings: d.earnings + activeRide.fare }
        : d,
    );
    setDrivers(updatedDrivers);
    setLoggedInDriver({
      ...loggedInDriver,
      earnings: loggedInDriver.earnings + activeRide.fare,
    });
    setActiveRide(null);
    setRideStep("list");
    toast.success(`Ride completed! ₹${activeRide.fare} earned`);
  }

  if (!loggedInDriver) {
    return <LoginScreen loginRole="driver" onLogin={handleLogin} />;
  }

  const pendingRides = rides.filter((r) => r.status === "pending");
  const myCompletedRides = rides.filter(
    (r) => r.driverId === loggedInDriver.id && r.status === "completed",
  );
  const today = new Date();
  const todayRides = myCompletedRides.filter(
    (r) => r.createdAt.toDateString() === today.toDateString(),
  );
  const todayEarnings = todayRides.reduce((s, r) => s + r.fare, 0);
  const weekEarnings = myCompletedRides.reduce((s, r) => s + r.fare, 0);

  const earningsRides =
    earningsFilter === "today" ? todayRides : myCompletedRides;
  const earningsTotal =
    earningsFilter === "today"
      ? todayEarnings
      : earningsFilter === "week"
        ? weekEarnings
        : weekEarnings;

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        {tab === "home" && (
          <>
            {/* Header */}
            <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <div>
                <p className="font-display font-bold text-foreground">
                  {loggedInDriver.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {loggedInDriver.bikeNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {loggedInDriver.online ? "Online" : "Offline"}
                </span>
                <Switch
                  data-ocid="driver.online_toggle"
                  checked={loggedInDriver.online}
                  onCheckedChange={handleToggleOnline}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              {!loggedInDriver.approved && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                  <p className="text-yellow-400 font-semibold text-sm">
                    ⏳ Approval Pending
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your account is under review. You'll be able to accept rides
                    once approved.
                  </p>
                </div>
              )}

              {/* Earnings today */}
              <div className="bg-primary rounded-2xl p-4">
                <p className="text-primary-foreground/80 text-sm">
                  Today's Earnings
                </p>
                <p className="font-display text-3xl font-bold text-primary-foreground">
                  ₹{todayEarnings}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-primary-foreground/70">
                    {todayRides.length} rides today
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-primary-foreground/70 fill-current" />
                    <span className="text-xs text-primary-foreground/70">
                      {loggedInDriver.rating} rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Available rides */}
              {rideStep === "list" && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Available Rides ({pendingRides.length})
                  </h3>
                  {pendingRides.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-8 text-center">
                      <Navigation className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        No rides available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRides.map((ride, idx) => (
                        <div
                          key={ride.id}
                          data-ocid={`driver.ride_card.${idx + 1}`}
                          className="bg-card border border-border rounded-2xl p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-sm font-medium text-foreground">
                                  {ride.pickup}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-destructive" />
                                <span className="text-sm text-muted-foreground">
                                  {ride.drop}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">
                                ₹{ride.fare}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ride.distance} km
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {ride.paymentMethod === "cash"
                                ? "💵 Cash"
                                : "👛 Wallet"}
                            </span>
                            <Button
                              data-ocid={`driver.accept_button.${idx + 1}`}
                              className="bg-primary text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2 h-auto"
                              onClick={() => handleAcceptRide(ride)}
                              disabled={
                                !loggedInDriver.approved ||
                                !loggedInDriver.online
                              }
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {rideStep === "active" && activeRide && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground">
                        Active Ride
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          activeRide.status === "accepted"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {activeRide.status === "accepted"
                          ? "Accepted"
                          : "On Ride"}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
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
                    <div className="bg-muted rounded-xl p-3 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Passenger
                      </p>
                      <p className="font-semibold text-foreground">
                        {activeRide.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fare: ₹{activeRide.fare} · {activeRide.paymentMethod}
                      </p>
                    </div>
                    <div className="bg-muted rounded-xl p-3 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Navigation (Simulated)
                      </p>
                      <p className="text-sm text-foreground">
                        Head north on Main Road → Turn right at Shivaji Chowk →
                        Continue 2km to destination
                      </p>
                    </div>
                    {activeRide.status === "accepted" ? (
                      <Button
                        data-ocid="driver.start_button"
                        className="w-full bg-primary text-primary-foreground font-semibold rounded-xl"
                        onClick={handleStartRide}
                      >
                        Start Ride
                      </Button>
                    ) : (
                      <Button
                        data-ocid="driver.complete_button"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                        onClick={handleCompleteRide}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Complete Ride
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "earnings" && (
          <div className="px-4 py-4 space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Earnings
            </h2>
            <div className="flex gap-2" data-ocid="driver.earnings_tab">
              {(["today", "week", "month"] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setEarningsFilter(f)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    earningsFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="bg-primary rounded-2xl p-4">
              <p className="text-primary-foreground/80 text-sm">
                Total Earnings
              </p>
              <p className="font-display text-4xl font-bold text-primary-foreground">
                ₹{earningsTotal}
              </p>
              <p className="text-primary-foreground/70 text-xs mt-1">
                {earningsRides.length} rides
              </p>
            </div>
            {earningsRides.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  No rides in this period
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {earningsRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-card border border-border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {ride.pickup}{" "}
                        <ChevronRight className="w-3 h-3 inline" /> {ride.drop}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ride.createdAt.toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className="font-bold text-primary">₹{ride.fare}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border flex z-20">
        {(
          [
            { id: "home", label: "Home", icon: Home },
            { id: "earnings", label: "Earnings", icon: TrendingUp },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            data-ocid={`driver.${id}.tab`}
            onClick={() => setTab(id as DriverTab)}
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
