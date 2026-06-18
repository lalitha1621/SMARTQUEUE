import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function DisplayBoard() {
  const [nowServing, setNowServing] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    socket.on("token_called", (data) => {
      // Native audio chime ring context
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } catch (e) {
        console.warn("Audio Context navigation ping blocked.");
      }

      setNowServing(data);
      setHistory((prev) => [data.token_number, ...prev.slice(0, 4)]);
    });

    return () => socket.off("token_called");
  }, []);

  return (
    <div style={{ background: "#0F172A", minHeight: "100vh", color: "#F8FAFC", padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #334155", paddingBottom: "20px", marginBottom: "40px" }}>
        <h1 style={{ margin: 0, fontSize: "36px", color: "#38BDF8" }}>LIVE QUEUE SYSTEM DISPLAY BOARD</h1>
        <p style={{ margin: "5px 0 0 0", color: "#94A3B8" }}>Proceed to your counter once your token ID flashes on the monitor matrix.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: "40px" }}>
        <div style={{ background: "#1E293B", padding: "60px 40px", borderRadius: "24px", textAlign: "center", border: "3px solid #0284C7" }}>
          <span style={{ fontSize: "18px", color: "#38BDF8", fontWeight: "bold", letterSpacing: "2px" }}>NOW SERVING</span>
          {nowServing ? (
            <div>
              <h1 style={{ fontSize: "120px", margin: "15px 0", color: "#38BDF8", fontWeight: "900" }}>{nowServing.token_number}</h1>
              <p style={{ fontSize: "22px", color: "#94A3B8" }}>Client Holder Name: <strong style={{ color: "#fff" }}>{nowServing.customer_name}</strong></p>
            </div>
          ) : <h2 style={{ fontSize: "36px", color: "#475569", margin: "70px 0" }}>System Idle - Awaiting Calls</h2>}
        </div>

        <div style={{ background: "#1E293B", padding: "25px", borderRadius: "24px", border: "1px solid #334155" }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#94A3B8" }}>RECENTLY LOGGED</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {history.slice(1).map((tok, idx) => (
              <div key={idx} style={{ padding: "15px", background: "#334155", borderRadius: "10px", fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#E2E8F0" }}>{tok}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}