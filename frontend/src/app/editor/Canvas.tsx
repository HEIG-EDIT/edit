"use client"
import { useRef, useEffect, useState } from "react"
import { Stage, Layer as KonvaLayerComponent } from "react-konva"
import { LayerComponent } from "./Layer"

const imageToImageData = (image: HTMLImageElement): ImageData => {
    const tmpCanvas = document.createElement("canvas")
    tmpCanvas.width = image.width
    tmpCanvas.height = image.height

    const ctx = tmpCanvas.getContext("2d")
    ctx?.drawImage(image, 0, 0)
    const result = ctx?.getImageData(0, 0, image.width, image.height)

    if (result) {
        return result
    }

    throw Error("Could not extract imageData from the input image.")
}

const imageDataToImage = (imageData: ImageData): HTMLImageElement => {
    var canvas = document.createElement("canvas")
    var ctx = canvas.getContext("2d")
    canvas.width = imageData.width
    canvas.height = imageData.height
    ctx?.putImageData(imageData, 0, 0)

    var image = new Image()
    image.src = canvas.toDataURL()
    return image
}

interface CanvasProps {
    width: number
    height: number
}

interface LayerState {
    image: HTMLImageElement
    imageData: ImageData
    id: number
}

export const Canvas = ({ width, height }: CanvasProps) => {
    const [nextLayerId, setNextLayerId] = useState<number>(0)
    const [layers, setLayers] = useState<LayerState[]>([])

    const useLayerId = (): number => {
        const result = nextLayerId
        setNextLayerId((prev) => prev + 1)

        return result
    }

    const findLayer = (layerId: number): [number, LayerState] => {
        for (const [i, layer] of layers.entries()) {
            if (layer.id == layerId) {
                return [i, layer]
            }
        }

        throw Error(`Could not find layer with id ${layerId}`)
    }

    const editLayer = (layerId: number) => {
        const [i, layer] = findLayer(layerId)

        const width = layer.imageData.width
        const height = layer.imageData.height

        const newPixels = layer.imageData.data.slice()
        for (let i = 0; i < width * height * 4; i += 12) {
            newPixels[i] = 255
            newPixels[i + 1] = 0
            newPixels[i + 2] = 255
        }

        const newImageData = new ImageData(newPixels, width, height)
        const newLayer: LayerState = {
            imageData: newImageData,
            image: imageDataToImage(newImageData),
            id: layer.id,
        }

        setLayers((prev) => [
            ...prev.slice(0, i),
            newLayer,
            ...prev.slice(i + 1),
        ])
    }

    const draw = () => {
        editLayer(1)
    }

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = () => {
            const img = new Image()
            img.src = reader.result as string

            img.onload = () => {
                const layer = {
                    id: useLayerId(),
                    image: img,
                    imageData: imageToImageData(img),
                }
                setLayers((prev) => [...prev, layer])
            }
        }

        reader.readAsDataURL(file)
    }

    return (
        <div>
            <input
                name="Add layer"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
            />
            <button onClick={draw}>Rosification</button>
            <div className="border-2 " id="stage-div">
                <Stage className="border-1" width={width} height={height}>
                    {layers.map(({ image, imageData, id }) => (
                        <LayerComponent
                            key={id}
                            imageData={imageData}
                            image={image}
                        />
                    ))}
                </Stage>
            </div>
        </div>
    )
}

export default function ImageEditor() {
    return (
        <div>
            <Canvas width={800} height={600} />
        </div>
    )
}
