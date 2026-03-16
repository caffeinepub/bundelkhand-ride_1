import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bike } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LoginScreenProps {
  loginRole: "user" | "driver";
  onLogin: (phone: string) => void;
}

export function LoginScreen({ loginRole, onLogin }: LoginScreenProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSendOtp() {
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      toast.success("OTP sent! Use 1234 for demo");
    }, 1000);
  }

  function handleVerify() {
    if (otp !== "1234") {
      toast.error("Invalid OTP. Use 1234 for demo");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(phone);
      toast.success("Welcome to Bundelkhand Ride!");
    }, 800);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pt-16 pb-8">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <img
              src="/assets/generated/logo-transparent.dim_400x400.png"
              alt="Bundelkhand Ride"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Bundelkhand Ride
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loginRole === "driver"
              ? "Driver Portal"
              : "Fast. Safe. Affordable."}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4 animate-slide-up">
          {!otpSent ? (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="phone-input"
                  className="text-sm font-medium text-foreground"
                >
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-card border border-border rounded-lg text-muted-foreground text-sm">
                    +91
                  </span>
                  <Input
                    id="phone-input"
                    data-ocid="login.input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className="bg-card border-border text-foreground placeholder:text-muted-foreground flex-1"
                  />
                </div>
              </div>
              <Button
                data-ocid="login.primary_button"
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-base"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="otp-input"
                  className="text-sm font-medium text-foreground"
                >
                  Enter OTP
                </label>
                <p className="text-xs text-muted-foreground">
                  OTP sent to +91 {phone}
                </p>
                <Input
                  id="otp-input"
                  data-ocid="login.otp_input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-widest font-bold"
                />
                <p className="text-xs text-primary text-center">
                  Demo OTP: 1234
                </p>
              </div>
              <Button
                data-ocid="login.submit_button"
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-base"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground text-center"
                onClick={() => setOtpSent(false)}
              >
                Change number
              </button>
            </>
          )}
        </div>
      </div>

      <div className="text-center py-4 text-xs text-muted-foreground">
        Serving Orchha &amp; Tikamgarh region
      </div>
    </div>
  );
}
