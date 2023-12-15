/**
 * custom style transformer
 */
class ScaleTransformer extends Konva.Transformer {
	constructor(config) {
		super({
			...config,
			flipEnabled: false,
			borderStrokeWidth: 1,
			anchorStyleFunc: (anchor) => {
				anchor.cornerRadius(10);
				if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
					anchor.height(6);
					anchor.offsetY(3);
					anchor.width(26);
					anchor.offsetX(13);
				} else if (anchor.hasName("middle-left") || anchor.hasName("middle-right")) {
					anchor.height(26);
					anchor.offsetY(13);
					anchor.width(6);
					anchor.offsetX(3);
				} else if (anchor.hasName("rotater")) {
					anchor.cornerRadius(15);
					anchor.width(26);
					anchor.height(26);
					anchor.offsetX(13);
					anchor.offsetY(13);
				} else {
					anchor.width(14);
					anchor.offsetX(8);
					anchor.height(14);
					anchor.offsetY(8);
				}
			},
		});
		console.log(this);
	}
}
