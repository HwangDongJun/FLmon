var CCCanvas = document.getElementById("clientclasscircle").getContext('2d');

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var hete_rcs = document.getElementById("hete_rcs").value.split(',');
var hete = document.getElementById("hete").value.split(',');

var CCData = {
	labels: hete_rcs,
	datasets: [{
		data: hete,
		backgroundColor: [
			'rgb(255, 99, 132, 0.5)',
			'rgb(54, 162, 235, 0.5)',
			'rgb(255, 205, 86, 0.5)',
			'rgb(156, 105, 45, 0.5)',
			'rgb(205, 255, 123, 0.5)',
			'rgb(211, 23, 125, 0.5)',
			'rgb(200, 255, 12, 0.5)',
			'rgb(86, 255, 205, 0.5)',
			'rgb(121, 91, 174, 0.5)'
		]
	}]
}

var chartOptions = {
	responsive: true,
	legend: false,
	pieceLabel: {
		mode: 'label',
		fontColor: '#000',
		position: 'outside', 
	}
};

var pieChart = new Chart(CCCanvas, {
	type: 'pie',
	data: CCData,
	options: chartOptions
});
