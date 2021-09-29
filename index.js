const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
var idb = new sqlite3.Database("../FederatedLearning-gRPC/server/dashboard_db/index.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	} else {
		console.log("Connected to the index database.");
	}
});
var cdb = new sqlite3.Database("../FederatedLearning-gRPC/server/dashboard_db/learning.db", sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		} else {
			console.log("Connected to the core database.");
		}
});

// db query
const clientCountQuery = `SELECT COUNT(clientname) AS Ccn FROM ClientID`;
const StatusQuery = `SELECT * FROM NowStatus ORDER BY round DESC LIMIT 1`;
const TrainingQuery = `SELECT (SUM(avg_acc)/COUNT(avg_acc)) AS racc, (SUM(avg_loss)/COUNT(avg_loss)) AS rloss FROM (SELECT (SUM(accuracy)/COUNT(clientid)) AS avg_acc, (SUM(loss)/COUNT(clientid)) AS avg_loss FROM LearningTrain GROUP BY round)`;
const TrainingtimeQuery = `SELECT (SUM(RTA)/COUNT(RTA)) AS avg_tt FROM (SELECT SUM(trainingtime)/COUNT(trainingtime) AS RTA FROM LearningTrain GROUP BY round)`;
const RoundListQuery = `SELECT DISTINCT round FROM LearningTrain`;
const AccLossListQuery = `SELECT (SUM(accuracy)/COUNT(clientid)) AS avg_acc, (SUM(loss)/COUNT(clientid)) AS avg_loss FROM LearningTrain GROUP BY round`;
const TrainingTimeListQuery = `SELECT (SUM(trainingtime)/COUNT(round)) AS avg_tt FROM LearningTrain GROUP BY round`;
const DataClassSizeQuery = `SELECT datasize FROM LearningRound`;
const CurrRadarChartQuery = `SELECT LR.clientid, LR.datasize, LR.classsize FROM (LearningRound) AS LR, (SELECT DISTINCT round AS DR FROM LearningRound ORDER BY round DESC LIMIT 1) AS LRD WHERE LRD.DR=LR.round`;
const PrevRadarChartQuery = `SELECT LR.clientid, LR.datasize, LR.classsize FROM (LearningRound) AS LR, (SELECT DISTINCT round AS DR FROM LearningRound ORDER BY round DESC LIMIT 1) AS LRD WHERE LRD.DR-1=LR.round`;
const RoundClientCountQuery = `SELECT COUNT(clientid) AS Cclient FROM LearningTrain GROUP BY round`;
const UploadTimeListQuery = `SELECT round, (SUM(uploadendtime)-SUM(uploadstarttime)) AS uploadtime FROM LearningTime GROUP BY round`;
const UploadTimeAvgQuery = `SELECT ((SUM(uploadendtime)-SUM(uploadstarttime))/COUNT(DISTINCT round)) AS avg_uploadtime FROM LearningTime`;
const InfoLearningQuery = `SELECT (LT.cr / LI.mr) AS avg_mr
							FROM (SELECT max_round AS mr FROM LearningInfo) AS LI,
								 (SELECT COUNT(DISTINCT round) AS cr FROM LearningTrain) AS LT`;
const ServerTimeQuery = `SELECT round, SUM(aggregationtime) AS sum_aggtime, SUM(distributiontime) AS sum_distime FROM ServerTime GROUP BY round`;
const ServerTimeAvgQuery = `SELECT (SUM(aggregationtime)/COUNT(DISTINCT round)) AS avg_agg, (SUM(distributiontime)/COUNT(DISTINCT round)) AS avg_dis FROM ServerTime`;
const DataSizebyClient = `select DISTINCT clientid, datasize, classsize from LearningRound ORDER BY clientid asc`;
const CurrentRoundQuery = `select round from LearningRound ORDER BY round desc LIMIT 1`;
const ParticipantClientQuery = `SELECT COUNT(clientid) AS ci FROM LearningRound GROUP BY round ORDER BY round desc LIMIT 2`;

app.set('view engine', 'jade');
app.set('views', './views');

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
	res.redirect('/dashboard');
});

async function idb_result(query) {
	let idbresult = null;
	idbresult = await new Promise((resolve) => {
		idb.serialize(() => {
			idb.all(query, [], (err, row) => {
				resolve(row);
			});
		});
	});
	return idbresult;
}
async function cdb_result(query) {
	let cdbresult = null;
	cdbresult = await new Promise((resolve) => {
		cdb.serialize(() => {
			cdb.all(query, [], (err, row) => {
				resolve(row);
			});
		});
	});
	return cdbresult;
}

app.get('/get_db', async(req, res) => {
	console.log(await participant_client());
});

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

async function dataclasssize_chart() {
	let dataclasssizelist = await cdb_result(DataClassSizeQuery);
	let chartdataclasssizelist = [];
	dataclasssizelist.forEach(ro =>
		chartdataclasssizelist.push(ro['datasize'].split(',')));
	let sum_datasize = 0; let reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
	chartdataclasssizelist.forEach(ro =>
		sum_datasize += ro.reduce(reducer));
	let classsize = chartdataclasssizelist[0].length;
	
	let curr_radarchart = await cdb_result(CurrRadarChartQuery);
	let curr_chartdata = [];
	curr_radarchart.forEach(ro =>
		curr_chartdata.push(ro['datasize'].split(',')));
	let curr_radarchartlist = new Array(classsize).fill(0);
	for(var i = 0; i < curr_chartdata.length; i++) {
		for(var j = 0; j < classsize; j++) {
			curr_radarchartlist[j] += parseInt(curr_chartdata[i][j], 10);
		}
	}
	let prev_radarchart = await cdb_result(PrevRadarChartQuery);
	let prev_chartdata = [];
	prev_radarchart.forEach(ro =>
		prev_chartdata.push(ro['datasize'].split(',')));
	let prev_radarchartlist = new Array(classsize).fill(0);
	for(var i = 0; i < prev_chartdata.length; i++) {
		for(var j = 0; j < classsize; j++) {
			prev_radarchartlist[j] += parseInt(prev_chartdata[i][j], 10);
		}
	}

	let classname = curr_radarchart[0]['classsize'].split(',');

	// heterogeneous data
	let clientcount = await idb_result(clientCountQuery);

	let het_data = new Array(classsize).fill(0);
	let get_data = new Array(classsize).fill(0);
	for(var i = 0; i < curr_chartdata.length; i++) {
		for(var j = 0; j < classsize; j++) {
			let avg_data = curr_radarchartlist[j]/clientcount[0]['Ccn'];
			if(curr_chartdata[i][j] <= avg_data) {
				het_data[j] += 1
			}

			if(curr_chartdata[i][j] != 0) {
				get_data[j] += 1
			}
		}
	}

	let max_datasize = Math.max(...curr_radarchartlist);
	let max_predatasize = Math.max(...prev_radarchartlist);

	return [sum_datasize, classsize, classname, curr_radarchartlist, prev_radarchartlist, het_data, max_datasize, get_data, max_predatasize]
}
async function acc_loss_chart() {
	let roundlist = await cdb_result(RoundListQuery);
	let chartroundlist = [];
	roundlist.forEach(ro =>
		chartroundlist.push(ro['round']));

	let acclosslist = await cdb_result(AccLossListQuery);
	let chartacclist = []; let chartlosslist = [];
	acclosslist.forEach(ro =>
		chartacclist.push(ro['avg_acc']));
	acclosslist.forEach(ro =>
		chartlosslist.push(ro['avg_loss']));
	return [chartroundlist, chartacclist, chartlosslist];
}
async function training_time_chart() {
	let trainingtimelist = await cdb_result(TrainingTimeListQuery);
	let charttrainingtimelist = [];
	trainingtimelist.forEach(ro =>
		charttrainingtimelist.push(ro['avg_tt']));
	return charttrainingtimelist;
}
async function upload_time_chart() {
	let uploadtimelist = await cdb_result(UploadTimeListQuery);
	let chartuploadtimelist = [];
	uploadtimelist.forEach(ro =>
		chartuploadtimelist.push(ro['uploadtime']));
	let avg_uploadtime = await cdb_result(UploadTimeAvgQuery);

	return [chartuploadtimelist, avg_uploadtime];
}
async function round_clinetcount_chart() {
	let rclientcountlist = await cdb_result(RoundClientCountQuery);
	let chartrclientcountlist = [];
	rclientcountlist.forEach(ro =>
		chartrclientcountlist.push(ro['Cclient']));
	return chartrclientcountlist;
}

async function round_learning_chart() {
	let maxround = await cdb_result(InfoLearningQuery);
	return maxround;
}
/*
async function insert_db_client_selection(req, cur_round) {
	let udt = req.query.updatetime == "" ? 1 : 0;
	let ult = req.query.uploadtime == "" ? 1 : 0;
	let agt = req.query.aggregationtime == "on" ? 1 : 0;
	let dit = req.query.distribution == "on" ? 1 : 0;
	let clv = req.query.classvolume == "on" ? 1 : 0;
	let dav = req.query.datavolume == "on" ? 1 : 0;
	let acc = req.query.acc == "on" ? 1 : 0;
	let los = req.query.loss == "on" ? 1 : 0;
	let cpu = req.query.cpu == "on" ? 1 : 0;
	let mem = req.query.memory == "on" ? 1 : 0;

	if(udt+ult+agt+dit+clv+dav+acc+los+cpu+mem > 0) {
		let res = await cdb_result("INSERT INTO ClientSelection VALUES ("+cur_round+", "+udt+", "+ult+", "+agt+", "+dit+", "+clv+", "+dav+", "+acc+", "+los+", "+cpu+", "+mem+")");
	}
}
*/

async function server_time_chart() {
	let ser_timelist = await cdb_result(ServerTimeQuery);
	let ser_aggtimelist = [];
	let ser_distimelist = [];
	ser_timelist.forEach(ro =>
		ser_aggtimelist.push(ro['sum_aggtime']));
	ser_timelist.forEach(ro =>
		ser_distimelist.push(ro['sum_distime']));
	let avg_agg_dis_time = await cdb_result(ServerTimeAvgQuery);

	return [ser_aggtimelist, ser_distimelist, avg_agg_dis_time]
}

async function datasize_by_client() {
	let dsbc = await cdb_result(DataSizebyClient);
	let clientsize_str = "";
	for(var i = 0; i < dsbc.length; i++) {
		if(i == dsbc.length-1) {
			clientsize_str += dsbc[i]['clientid'];
		} else {
			clientsize_str += dsbc[i]['clientid'] + ",";
		}
	}
	let datasize_str = "";
	for(var i = 0; i < dsbc.length; i++) {
		if(i == dsbc.length-1) {
			datasize_str += dsbc[i]['datasize'];
		} else {
			datasize_str += dsbc[i]['datasize'] + "/";
		}
	}
	
	return [clientsize_str, datasize_str]
}

app.get('/dashboard', async(req, res) => {
	let res_cc = await idb_result(clientCountQuery);
	let res_ss = await cdb_result(StatusQuery);
	let res_al = await cdb_result(TrainingQuery);
	let res_tt = await cdb_result(TrainingtimeQuery);
	// acc_loss chart
	let alc = await acc_loss_chart();
	// trainingtime chart / uploadtime chart
	let ttc = await training_time_chart();
	let utc = await upload_time_chart();
	// datasize, classsize radar chart
	let dcc = await dataclasssize_chart();
	// clients by round
	let res_cr = await round_clinetcount_chart();
	// curr round / max round
	let mr = await round_learning_chart();
	// check client selection
	//await insert_db_client_selection(req, res_ss[0]['round']);
	// server time list (aggregation, distribution)
	let stl = await server_time_chart();
	// datasize by client
	let dbc = await datasize_by_client();
	// current round
	let cur = await cdb_result(CurrentRoundQuery);
	// participant client
	let pcr = await cdb_result(ParticipantClientQuery);

	res.render('dashboard_main', {cCount: res_cc[0]['Ccn'], cRound: res_ss[0]['round'], ston: res_ss[0]['status_on'], stoff: res_ss[0]['status_off'], acc: String(Math.round((res_al[0]['racc']+Number.EPSILON)*10000)/100)+'%', loss: Math.round((res_al[0]['rloss']+Number.EPSILON)*100)/100, Tt: String(new Date(res_tt[0]['avg_tt']*1000).toISOString().substr(11, 8)), alc_round: alc[0], alc_acc: alc[1], alc_loss: alc[2], at_tt: ttc, at_ut: utc[0], Tu: String(new Date(utc[1][0]['avg_uploadtime']*1000).toISOString().substr(11, 8)), dcc_ds: dcc[0], dcc_cs: dcc[1], dcc_rcs: dcc[2], dcc_cur: dcc[3], dcc_pre: dcc[4], hete: dcc[5], mds: dcc[6], getdata: dcc[7], pds: dcc[8], cbr: res_cr, mcr: mr[0]['avg_mr']*100, aggtime: stl[0], distime: stl[1], Ta: String(new Date(stl[2][0]['avg_agg']*1000).toISOString().substr(11, 8)), Td: String(new Date(stl[2][0]['avg_dis']*1000).toISOString().substr(11, 8)), dbc_class: dbc[0], dbc_data: dbc[1], ccr:cur[0]['round'], curpar:pcr[0]['ci'], prepar:pcr[1]['ci']});
});

app.get('/new_client', (req, res) => {
	return res.join(success);
});

app.get('/train_done', (req, res) => {
	return res.join(success);
});

let success = [
	{
		'success': 1
	}
]

app.listen(5005);
