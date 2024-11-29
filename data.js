
let data = await d3.csv('/data/data.csv')
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
const puzzler_names = Array.from(new Set(data.map(d=>d.puzzler_name)))
const colorScale = d3.scaleOrdinal().domain(puzzler_names).range(["#c2d968", "#aacdfe", "#ffcafa", "#ff4e20", "#3C40FE", "#3F8B4E"])
const group_puzzle = Object.fromEntries(d3.rollup(data, v=>v, d=>d.puzzle_name))

const app = d3.select('#app')
const plot_container = app.append('div').attr('class', 'plot-container')


const padding = 50
const width = (window.innerWidth-20*4)/2
const height =  width


for(const puzzleName of Object.keys(group_puzzle)){
    if(puzzleName != ""){
        layoutSinglePuzzle(puzzleName)
    }
    
}
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
        d3.selectAll('.face').style('background','none').style('border', 'none')
        d3.select('.face-'+d).style('background',colorScale(d)).style('border', '1px solid #2225D8')
        for(const name of puzzler_names){
            d3.selectAll('.'+name).attr('opacity',.3)
            d3.selectAll('circle.'+name).attr('stroke',"none")
        }
        d3.selectAll('.'+d).attr('opacity',1)
        d3.selectAll('circle.'+d).attr('stroke',"#2225D8")
    })
    .on('mouseleave', (event, d)=> {
        for(const name of puzzler_names){
            d3.selectAll('.'+name).attr('opacity',1)
            d3.selectAll('circle.'+name).attr('stroke',"none")
        }
    })
    .append('div')
        .text(d=>d)
        .attr('width', legendSize)
        .attr('class', d=>'legend-text')

showFaces()
 

                                


function layoutSinglePuzzle(puzzleName){
    const puzzleData = Array.from(group_puzzle[puzzleName])
    const userPuzzleData = d3.rollup(group_puzzle[puzzleName], v=> v, d=>d.puzzler_name)
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

    svg.append("g").attr('transform', `translate(${padding},0)`)
        .call(d3.axisLeft(timeScale).ticks(5))   
    svg.append("g").attr('transform', `translate(0,${ height-padding})`)
        .call(d3.axisBottom(attemptScale).ticks(max_attempts))   
    svg.append('text').text(puzzleName).attr('x', width/2 - 2*(puzzleName.length)).attr('y', 30).style('transform', `translate(-50% 0)`)

    

        
    

    
}