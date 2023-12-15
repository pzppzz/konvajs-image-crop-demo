class SceneManager extends Konva.Group {
	/**
	 * @private
	 * @type {Konva.Stage}
	 */
	_stage;
	/**
	 * @private
	 * @type {{new (stage): Konva.Group; hide: () => void; show: () => void; sceneId: string}}
	 */
	_currentScene;

	constructor(stage) {
		super();
		this._stage = stage;
	}
	/**
	 * get scene
	 * @param {typeof this._currentScene} SceneCtor
	 */
	getScene(SceneCtor) {
		const scene = this.children.find(
			(scene) => scene.constructor.sceneId === SceneCtor.sceneId
		);
		if (!scene) {
			throw new Error("No such scene!");
		}
		return scene;
	}
	/**
	 * @param {typeof this._currentScene} SceneCtor
	 */
	hasScene(SceneCtor) {
		return (
			this.children.findIndex(
				(scene) => scene.constructor.sceneId === SceneCtor.sceneId
			) !== -1
		);
	}
	/**
	 * change scene
	 * @param {typeof this._currentScene} SceneCtor
	 */
	goto(SceneCtor) {
		if (this._currentScene?.constructor.sceneId === SceneCtor.sceneId) {
			return;
		}
		let scene;
		if (this.hasScene(SceneCtor)) {
			scene = this.getScene(SceneCtor);
		} else {
			scene = new SceneCtor(this._stage, this);
			this.add(scene);
		}
		this._currentScene?.hide();
		this._currentScene = scene;
		scene.show();
	}
}
