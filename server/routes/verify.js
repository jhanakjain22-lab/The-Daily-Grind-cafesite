const handlePayment = async () => {
  const response = await fetch("http://localhost:5000/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: totalAmount,
    }),
  });

  const order = await response.json();

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: "INR",
    name: "Your Cafe",
    description: "Cafe Order",
    order_id: order.id,

    handler: function (paymentResponse) {
      console.log(paymentResponse);

      // Show order confirmation
      alert("Payment successful!");
    },

    theme: {
      color: "#6F4E37",
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};