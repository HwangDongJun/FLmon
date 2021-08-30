var TTCanvas = document.getElementById("trainingtimeline");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var TTData = {
	labels: [1, 2, 3],
	datasets: [{
		data: [
			647,
			323,
			620
		],
		borderColor: "rgba(255,151,124,1)",
		backgroundColor: "rgba(255,151,124,0.5)",
		fill: false,
		yAxisID: 'y'
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
		}]
	},
	legend: {
		display: false
	}
}

var lineChart = new Chart(TTCanvas, {
	type: 'line',
	data: TTData,
	options: chartOptions
});
