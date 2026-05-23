"use client";
import { Toaster } from "react-hot-toast";

export function Toast() {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 3500,
        style: {
          background: "var(--surface-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px var(--border)",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: 500,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        },
        success: {
          style: {
            background: "var(--surface-card)",
            border: "1px solid rgba(52,211,153,0.2)",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(52,211,153,0.2)",
          },
          iconTheme: {
            primary: "#34D399",
            secondary: "var(--surface-card)",
          },
        },
        error: {
          style: {
            background: "var(--surface-card)",
            border: "1px solid rgba(248,113,113,0.2)",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(248,113,113,0.2)",
          },
          iconTheme: {
            primary: "#F87171",
            secondary: "var(--surface-card)",
          },
        },
        loading: {
          style: {
            background: "var(--surface-card)",
            border: "1px solid rgba(200,241,53,0.2)",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,241,53,0.2)",
          },
          iconTheme: {
            primary: "var(--lime)",
            secondary: "var(--surface-card)",
          },
        },
        blank: {
          style: {
            background: "var(--surface-card)",
          },
        },
        custom: {
          style: {
            background: "var(--surface-card)",
          },
        },
      }}
    />
  );
}
