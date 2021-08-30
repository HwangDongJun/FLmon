var TDSCanvas = document.getElementById("totaldatasize");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var TDSData = {
	labels: ["0", "1", "2", "3", "4"],
	datasets: [{
		label: "previous round",
		backgroundColor: "transparent",
		borderColor: "rgba(200,0,0,0.6)",
		fill: false,
		radius: 6,
		pointRadius: 6,
		pointBorderWidth: 3,
		pointBackgroudColor: "orange",
		pointBorderColor: "rgba(200,0,0,0.6)",
		pointHoverRadius: 10,
		data: [1600, 200, 300, 200, 100]
	}, {
		label: "current round",
		backgroundColor: "transparent",
		borderColor: "rgba(0,0,200,0.6)",
		fill: false,
		radius: 6,
		pointRadius: 6,
		pointBorderWidth: 3,
		pointBackgroundColor: "cornflowerblue",
		pointBorderColor: "rgba(0,0,200,0.6)",
		pointHoverRadius: 10,
		data: [1895, 1260, 1560, 1285, 1386]
	}]
};

var chartOptions = {
	scale: {
		gridLines: {
			color: "black",
			lineWidth: 2
		},
		angleLines: {
			display: false			
		},
		ticks: {
			display: false,
			beginAtZero: true,
			min: 0,
			max: 1895, // max is from datasize
			stepSize: 300 
		},
		pointLabels: {
			fontSize: 14,
			fontColor: "black"
		}
	},
	legend: {
		position: 'top',
		labels: {
			font: {
				size: 14	
			}
		}
	}
};

var radarChart = new Chart(TDSCanvas, {
	type: 'radar',
	data: TDSData,
	options: chartOptions
});
