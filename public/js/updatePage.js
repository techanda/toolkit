$(window).on("load",function(){
	$("#fileSelect").fadeIn();
	$("#downloadFile").on("click",function(){
		downloadFile("table#previewTable");
	})
	window.masterPreviewHtml = $("#resultsPreview").html();
})

$("select[name=mTeamMember]").on("change",function(event){
	var mTeamMemberSelect 	= $(this).val(),
		mTeamDirects 		= csvObj.mTeamMembers.find(function(mTeamMember){
              					return mTeamMember.name === mTeamMemberSelect }).mTeamDirects,
		mTeamDirectsHtml	= "";
		$(mTeamDirects).each(function(){
			mTeamDirectsHtml += "<div class='checkbox'><label><input type='checkbox' value='"+this.name+"'> "+this.name+"</label></div>";
		})

		$("#mTeamDirect").html(mTeamDirectsHtml);
		$("#resultsPreviewGroup").hide();
		$("#downloadGroup").hide();
		$("#mTeamDirectGroup").fadeIn();
		location.href = "#mTeamDirectGroup";
		$("#mTeamDirectGroup .checkbox input[type=checkbox]").change(function(){
			$.when(updatePreview()).then(function(){
				addClassToRowByValue("table#previewTable","On Exception","True","highlight-row");
			  	$(".highlight-row").toggleClass("highlighted");
			})
		});
})

function updatePreview(){
	var mTeamMember 		= $("select[name=mTeamMember]").val(),
		mTeamDirects 		= $("#mTeamDirectGroup .checkbox input[type=checkbox]:checked"),
		previewData 		= [];

	$("#resultsPreview").html(masterPreviewHtml);
	updateException(csvFileData_fileMaster,csvFileData_fileException);
	updateBlanks(csvFileData_fileMaster,"EE is on Leave?","No")
	// updateBlanks(csvFileData_fileMaster,"On Exception","False")
	$(csvFileData_fileMaster).each(function(){
		var entry = this;
		$(mTeamDirects).each(function(){
			if (entry["mTeam Direct"] === $(this).val()) {previewData.push(entry)}
		})
	});

	var headers = [];
	$(getUniqueKeys(previewData)).each(function(){
		var datepicker = false;
		var data = {
				field 			: this.replace(/[^A-Z0-9]/ig, "_"),
				title 			: this,
				sortable		: true,
				filterControl	: "input",
				visible			: false
			}
		switch (this.toString()) {
			case "Remarks":
				data.visible = true;
				break;
			case "Employee ID":
				data.visible = true;
				break;
			case "Name":
				data.visible = true;
				break;
			case "Hire Date > 50 Days Ago":
				data.filterControl 	= "select";
				data.visible = true;
				break;
			case "EE is on Leave?":
				data.filterControl 	= "select";
				data.visible = true;
				break;
			case "Manager Name":
				data.visible = true;
				break;
			case "mTeam Member":
				data.visible = true;
				break;
			case "mTeam Direct":
				data.visible = true;
				break;
			case "mTeam Direct Direct":
				data.visible = true;
				break;
			case "Location":
				data.filterControl 	= "select";
				data.visible = true;
				break;
			case "On Exception":
				data.filterControl 	= "select";
				data.visible = true;
				break;
			case "Notes (if needed)":
				data.visible = true;
				break;
		}
		headers.push(data)
	})

	$("#resultsPreviewGroup").fadeIn();
	$("#downloadGroup").fadeIn();
	// location.href = "#resultsPreviewGroup";
	var	date 		= new Date,
		month 		= date.getMonth(),
		day			= date.getDay(),
		year 		= date.getYear(),
		timeHash 	= date.getMinutes().toString() + date.getSeconds().toString() + date.getMilliseconds().toString(),
		fileName 	= mTeamMember + "_report_" + month + "_" + day + "_" + year + "_" + timeHash;

	$(function () {
	    $('table#previewTable').bootstrapTable({
	    	columns					: headers,
	        data 					: trimObjKey(previewData),
	        showColumns				: true,
	        striped					: true,
	        buttonsClass			: "primary",
	        pagination				: true,
	        toolbar					: "#toolbar",
	        showExport				: true,
	        clickToSelect			: true,
	        filterControl			: true,
	        filterShowClear			: true,
	        exportTypes				: ['json', 'xml', 'csv', 'txt', 'sql', 'excel','pdf','xlsx'],
	        exportDataType			: "all",
	        search					: true
	    });
	    $.fn.tableExportSettings.fileName = fileName;
	    $(".filter-show-clear").removeClass("btn-default");
	    $(".filter-show-clear").addClass("btn-primary");
	  //   $(".filter-show-clear").on("click",function(){
	  //   	$.when(updatePreview()).then(function(){
			// 	addClassToRowByValue("table#previewTable","On Exception","True","highlight-row");
			// 	if ($(".btn-toggle-highlight .glyphicon.highlight-off").length < 1){
			// 		$(".highlight-row").toggleClass("highlighted");
			// 	}
			// })
	  //   })


	    toggleViewOnWindow("table#previewTable",768);


	});

	var $table = $('table#previewTable');
    $(function () {
        $('#toolbar').find('select').change(function () {
            $table.bootstrapTable('refreshOptions', {
                exportDataType: $(this).val()
            });
        });
    })
}


function trimObjKey(obj) {
  var outputArr = [];
  $(obj).each(function(){
    var arrObject = {};
    for (key in this){
      var newKeyName = key.replace(/[^A-Z0-9]/ig, "_");
      arrObject[newKeyName] = this[key];
    }
    outputArr.push(arrObject)
  })
  return outputArr;
}

function getUniqueKeys(obj){
	var returnData = [];
	$(obj).each(function(){
		for (key in this){
			if (!(returnData.find(function(entry){ return entry === key}))) {
				returnData.push(key);
			}
		}
	})
	return returnData
}

//appends exception information into masterObj
function updateException(masterObj,exceptionObj){
	for (var i = masterObj.length - 1; i >= 0; i--) {
		masterObj[i]["On Exception"] = "False";
		masterObj[i]["Notes (if needed)"] = "-";
	}
	$(exceptionObj).each(function(){
		var exception = this;
		foundObj = masterObj.find(function(entry) { return entry["Name"] == exception["Employee Name"]});
		if (foundObj !== undefined){
			foundObj["On Exception"] = "True";
			for (key in exception){
				foundObj[key] = this[key];
			}
		}
	})
}

function updateBlanks(obj,key,replaceString){
	$(obj).each(function(){
		if (this[key] === "" || this[key] === null || !this.hasOwnProperty(key)) {
			this[key] = replaceString;
		}
	})
}

function toggleViewOnWindow(selector,breakPoint){
	
	if ($(window).width() < breakPoint) {
		$(selector).bootstrapTable("toggleView");
		window.cardView = true;
	} else {
		window.cardView = false;
	}

	$(window).bind('resize', function(e)
	{

		currentView = window.cardView;

		if ($(window).width() < breakPoint) {
			window.cardView = true;
		} else {
			window.cardView = false
		}

		if (currentView !== window.cardView) {
			
			$.when(toggleView(selector)).then(function(){
				addClassToRowByValue("table#previewTable","On Exception","True","highlight-row");
		        if ($(".btn-toggle-highlight .glyphicon.highlight-off").length < 1){
		            $(".highlight-row").toggleClass("highlighted");
		        }
			})
		}

		function toggleView(selector) {$(selector).bootstrapTable("toggleView");}

	});
}

function addClassToRowByValue(tableSelector,columnName,columnValue,className){
	$(tableSelector).on("change",function(){

	})
	var tHeaders 	= $(tableSelector + " thead tr").find("th"),
		tRows		= $(tableSelector + " tbody").find("tr");

	for (var i = 0; i < tHeaders.length; i++){
		if ($(tHeaders[i]).find("div.th-inner").text() === columnName){var columnIndex = i}
	}
	
	if ($(tableSelector + " .card-view").length < 1) {
		$(tRows).each(function(){
			if ($($(this).find("td")[columnIndex]).text() === columnValue){
			$(this).addClass(className);
			}
		});
	} else {
		$(tRows).each(function(){
			if ($($($(this).find(".card-view"))[columnIndex]).find("span.value").text() === columnValue){
			$(this).addClass(className);
			}
		});
	}

	
	if ($(".btn-toggle-highlight").length < 1) {
		$($($($(".fixed-table-toolbar").find(">div"))[1]).find(">div,>button")[0])
		.append("<button title='Toggle Exception Highlighting Off' class='btn btn-toggle-highlight btn-primary' style='border-radius:0;'>\
			<span class='glyphicon glyphicon glyphicon-pencil' aria-hidden='true'></span></button>");
		$('.btn-toggle-highlight').on("click",function(){
			$(".highlight-row").toggleClass("highlighted");
			$(".btn-toggle-highlight").find(".glyphicon").toggleClass("highlight-off");
			if ($(".btn-toggle-highlight").attr("title") === "Toggle Exception Highlighting Off") {
				$(".btn-toggle-highlight").attr("title","Toggle Exception Highlighting On");
			} else {
				$(".btn-toggle-highlight").attr("title","Toggle Exception Highlighting Off");
			}
		})
	}	

}
