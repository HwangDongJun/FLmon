var ALCanvas = document.getElementById("accuracylossline");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var ALData = {
	labels: [1, 2, 3],
	datasets: [{
		label: 'accuracy (Left)',
		data: [
			56.54,
			61.31,
			76.43
		],
		borderColor: "rgba(255,201,14,1)",
		backgroundColor: "rgba(255,201,14,0.5)",
		fill: false,
		yAxisID: 'y'
	}, {
		label: 'loss (Right)',
		data: [
			1.2,
			0.94,
			0.81
		],
		borderColor: "rgba(201,14,255,1)",
		backgroundColor: "rgba(201,14,255,0.5)",
		fill: false,
		yAxisID: 'y1'
	}]
};

var chartOptions = {
	responsive: true,
	interaction: {
		mode: 'index',
		intersect: false
	},
	stacked: false,
	scales: {
		yAxes: [{
			id: 'y',
			type: 'linear',
			display: true,
			position: 'left'
		}, {
			id: 'y1',
			type: 'linear',
			display: true,
			position: 'right'
		}]
	},
	legend: {
		position: 'top'
	}
}

var lineChart = new Chart(ALCanvas, {
	type: 'line',
	data: ALData,
	options: chartOptions
});
