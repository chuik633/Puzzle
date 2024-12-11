
// const link = "https://docs.google.com/spreadsheets/d/1vX27YI9FHUgYR9pkKbbQMZ8BdW6_IDtPsT8L4-CeMnU/edit?usp=sharing"
// const SPREADSHEET_ID = "1vX27YI9FHUgYR9pkKbbQMZ8BdW6_IDtPsT8L4-CeMnU"
// const API_KEY = 'AIzaSyBSuEJzNjYnuehwPk0fGnmTcZwCpFzzSA8'
// function initClient() {
//     gapi.client.init({
//     apiKey: API_KEY,
//     discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
//     }).then(() => {
//     console.log('Google Sheets API client initialized');
//     // Once initialized, fetch data
//     fetchData();
//     }).catch(error => {
//     console.error("Error initializing gapi client", error);
//     });
// }

// // Load the gapi client and initialize it
// function start() {
//     gapi.load('client', initClient);  // Ensure the client is loaded before initializing
// }

// start();

const fetchSheetData = async () => {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1',  
      key: API_KEY
    });
  
    const rows = response.result.values;
    const numColumns = rows[0] ? rows[0].length : 0;
    const numRows = rows.length;

    const range = `Sheet1!A1:${String.fromCharCode(64 + numColumns)}${numRows}`;
    return range;
  };

const fetchData = async () => {
  const range = await fetchSheetData(); 
  const response = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range,  
    key: API_KEY
});

  return response.result.values;  // Return the fetched data
};
// let data = await fetchData()
let data = await d3.csv('data/data.csv')
let group_puzzle, colorScale, puzzler_names;

const app = d3.select('#app')
const plot_container = app.append('div').attr('class', 'plot-container')
const padding = 50
const width = (window.innerWidth-20*4)/2
const height =  width


driver_visualizePuzzles(data)

function driver_visualizePuzzles(data){
    data = data.map(d=>{
        let time_min =  parseInt(d.time.trim().split(':')[0])
        let time_sec = parseInt(d.time.trim().split(':')[1])
        let total_time = time_min + time_sec/60
        return {
            puzzle_name_id: d.puzzle_name.trim().replace(/\s+/g, '-'),
            puzzle_name: d.puzzle_name.trim(),
            puzzler_name: d.puzzler_name.trim(),
            attempt_num: parseInt(d.attempt_num.trim()),
            time: total_time,
            time_min: time_min,
            time_sec: time_sec,
    
        }
    })
    
    puzzler_names = Array.from(new Set(data.map(d=>d.puzzler_name)))
    colorScale = d3.scaleOrdinal().domain(puzzler_names).range(["#c2d968", "#aacdfe", "#ffcafa", "#ff4e20", "#3C40FE", "#3F8B4E"])
    group_puzzle = Object.fromEntries(d3.rollup(data, v=>v, d=>d.puzzle_name))

   
    for(const puzzleName of Object.keys(group_puzzle)){
        if(puzzleName != ""){
            layoutSinglePuzzle(puzzleName)
            layoutHighScores(puzzleName)
        }
        
    }
    layoutLegend()
    layoutHighScores("all")
    showFaces()
}





function layoutLegend(){
    const header = app.append('div').attr('class', 'header')
    header.append('div').attr('class', 'title').text('Puzzle Race')
    const legendSize = 20
    const legend = header.append('div').attr('class', 'legend-container')
    legend.selectAll('div')
        .data(puzzler_names)
        .enter().append('div')
        .attr('width', legendSize)
        .attr('height', legendSize)
        .attr('class', d=> 'face face-'+ d)
        .on('mouseover', (event, d)=> {
            d3.selectAll('.legend-container .face').style('background','none').style('border', 'none')
            d3.select('.legend-container .face-'+d).style('background',colorScale(d)).style('border', '1px solid #2225D8')
            for(const name of puzzler_names){
                d3.selectAll('.'+name).style('opacity',.2)
                d3.selectAll('circle.'+name).attr('stroke',"none")
            }
            d3.selectAll('.'+d).style('opacity',1)
            d3.selectAll('circle.'+d).attr('stroke',"#2225D8")
            d3.selectAll('.bar.'+d).attr('stroke',"#2225D8")
        })
        .on('mouseleave', (event, d)=> {
            for(const name of puzzler_names){
                d3.selectAll('.'+name).style('opacity',1)
                d3.selectAll('circle.'+name).attr('stroke',"none")
                d3.selectAll('.bar.'+d).attr('stroke',"none")
            }
        })
        .append('div')
            .text(d=>d)
            .attr('width', legendSize)
            .attr('class', d=>'legend-text')

    showFaces()
}

                    

function layoutSinglePuzzle(puzzleName){
    const puzzleData = Array.from(group_puzzle[puzzleName])
    const userPuzzleData = d3.rollup(group_puzzle[puzzleName],
         v=> v.map(entry=> {
            const best_time = d3.min(v, d => d.time);
            return {
                ...entry,
                best_time: best_time}
        }), 
         d=>d.puzzler_name)
                                
    const max_attempts = d3.max(puzzleData.map(d=> d.attempt_num))
    console.log('puzzleData', userPuzzleData)
    
    const svg = plot_container.append('svg')
                        .attr('width', width)
                        .attr("height", height)
                        .attr('viewBox', [0,0,width,height])
                        .style('border', '1px solid #2225D8')
       
    const timeScale = d3.scaleLinear().domain([5, 30]).range([height-padding, padding])    
    const attemptScale = d3.scaleLinear().domain([1,max_attempts]).range([padding, width-padding]) 
    // attempt # vs time
   
    const line = d3.line()
        .x((d) => attemptScale(d.attempt_num))
        .y((d) => timeScale(d.time));
    
    svg.selectAll('path')
        .data(userPuzzleData).enter()
        .append('path')
        .attr('class', d=>`${d[1][0].puzzle_name_id} ${d[0]} ${d[1][0].puzzle_name_id}-${d[0]}`)
        .attr("fill", "none")
        .attr("stroke", d=> colorScale(d[0]))
        .attr("stroke-width", 1.5)
        .attr("d", d=> {
            return line(d[1])
        })
        .on('mouseover', (event,d)=>{
            d3.selectAll('.face').style('background','none').style('border', 'none')
            d3.select('.face-'+d.puzzler_name).style('background',colorScale(d.puzzler_name)).style('border', '1px solid #2225D8')
            d3.selectAll(`.${d[1][0].puzzle_name_id}`).style('opacity', .3)
            d3.selectAll(`.${d[1][0].puzzle_name_id}-${d[0]}`).style('opacity', 1)
        })
        .on('mouseleave', (event,d)=>{
            d3.selectAll(`.${d[1][0].puzzle_name_id}`).style('opacity', 1)
        })
    svg.selectAll('circle')
        .data(puzzleData)
        .enter().append('circle')
        .attr('class', d=>`${d.puzzle_name_id} ${d.puzzler_name} ${d.puzzle_name_id}-${d.puzzler_name}`)
        .attr('r', 5)
        .attr('cx',d=> attemptScale(d.attempt_num))
        .attr('cy',d=> timeScale(d.time))
        .style('fill', d=>colorScale(d.puzzler_name))
        .on('mouseover', (event,d)=>{
            d3.selectAll('.face').style('background','none').style('border', 'none')
            d3.select('.face-'+d.puzzler_name).style('background',colorScale(d.puzzler_name)).style('border', '1px solid #2225D8')
            d3.selectAll(`.${d.puzzle_name_id}`).style('opacity', .3)
            d3.selectAll(`.${d.puzzle_name_id}-${d.puzzler_name}`).style('opacity', 1)
        })
        .on('mouseleave', (event,d)=>{
            d3.selectAll(`.${d.puzzle_name_id}`).style('opacity', 1)
        })


   const best_time_line = d3.line()
        .x((d) => attemptScale(d.attempt_num))
        .y((d) => {
         
            return timeScale(d.best_time)});
    const extendedUserPuzzleData = Array.from(userPuzzleData, ([puzzler_name, attempts]) => {      
        const extendedAttempts = Array.from({ length: max_attempts }, (_, i) => {
            return {
                attempt_num: i +1,
                best_time: attempts[i] ? attempts[i].best_time : attempts[0].best_time 
            };
        });
        return [puzzler_name, extendedAttempts];
    });
    svg.selectAll("path.best-time-line")
        .data(extendedUserPuzzleData).enter()
        .append('path')
        .attr('class', 'best-time-line')
        .attr("d", d=> {
            console.log("D",d)
            return best_time_line(d[1])})    
        .attr("stroke", d=>colorScale(d[0]))  
        .attr("stroke-width", .5)
        .attr("stroke-dasharray", "5,5");

    svg.append("g").attr('transform', `translate(${padding},0)`)
        .call(d3.axisLeft(timeScale).ticks(5))   
    svg.append("g").attr('transform', `translate(0,${ height-padding})`)
        .call(d3.axisBottom(attemptScale).ticks(max_attempts))   
    svg.append('text').text(puzzleName).attr('x', width/2 - 2*(puzzleName.length)).attr('y', 30).style('transform', `translate(-50% 0)`)

    

        
    

    
}

function layoutHighScores(puzzle_name) {
    let highScores = [];
    if (puzzle_name === "all") {
        highScores = Array.from(d3.rollup(data, v => d3.min(v, d => d.time), d => d.puzzler_name), ([puzzler_name, best_time]) => ({
            puzzler_name: puzzler_name,
            best_time: best_time
        }));
    } else {
        highScores = Array.from(
                d3.rollup( group_puzzle[puzzle_name],
            v => d3.min(v, d => d.time),
            d => d.puzzler_name), 
            ([puzzler_name, best_time]) => ({
                puzzler_name: puzzler_name,
                best_time: best_time
        }));
    }
    highScores.sort((a, b) => a.best_time - b.best_time);
    console.log("HIGHSCHORES", highScores)

    const svg_container = plot_container.append('div').attr('class', 'svg-container').style('height', height+'px').style("position", 'relative')
    const svg = svg_container.append('svg')
        .attr('width', width)
        .attr("height", height)
        .style('border', '1px solid #2225D8')

    const xScale = d3.scaleBand()
        .domain(highScores.map(d => d.puzzler_name))
        .range([padding, width - padding])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(highScores, d => d.best_time)])
        .nice()
        .range([height - padding, padding]);

    svg.selectAll('.bar')
        .data(highScores)
        .enter().append('rect')
        .attr('class', d=> 'bar' + ` ${d.puzzler_name}`)
        .attr('x', d => xScale(d.puzzler_name))
        .attr('y', d => yScale(d.best_time))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - padding - yScale(d.best_time))
        .attr('fill', d => colorScale(d.puzzler_name));

    svg_container.selectAll('div.face')
        .data(highScores)
        .enter().append('div')
        // .attr('class',d=> 'bar-face')
        .attr('class',d=> 'face face-' +d.puzzler_name)
        .style('position', 'absolute')
        .style('z-index', '0')
        .style('left', d => `${xScale(d.puzzler_name)}px`)
        .style('top', d => `${yScale(d.best_time) - xScale.bandwidth()/2}px`)
        .style('width', xScale.bandwidth() + "px")
        .style('height',xScale.bandwidth()+ "px")

    svg.append("g")
        .attr('transform', `translate(0, ${height - padding})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr('transform', `translate(${padding}, 0)`)
        .call(d3.axisLeft(yScale));



}
