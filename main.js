
let data;
//API SET UP
const link = "https://docs.google.com/spreadsheets/d/1vX27YI9FHUgYR9pkKbbQMZ8BdW6_IDtPsT8L4-CeMnU/edit?usp=sharing"
const SPREADSHEET_ID = "1vX27YI9FHUgYR9pkKbbQMZ8BdW6_IDtPsT8L4-CeMnU"
const API_KEY = 'AIzaSyBSuEJzNjYnuehwPk0fGnmTcZwCpFzzSA8'
async function initClient() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
        });
        console.log('api inited');

        let sheet_data = await fetchData(); 
        data = reformat_data(sheet_data)
        run(data); 

    } catch (error) {
        console.error("Error!!", error);
    }
}


function start() {
    gapi.load('client', initClient); 
}


// FETCH DATA FUCTNIONS
const fetchSheetData = async () => {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
    //   range: 'Sheet1',  
      range: 'AdventCal',  
      key: API_KEY
    });
  
    const rows = response.result.values;
    const numColumns = rows[0] ? rows[0].length : 0;
    const numRows = rows.length;

    const range = `AdventCal!A1:${String.fromCharCode(64 + numColumns)}${numRows}`;
    return range;
  };

const fetchData = async () => {
  const range = await fetchSheetData(); 
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range,  
    key: API_KEY
});

  return response.result.values;  
};


// RUN THINGS
start();

function reformat_data(data){
    let data_object = []
    let col_names = data[0]
    for(let row_idx = 1; row_idx<data.length; row_idx++){
        let row = data[row_idx]
        let entry = {}
        for(let col_idx = 0; col_idx < col_names.length; col_idx++){
            entry[col_names[col_idx]] = row[col_idx]
        }
        data_object.push(entry)
    }
    return data_object
}

function run(data){
    console.log("RUNNING ON DATA: ", data)
    driver_christmasPuzzles(data)
    // driver_visualizePuzzles(data)

}
