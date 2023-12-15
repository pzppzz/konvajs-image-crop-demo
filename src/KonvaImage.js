class KonvaImage extends Konva.Image {
	/**
	 * last size
	 * @private
	 * @type {{width: number, height: number}}
	 */
	_lastSize;
	/**
	 * last crop
	 * @private
	 * @type {{x: number, y: number, width: number, height: number}}
	 */
	_lastCrop;

	constructor(imageData) {
		super(imageData);
		this.draggable(true);
		this.cropWidth(imageData.image.width);
		this.cropHeight(imageData.image.height);
		this._lastCrop = this.crop();
	}
	/**
	 * before transform
	 */
	handleTransformStart() {
		this._lastSize = this.size();
		this._lastCrop = this.crop();
	}
	/**
	 * transforming
	 * @param {string} activeAnchor
	 */
	handleTransform(activeAnchor) {
		this.setAttrs({
			scaleX: 1,
			scaleY: 1,
			width: this.width() * this.scaleX(),
			height: this.height() * this.scaleY(),
		});
		this.handleCrop(this.size(), this._lastSize, this._lastCrop, activeAnchor);
	}
	/**
	 * after transform
	 */
	handleTransformEnd() {
		this._lastSize = null;
		this._lastCrop = null;
	}
	/**
	 * keep ratio when scaling
	 * @param {typeof this._lastSize} curSize
	 * @param {typeof this._lastSize} lastSize
	 * @param {typeof this._lastCrop} lastCrop
	 * @param {string} anchor
	 */
	handleCrop(curSize, lastSize, lastCrop, anchor) {
		let ratio;
		let newCropWidth = lastCrop.width;
		let newCropHeight = lastCrop.height;
		const image = this.image();
		if (anchor === "middle-left" || anchor === "middle-right") {
			if (curSize.width < lastSize.width) {
				ratio = curSize.width / lastSize.width;
				newCropWidth = lastCrop.width * ratio;
				this.cropWidth(newCropWidth);
			} else {
				ratio = lastCrop.height / lastSize.height;
				newCropWidth = curSize.width * ratio;
				if (newCropWidth > image.width - lastCrop.x) {
					ratio = (image.width - lastCrop.x) / curSize.width;
					newCropHeight = curSize.height * ratio;
					this.cropHeight(newCropHeight);
				} else {
					this.cropWidth(newCropWidth);
				}
			}
		} else if (anchor === "top-center" || anchor === "bottom-center") {
			if (curSize.height < lastSize.height) {
				ratio = curSize.height / lastSize.height;
				newCropHeight = lastCrop.height * ratio;
				this.cropHeight(newCropHeight);
			} else {
				ratio = lastCrop.width / lastSize.width;
				newCropHeight = curSize.height * ratio;
				if (newCropHeight > image.height - lastCrop.y) {
					ratio = (image.height - lastCrop.y) / curSize.height;
					newCropWidth = curSize.width * ratio;
					this.cropWidth(newCropWidth);
				} else {
					this.cropHeight(newCropHeight);
				}
			}
		}
	}
}
