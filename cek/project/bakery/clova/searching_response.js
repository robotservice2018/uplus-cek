const RAW_DATA_SET = require('../clova/raw_data_set');
const logger = require('../clova/logger');
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
	logger.verbose('\n' + JSON.stringify(reqBody.request, null, 2));

	const intent = reqBody.request.intent.name;
	const responseData = { 'version': reqBody.version, 'sessionAttributes': {}, 'response': JSON.parse(RAW_DATA_SET.RESPONSE_TEMPLATE) };
	let slot;
	let serviceId = '';
	const deviceId = reqBody.context.System.device.deviceId;

	if (!!!reqBody.request.intent.slots) {
		logger.verbose('## Error ## Slots field is empty.');
		logger.info('\t' + deviceId + '\t' + intent + '\t' + serviceId + '\t' + '[Error] Slots field is empty. ');
		return getErrorResponse(responseData);
	}

	const slotsKeys = Object.keys(reqBody.request.intent.slots);

	switch(intent) {
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
			let requestCakeCategory = reqBody.request.intent.slots.CAKE_CATEGORY;
			const requestCakeType = reqBody.request.intent.slots.CAKE_TYPE;
			const requestCakeKind = reqBody.request.intent.slots.CAKE_TYPE_KIND;

			if(!!!requestCakeCategory) {
				logger.verbose('## Error ## Invalid slot. CakeCategory is empty. use intent data.[' + intent + ']');
				requestCakeCategory = {'name':'CAKE_CATEGORY', 'value':'케이크'};
			}

			if(!!requestCakeType) {
				(!!requestCakeKind)
					? slot = requestCakeKind.value + '|' + requestCakeCategory.value
					: slot = requestCakeType.value + '|' + requestCakeCategory.value;

			} else if(~slotsKeys.indexOf('BREAD_TYPE')) {
				const requestBreadType = reqBody.request.intent.slots.BREAD_TYPE;
				slot = requestBreadType.value + '|' + requestCakeCategory.value;

			} else if(~slotsKeys.indexOf('GIFT_TYPE')) {
				const requestGiftType = reqBody.request.intent.slots.GIFT_TYPE;
				slot = requestGiftType.value + '|' + requestCakeCategory.value;

			} else {
				slot = requestCakeCategory.value;
				logger.verbose('## Error ## Invalid slot. CakeType is empty. [' + slot + ']');
			}

			break;

		case 'GuideBread':
			let requestBreadCategory = reqBody.request.intent.slots.BREAD_CATEGORY;
			const requestBreadType = reqBody.request.intent.slots.BREAD_TYPE;
			const requestBreadKind = reqBody.request.intent.slots.BREAD_TYPE_KIND;

			if(!!!requestBreadCategory) {
				logger.verbose('## Error ## Invalid slot. BreadCategory is empty. use intent data.[' + intent + ']');
				requestBreadCategory = {'name':'BREAD_CATEGORY', 'value':'빵'};
			}

			if(!!requestBreadType) {
				slot = requestBreadType.value + '|' + requestBreadCategory.value;
			} else if(~slotsKeys.indexOf('CAKE_TYPE')) {
				const requestCakeType = reqBody.request.intent.slots.CAKE_TYPE;
				slot = requestCakeType.value + '|' + requestBreadCategory.value;
			} else if(~slotsKeys.indexOf('GIFT_TYPE')) {
				const requestGiftType = reqBody.request.intent.slots.GIFT_TYPE;
				slot = requestGiftType.value + '|' + requestBreadCategory.value;
			} else {
				slot = requestBreadCategory.value;
				logger.verbose('## Error ## Invalid slot. BreadType is empty. [' + slot + ']');
			}
			break;

		case 'GuideFAQ':
			const requestFAQType = reqBody.request.intent.slots.FAQ_TYPE;

			if(!!requestFAQType) {
				slot = requestFAQType.value;
			}			
			break;

		case 'GuideGift':
			const requestGiftCategory = reqBody.request.intent.slots.GIFT_CATEGORY;
			const requestGiftType = reqBody.request.intent.slots.GIFT_TYPE;

			if(!!requestGiftCategory) {
				(!!requestGiftType)
					? slot = requestGiftType.value + '|' + requestGiftCategory.value
					: slot = requestGiftCategory.value;
			} else {
				slot = '선물';
				logger.verbose('## Error ## Invalid slot. GiftCategory is empty. [' + slot + ']');
			}
			break;

		default:
			logger.verbose('## Error ## Invalid intent [' + intent + ']');
			logger.info('\t' + deviceId + '\t' + intent + '\t' + serviceId + '\t' + '[Error] Invalid intent [' + intent + ']');
			return getErrorResponse(responseData);
	}

	if(~RAW_DATA_SET.RANDOM_SCENARIO_LIST.indexOf(slot)) {
		slot = slot.split('|')[0] + (Math.floor(Math.random()*3) + 1) + '|' + slot.split('|')[1];
	}

	if(!!slot) {
		logger.verbose('## intent : ' + intent + ' [' + slot + '] ');
		for(let inx=0, res; res = RAW_DATA_SET.RESPONSE_LIST[intent][inx]; inx++) {
		    if(~res.slot.indexOf(slot)) {
		    	const cardData = JSON.parse(JSON.stringify(res.value));
				for(let jnx=0; jnx<cardData.thumbImageUrlList.length; jnx++) {
					cardData.thumbImageUrlList[jnx].imageReference.value = 'parisbakery.' + intent;
					const emotionId = cardData.thumbImageUrlList[jnx].referenceUrl.value;
					if(!emotionId.startsWith('$')) {
						if(!!emotionId) {
							const emotion = getEmotion(emotionId);
							if(!!emotion && !!emotion.face && !!emotion.motion) {
								cardData.thumbImageUrlList[jnx].referenceUrl.value = emotion.face; // face
								cardData.thumbImageUrlList[jnx].thumbImageUrl.value = emotion.motion; // motion
								serviceId = emotionId;
							}
						} else {
							cardData.thumbImageUrlList[jnx].thumbImageUrl.value = 
								RAW_DATA_SET.DEFAULT_MOTION_LIST[Math.floor(Math.random()*RAW_DATA_SET.DEFAULT_MOTION_LIST.length)];; // motion
						}
					}
				}
				responseData.response.card = cardData;
				break;
		    }
		}

		if(JSON.stringify(responseData.response.card) === '{}') {
			logger.verbose('## Error ## Slot is not matched');
			logger.info('\t' + deviceId + '\t' + intent + '\t' + serviceId + '\t' + '[Error] Slot is not matched');
			return getErrorResponse(responseData);
		}

		(~slot.indexOf('|'))
			? logger.info('\t' + deviceId + '\t' + intent + '\t' + serviceId + '\t' + slot.split('|')[0] + '\t' + slot.split('|')[1])
			: logger.info('\t' + deviceId + '\t' + intent + '\t' + serviceId + '\t' + slot);

	} else {
		logger.verbose('## Error ## Invalid slot data');
		logger.info('\t' + deviceId + '\t' + intent + '\t' + serviceId + '\t' + '[Error] Invalid slot data');
		return getErrorResponse(responseData);
	}

	return responseData;
}


function searchResponseDataForSpeaker(reqBody) {
	logger.verbose('\n' + JSON.stringify(reqBody.request, null, 2));

	const reqIntent = reqBody.request.intent.name;
	const reqReference = 'parisbakerytest.' + reqIntent;
	const responseData = { 'version': reqBody.version, 'sessionAttributes': {}, 'response': JSON.parse(RAW_DATA_SET.RESPONSE_TEMPLATE_SPEAKER) };
	const date = new Date();
	let slot;

	if (!!!reqBody.request.intent.slots) {
		logger.verbose('## Error ## Slots field is empty.');
		return getErrorResponseForSpeak(responseData);
	}

	const slotsKeys = Object.keys(reqBody.request.intent.slots);

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
			let requestCakeCategory = reqBody.request.intent.slots.CAKE_CATEGORY;
			const requestCakeType = reqBody.request.intent.slots.CAKE_TYPE;
			const requestCakeKind = reqBody.request.intent.slots.CAKE_TYPE_KIND;

			if(!!!requestCakeCategory) {
				logger.verbose('## Error ## Invalid Slot. CakeCategory is empty. use intent.');
				requestCakeCategory = {'name':'CAKE_CATEGORY', 'value':'케이크'};
			}

			if(!!requestCakeType) {
				(!!requestCakeKind)
					? slot = requestCakeKind.value + '|' + requestCakeCategory.value
					: slot = requestCakeType.value + '|' + requestCakeCategory.value;

			} else if(~slotsKeys.indexOf('BREAD_TYPE')) {
				const requestBreadType = reqBody.request.intent.slots.BREAD_TYPE;
				slot = requestBreadType.value + '|' + requestCakeCategory.value;

			} else if(~slotsKeys.indexOf('GIFT_TYPE')) {
				const requestGiftType = reqBody.request.intent.slots.GIFT_TYPE;
				slot = requestGiftType.value + '|' + requestCakeCategory.value;

			} else {
				slot = requestCakeCategory.value;
				logger.verbose('## Error ## Invalid Slot. CakeType is empty. [' + slot + ']');
			}
			break;

		case 'GuideBread':
			let requestBreadCategory = reqBody.request.intent.slots.BREAD_CATEGORY;
			const requestBreadType = reqBody.request.intent.slots.BREAD_TYPE;
			const requestBreadKind = reqBody.request.intent.slots.BREAD_TYPE_KIND;

			if(!!!requestBreadCategory) {
				logger.verbose('## Error ## Invalid Slot. BreadCategory is empty. use intent.');
				requestBreadCategory = {'name':'BREAD_CATEGORY', 'value':'빵'};
			}

			if(!!requestBreadType) {
				slot = requestBreadType.value + '|' + requestBreadCategory.value;
			} else if(~slotsKeys.indexOf('CAKE_TYPE')) {
				const requestCakeType = reqBody.request.intent.slots.CAKE_TYPE;
				slot = requestCakeType.value + '|' + requestBreadCategory.value;
			} else if(~slotsKeys.indexOf('GIFT_TYPE')) {
				const requestGiftType = reqBody.request.intent.slots.GIFT_TYPE;
				slot = requestGiftType.value + '|' + requestBreadCategory.value;
			} else {
				slot = requestBreadCategory.value;
				logger.verbose('## Error ## Invalid Slot. BreadType is empty. [' + slot + ']');
			}
			break;

		case 'GuideFAQ':
			const requestFAQType = reqBody.request.intent.slots.FAQ_TYPE;

			if(!!requestFAQType) {
				slot = requestFAQType.value;
			}			
			break;

		case 'GuideGift':
			const requestGiftCategory = reqBody.request.intent.slots.GIFT_CATEGORY;
			const requestGiftType = reqBody.request.intent.slots.GIFT_TYPE;

			if(!!requestGiftCategory) {
				(!!requestGiftType)
					? slot = requestGiftType.value + '|' + requestGiftCategory.value
					: slot = requestGiftCategory.value;
			} else {
				slot = '선물';
				logger.verbose('## Error ## Invalid Slot. GiftCategory is empty. [' + slot + ']');
			}
			break;

		default:
			logger.verbose('## Error ## Invalid intent [' + reqIntent + ']');
			return getErrorResponseForSpeak(responseData);
	}

	if(!!slot) {
		logger.verbose('## intent : ' + reqIntent + ' [' + slot + '] ');
		for(let inx=0, res; res = RAW_DATA_SET.RESPONSE_LIST[reqIntent][inx]; inx++) {

		    if(~res.slot.indexOf(slot)) {
		    	//responseData.response.card = res.value;
		    	var template_data = res.value;
		    	var speechList = [];

				for(let jnx=0; jnx<template_data.thumbImageUrlList.length; jnx++) {
					var json = {"type": "PlainText", "lang": "ko", "value": template_data.thumbImageUrlList[jnx].referenceText.value};
					speechList.push(json);
				}

				responseData.response.outputSpeech.values = speechList;
				break;
		    }
		}

		if(responseData.response.outputSpeech.values.length < 1) {
			logger.verbose('## Error ## Slot is not matched');
			return getErrorResponseForSpeak(responseData);
		}

	} else {
		logger.verbose('## Error ## Invalid slot data');
		return getErrorResponseForSpeak(responseData);
	}

	return responseData;
}


function getEmotion(emotionId) {
	let emotion = {};
	for(let inx=0, emotionList; emotionList = RAW_DATA_SET.EMOTION_LIST[inx]; inx++) {
		if(emotionList.id === emotionId) {
			//const num = Math.floor(Math.random()*emotionList.value.length);
			const num = 0;
			emotion = emotionList.value[num];
			break;
		}
	}
	return emotion;
}

function getErrorResponse(responseData) {
	responseData.response.card = RAW_DATA_SET.ERROR_RESPONSE_LIST[Math.floor(Math.random()*RAW_DATA_SET.ERROR_RESPONSE_LIST.length)];
	return responseData;
}

function getErrorResponseForSpeak(responseData) {
	var template_data = RAW_DATA_SET.ERROR_RESPONSE_LIST[Math.floor(Math.random()*RAW_DATA_SET.ERROR_RESPONSE_LIST.length)];
	var speechList = [];

	for(let jnx=0; jnx<template_data.thumbImageUrlList.length; jnx++) {
		var json = {"type": "PlainText", "lang": "ko", "value": template_data.thumbImageUrlList[jnx].referenceText.value};
		speechList.push(json);
	}

	responseData.response.outputSpeech.values = speechList;
	
	return responseData;
}

var dynamicResponseData = "";

function searchResponseDataForTTS(reqBody) {
	const reqIntent = reqBody.request.intent.name;
	const reqReference = 'parisbakerytest.' + reqIntent;
	const responseData = { 'version': reqBody.version, 'sessionAttributes': {}, 'response': JSON.parse(RAW_DATA_SET.RESPONSE_TEMPLATE_SPEAKER) };

	var json = {"type": "PlainText", "lang": "ko", "value": dynamicResponseData};
	var speechList = [];
	speechList.push(json);
	console.log(json);

	responseData.response.outputSpeech.values = speechList;

	return responseData;
}

function setResponseData(responseData) {
	dynamicResponseData = responseData;
	console.log(dynamicResponseData + "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
}

module.exports.searchResponseData = function(reqBody) {
	return searchResponseData(reqBody);
}

module.exports.searchResponseDataForSpeaker = function(reqBody) {
	return searchResponseDataForSpeaker(reqBody);
}

module.exports.searchResponseDataForTTS = function(reqBody) {
	return searchResponseDataForTTS(reqBody);
}

module.exports.setResponseData = function(responseData) {
	return setResponseData(responseData);
}
