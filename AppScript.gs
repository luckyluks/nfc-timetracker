const SPREADSHEET_URL = "<SECRET>"
const DEVICE = "<DEVICE>"
const SECRET = "<SECRET>"

var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
var sheet = selectOrCreateSheet();


// entry point for POST requests
function doPost(e){
  var action = e.parameter.action;
  var device = e.parameter.device;
  var secret = e.parameter.secret;

  if (action==="addItem" && device===DEVICE && secret===SECRET){
    return addItem()
  } else {
    return ContentService.createTextOutput("Error: action, device or secret not correct!").setMimeType(ContentService.MimeType.TEXT)
  }
}

function addItem(){
  
  try{

    // get current date
    var newDate = new Date();
    
    // get date value
    var lastRowId = sheet.getLastRow();
    var lastDateItem = sheet.getRange("A" + lastRowId);
    var previousDate = lastDateItem.getValue();

    if (isSameDay(newDate, previousDate)){
      // dates are the same
      var departureString = getRoundedDate(15, newDate)
      var departureCell = sheet.getRange("C"+lastRowId)
      departureCell.setValue(departureString)
      return ContentService.createTextOutput("added new departure: "+departureString).setMimeType(ContentService.MimeType.TEXT)
    } else {
      // dates are not the same -> add new date
      var arrivalString = getRoundedDate(15, newDate)
      sheet.appendRow(
        [
          newDate.getDate() + '.' + (newDate.getMonth()+1) + '.' +  newDate.getFullYear(),
          getRoundedDate(15, newDate)
        ]
      )
      return ContentService.createTextOutput("added new arrival: "+arrivalString).setMimeType(ContentService.MimeType.TEXT)
    }

  } catch (error){
    Logger.log(error)
    return ContentService.createTextOutput("error: could not finish: " + error).setMimeType(ContentService.MimeType.TEXT)   	
  }
}

// function parseDateString(dateString){
//   var parts = dateString.split('.');
//   return new Date(parts[2], parts[1] - 1, parts[0]); 
// }

function isSameDay(newDate, previousDate){
  try {
    return newDate.getFullYear() === previousDate.getFullYear() &&
      newDate.getMonth() === previousDate.getMonth() &&
      newDate.getDate() === previousDate.getDate()
  } catch {
    return false
  }
}

function getRoundedDate (minutes, d=new Date()) {
  let ms = 1000 * 60 * minutes; // convert minutes to ms
  let roundedDate = new Date(Math.round(d.getTime() / ms) * ms);
  return roundedDate.getHours() + ':' + ('0'+roundedDate.getMinutes()).slice(-2)
}

function selectOrCreateSheet(){
  var month = new Date().toLocaleString('default', { month: 'short' }) + new Date().getFullYear();
  var yourNewSheet = ss.getSheetByName(month);
  if (yourNewSheet === null) {
    yourNewSheet = ss.getSheetByName("_default").copyTo(ss).setName(month);
  }
  return yourNewSheet
}
