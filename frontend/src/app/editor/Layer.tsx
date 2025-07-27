"use client"
import { Image as ReactKonvaImage, Layer as ReactKonvaLayer } from "react-konva"

export const LayerComponent = ({ image }: LayerProps) => {
    return (
        <ReactKonvaLayer draggable={true}>
            <ReactKonvaImage image={image} />
        </ReactKonvaLayer>
    )
}
