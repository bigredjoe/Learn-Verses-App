var fetchverses = function(callBack) {
		//Split Up the Passage Input for the ESV API
		var passage = $("#passage").val().split(" ");
		localStorage.Passage = $("#passage").val();
		//Setting Title H1
		$("#title").text("Loading Scriptures");

		//Loading XML (Couldn't get it to load straight into a variable)
		$("#xmlimport").load('http://www.esvapi.org/v2/rest/passageQuery?key=c132b8e2f4f975cc&passage=' + passage[0] + '+' + passage[1] + '&include-xml-declaration=true&output-format=crossway-xml-1.0&include-simple-entities=true', function(responseText, textStatus, req) {
			if (textStatus == "error") {
			   $("#title").text("Hmm...We couldn't connect the internet.");
			} else {
				var xml = $("#xmlimport").html();
				    xmlDoc = $.parseXML( xml );
				    $xml = $( xmlDoc );
				
					//Sorting XML contents
				  	$xml.find("heading").remove();
					$chapter = $xml.find("reference").text().split(":")[0];
				    $flashcards = $xml.find( "verse-unit" );
				
				var scripturedata = new Array();

				if ($flashcards.length < 1) { //Checking for flashcards,if none showing error message
					$("#title").text("Sorry, we couldn't find that passage");
				} else {
					$flashcards.each(function(index) {
						
						var verseReference = $chapter + ":" + $(this).find("verse-num").text();
						//Removing Extra XML that is rendered after referencing the verse
						$(this).find("verse-num, footnote").remove();
						var audionum = $(this).attr("unit-id"); //audio number for mp3
						var data = { reference : verseReference,
						 			 versecontents : $(this).text(),
						 			 audiolink : "http://stream.esvmedia.org/mp3-play/hw/" + audionum + ".mp3" };
						scripturedata[index] = data;
					});

					localStorage.Scriptures = JSON.stringify(scripturedata); //puting scriptures in local storage
					
					//Calling Callback
					if (callBack != undefined) {
						callBack();
					}
					
					$("#title").text("Studying " + localStorage.Passage);
				}//End Flashcard checking
				
			} //End Connection Checking
			
		});
					
};

var initpassages = function(prevInit) {
	
	//Needed to create a seperate function to call twice in each case and after the retrieval of the verses
	var commonInstructions = function() {
			var scriptures = JSON.parse(localStorage.Scriptures); //Stores the scriptures to be rendered
			
			//Rendering Scripture Partial
			renderPartial(scriptures, "partials/flashcard.html", "#scriptures", function(){
					
				}, function() {
					//Final Callback

					$("#scriptures").trigger("create");
					$("audio").click(function(event){
							    			event.stopPropagation();
					});				
				});
			
	};
		
	
		if (prevInit === "true") { //If this is a previous passage reload
			$("#passage").val(localStorage.Passage);
			commonInstructions();
			$("#title").text("Studying " + localStorage.Passage);
		} else { //If it a new passage
			localStorage.Passage = $("#passage").val();
			fetchverses(commonInstructions);
		};

};

//Made the renderPartial function reusable for any future improvements, etc.
var renderPartial = function(data, partialLocation, destination, everyRenderCallback, finalCallback){
	
	$("#partialloading").load(partialLocation, function(){
		var source = $("#partialloading").html();
		var template = Handlebars.compile(source);
		var compiledHTML = "";
		
		//Had to what for the function calls using when / then because of asynchronous Javascript execution in Safari
		$.when(		
			//compiling each verse
			$.each(data, function(i, linedata){
				compiledHTML = compiledHTML + template(linedata);
				if (everyRenderCallback != undefined) {
					everyRenderCallback();
				}
			})	
		).then(function(){		
			//Inserting HTML into #scripture div
			$(destination).html(compiledHTML);
		}).then(function(){
			if (finalCallback != undefined) {
					finalCallback();
			}
		});

		

	});
};

/* Todo's
Check if Passage Exists
Check if internet is working
*/