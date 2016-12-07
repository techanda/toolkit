(function($){
	$.fn.extend({
		buildTiles: function(srcData){
			var destination = $(this);
			var htmlTemplate = $(this).html();
			(this).html("");
			(this).show();
			for (var i = srcData.length - 1; i >= 0; i--) {
				$(this).append("<div style='display:none' class='toolboxTile' id='toolTile_"+i+"'></div>")
				var current = $("#toolTile_"+i);
				current.html(htmlTemplate);

				if (srcData[i].description.length >140){
					var description = srcData[i].description.slice(0,137) + "...";
				} else {
					var description = srcData[i].description;
				}

				current.find(".thumbnail img").attr("src",srcData[i].imgSrc)
				current.find(".thumbnail img").attr("title",srcData[i].description)
				current.find(".thumbnail h3").text(srcData[i].name)
				current.find(".thumbnail p").text(description)
				current.find(".thumbnail").wrap("<a href='"+srcData[i].alias+".html'></a>")
				current.fadeIn();

			} 
		},
		buildMenu: function(srcData){
			var destination = $(this);
			for (var i = srcData.length - 1; i >= 0; i--) {
				var menuChoice = "<li><a href='"+srcData[i].alias+".html'>"+srcData[i].name+"</a></li>"
				destination.find("li.dropdown ul.dropdown-menu").append(menuChoice);
			}
		}
	})
})(jQuery)