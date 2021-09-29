var CRCanvas = document.getElementById("clientroundline");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var acc_loss_round = document.getElementById("acc_loss_round").value.split(',');
var cli_rou_count = document.getElementById("client_round_count").value.split(',');

var CRData = {
	labels: acc_loss_round,
	datasets: [{
		data: cli_rou_count,
		borderColor: 'rgba(255, 159, 64, 0.8)',
		backgroundColor: 'rgba(255, 159, 64, 0.5)',
		fill: true
	}]
};

var chartOptions = {
	responsive: true,
	plugins: {
		tooltip: {
			mode: 'index'
		}
	},
	interaction: {
		mode: 'nearest',
		axis: 'x',
		intersect: false
	},
	scales: {
		y: {
			stacked: true,
		}
	},
	legend: {
		display: false
	}
}

var areaChart = new Chart(CRCanvas, {
	type: 'line',
	data: CRData,
	options: chartOptions
});
