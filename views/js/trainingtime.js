var TTCanvas = document.getElementById("trainingtimeline");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var at_round = document.getElementById("acc_loss_round").value.split(',');
var at_tt = document.getElementById("at_tt").value.split(',');
var at_ut = document.getElementById("at_ut").value.split(',');

var TTData = {
	labels: at_round,
	datasets: [{
		label: "update time (left)",
		data: at_tt,
		borderColor: "rgba(255,21,151,1)",
		backgroundColor: "rgba(255,21,151,0.5)",
		fill: false,
		yAxisID: 'y'
	}, {
		label: "upload time (right)",
		data: at_ut,
		borderColor: "rgba(241, 162, 32, 1)",
		backgroundColor: "rgba(241, 162, 32, 0.5)",
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
			position: 'left',
			ticks: {
				beginAtZero: true
			}
		}, {
			id: 'y1',
			type: 'linear',
			display: true,
			position: 'right',
			ticks: {
				beginAtZero: true
			}
		}]
	},
	legend: {
		display: true
	}
}

var lineChart = new Chart(TTCanvas, {
	type: 'horizontalBar',
	data: TTData,
	options: chartOptions
});
