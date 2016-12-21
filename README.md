# toolkit
This is a localized (non-webserver) application created for my wife.  It contains a landing page that can launch other tools
that are created in the future.  Currently there is only one application created, an audit tool that assists with the creation 
of an audit report used within my wifes job.

## Manager to IC Audit
Currently this is the only tool within this application.  It accepts standard spreadsheet files (*.xlsx, *.csv, etc.) that are
structured within the constraints (public/js/data/fileRequirements.js) of the fileRequirements file.  Once the files are loaded,
the user can select other options to build a interactive table.  Once the information is filtered and selected, you can download the
file as an *.xlsx file via the button or various other files such as JSON via the dropdown within the table.

# Note
- This application does not interact with any webs services.
- All necessary files are within the application
- All code is run locally in the user's browser
