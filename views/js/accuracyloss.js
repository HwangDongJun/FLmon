var ALCanvas = document.getElementById("accuracyline");
var LLCanvas = document.getElementById("lossline");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var acc_loss_round = document.getElementById("acc_loss_round").value.split(',');
var acc_loss_acc = document.getElementById("acc_loss_acc").value.split(',');
var acc_loss_loss = document.getElementById("acc_loss_loss").value.split(',');

var ALData = {
	labels: acc_loss_round,
	datasets: [{
		label: 'accuracy',
		data: acc_loss_acc,
		borderColor: "rgba(255,201,14,1)",
		backgroundColor: "rgba(255,201,14,0.5)",
		fill: false,
	}]
};
var LLData = {
	labels: acc_loss_round,
	datasets: [{
		label: 'loss',
		data: acc_loss_loss,
		borderCorlor: "rgba(201,14,255,1)",
		backgroundColor: "rgba(201,14,255,0.5)",
		fill: false
	}]
};

var chartOptions = {
	responsive: false,
	interaction: {
		mode: 'index',
		intersect: false
	},
	stacked: false,
	scales: {
		xAxes: [{
			scaleLabel: {
				display: true,
				labelString: "Rounds"
			}
		}],
		yAxes: [{
			type: 'linear',
			display: true,
			position: 'left',
			ticks: {
				beginAtZero: true,
				max: 1.0
			}
		}]
	},
	legend: {
		display: false
	}
}
var losschartOptions = {
	responsive: false,
	interaction: {
		model: 'index',
		intersect: false
	},
	stacked: false,
	scales: {
		xAxes: [{
			scaleLabel: {
				display: true,
				labelString: "Rounds"
			}
		}],
		yAxes: [{
			type: 'linear',
			display: true,
			position: 'left',
			ticks: {
				beginAtZero: true
			}
		}]
	},
	legend: {
		display: false
	}
}

var lineChart = new Chart(ALCanvas, {
	type: 'line',
	data: ALData,
	options: chartOptions
});

var lineChart2 = new Chart(LLCanvas, {
	type: 'line',
	data: LLData,
	options: losschartOptions
});
