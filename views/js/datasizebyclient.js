var dbc_cl = document.getElementById("dbc_class").value.split(',');
var dbc_da = document.getElementById("dbc_data").value.split('/');

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

let dbc_per_data = [];
let client_per_datasize = {};
for(var i = 0; i < dbc_da.length; i++) {
	let client_datasize = dbc_da[i].split(',').map(function (x) { return parseInt(x, 10); });
	for(var j = 0; j < client_datasize.length; j++) {
		if(Object.keys(client_per_datasize).includes(String(j))) {
			let tlist = client_per_datasize[j];
			tlist.push(client_datasize[j]);
			client_per_datasize[j] = tlist;
		} else {
			let tlist = [];
			tlist.push(client_datasize[j]);
			client_per_datasize[j] = tlist;
		}
	}
}

for(var cpd in client_per_datasize) {
	let temp_dict = {};
	temp_dict['data'] = client_per_datasize[cpd];
	temp_dict['backgroundColor'] = getRandomColor();
	temp_dict['hoverBackgroundColor'] = getRandomColor();
	temp_dict['label'] = cpd;
	dbc_per_data.push(temp_dict);
}

var barOptions_stacked = {
	responsive: false,
    tooltips: {
        enabled: false
    },
    hover :{
        animationDuration:0
    },
    scales: {
        xAxes: [{
            ticks: {
                beginAtZero:true,
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize:11
            },
            scaleLabel:{
                display:true,
				labelString: "Clients"
            },
            gridLines: {
            }, 
            stacked: true
        }],
        yAxes: [{
            gridLines: {
                display:false,
                color: "#fff",
                zeroLineColor: "#fff",
                zeroLineWidth: 0
            },
            ticks: {
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize:11
            },
            stacked: true
        }]
    },
    legend:{
        display:true,
		position: 'right'
    },
    
    pointLabelFontFamily : "Quadon Extra Bold",
    scaleFontFamily : "Quadon Extra Bold",
};

var ctx = document.getElementById("clientdatasize");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: dbc_cl,
        datasets: dbc_per_data
    },

    options: barOptions_stacked,
});
