import React, { useState, useEffect, useRef, useCallback } from "react";
import { OTPInput } from "input-otp";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = "http://localhost:5000/testuser";
const RESEND_COOLDOWN = 60;
const OTP_LENGTH = 5; // matches backend generateOtp()
const SUCCESS_REDIRECT_DELAY = 900;

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function OTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email is needed for resend. It is expected to be passed via navigate("/otp", { state: { email } })
  // (or ?email=... in the URL) from the registration screen.
  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    "";

  const [otp, setOtp] = useState("");
  // status: "idle" | "verifying" | "success" | "error"
  const [status, setStatus] = useState("idle");
  const [errorText, setErrorText] = useState("");
  const [shake, setShake] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendNotice, setResendNotice] = useState(null); // { type: "success" | "error", text }
  // The code was just sent when this screen opens, so the countdown starts immediately.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const inputRef = useRef(null);
  const verifyInFlight = useRef(false);
  const resendInFlight = useRef(false);
  const redirectTimer = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(redirectTimer.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVerify = useCallback(
    async (code) => {
      // Guard against duplicate calls (fast typing, paste + change, re-renders)
      if (verifyInFlight.current || status === "success") return;
      if (!code || code.length !== OTP_LENGTH) return;

      verifyInFlight.current = true;
      setStatus("verifying");
      setErrorText("");
      setResendNotice(null);

      let failed = false;

      try {
        const response = await fetch(`${API_BASE}/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: code }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (!mounted.current) return;
          setStatus("success");
          redirectTimer.current = setTimeout(() => navigate("/"), SUCCESS_REDIRECT_DELAY);
          return;
        }

        failed = true;
        if (mounted.current) setErrorText(data.error || "Invalid code. Please try again.");
      } catch (err) {
        console.error(err);
        failed = true;
        if (mounted.current) setErrorText("Server error. Please try again.");
      } finally {
        verifyInFlight.current = false;
      }

      if (failed && mounted.current) {
        setStatus("error");
        setShake(true);
        // Let the user see the error state briefly, then clear for re-entry
        setTimeout(() => {
          if (!mounted.current) return;
          setShake(false);
          setOtp("");
          inputRef.current?.focus();
        }, 600);
      }
    },
    [navigate, status]
  );

  const handleChange = (value) => {
    setOtp(value);
    if (status === "error") {
      setStatus("idle");
      setErrorText("");
    }
  };

  const handleResend = async () => {
    if (!email) {
      setResendNotice({ type: "error", text: "Email not found. Please register again." });
      return;
    }
    if (cooldown > 0 || resendInFlight.current || status === "verifying" || status === "success") return;

    resendInFlight.current = true;
    setResendLoading(true);
    setResendNotice(null);

    try {
      const response = await fetch(`${API_BASE}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendNotice({ type: "success", text: "A new verification code has been sent." });
        setCooldown(RESEND_COOLDOWN);
        setOtp("");
        setStatus("idle");
        setErrorText("");
        inputRef.current?.focus();
      } else {
        setResendNotice({ type: "error", text: data.error || "Could not resend code. Please try again." });
      }
    } catch (error) {
      console.error(error);
      setResendNotice({ type: "error", text: "Server error. Please try again." });
    } finally {
      resendInFlight.current = false;
      setResendLoading(false);
    }
  };

  const isVerifying = status === "verifying";
  const isSuccess = status === "success";
  const isError = status === "error";
  const isComplete = otp.length === OTP_LENGTH;

  return (
    <div className="otp-page">
      <style>{styles}</style>

      <div className="otp-card" data-status={status}>
        <div className={`otp-icon ${isSuccess ? "is-success" : ""} ${isError ? "is-error" : ""}`} aria-hidden="true">
          {isSuccess ? (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path className="otp-check" d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
              <path d="M9.5 12l2 2 3-3.5" />
            </svg>
          )}
        </div>

        <h2 className="otp-title">{isSuccess ? "Verified" : "Verify your account"}</h2>
        <p className="otp-subtitle">
          {isSuccess ? (
            "Your identity has been confirmed. Redirecting…"
          ) : (
            <>
              Enter the {OTP_LENGTH}-digit code we sent{" "}
              {email ? <strong>to {email}</strong> : "to your email"}.
            </>
          )}
        </p>

        <div className={`otp-field ${shake ? "shake" : ""}`}>
          <OTPInput
            ref={inputRef}
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={handleChange}
            onComplete={handleVerify}
            disabled={isVerifying || isSuccess}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            aria-label={`Enter the ${OTP_LENGTH}-digit verification code`}
            aria-invalid={isError}
            aria-describedby="otp-feedback"
            containerClassName="otp-container"
            render={({ slots }) => (
              <div className="otp-slots" role="group" aria-label="Verification code">
                {slots.map((slot, index) => {
                  const cls = [
                    "otp-slot",
                    slot.char ? "filled" : "empty",
                    slot.isActive && !isVerifying && !isSuccess ? "active" : "",
                    isComplete && !isError && !isSuccess ? "complete" : "",
                    isVerifying ? "verifying" : "",
                    isSuccess ? "success" : "",
                    isError ? "error" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <div key={index} className={cls}>
                      {slot.char ? <span className="otp-char">{slot.char}</span> : null}
                      {slot.hasFakeCaret && !isVerifying && !isSuccess ? <span className="otp-caret" /> : null}
                    </div>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div id="otp-feedback" className="otp-feedback" aria-live="polite" role="status">
          {isVerifying && (
            <span className="otp-msg info">
              <span className="spinner" aria-hidden="true" /> Verifying…
            </span>
          )}
          {isError && <span className="otp-msg error" role="alert">{errorText}</span>}
          {isSuccess && <span className="otp-msg success">Code verified successfully</span>}
          {!isVerifying && !isError && !isSuccess && resendNotice && (
            <span className={`otp-msg ${resendNotice.type}`}>{resendNotice.text}</span>
          )}
        </div>

        <div className="otp-resend">
          {cooldown > 0 ? (
            <p className="otp-timer">
              Resend code in <span className="otp-time">{formatTime(cooldown)}</span>
            </p>
          ) : (
            <p className="otp-timer">Didn’t receive the code?</p>
          )}
          <button
            type="button"
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0 || isVerifying || isSuccess}
          >
            {resendLoading ? (
              <>
                <span className="spinner small" aria-hidden="true" /> Sending…
              </>
            ) : (
              "Resend code"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = `
.otp-page {
  --otp-bg: #f5f6fa;
  --otp-card: #ffffff;
  --otp-text: #0f172a;
  --otp-muted: #64748b;
  --otp-border: #d9dee8;
  --otp-primary: #4f46e5;
  --otp-primary-soft: rgba(79, 70, 229, 0.14);
  --otp-success: #16a34a;
  --otp-error: #dc2626;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
  background: radial-gradient(1200px 500px at 50% -10%, #e8e9ff 0%, var(--otp-bg) 60%);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
  color: var(--otp-text);
}
.otp-page *, .otp-page *::before, .otp-page *::after { box-sizing: border-box; }

.otp-card {
  width: 100%;
  max-width: 420px;
  background: var(--otp-card);
  border: 1px solid #eceff5;
  border-radius: 20px;
  padding: 36px 28px 28px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 40px rgba(15, 23, 42, 0.08);
  animation: otp-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes otp-in { from { opacity: 0; transform: translateY(12px) scale(0.985); } to { opacity: 1; transform: none; } }

.otp-icon {
  width: 56px; height: 56px; margin: 0 auto 20px;
  display: grid; place-items: center;
  border-radius: 16px;
  color: var(--otp-primary);
  background: var(--otp-primary-soft);
  transition: background 0.3s, color 0.3s, transform 0.3s;
}
.otp-icon.is-success { color: var(--otp-success); background: rgba(22, 163, 74, 0.12); transform: scale(1.05); }
.otp-icon.is-error { color: var(--otp-error); background: rgba(220, 38, 38, 0.1); }
.otp-check { stroke-dasharray: 24; stroke-dashoffset: 24; animation: otp-draw 0.45s 0.05s ease forwards; }
@keyframes otp-draw { to { stroke-dashoffset: 0; } }

.otp-title { margin: 0 0 8px; font-size: 22px; font-weight: 650; letter-spacing: -0.01em; }
.otp-subtitle { margin: 0 0 28px; font-size: 14.5px; line-height: 1.55; color: var(--otp-muted); word-break: break-word; }
.otp-subtitle strong { color: var(--otp-text); font-weight: 600; }

.otp-field { display: flex; justify-content: center; }
.otp-field.shake { animation: otp-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
@keyframes otp-shake {
  10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(3px); }
  30%, 50%, 70% { transform: translateX(-6px); } 40%, 60% { transform: translateX(6px); }
}

.otp-slots { display: flex; gap: clamp(6px, 2.5vw, 12px); justify-content: center; }
.otp-slot {
  position: relative;
  width: clamp(42px, 13vw, 56px);
  aspect-ratio: 1 / 1.1;
  display: flex; align-items: center; justify-content: center;
  font-size: clamp(22px, 6vw, 26px); font-weight: 600;
  background: #f8fafc;
  border: 1.5px solid var(--otp-border);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.2s;
}
.otp-slot.filled { background: #fff; border-color: #aab2c5; }
.otp-slot.filled .otp-char { animation: otp-pop 0.18s ease-out; }
.otp-slot.active {
  background: #fff; border-color: var(--otp-primary);
  box-shadow: 0 0 0 4px var(--otp-primary-soft); transform: translateY(-1px);
}
.otp-slot.complete { border-color: var(--otp-primary); }
.otp-slot.verifying { border-color: var(--otp-primary); background: #f5f5ff; animation: otp-pulse 1.1s ease-in-out infinite; }
.otp-slot.verifying:nth-child(2) { animation-delay: 0.1s; } .otp-slot.verifying:nth-child(3) { animation-delay: 0.2s; }
.otp-slot.verifying:nth-child(4) { animation-delay: 0.3s; } .otp-slot.verifying:nth-child(5) { animation-delay: 0.4s; }
.otp-slot.success { border-color: var(--otp-success); background: #f0fdf4; color: var(--otp-success); }
.otp-slot.error { border-color: var(--otp-error); background: #fef2f2; color: var(--otp-error); }
@keyframes otp-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes otp-pulse { 50% { opacity: 0.6; } }

.otp-caret { width: 2px; height: 28%; background: var(--otp-primary); border-radius: 1px; animation: otp-blink 1s steps(1) infinite; }
@keyframes otp-blink { 50% { opacity: 0; } }

.otp-feedback { min-height: 40px; margin-top: 16px; display: flex; align-items: center; justify-content: center; }
.otp-msg { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 500; padding: 6px 12px; border-radius: 999px; animation: otp-in 0.25s ease; }
.otp-msg.info { color: var(--otp-primary); background: var(--otp-primary-soft); }
.otp-msg.error { color: var(--otp-error); background: rgba(220, 38, 38, 0.08); }
.otp-msg.success { color: var(--otp-success); background: rgba(22, 163, 74, 0.1); }

.otp-resend { margin-top: 12px; padding-top: 20px; border-top: 1px solid #eef1f6; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.otp-timer { margin: 0; font-size: 13.5px; color: var(--otp-muted); }
.otp-time { font-variant-numeric: tabular-nums; font-weight: 600; color: var(--otp-text); }

.otp-resend-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-width: 140px; height: 42px; padding: 0 20px;
  font: inherit; font-size: 14px; font-weight: 600;
  color: #fff; background: var(--otp-primary);
  border: none; border-radius: 10px; cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  transition: transform 0.15s, box-shadow 0.2s, background 0.2s, opacity 0.2s;
}
.otp-resend-btn:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(79, 70, 229, 0.38); }
.otp-resend-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.otp-resend-btn:focus-visible { outline: none; box-shadow: 0 0 0 4px var(--otp-primary-soft), 0 0 0 2px var(--otp-primary); }
.otp-resend-btn:disabled { background: #e8ebf2; color: #98a2b3; box-shadow: none; cursor: not-allowed; }

.spinner { width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: otp-spin 0.7s linear infinite; }
.spinner.small { width: 13px; height: 13px; }
@keyframes otp-spin { to { transform: rotate(360deg); } }

@media (max-width: 400px) {
  .otp-card { padding: 28px 18px 22px; border-radius: 16px; }
  .otp-title { font-size: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .otp-page *, .otp-page *::before, .otp-page *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;

export default OTP;