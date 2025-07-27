"use client"
import { useRef, useState, useCallback } from "react"
import { Stage } from "react-konva"
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
    x: number
    y: number
}

function useUndoRedo<T>(initialState: T) {
    const [states, setStates] = useState([initialState])
    const [index, setIndex] = useState(0)

    const setState = useCallback(
        (newState: T) => {
            const func =
                typeof newState === "function" ? newState : () => newState

            setStates((currentStates) => {
                const newStates = currentStates.slice(0, index + 1)
                return [...newStates, func(currentStates[index])]
            })
            setIndex((currentIndex) => currentIndex + 1)
        },
        [index]
    )

    const undo = useCallback(() => {
        setIndex((currentIndex) => Math.max(0, currentIndex - 1))
    }, [])

    const redo = useCallback(() => {
        setIndex((currentIndex) =>
            Math.min(states.length - 1, currentIndex + 1)
        )
    }, [states.length])

    const canUndo = index > 0
    const canRedo = index < states.length - 1

    return {
        state: states[index],
        setState,
        undo,
        redo,
        canUndo,
        canRedo,
    }
}

export const Canvas = ({ width, height }: CanvasProps) => {
    const [nextLayerId, setNextLayerId] = useState<number>(0)
    const {
        state: layers,
        setState: setLayers,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useUndoRedo([])

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
        changeLayer(i, () => {
            return {
                ...layer,
                imageData: newImageData,
                image: imageDataToImage(newImageData),
            }
        })
    }

    const changeLayer = (
        i: index,
        callback: (layerState: LayerState) => LayerState
    ) => {
        const layer = layers[i]
        const newLayer = callback(layer)

        setLayers((prev) => [
            ...prev.slice(0, i),
            newLayer,
            ...prev.slice(i + 1),
        ])
    }

    const handleDragEnd = (e) => {
        const id = parseInt(e.target.id())
        const [i, _] = findLayer(id)

        changeLayer(i, (layer) => {
            let newLayer: LayerState = {
                ...layer,
                x: e.target.x(),
                y: e.target.y(),
            }
            return newLayer
        })
    }

    const draw = () => {
        editLayer(0)
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
            <button disabled={!canUndo} onClick={undo}>
                Undo
            </button>
            <button disabled={!canRedo} onClick={redo}>
                Redo
            </button>
            <div className="border-2 " id="stage-div">
                <Stage className="border-1" width={width} height={height}>
                    {layers?.map(({ image, id, x, y }) => (
                        <LayerComponent
                            key={id}
                            id={id}
                            image={image}
                            onDragEnd={handleDragEnd}
                            x={x}
                            y={y}
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
