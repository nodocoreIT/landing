import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.1.37"],
  turbopack: {
    root: "/Users/ramirotule/Documents/1.Proyectos/nodocore/nodo-core",
  },
};

export default nextConfig;
