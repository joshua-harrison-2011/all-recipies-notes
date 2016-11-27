// ==UserScript==
// @name         AllRecipies.com Notes (port: {{ port }})
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add notes to AllRecipies.com
// @author       Joshua Harrison
// @match        http://allrecipes.com/recipe/*
// @match        http://www.allrecipies.com/recipe/*
// @require      http://code.jquery.com/jquery-3.1.1.slim.min.js
// @grant        GM_xmlhttpRequest
// @connect      {{ host }}
// ==/UserScript==

(function() {
	'use strict';
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

	var STATE_LOADING  = 1;
	var STATE_READONLY = 2;
	var STATE_EDITING  = 3;
	var STATE_SAVING   = 4;
	var STATE_ERROR    = 5;

	var currentState = STATE_LOADING;
	var currentNotes = "";

	var recipeId = parseInt(document.location.href.split("/")[4]);

	var notesDiv = $("<div />")
		.css("font-style", "italic")
		.css("white-space", "pre")
		.html("Loading Notes ...");


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
		);

	var notesEditIcon = $("<div />")
		.css({
			"width":          "32px",
			"height":         "32px",
			"margin-left":    "32px",
			"border-radius":  "32px/32px",
			"border":         "1px solid #b3b3b3",
			"cursor":         "pointer"
		})
		.click(startEdit)
		.append($("<img />")
			.attr("src",         "http://images.media-allrecipes.com/ar-images/icons/icon_edit_grey.svg")
			.css("transform",    "scale(0.7)")
			.css("padding-left", "3px")
			.css("padding-top",  "4px")
		);

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
		notesEditDiv.hide();
		notesDiv.show().html("Error accessing notes");
		currentState = STATE_ERROR;
	}

	function setNotes(notes) {
		if (notes.trim()) {
			notesDiv.css("font-style", "normal").html(notes);
			notesEditDiv.find("textarea").val(notes);
		} else {
			notesDiv.css("font-style", "italic").html("No notes provided");
			notesEditDiv.find("textarea").val("");
		}
		notesDiv.show();
		notesEditDiv.hide();

		currentNotes = notes;
		currentState = STATE_READONLY;
	}

	function startEdit() {
		if (currentState == STATE_READONLY) {
			log("Edit image clicked");
			notesDiv.hide();
			notesEditDiv.show();
			notesEditDiv.find("input[value='Saving ...']").val("Save");
			notesEditDiv.find("textarea").focus();
			currentState = STATE_EDITING;
		}
	}

	function saveEdit() {
		if (currentState != STATE_EDITING) {
			return;
		}
		currentState = STATE_SAVING;
		notesEditDiv.find("input[value='Save']").val("Saving ...");

		var newNotes = notesEditDiv.find("textarea").val();
		var url = "http://{{ host }}:{{ port }}/notes/" + recipeId + "?" + (new Date()).getTime();
		log("Save button clicked.  POST %s, notes: %s", [url, newNotes]);

		GM_xmlhttpRequest({
			method: "POST",
			url: url,
			data: newNotes,
			onerror: function (response) {
				setError();
			},
			onload: function (response) {
				setNotes(newNotes);
            		}
		});
	}

	function cancelEdit() {
		if (currentState != STATE_EDITING) {
			return;
		}

		log("Cancel button clicked");
		setNotes(currentNotes);
	}

	var url = "http://{{ host }}:{{ port }}/notes/" + recipeId + "?" + (new Date()).getTime();
	log("GET %s", [url]);
	GM_xmlhttpRequest({
		method: "GET",
		url: url,
		timeout: 5000,
		onerror: function (response) {
			setError();
		},
		onload: function (response) {
			if (!response.responseText) {
				response.responseText = "";
			}
			log("Setting notes to: %s", [response.responseText]);
			setNotes(response.responseText);
		}
	});

	setTimeout(function() {
		var existingNotes = $(".recipeNotes").find(".recipe-directions__list--item").html();

		if (existingNotes && !currentNotes && currentState == STATE_READONLY) {
			log("Found existing notes to save: %s", [existingNotes]);
			setNotes(existingNotes);

			startEdit();
			saveEdit();
		}

	}, 3000);
})();
