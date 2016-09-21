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

	var STATE_LOADING  = 1
	var STATE_READONLY = 2
	var STATE_EDITING  = 3
	var STATE_SAVING   = 4
	var STATE_ERROR    = 5

	var currentState = STATE_LOADING;
	var currentNotes = ""
	
	var recipeId = parseInt(document.location.href.split("/")[4]);

	var notesDiv = $("<div />")
		.css("font-style", "italic")
		.css("white-space", "pre")
		.html("Loading Notes ...")

	var notesEditDiv = $("<div />")
		.css("display", "none")
		.append($("<textarea />")
			.attr("rows", "5")
			.css("width", "100%")
			.css("margin-bottom", "2px")
		)
		.append($("<input />")
			.css("margin-right", "5px")
			.css("padding-left", "10px")
			.css("padding-right", "10px")
			.css("color", "#4d4d4d")
			.css("background-color", "#ebebeb")
			.attr("type", "button")
			.attr("value", "Save")
			.click(saveEdit)
		)
		.append($("<input />")
			.css("padding-left", "10px")
			.css("padding-right", "10px")
			.css("color", "#4d4d4d")
			.css("background-color", "#ebebeb")
			.addClass("cancel-button")
			.attr("type", "button")
			.attr("value", "Cancel")
			.click(cancelEdit)
		)

	var notesEditIcon = $("<img />")
		.attr("src",       chrome.extension.getURL("images/edit_32x32.png"))
		.css("width",       "32px")
		.css("height",      "32px")
		.css("margin-left", "34px")
		.css("cursor",      "pointer")
		.click(startEdit)
		
	log("Hiding original notes container and injecting new notes container");
	$(".recipeNotes").hide().after($("<ol />")
		.css("padding-bottom", "10px")
		.append($("<li />")
			.append($("<table />")
				.append($("<tr />")
					.append($("<td />")
						.attr("valign", "top")
						.append(notesEditIcon)
					)
					.append($("<td />")
						.css("width", "100%")
						.css("padding-left", "8px")
						.append(notesDiv)
						.append(notesEditDiv)
					)
				)
			)
		)
	);

	function setError() {
		notesEditDiv.hide()
		notesDiv.show().html("Error accessing notes")
			
		currentState = STATE_ERROR
	}
	
	function setNotes(notes) {
		if (notes) {
			notesDiv.css("font-style", "normal").html(notes);
			notesEditDiv.find("textarea").val(notes);
		} else {
			notesDiv.css("font-style", "italic").html("No notes provided");
			notesEditDiv.find("textarea").val("");
		}
		notesDiv.show()
		notesEditDiv.hide()
		
		currentNotes = notes;
		currentState = STATE_READONLY;
	}

	function startEdit() {
		if (currentState == STATE_READONLY) {
			log("Edit image clicked");
			notesDiv.hide()
			notesEditDiv.show()
			notesEditDiv.find("input[value='Saving ...']").val("Save")
			currentState = STATE_EDITING
		}
	}

	function saveEdit() {
		if (currentState != STATE_EDITING) {
			return;
		}
		currentState = STATE_SAVING
		notesEditDiv.find("input[value='Save']").val("Saving ...")

		var newNotes = notesEditDiv.find("textarea").val();
		log("Save button clicked.  Sending SET_NOTES message for recipeId %d, notes: %s", [recipeId, newNotes]);
		// Send message to background script to set the notes
		chrome.runtime.sendMessage({
			"messageType": "AllRecipiesRecipeNotes::SET_NOTES",
			"recipeId":    recipeId,
			"notes":       newNotes
		});
	}

	function cancelEdit() {
		if (currentState != STATE_EDITING) {
			return;
		}
		log("Cancel button clicked");
		setNotes(currentNotes)
	}
	
	log("Sending GET_NOTES message for recipeId %d", [recipeId]);
	// Send message to background script to request the notes
	chrome.runtime.sendMessage({
		"messageType": "AllRecipiesRecipeNotes::GET_NOTES",
		"recipeId":    recipeId
	});
	
	chrome.runtime.onMessage.addListener(function(request, sender, responseCallback) {
		var validMessageTypes = [
			"AllRecipiesRecipeNotes::GET_NOTES_RESPONSE",
			"AllRecipiesRecipeNotes::SET_NOTES_RESPONSE"
		]
		if (validMessageTypes.indexOf(request.messageType) < 0) {
			log("Ignoring unknown message: %o", [request], "info");
			return;
		}
	
		log("Received message %o", [request]);
		if (request.recipeId != recipeId) {
			log("Ignoring message associated with different recipe id (actual=%s, expected=%s)", [request.recipeId, recipeId], "warn");
			return;
		}
		if (request.error) {
			log(request.error, [], "error");
			setError()
		} else if (request.messageType == "AllRecipiesRecipeNotes::GET_NOTES_RESPONSE") {
			log("Setting notes to: %s", [request.notes]);
			setNotes(request.notes);
		} else if (request.messageType == "AllRecipiesRecipeNotes::SET_NOTES_RESPONSE") {
			log("Setting notes to: %s", [request.notes]);
			setNotes(request.notes);
		}
	});

	setTimeout(function() {
		var existingNotes = $(".recipeNotes").find(".recipe-directions__list--item").html()
		if (existingNotes && !currentNotes) {
			log("Found existing notes to save: %s", [existingNotes])
			setNotes(existingNotes)
			startEdit()
			saveEdit()
		}
	}, 3000)
})();
