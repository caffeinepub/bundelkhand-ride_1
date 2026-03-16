import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import {
  Car,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AdminTab = "dashboard" | "drivers" | "users" | "rides";

export function AdminPanel() {
  const { rides, drivers, setDrivers, users } = useApp();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [rideFilter, setRideFilter] = useState<
    "all" | "pending" | "on_ride" | "completed" | "cancelled"
  >("all");
  const [expandedRide, setExpandedRide] = useState<string | null>(null);

  function handleApprove(driverId: string) {
    setDrivers(
      drivers.map((d) => (d.id === driverId ? { ...d, approved: true } : d)),
    );
    toast.success("Driver approved!");
  }

  function handleReject(driverId: string) {
    setDrivers(drivers.filter((d) => d.id !== driverId));
    toast.error("Driver rejected and removed");
  }

  const totalEarnings = rides
    .filter((r) => r.status === "completed")
    .reduce((s, r) => s + r.fare, 0);
  const activeDrivers = drivers.filter((d) => d.online && d.approved).length;
  const pendingDrivers = drivers.filter((d) => !d.approved).length;
  const filteredRides =
    rideFilter === "all" ? rides : rides.filter((r) => r.status === rideFilter);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    accepted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    on_ride: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <img
              src="/assets/generated/logo-transparent.dim_400x400.png"
              alt=""
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="font-display font-bold text-foreground">
              Admin Panel
            </p>
            <p className="text-xs text-muted-foreground">Bundelkhand Ride</p>
          </div>
          {pendingDrivers > 0 && (
            <Badge className="ml-auto bg-destructive text-destructive-foreground">
              {pendingDrivers} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border px-4 flex gap-1 overflow-x-auto scrollbar-hide">
        {(["dashboard", "drivers", "users", "rides"] as const).map((t) => (
          <button
            type="button"
            key={t}
            data-ocid={`admin.${t}.tab`}
            onClick={() => setTab(t)}
            className={`py-3 px-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {tab === "dashboard" && (
          <div className="px-4 py-4 space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Dashboard
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Total Rides",
                  value: rides.length,
                  icon: Car,
                  color: "text-primary",
                },
                {
                  label: "Active Drivers",
                  value: activeDrivers,
                  icon: Users,
                  color: "text-green-400",
                },
                {
                  label: "Total Users",
                  value: users.length,
                  icon: Users,
                  color: "text-blue-400",
                },
                {
                  label: "Total Earnings",
                  value: `₹${totalEarnings}`,
                  icon: TrendingUp,
                  color: "text-primary",
                },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  data-ocid={`admin.stats_card.${idx + 1}`}
                  className="bg-card border border-border rounded-2xl p-4"
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                  <p className="text-2xl font-bold font-display text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent rides */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-3">
                Recent Rides
              </h3>
              <div className="space-y-2" data-ocid="admin.rides_table">
                {rides.slice(0, 5).map((ride) => (
                  <div
                    key={ride.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm text-foreground">{ride.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {ride.pickup} → {ride.drop}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ₹{ride.fare}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[ride.status]}`}
                      >
                        {ride.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "drivers" && (
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">
                Drivers
              </h2>
              {pendingDrivers > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  {pendingDrivers} pending
                </Badge>
              )}
            </div>
            {drivers.map((driver, idx) => (
              <div
                key={driver.id}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {driver.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {driver.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {driver.phone} · {driver.bikeNumber}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      driver.approved
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {driver.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Rating: {driver.rating}★</span>
                  <span>Earnings: ₹{driver.earnings}</span>
                  <span>{driver.online ? "🟢 Online" : "⚫ Offline"}</span>
                </div>
                {!driver.approved && (
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`admin.approve_button.${idx + 1}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl h-9"
                      onClick={() => handleApprove(driver.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      data-ocid={`admin.reject_button.${idx + 1}`}
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-sm font-semibold rounded-xl h-9"
                      onClick={() => handleReject(driver.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="px-4 py-4 space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Users
            </h2>
            <div data-ocid="admin.users_table" className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="font-bold text-foreground">
                      {user.name[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      ₹{user.walletBalance}
                    </p>
                    <p className="text-xs text-muted-foreground">wallet</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rides" && (
          <div className="px-4 py-4 space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              All Rides
            </h2>
            {/* Filter */}
            <div
              className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1"
              data-ocid="admin.ride_filter_tab"
            >
              {(
                ["all", "pending", "on_ride", "completed", "cancelled"] as const
              ).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setRideFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                    rideFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {f === "on_ride"
                    ? "On Ride"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredRides.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    No rides found
                  </p>
                </div>
              ) : (
                filteredRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      className="w-full p-4 flex items-center justify-between"
                      onClick={() =>
                        setExpandedRide(
                          expandedRide === ride.id ? null : ride.id,
                        )
                      }
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          {ride.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ride.pickup} → {ride.drop}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[ride.status]}`}
                        >
                          {ride.status}
                        </span>
                        {expandedRide === ride.id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    {expandedRide === ride.id && (
                      <div className="px-4 pb-4 space-y-1.5 border-t border-border pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Fare</span>
                          <span className="text-foreground font-semibold">
                            ₹{ride.fare}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Distance
                          </span>
                          <span className="text-foreground">
                            {ride.distance} km
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Payment</span>
                          <span className="text-foreground capitalize">
                            {ride.paymentMethod}
                          </span>
                        </div>
                        {ride.driverName && (
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Driver
                            </span>
                            <span className="text-foreground">
                              {ride.driverName}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Date</span>
                          <span className="text-foreground">
                            {ride.createdAt.toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
