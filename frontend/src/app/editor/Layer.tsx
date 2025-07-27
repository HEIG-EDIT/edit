"use client"
import { Image as ReactKonvaImage, Layer as ReactKonvaLayer } from "react-konva"

interface LayerProps {
    image: HTMLImageElement
    ref: any
    id: number
    x: number
    y: number
    onDragEnd: any
}

export const LayerComponent = ({ image, onDragEnd, x, y, id, ref }: LayerProps) => {
    return (
        <ReactKonvaLayer
            x={x}
            y={y}
            id={id.toString()}
            onDragEnd={onDragEnd}
            draggable={true}
            ref={ref}
        >
            <ReactKonvaImage image={image} />
        </ReactKonvaLayer>
    )
}
