
  $(document).ready(function() {
    window.csvObj = {};
    window.csvObj.mTeamMembers = [];
    fileValid = false;
    if(isAPIAvailable()) {
      var masterObject = {};
      $('#fileException').bind('change', handleFileSelect);
      $('#fileMaster').bind('change', handleFileSelect);
    }
  });

function isAPIAvailable() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    return true;
  } else {
    // source: File API availability - http://caniuse.com/#feat=fileapi
    // source: <output> availability - http://html5doctor.com/the-output-element/
    document.writeln('The HTML5 APIs used in this form are only available in the following browsers:<br />');
    // 6.0 File API & 13.0 <output>
    document.writeln(' - Google Chrome: 13.0 or later<br />');
    // 3.6 File API & 6.0 <output>
    document.writeln(' - Mozilla Firefox: 6.0 or later<br />');
    // 10.0 File API & 10.0 <output>
    document.writeln(' - Internet Explorer: Not supported (partial support expected in 10.0)<br />');
    // ? File API & 5.1 <output>
    document.writeln(' - Safari: Not supported<br />');
    // ? File API & 9.2 <output>
    document.writeln(' - Opera: Not supported');
    return false;
  }
}

function handleFileSelect(evt) {
  var element = this;
  var files = evt.target.files; // FileList object
  var file = files[0];
  fileValid = false;
  var fileSelectId = $(element).attr("id")
  var variableName = "csvFileData_" + fileSelectId;
  if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    if ($(element).attr("data-heirarchy") === "true") {
      handleXLSX(element,files,variableName,true);
    } else {
      handleXLSX(element,files,variableName,false);
    }
  } else if ( file.type === "text/csv") {
    if ($(element).attr("data-heirarchy") === "true") {
      handleCSV(element,file,variableName,true);
    } else {
      handleCSV(element,file,variableName);
    }
  } else {
    var message = "<strong>" + file.name + "</strong> is not a supported file type.  \
                    Please use a valid spreadsheet document type.\
                    Valid file types are file swith the extension CSV, XLS, or XLSX.";
    errorMessage(message);
  }

  function handleCSV(element,file,variableName,heirarchyData = false) {
    var fileSelectId = $(element).attr('id')
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event){
      var csv = event.target.result;
      var data = $.csv.toObjects(csv);
      window[variableName]= data;
      var currentHeaders = [];
        for (key in data[0]){ currentHeaders.push(key)}
        if (fileSelectId === "fileMaster") {
          $("#fileSelect2").hide();
          $("#mainForm").hide();
          $("#mTeamDirectGroup").hide();
          $("#resultsPreviewGroup").hide();
          $("#downloadGroup").hide();
          $(".fileName").text("")
        }
        if (fileSelectId === "fileException"){
          $("#mainForm").hide();
          $("#mTeamDirectGroup").hide();
          $("#resultsPreviewGroup").hide();
          $("#downloadGroup").hide();
          $("#fileException .fileName").text("")
        }
        if ( superbag(currentHeaders,fileStructureReq[fileSelectId].requiredHeaders)) {
          updatePage(element,data,heirarchyData);
          if (fileSelectId === "fileMaster") {
            $("#fileSelect2").fadeIn();
            location.href = "#fileSelect2";
          }
          if (fileSelectId === "fileException"){
            $("#mainForm").fadeIn();
            location.href = "#mainForm";
          }
        } else {
          message = "Oops, <strong>" + file.name + "</strong> appears to have the wrong information.  Make sure \
                    that you are loading the correct file and try again."
          errorMessage(message);
          
        }
    };

    reader.onerror = function(){ errorMessage('Unable to read ' + file.fileName); };
  }

  function handleXLSX(element,files,variableName,heirarchyData = false) {
    var fileSelectId = $(element).attr('id')
      var name = files[0].name;
      var reader = new FileReader();
      reader.onload = function(e) {
        var dataXLSX = e.target.result;
        var workbook = XLSX.read(dataXLSX, {type: 'binary'});
        window.workbook = workbook

        var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[first(workbook.Sheets)]);

        var data = $.csv.toObjects(csv);
        window[variableName]= data;
        var currentHeaders = [];
        for (key in data[0]){ currentHeaders.push(key)}
        if (fileSelectId === "fileMaster") {
          $("#fileSelect2").hide();
          $("#mainForm").hide();
          $("#mTeamDirectGroup").hide();
          $("#resultsPreviewGroup").hide();
          $("#downloadGroup").hide();
          $(".fileName").text("")
        }
        if (fileSelectId === "fileException"){
          $("#mainForm").hide();
          $("#mTeamDirectGroup").hide();
          $("#resultsPreviewGroup").hide();
          $("#downloadGroup").hide();
          $("#fileException .fileName").text("")
        }
        if ( superbag(currentHeaders,fileStructureReq[fileSelectId].requiredHeaders)) {
          updatePage(element,data,heirarchyData);
          if (fileSelectId === "fileMaster") {
            $("#fileSelect2").fadeIn();
            location.href = "#fileSelect2";
          }
          if (fileSelectId === "fileException"){
            $("#mainForm").fadeIn();
            location.href = "#mainForm";
          }
        } else {
          message = "Oops, <strong>" + file.name + "</strong> appears to have the wrong information.  Make sure \
                    that you are loading the correct file and try again."
          errorMessage(message);
          
        }

        function first(obj) {
          for (var a in obj) return a;
        }
      };
      reader.readAsBinaryString(files[0]);  
  }

  function updatePage(element,data,heirarchyData = false){
      // update page heriarchy data
      if (heirarchyData === true) {
        //add mTeam Members
        for (var i = data.length - 1; i >= 0; i--) {
          //check if mTeam Member is already present
          var mTeamMemberFound = false;
          for (var n = window.csvObj.mTeamMembers.length - 1; n >= 0; n--) {
            if (window.csvObj.mTeamMembers[n].name === data[i]["mTeam Member"]) {
              mTeamMemberFound = true;
            }
          }
          if (!mTeamMemberFound) {
            if (data[i]["mTeam Member"] !== "") {
              window.csvObj.mTeamMembers.push({"name" : data[i]["mTeam Member"]});
              window.csvObj.mTeamMembers.find(function(mTeamMember){
                return mTeamMember.name === data[i]["mTeam Member"] }).mTeamDirects = [];
            }
          }
        }
        //add mTeam Directs
        for (var i = data.length - 1; i >= 0; i--) {
          var mTeamDirectFound = false;
          for (var n = window.csvObj.mTeamMembers.length - 1; n >= 0; n--) {
            for (var x = window.csvObj.mTeamMembers[n].mTeamDirects.length - 1; x >= 0; x--) {
              if (window.csvObj.mTeamMembers[n].mTeamDirects[x].name === data[i]["mTeam Direct"]) {
                mTeamDirectFound = true;
              }
            }
          }

          if (!mTeamDirectFound) {
            if (data[i]["mTeam Direct"] !== "") {
              window.csvObj.mTeamMembers.find(function(mTeamMember){

                return mTeamMember.name === data[i]["mTeam Member"]
              }).mTeamDirects.push({name : data[i]["mTeam Direct"]});

              window.csvObj.mTeamMembers.find(function(mTeamMember){
                return mTeamMember.name === data[i]["mTeam Member"] }).mTeamDirects.find(function(mTeamDirect){
                  return mTeamDirect.name === data[i]["mTeam Direct"]
                }).employee = [];
            }
          }
          if (data[i]["Name"] !== ""){
            window.csvObj.mTeamMembers.find(function(mTeamMember){
              return mTeamMember.name === data[i]["mTeam Member"] }).mTeamDirects.find(function(mTeamDirect){
                return mTeamDirect.name === data[i]["mTeam Direct"]
            }).employee.push({
              employeeId    : data[i]["Employee ID"],
              name          : data[i]["Name"],
              hireDate      : data[i]["Hire Date"],
              hireDateGT50  : data[i]["Hire Date > 50 Days Ago"],
              onLeave       : data[i]["EE is on Leave?"],
              managerName   : data[i]["Manager Name"],
              location      : data[i]["Location"]
            })
          }
        }
      }


      //update fileName span
      
      $(element).parent().next().text(file.name);

      var mTeamMembersHtml = "<option value='null'>- Please Select -</option>";
      $(csvObj.mTeamMembers).each(function(){
        mTeamMembersHtml += "<option value='"+this.name +"'>"+this.name+"</option>";
      })

      $("select[name=mTeamMember]").html(mTeamMembersHtml);
  }
  return fileValid;
}

  function downloadFile(tableSelector) {
    var mTeamMember = $("select[name=mTeamMember]").val().replace(/\s+/g, ''),
        date        = new Date,
        month       = date.getMonth(),
        day         = date.getDay(),
        year        = date.getYear(),
        timeHash    = date.getMinutes().toString() + date.getSeconds().toString() + date.getMilliseconds().toString(),
        fileName    = mTeamMember + "_report_" + month + "_" + day + "_" + year + "_" + timeHash,
        $table      = $(tableSelector);

    $table.bootstrapTable('togglePagination');
    $(tableSelector).tableExport({
      fileName    : fileName,
      type      : "xlsx",
      tableName   : "Master",
      worksheetName : "Manager to IC Audit"
    })
    $table.bootstrapTable('togglePagination');
}

function superbag(sup, sub) {
    sup.sort();
    sub.sort();
    var i, j;
    for (i=0,j=0; i<sup.length && j<sub.length;) {
        if (sup[i] < sub[j]) {
            ++i;
        } else if (sup[i] == sub[j]) {
            ++i; ++j;
        } else {
            // sub[j] not in sup, so sub not subbag
            return false;
        }
    }
    // make sure there are no elements left in sub
    return j == sub.length;
}

function errorMessage(messageHTML){
    $("#errorModal p#errorMessage").html(messageHTML);
    $("#errorModal").modal("show");
}


