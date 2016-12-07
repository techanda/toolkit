
  $(document).ready(function() {
    window.csvObj = {};
    window.csvObj.mTeamMembers = [];
    if(isAPIAvailable()) {
      var masterObject = {};
      $('#fileMaster').bind('change', handleFileSelect);
      $('#fileException').bind('change', handleFileSelect);

      $("#fileMaster").bind("change",function(){
        $("#fileSelect2").hide();
        $("#mainForm").hide();
        $("#mTeamDirectGroup").hide();
        $("#resultsPreviewGroup").hide();
        $("#downloadGroup").hide();
        if (window.fileValid === true) {
          $("#fileSelect2").fadeIn();
          location.href = "#fileSelect2";
        }
      })
      $("#fileException").bind("change",function(){
        $("#mainForm").hide();
        $("#mTeamDirectGroup").hide();
        $("#resultsPreviewGroup").hide();
        $("#downloadGroup").hide();
        if (window.fileValid === true) {
          $("#mainForm").fadeIn();
          location.href = "#mainForm";
        }
      })
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
    var files = evt.target.files; // FileList object
    var file = files[0];
    window.fileValid = false;
    var variableName = "csvFileData_" + $(this).attr("id");
    if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      if ($(this).attr("data-heirarchy") === "true") {
        window.fileValid = true;
        handleXLSX(this,files,variableName,true);
      } else {
        window.fileValid = true;
        handleXLSX(this,files,variableName,false);
      }
    } 
    else if ( file.type === "text/csv")
    {
      if ($(this).attr("data-heirarchy") === "true") {
        window.fileValid = true;
        handleCSV(this,file,variableName,true);
      } else {
        window.fileValid = true;
        handleCSV(this,file,variableName);
      }
    } else {
      alert("Please select a valid file type");
    }


    function handleCSV(element,file,variableName,heirarchyData = false) {
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function(event){
        var csv = event.target.result;
        var data = $.csv.toObjects(csv);
        window[variableName]= data;
        updatePage(element,data,heirarchyData);
      };

      reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
    }

    function handleXLSX(element,files,variableName,heirarchyData = false) {
      var i,f;
      for (i = 0, f = files[i]; i != files.length; ++i) {
        var reader = new FileReader();
        var name = f.name;
        reader.onload = function(e) {
          var dataXLSX = e.target.result;
          var workbook = XLSX.read(dataXLSX, {type: 'binary'});
          window.workbook = workbook

          var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[first(workbook.Sheets)]);

          var data = $.csv.toObjects(csv);
          window[variableName]= data;
          updatePage(element,data,heirarchyData);


          function first(obj) {
            for (var a in obj) return a;
          }
        };
        reader.readAsBinaryString(f);
      }
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

  }

  function downloadFile(tableSelector){
  var mTeamMember = $("select[name=mTeamMember]").val().replace(/\s+/g, '');
    date    = new Date,
    month     = date.getMonth(),
    day     = date.getDay(),
    year    = date.getYear(),
    timeHash  = date.getMinutes().toString() + date.getSeconds().toString() + date.getMilliseconds().toString(),
    fileName  = mTeamMember + "_report_" + month + "_" + day + "_" + year + "_" + timeHash,
    $table    = $(tableSelector);

    $table.bootstrapTable('togglePagination');
    $(tableSelector).tableExport({
      fileName    : fileName,
      type      : "xlsx",
      tableName   : "Master",
      worksheetName : "Manager to IC Audit"
    })
    $table.bootstrapTable('togglePagination');

}
