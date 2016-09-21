(function () {

	function log(message, params, level) {
		if (!params) {
			params = [];
		}
		if (!level) {
			level = "log";
		}

		params.unshift("[AllRecipiesRecipeNotes] " + message);
		console[level].apply(console, params);
	}


	// Only need this background thing to get around cross-site scripting limitations
	chrome.runtime.onMessage.addListener(function(request, sender, responseCallback) {
		if (!sender.tab) {
			log("No-op as request didn't come from a valid tab", [], "warn");
			return;
		}

		var recipeId = request.recipeId;
		var tabId    = sender.tab.id;

		if (request.messageType == "AllRecipiesRecipeNotes::GET_NOTES") {
			log("Received GET_NOTES request for recipeId %d on tabId %d", [recipeId, tabId]);
			getNotes(recipeId, tabId);
		} else if (request.messageType == "AllRecipiesRecipeNotes::SET_NOTES") {
			var notes = request.notes;
			log("Received SET_NOTES request for recipeId %d on tabId %d: %s", [recipeId, tabId, notes]);
			setNotes(recipeId, notes, tabId);
		}
	});
	
	function getNotes(recipeId, tabId) {
		var url = "http://ubu:5000/notes/" + recipeId;
		var request = new XMLHttpRequest();
		
		log("Getting notes for %s", [url]);
	
		request.onreadystatechange = function() {
			response = {
				"messageType": "AllRecipiesRecipeNotes::GET_NOTES_RESPONSE",
				"recipeId":    recipeId,
			}
			if(request.readyState == 4) {
				if (request.status == 200) {
					response.notes = request.response;
					log("Sending response to tab id %d: %o", [tabId, response]);
					chrome.tabs.sendMessage(tabId, response);
				} else {
					response.error = "Recieved bad response code: " + request.status
					log("Sending error response to tab id %d: %o", [tabId, response], "error");
					chrome.tabs.sendMessage(tabId, response);
				}
			}
		}
	
		request.open("GET", url, true);
		request.send(null);
	}
	
	function setNotes(recipeId, notes, tabId) {
		var url = "http://ubu:5000/notes/" + recipeId;
		var request = new XMLHttpRequest();
		
		log("Setting notes for %s to %s", [url, notes]);
	
		request.onreadystatechange = function() {
			if(request.readyState == 4) {
				response = {
					"messageType": "AllRecipiesRecipeNotes::SET_NOTES_RESPONSE",
					"recipeId":    recipeId,
					"notes":       notes
				}
				if (request.status == 200) {
					log("Sending response to tab id %d: %o", [tabId, response]);
					chrome.tabs.sendMessage(tabId, response);
				} else {
					response.error = "Recieved bad response code: " + request.status;
					log("Sending error response to tabe id %d: %o", [tabId, response], "error");
					chrome.tabs.sendMessage(tabId, response);
				}
			}
		}
	
		request.open("POST", url, true);
		request.send(notes);
	}

})();
