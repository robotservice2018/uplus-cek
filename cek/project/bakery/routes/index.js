const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './uploads'});

const searching = require('../clova/searching_response');

router.post('/api/cloi', function(req, res) {
	var serviceId = req.query.serviceId;
	if(serviceId == null) {
		res.end();
		return;
	}

	var result = searching.searchResponseDatByServiceId(serviceId);
    res.send(result);
});

router.post('/clova', function(req, res) {
    var result = searching.searchResponseData(req.body);
    res.send(result);
});

module.exports = router;
