"use client"
import { useRef, useState } from "react"
import { Stage, Layer as KonvaLayer, Image as KonvaImage } from "react-konva"
import Konva from "konva"
import ImageEditor from "./Canvas"

export default function Editor() {
    const layerRef = useRef<Konva.Layer>(null)

    const drawRect = () => {
        console.log("Drawing rectangle")
        if (!layerRef.current) {
            return
        }

        const layer = layerRef.current

        layer.destroyChildren()

        const ctx = layer.getContext()
        ctx.clearRect(0, 0, layer.width(), layer.height())

        ctx.fillStyle = "blue"
        ctx.fillRect(200, 200, 200, 200)

        layer.batchDraw()

        console.log("Done")
    }

    return (
        <main>
            <ImageEditor />
        </main>
    )
}
