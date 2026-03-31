((window, $) => {
	window.imagesCompareBindControls = (imagesCompare) => {
		if (!imagesCompare || typeof imagesCompare.setValue !== "function") {
			return;
		}

		$(".js-front-btn")
			.off("click.imagesCompareControls")
			.on("click.imagesCompareControls", (event) => {
				event.preventDefault();
				imagesCompare.setValue(1, true);
			});

		$(".js-back-btn")
			.off("click.imagesCompareControls")
			.on("click.imagesCompareControls", (event) => {
				event.preventDefault();
				imagesCompare.setValue(0, true);
			});

		$(".js-toggle-btn")
			.off("click.imagesCompareControls")
			.on("click.imagesCompareControls", (event) => {
				event.preventDefault();
				if (imagesCompare.getValue() >= 0 && imagesCompare.getValue() < 1) {
					imagesCompare.setValue(1, true);
				} else {
					imagesCompare.setValue(0, true);
				}
			});
	};
})(window, window.jQuery || window.$);
