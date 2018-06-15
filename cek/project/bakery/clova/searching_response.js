const RAW_DATA_SET = require('../clova/raw_data_set');

/*
 * 1. RAW_DATA_SET.RESPONSE_LIST : response data set
 *    ex) RAW_DATA_SET.RESPONSE_LIST["GuideCake"]; // response data list for guide cake
 *
 * 2. RAW_DATA_SET.EMOTION_LIST : emotion data set
 * 
 * 3. RAW_DATA_SET.RESPONSE_TEMPLATE => JSON.parse(RAW_DATA_SET.RESPONSE_TEMPLATE).card = selected response_list data;
 *
 */

function searchResponseData(req_body) {
	console.log("\n");
	console.log(req_body);
	// search response data
	var req_intent = req_body.request.intent;
	var response_data = { "version": req_body.version, "sessionAttributes": {}, "response": JSON.parse(RAW_DATA_SET.RESPONSE_TEMPLATE) };
	var date = new Date();
	//var date = now.toFormat('YYYY-MM-DD HH24:MI:SS'); 

	if (req_body.request.intent.slots == null || JSON.stringify(req_body.request.intent.slots) == '{}') {
		console.log("[" + date + "] ## Error ## slots field is empty.");
		response_data.response.card = RAW_DATA_SET.ERROR_RESPONSE_LIST[Math.floor(Math.random()*RAW_DATA_SET.ERROR_RESPONSE_LIST.length)];
		return response_data;
	}

	var request_cake_catetory = req_body.request.intent.slots.CAKE_CATEGORY;
	var request_cake_type = req_body.request.intent.slots.CAKE_TYPE;
	var request_cake_kind = req_body.request.intent.slots.CAKE_TYPE_KIND;

	if(request_cake_type != undefined && request_cake_catetory != undefined) {
		if(request_cake_kind != undefined) {
			var slot = request_cake_kind.value + "|" + request_cake_catetory.value;
		} else {
			var slot = request_cake_type.value + "|" + request_cake_catetory.value;
		}

		console.log("[" + date + "] ## intent : " + req_intent.name + " [" + slot + "] ");

		for(var inx=0; inx<RAW_DATA_SET.RESPONSE_LIST[req_intent.name].length; inx++) {
		    if(RAW_DATA_SET.RESPONSE_LIST[req_intent.name][inx].slot == slot) {
				response_data.response.card = RAW_DATA_SET.RESPONSE_LIST[req_intent.name][inx].value;

				for(var jnx=0; jnx<response_data.response.card.thumbImageUrlList.length; jnx++) {
					var emotion_id = response_data.response.card.thumbImageUrlList[jnx].referenceUrl.value;
					if(emotion_id != '') {
						var emotion = getEmotion(emotion_id);

						if(emotion.face != undefined && emotion.motion != undefined) {
							//console.log(" => " + emotion.face + " / " + emotion.motion);
							response_data.response.card.thumbImageUrlList[jnx].referenceUrl.value = emotion.face; // face
							response_data.response.card.thumbImageUrlList[jnx].thumbImageUrl.value = emotion.motion; // motion
						}
					}
				}

				break;//return response_data;
		    }
		}
	} else {
		response_data.response.card = RAW_DATA_SET.ERROR_RESPONSE_LIST[Math.floor(Math.random()*RAW_DATA_SET.ERROR_RESPONSE_LIST.length)];
		console.log("[" + date + "] ## Error ## request_cake_type or request_cake_catetory is undefined. type:" + request_cake_type + "/category:" + request_cake_catetory);
	}
	
	return response_data;
}

function getEmotion(emotion_id) {
	var emotion = {}
	for(var inx=0; inx<RAW_DATA_SET.EMOTION_LIST.length; inx++) {
		if(RAW_DATA_SET.EMOTION_LIST[inx].id == emotion_id) {
			var num = Math.floor(Math.random()*3);
			emotion = RAW_DATA_SET.EMOTION_LIST[inx].value[num];
			console.log("  ## service id : " + emotion_id);
			//console.log(" ## Service ID :" + emotion_id + " / " + emotion.face + " / " + emotion.motion);
			break;
		}
	}

	return emotion;
}

module.exports.searchResponseData = function(req_body) {
	return searchResponseData(req_body);
}
