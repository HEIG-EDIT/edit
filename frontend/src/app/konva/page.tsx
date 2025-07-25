"use client";
import dynamic from "next/dynamic";

const Canvas = dynamic(
  () => import("../../components/konva/canvas").then((mod) => mod.Canvas),
  {
    ssr: false,
  },
);

export default function Page() {
  return <Canvas />;
}
