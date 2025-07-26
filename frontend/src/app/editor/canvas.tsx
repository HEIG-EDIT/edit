import Konva from 'konva';

class LayerWrapper {
	private layer: Konva.Layer
	constructor() {
		this.layer = new Konva.Layer();
	}

	getWidth() {
		return this.layer.width();
	}

	getHeight() {
		return this.layer.height();
	}

	getImageData() {
		const ctx = this.layer.getContext();

		return ctx.getImageData(0, 0, this.getWidth(), this.getHeight());
	}

	clearCtx() {
		const ctx = this.layer.getContext();
		ctx.clearRect(0, 0, this.getWidth(), this.getHeight());

		return ctx;
	}

	setImageData(newImage: ImageData) {
		const ctx = this.clearCtx();
		ctx.putImageData(newImage, 0, 0);

		this.layer.draw();
	}

	setImage(newImage: HTMLImageElement) {
		const ctx = this.clearCtx();

		ctx.drawImage(newImage, 0, 0);
		this.layer.draw();
	}

};

class CanvasLogic {
	private layers: LayerWrapper[];
	private stage: Konva.Stage;

	constructor() {
		this.layers = [];
		this.stage = new Konva.Stage({
			container: 'stage-container',
			width: 800,
			height: 600

		});
	};

	addLayer() {
	  const layer = new LayerWrapper();
	  this.layers.push(layer);
	}
}

export default function CanvasComponent() {
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new window.Image();
			img.src = event.target?.result as string;
			img.onload = () => {
				setImage(img); // Store it in React state
			};
		};
		reader.readAsDataURL(file);
	};
	return (
		<div id="canvas">
			<input
				type="file"
				accept="image/*"
				onChange={(e) => handleFileChange(e)}
			/>
			<div id="stage-container"></div>
		</div>
	)
};
