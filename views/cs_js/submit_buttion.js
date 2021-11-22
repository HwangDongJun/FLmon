var oneround = document.getElementById("curr").value;
oneround = String(parseInt(oneround) + 1);

function writeFile(fileName, content) {
	var blob = new Blob([content], { type: 'text/plain' });
    objURL = window.URL.createObjectURL(blob);

    // 이전에 생성된 메모리 해제
    if (window.__Xr_objURL_forCreatingFile__) {
        window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;

    var a = document.createElement('a');
    a.download = fileName;
    a.href = objURL;
    a.click();
}

function _submit(f) {
	var cs_dict = {"accuracy": 0, "loss": 0, "class_data": "", "distribution time": 0, "update time": 0, "upload time": 0, "aggregation time": 0, "cpu": 0, "ram": 0};
	var obj_length = document.getElementsByName('chk').length;
	var logo_str = "";

	for(var i = 0; i < obj_length; i++) {
		if(document.getElementsByName('chk')[i].checked == true) {
			if(document.getElementsByName('chk')[i].value == 'accuracy') {
				cs_dict['accuracy'] = 1;
				logo_str += "M1||";
			} 
			if(document.getElementsByName('chk')[i].value == 'loss') {
				cs_dict['loss'] = 1;
				logo_str += "M2||";
			}
			if(document.getElementsByName('chk')[i].className == 'cl') {
				cs_dict['class_data'] += document.getElementsByName('chk')[i].value + ",";
				logo_str += "CD" + document.getElementsByName('chk')[i].value + "||";
			} 
			if(document.getElementsByName('chk')[i].value == 'distribution time') {
				cs_dict['distribution time'] = 1;
				logo_str += "LT1||";
			} 
			if(document.getElementsByName('chk')[i].value == 'update time') {
				cs_dict['update time'] = 1;
				logo_str += "LT2||";
			}
			if(document.getElementsByName('chk')[i].value == 'upload time') {
				cs_dict['upload time'] = 1;
				logo_str += "LT3||";
			} 
			/*if(document.getElementsByName('chk')[i].value == 'aggregation time') {
				cs_dict['aggregation time'] = 1;
				logo_str += "LT4||";
			}*/
			if(document.getElementsByName('chk')[i].value == 'cpu') {
				cs_dict['cpu'] = 1;
				logo_str += "R1||";
			}
			if(document.getElementsByName('chk')[i].value == 'ram') {
				cs_dict['ram'] = 1;
				logo_str += "R2||";
			}
		}
	}

	writeFile("check_list_" + oneround + ".txt", JSON.stringify(cs_dict));
	//document.getElementById('cmr_board').textContent = logo_str;
}
