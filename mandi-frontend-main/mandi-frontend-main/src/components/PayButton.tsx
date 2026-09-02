"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api-client";
import { loadRazorpayScript, type RazorpayResponse } from "@/lib/razorpay";
import type { Order } from "@/lib/types";

interface CreatePaymentResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export function PayButton({
  order,
  contactName,
  contactPhone,
  onPaid,
}: {
  order: Order;
  contactName?: string;
  contactPhone?: string;
  onPaid: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  async function handlePay() {
    setLoading(true);
    try {
      const [payment, scriptLoaded] = await Promise.all([
        api.post<CreatePaymentResponse>("/payment/create", { orderId: order._id }),
        loadRazorpayScript(),
      ]);

      if (!scriptLoaded || !window.Razorpay) {
        show("Couldn't load payment gateway. Check your connection.", "error");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency,
        name: "Mandi",
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        order_id: payment.razorpayOrderId,
        prefill: { name: contactName, contact: contactPhone },
        theme: { color: "#16213e" },
        handler: async (response: RazorpayResponse) => {
          try {
            await api.post("/payment/verify", {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            show("Payment successful");
            onPaid();
          } catch (err) {
            show(err instanceof ApiError ? err.message : "Payment verification failed", "error");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't start payment", "error");
      setLoading(false);
    }
  }

  return (
    <Button onClick={handlePay} disabled={loading} className="w-full">
      {loading ? "Opening payment…" : "Pay now"}
    </Button>
  );
}
