const RAW_DATA_SET = require('../clova_dev/raw_data_set');

/*
 * 1. RAW_DATA_SET.RESPONSE_LIST : response data set
 *    ex) RAW_DATA_SET.RESPONSE_LIST['GuideCake']; // response data list for guide cake
 *
 * 2. RAW_DATA_SET.EMOTION_LIST : emotion data set
 * 
 * 3. RAW_DATA_SET.RESPONSE_TEMPLATE => JSON.parse(RAW_DATA_SET.RESPONSE_TEMPLATE).card = selected response_list data;
 *
 */

function searchResponseData(reqBody) {
	//console.log(reqBody);
	console.log('\n' + JSON.stringify(reqBody.request, null, 2));

	const reqIntent = reqBody.request.intent.name;
	const reqReference = 'parisbakery.' + reqIntent;
	const responseData = { 'version': reqBody.version, 'sessionAttributes': {}, 'response': JSON.parse(RAW_DATA_SET.RESPONSE_TEMPLATE) };
	const date = new Date();
	let slot;

	if (!!!reqBody.request.intent.slots) {
		console.log('[' + date + '] ## Error ## slots field is empty.');
		return getErrorResponse(responseData);
	}

	switch(reqIntent) {
		case 'PlayGame':
			const requestPlayTarget = reqBody.request.intent.slots.PLAY_TARGET;
			if(!!requestPlayTarget) {
				slot = requestPlayTarget.value;
			}
			break;

		case 'RequestInfotainment':
			const requestInfotainmentType = reqBody.request.intent.slots.INFOTAINMENT_TYPE;
			if(!!requestInfotainmentType) {
				slot = requestInfotainmentType.value + (Math.floor(Math.random()*3) + 1);
			}
			break;

		case 'GuideCake':
			const requestCakeCatetory = reqBody.request.intent.slots.CAKE_CATEGORY;
			const requestCakeType = reqBody.request.intent.slots.CAKE_TYPE;
			const requestCakeKind = reqBody.request.intent.slots.CAKE_TYPE_KIND;

			if(!!requestCakeType && !!requestCakeCatetory) {
				if(!!requestCakeKind) {
					slot = requestCakeKind.value + '|' + requestCakeCatetory.value;
				} else {
					slot = requestCakeType.value + '|' + requestCakeCatetory.value;
				}
			}
			break;

		case 'GuideBread':
			const requestBreadCatetory = reqBody.request.intent.slots.BREAD_CATEGORY;
			const requestBreadType = reqBody.request.intent.slots.BREAD_TYPE;
			const requestBreadKind = reqBody.request.intent.slots.BREAD_TYPE_KIND;

			if(!!requestBreadType) {
				if(!!requestBreadCatetory) {
					if(!!requestBreadKind) {
						slot = requestBreadKind.value + '|' + requestBreadCatetory.value;
					} else {
						slot = requestBreadType.value + '|' + requestBreadCatetory.value;
					}
				} else {
					slot = requestBreadType.value;
				}
			}
			break;

		case 'GuideFAQ':
			const requestFaqType = reqBody.request.intent.slots.FAQ_TYPE;

			if(!!requestFaqType) {
				slot = requestFaqType.value;
			}
			
			break;

		case 'GuideGift':
			const requestGiftCatetory = reqBody.request.intent.slots.GIFT_CATEGORY;
			const requestGiftType = reqBody.request.intent.slots.GIFT_TYPE;

			if(!!requestGiftCatetory) {
				if(!!requestGiftType) {
					slot = requestGiftType.value + '|' + requestGiftCatetory.value;
				} else {
					slot = requestGiftCatetory.value;
				}
			}
			break;
	}

	if(!!slot) {
		console.log('[' + date + '] ## intent : ' + reqIntent + ' [' + slot + '] ');
		for(let inx=0, res; res = RAW_DATA_SET.RESPONSE_LIST[reqIntent][inx]; inx++) {

		    if(res.slot.indexOf(slot) >= 0) {
				responseData.response.card = res.value;

				for(let jnx=0; jnx<responseData.response.card.thumbImageUrlList.length; jnx++) {
					responseData.response.card.thumbImageUrlList[jnx].imageReference.value = reqReference;
					const emotionId = responseData.response.card.thumbImageUrlList[jnx].referenceUrl.value;
					if(!!emotionId) {
						const emotion = getEmotion(emotionId);
						if(!!emotion && !!emotion.face && !!emotion.motion) {
							//console.log(' => ' + emotion.face + ' / ' + emotion.motion);
							responseData.response.card.thumbImageUrlList[jnx].referenceUrl.value = emotion.face; // face
							responseData.response.card.thumbImageUrlList[jnx].thumbImageUrl.value = emotion.motion; // motion
						}
					} else {
						responseData.response.card.thumbImageUrlList[jnx].thumbImageUrl.value = 
							RAW_DATA_SET.DEFAULT_MOTION_LIST[Math.floor(Math.random()*RAW_DATA_SET.DEFAULT_MOTION_LIST.length)];; // motion
					}
				}

				break;
		    }
		}
	} else {
		console.log('[' + date + '] ## Error ## Invalid slot data');
		return getErrorResponse(responseData);
	}

	if(JSON.stringify(responseData.response.card) === '{}') {
		console.log('[' + date + '] ## Error ## slot is not matched');
		return getErrorResponse(responseData);
	}

	return responseData;
}

function getEmotion(emotionId) {
	let emotion = {}
	for(let inx=0, emotionList; emotionList = RAW_DATA_SET.EMOTION_LIST[inx]; inx++) {
		if(emotionList.id === emotionId) {
			emotion = emotionList.value[Math.floor(Math.random()*emotionList.value.length)];
			//console.log('  ## service id : ' + emotionId);
			break;
		}
	}

	return emotion;
}

function getErrorResponse(responseData) {
	responseData.response.card = RAW_DATA_SET.ERROR_RESPONSE_LIST[Math.floor(Math.random()*RAW_DATA_SET.ERROR_RESPONSE_LIST.length)];
	return responseData;
}

module.exports.searchResponseData = function(reqBody) {
	return searchResponseData(reqBody);
}
