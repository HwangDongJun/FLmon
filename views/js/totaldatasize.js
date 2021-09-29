var TDSCanvas = document.getElementById("currdatasize");
var PRECanvas = document.getElementById("predatasize");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var dcc_rcs = document.getElementById("dcc_rcs").value.split(',');
var dcc_cur = document.getElementById("dcc_cur").value.split(',');
var dcc_pre = document.getElementById("dcc_pre").value.split(',');
var dcc_mds = document.getElementById("dcc_mds").value;
var dcc_pds = document.getElementById("dcc_pds").value;
var ccr = document.getElementById("ccr").value;

var current_str = " Round " + String(ccr);
var previous_str = " Round " + String(ccr-1);

var max_value = 0;
if(parseInt(dcc_mds) >= parseInt(dcc_pds)) {
	max_value = parseInt(dcc_mds);
} else {
	max_value = parseInt(dcc_pds);
}

var TDSData = {
	labels: dcc_rcs,
	datasets: [{
		label: current_str,
		backgroundColor: "transparent",
		borderColor: "rgba(0,0,200,0.6)",
		fill: false,
		radius: 6,
		pointRadius: 6,
		pointBorderWidth: 3,
		pointBackgroundColor: "cornflowerblue",
		pointBorderColor: "rgba(0,0,200,0.6)",
		pointHoverRadius: 10,
		data: dcc_cur
	}]
};
var PREData = {
	labels: dcc_rcs,
	datasets: [{
		label: previous_str,
		backgroundColor: "transparent",
		borderColor: "rgba(200,0,0,0.6)",
		fill: false,
		radius: 6,
		pointRadius: 6,
		pointBorderWidth: 3,
		pointBackgroudColor: "orange",
		pointBorderColor: "rgba(200,0,0,0.6)",
		pointHoverRadius: 10,
		data: dcc_pre
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
			max: max_value, // max is from datasize
			stepSize: parseInt(max_value/8)
		},
		pointLabels: {
			fontSize: 14,
			fontColor: "black"
		}
	},
	legend: {
		display: true,
		position: 'top',
		labels: {
			font: {
				size: 14	
			}
		}
	}
};
var chartOptions2 = {
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
			max: max_value, // max is from datasize
			stepSize: parseInt(max_value/8)
		},
		pointLabels: {
			fontSize: 14,
			fontColor: "black"
		}
	},
	legend: {
		display: true,
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
var radarChart2 = new Chart(PRECanvas, {
	type: 'radar',
	data: PREData,
	options: chartOptions2
});
