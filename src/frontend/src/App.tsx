import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "@/context/AppContext";
import { AdminPanel } from "@/panels/AdminPanel";
import { DriverPanel } from "@/panels/DriverPanel";
import { UserPanel } from "@/panels/UserPanel";
import { AnimatePresence, motion } from "motion/react";

function RoleSwitcher() {
  const { currentRole, setCurrentRole, setLoggedInUser, setLoggedInDriver } =
    useApp();

  function switchRole(role: "user" | "driver" | "admin") {
    setCurrentRole(role);
    setLoggedInUser(null);
    setLoggedInDriver(null);
  }

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-black/90 backdrop-blur-md border-b border-border">
      <div className="flex">
        {(["user", "driver", "admin"] as const).map((role) => (
          <button
            type="button"
            key={role}
            data-ocid={`nav.${role}.tab`}
            onClick={() => switchRole(role)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider capitalize transition-all ${
              currentRole === role
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}

function AppInner() {
  const { currentRole } = useApp();

  return (
    <div className="min-h-screen bg-black flex items-start justify-center md:py-4">
      {/* Desktop background */}
      <div
        className="hidden md:block fixed inset-0 bg-black"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, oklch(0.18 0.03 90) 0%, oklch(0.05 0 0) 70%)",
        }}
      />

      {/* Phone frame */}
      <div className="relative w-full max-w-[430px] min-h-screen md:min-h-0 md:h-[844px] md:rounded-[40px] overflow-hidden md:shadow-phone md:border md:border-white/10">
        <div className="pt-10 h-full bg-background overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRole}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentRole === "user" && <UserPanel />}
              {currentRole === "driver" && <DriverPanel />}
              {currentRole === "admin" && <AdminPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
        <RoleSwitcher />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
      <Toaster position="top-center" richColors />
    </AppProvider>
  );
}
