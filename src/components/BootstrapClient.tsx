"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // Dynamically import bootstrap JS on the client side
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
