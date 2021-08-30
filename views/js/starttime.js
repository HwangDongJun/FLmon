var STCanvas = document.getElementById('starttimebubble');

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 14;

var STData = {
  datasets: [{
    data: [{
      x: 1,
      y: 7,
      r: 6
    }, {
      x: 1,
      y: 23,
      r: 4
    }, {
      x: 2,
      y: 6,
      r: 8
    }, {
	  x: 2,
	  y: 3,
	  r: 2
	}, {
	  x: 3,
	  y: 5,
	  r: 10
	}],
    backgroundColor: "rgba(70,130,180,0.5)"
  }]
};

var chartOptions = {
	responsive: true,
	scales: {
		xAxes: [{
			ticks: {
				stepSize: 1
			}
		}],
		yAxes: [{
			ticks: {
				min: 0,
				max: 24,
				stepSize: 6
			}
		}]
	},
	legend: {
		display: false
	}
}

var bubbleChart = new Chart(STCanvas, {
  type: 'bubble',
  data: STData,
  options: chartOptions
});
