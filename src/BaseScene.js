class BaseScene extends Konva.Group {
	static sceneId = "BaseScene";
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
	/**
	 * @private
	 * @type {Konva.Transformer}
	 */
	_scaleTransformer;

	constructor(stage, sceneManager) {
		super();
		this._stage = stage;
		this._sceneManager = sceneManager;
		this._scaleTransformer = new ScaleTransformer();
		this.add(this._scaleTransformer);
		this._handlePointerDown = this._handlePointerDown.bind(this);
		this._handleDoubleClick = this._handleDoubleClick.bind(this);
		this._handleTransformStart = this._handleTransformStart.bind(this);
	}
	/**
	 * @private
	 */
	_registerEvents() {
		this._stage.on("pointerdown", this._handlePointerDown);
		this._stage.on("pointerdblclick", this._handleDoubleClick);
		this._scaleTransformer.on("transformstart", this._handleTransformStart);
	}
	/**
	 * @private
	 */
	_unbindEvents() {
		this._stage.off("pointerdown", this._handlePointerDown);
		this._stage.off("pointerdblclick", this._handleDoubleClick);
		this._scaleTransformer.off("transformstart", this._handleTransformStart);
	}
	/**
	 * @private
	 */
	_handlePointerDown({ target }) {
		if (target.hasName("_anchor")) {
			return;
		}
		if (target.className === "Image") {
			const isSelected = this.getSelection() === target;
			if (isSelected) {
				return;
			}
			this.setSelection([target]);
		} else {
			this.setSelection([]);
		}
	}
	/**
	 * @private
	 */
	_handleDoubleClick(e) {
		const selection = this.getSelection();
		if (e.target === selection) {
			if (selection.className === "Image") {
				this._sceneManager.goto(CropScene);
			}
		}
	}
	/**
	 * @private
	 */
	_handleTransformStart() {
		const selection = this.getSelection();
		const activeAnchor = this._scaleTransformer.getActiveAnchor();
		selection.handleTransformStart(activeAnchor);

		const transformHandler = () => {
			selection.handleTransform(activeAnchor);
		};

		const transformEndHandler = () => {
			this._scaleTransformer.off("transform", transformHandler);
			this._scaleTransformer.off("transformend", transformEndHandler);
			selection.handleTransformEnd(activeAnchor);
		};

		this._scaleTransformer.on("transform", transformHandler);
		this._scaleTransformer.on("transformend", transformEndHandler);
	}

	hide() {
		super.hide();
		this._unbindEvents();
	}

	show() {
		super.show();
		this._registerEvents();
	}

	getSelection() {
		return this._scaleTransformer.nodes()[0] ?? null;
	}

	setSelection(target) {
		this._scaleTransformer.nodes(target);
	}
}
