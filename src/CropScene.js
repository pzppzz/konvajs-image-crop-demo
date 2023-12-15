class CropScene extends Konva.Group {
	static sceneId = "CropScene";
	/**
	 * transformer for crop
	 * @private
	 * @type {Konva.Transformer}
	 */
	_cropTransformer;
	/**
	 * transformer for scale
	 * @private
	 * @type {Konva.Transformer}
	 */
	_scaleTransformer;
	/**
	 * canvas mask
	 * @private
	 * @type {Konva.Rect}
	 */
	_mask;
	/**
	 * image without crop
	 * @private
	 * @type {Konva.Image}
	 */
	_originImage;
	/**
	 * @private
	 * @type {Konva.Group}
	 */
	_cropGroup;
	/**
	 * for clipping the image('Konva.Image' doesn't have the property 'clip')
	 * @private
	 * @type {Konva.Group}
	 */
	_clipGroup;
	/**
	 * highlight image
	 * @private
	 * @type {Konva.Image}
	 */
	_clipImage;
	/**
	 * the cropped area of the image
	 * @private
	 * @type {Konva.Rect}
	 */
	_clipRect;
	/**
	 * grid line
	 * @private
	 * @type {Konva.Group}
	 */
	_grid;
	/**
	 * @private
	 * @type {Konva.Stage}
	 */
	_stage;
	/**
	 * @private
	 * @type {SceneManager}
	 */
	_sceneManager;

	constructor(stage, sceneManager) {
		super();
		this._stage = stage;
		this._sceneManager = sceneManager;
		this._createMask();
		this._createTransformer();
		this._handlePointerDown = this._handlePointerDown.bind(this);
		this._handleCrop = this._handleCrop.bind(this);
		this._handleScale = this._handleScale.bind(this);
		this._handleDrag = this._handleDrag.bind(this);
	}
	/**
	 * bind events
	 * @private
	 */
	_registerEvents() {
		this._stage.on("pointerdown", this._handlePointerDown);
		this._cropTransformer.on("dragmove", this._handleDrag);
		this._cropTransformer.on("transform", this._handleCrop);
		this._originImage.on("transform", this._handleScale);
	}
	/**
	 * unbind events
	 * @private
	 */
	_unbindEvents() {
		this._stage.off("pointerdown", this._handlePointerDown);
		this._cropTransformer.off("dragmove", this._handleDrag);
		this._cropTransformer.off("transform", this._handleCrop);
		this._originImage.off("transform", this._handleScale);
	}
	/**
	 * scale
	 * @private
	 */
	_handleScale() {
		const originImage = this._originImage;

		const scaleX = originImage.scaleX();
		const scaleY = originImage.scaleY();
		const width = originImage.width() * scaleX;
		const height = originImage.height() * scaleY;

		const rectAbspos = this._clipRect.absolutePosition();
		const imageAbsPos = this._cropGroup.absolutePosition();

		this._cropGroup.absolutePosition(originImage.absolutePosition());
		// should not change the position of the 'clipRect'
		this._clipRect.absolutePosition(rectAbspos);
		// scale limit
		if (
			this._clipRect.x() <= 0 ||
			this._clipRect.y() <= 0 ||
			this._clipRect.x() + this._clipRect.width() >= width ||
			this._clipRect.y() + this._clipRect.height() >= height
		) {
			this._cropGroup.absolutePosition(imageAbsPos);
			this._clipRect.absolutePosition(rectAbspos);
			this._originImage.setAttrs({
				width: this._clipImage.width(),
				height: this._clipImage.height(),
				scaleX: 1,
				scaleY: 1,
				absolutePosition: imageAbsPos,
			});
		} else {
			originImage.setAttrs({
				scaleX: 1,
				scaleY: 1,
				width,
				height,
			});
			this._clipImage.setAttrs({
				width,
				height,
			});
		}
		const x = this._clipRect.x();
		const y = this._clipRect.y();
		this._clipGroup.clipX(x);
		this._clipGroup.clipY(y);
		this._grid.position({ x, y });
	}
	/**
	 * move
	 * @private
	 */
	_handleDrag() {
		let x = this._clipRect.x();
		let y = this._clipRect.y();
		let width = this._clipRect.width();
		let height = this._clipRect.height();
		const originWidth = this._originImage.width();
		const originHeight = this._originImage.height();

		if (x < 0) {
			x = 0;
		}
		if (x + width > originWidth) {
			x = originWidth - width;
			width = originWidth - x;
		}
		if (y < 0) {
			y = 0;
		}
		if (y + height > originHeight) {
			y = originHeight - height;
			height = originHeight - y;
		}

		this._clipRect.setAttrs({
			x,
			y,
			width,
			height,
		});
		this._clipGroup.clip({
			x,
			y,
			width,
			height,
		});
		this._grid.position({ x, y });
		this._drawGridLine(width, height);
	}
	/**
	 * crop
	 */
	_handleCrop() {
		let x = this._clipRect.x();
		let y = this._clipRect.y();
		let width = this._clipRect.width() * this._clipRect.scaleX();
		let height = this._clipRect.height() * this._clipRect.scaleY();
		if (x < 0) {
			width += x;
			x = 0;
		}
		if (x + width > this._originImage.width()) {
			width = this._originImage.width() - x;
		}
		if (y < 0) {
			height += y;
			y = 0;
		}
		if (y + height > this._originImage.height()) {
			height = this._originImage.height() - y;
		}
		this._clipRect.setAttrs({
			x,
			y,
			width,
			height,
			scaleX: 1,
			scaleY: 1,
		});
		this._cropTransformer.absolutePosition(this._clipRect.absolutePosition());
		this._clipGroup.clip({
			x,
			y,
			width,
			height,
		});
		this._grid.position({ x, y });
		this._drawGridLine(width, height);
	}
	/**
	 * update the image we selected
	 * @private
	 */
	_handleCropEnd() {
		const selectedImage = this._sceneManager.getScene(BaseScene).getSelection();
		const image = selectedImage.image(); // dom img
		const ratio = this._originImage.width() / image.width;
		const cropX = this._clipRect.x() / ratio;
		const cropY = this._clipRect.y() / ratio;
		const width = this._clipRect.width();
		const height = this._clipRect.height();
		const cropWidth = (width * image.width) / this._originImage.width();
		const cropHeight = (height * image.height) / this._originImage.height();
		selectedImage.setAttrs({
			width,
			height,
			cropX,
			cropY,
			cropWidth,
			cropHeight,
		});
		selectedImage.absolutePosition(this._clipRect.absolutePosition());
	}
	/**
	 * draw the grid line
	 * @param {number} width
	 * @param {number} height
	 */
	_drawGridLine(width, height) {
		this._grid.destroyChildren();
		const stepX = width / 3;
		const stepY = height / 3;
		for (let i = 1; i <= 2; i++) {
			const vLine = new Konva.Line({
				points: [stepX * i, 0, stepX * i, height],
				stroke: "#ffffff",
				strokeWidth: 1,
			});
			const hLine = new Konva.Line({
				points: [0, stepY * i, width, stepY * i],
				stroke: "#ffffff",
				strokeWidth: 1,
			});
			this._grid.add(vLine, hLine);
		}
	}
	/**
	 * @private
	 * @param {*} e
	 */
	_handlePointerDown(e) {
		const target = e.target;
		if (target.hasName("mask")) {
			this._handleCropEnd();
			this._sceneManager.goto(BaseScene);
		}
	}
	/**
	 * @private
	 */
	_createMask() {
		const rect = new Konva.Rect({
			width: this._stage.width(),
			height: this._stage.height(),
			fill: "rgba(0, 0, 0, 0.5)",
		});
		rect.addName("mask");
		this._mask = rect;
		this.add(rect);
	}
	/**
	 * @private
	 */
	_createTransformer() {
		this._cropTransformer = new Konva.Transformer({
			flipEnabled: false,
			keepRatio: false,
			rotateEnabled: false,
			enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
		});
		this._scaleTransformer = new ScaleTransformer({
			flipEnabled: false,
			rotateEnabled: false,
			enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
		});
		this.add(this._cropTransformer, this._scaleTransformer);
	}

	show() {
		this.visible(true);
		const selectedImage = this._sceneManager.getScene(BaseScene).getSelection();
		const abspos = selectedImage.absolutePosition();
		const ratio = selectedImage.width() / selectedImage.cropWidth();

		const originWidth = ratio * selectedImage.image().width;
		const originHeight = ratio * selectedImage.image().height;
		const cropX = selectedImage.cropX() * ratio;
		const cropY = selectedImage.cropY() * ratio;

		this._originImage = selectedImage.clone({
			cropX: 0,
			cropY: 0,
			cropWidth: 0,
			cropHeight: 0,
			width: originWidth,
			height: originHeight,
			draggable: false,
		});

		this._cropGroup = new Konva.Group({
			rotation: selectedImage.rotation(),
			draggable: false,
			absolutePosition: {
				x: abspos.x,
				y: abspos.y,
			},
		});

		this._clipRect = new Konva.Rect({
			width: selectedImage.width(),
			height: selectedImage.height(),
			draggable: true,
		});

		this._clipGroup = new Konva.Group();
		this._clipImage = this._originImage.clone({
			x: 0,
			y: 0,
			rotation: 0,
		});
		this._clipGroup.add(this._clipImage);

		this._grid = new Konva.Group();
		this._cropGroup.add(this._clipGroup, this._clipRect, this._grid);

		selectedImage.hide();

		this.add(this._originImage, this._cropGroup);
		// adjust position
		this._clipRect.position({ x: -cropX, y: -cropY });
		const pos = this._clipRect.absolutePosition();
		this._originImage.absolutePosition({ ...pos });
		this._cropGroup.absolutePosition({ ...pos });
		this._clipRect.position({ x: cropX, y: cropY });

		this._handleCrop();
		this._cropTransformer.nodes([this._clipRect]);
		this._scaleTransformer.nodes([this._originImage]);
		this._cropTransformer.zIndex(4);
		this._mask.zIndex(2);
		this._scaleTransformer.zIndex(3);
		this._registerEvents();
	}

	hide() {
		this._unbindEvents();
		this.visible(false);
		this._originImage.destroy();
		this._cropGroup.destroy();
		this._originImage = null;
		this._cropGroup = null;
		this._clipGroup = null;
		this._clipImage = null;
		this._clipRect = null;
		this._grid = null;
		this._cropTransformer.nodes([]);
		this._scaleTransformer.nodes([]);
		const selectedImage = this._sceneManager.getScene(BaseScene).getSelection();
		selectedImage.show();
	}
}
