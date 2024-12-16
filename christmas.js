
let days = d3.range(1,26);
const calWidth = Math.min(window.innerWidth -20,600)
const today = new Date();
let today_date = today.getDate();
let viewMode;
let flattened_day_data=[]
let day_data=[]
let advent_puzzler_names;
let highlight_container;



function driver_christmasPuzzles(data){
    app.attr('class', 'advent')
    flattened_day_data=[]
    
    day_data = data.map(d=>{
        let day_entry =  {
            day: parseInt(d.Day),
            all_times:[],
            fastest:{name:"",time:Infinity }
        }
        for(const [name, time] of Object.entries(d)){
            if(name != "Day"){
                try{
                    const [min, sec] = time.split(":");
                    let parsedTime = parseInt(min)+ parseInt(sec)/60
                    parsedTime= Math.round(parsedTime * 100) / 100;
                    day_entry[name] = parsedTime
                    if(parsedTime == NaN){
                        continue;
                    }
                    day_entry.all_times.push(parsedTime)
                    flattened_day_data.push(
                        {
                            day:parseInt(d.Day),
                            name:name,
                            time:parsedTime

                        }
                    )
                    
                    if(parsedTime < day_entry["fastest"]["time"]){
                        day_entry["fastest"]["time"]=parsedTime
                        day_entry["fastest"]["name"]=name
                    }
                }catch (e){
                    console.log("err", e)
                    continue
                }
            }
            
        }
        day_entry['average_time'] = d3.mean((day_entry.all_times).filter(d=>d!=undefined))
        return day_entry
        
    })
   
    console.log(day_data)
    advent_puzzler_names = Array.from(Object.keys(data[0]).slice(1,))
    layout_header()
    layout_legend()
    
    layout_puzzle_difficulty(day_data)

    // let apuzzler_data = {}

    

    personColorScale = d3.scaleOrdinal().domain(advent_puzzler_names).range(["#c2d968", "#aacdfe", "#ffcafa", "#ff4e20", "#3C40FE", "#3F8B4E"])
    // const advent_puzzler_names = data[0].slice(1,data[0].length)
    // console.log('puzzler names', advent_puzzler_names)
    // for(const name of advent_puzzler_names){

    // }


}

function set_view_mode(selectedMode){
    if(selectedMode == viewMode){
        return
    }
    plot_container.selectAll("*").remove()
    if(selectedMode == "difficulty"){
        layout_puzzle_difficulty(day_data)
    }else{
        layout_puzzle_leaderboard(day_data)
        showFaces(advent_puzzler_names)
    }

}

function layout_header(){
    const header_container = app.append('div').attr('class', 'advent-header')
    const small_info = header_container.append('div').attr('class', 'header-small-font')
    small_info.append('h5').text("December 2024")
    small_info.append('h3').text("THE")
    small_info.append('h5').text("Price: $idk")
    header_container.append('h1').text("Advent Puzzle")
    header_container.append('h4').text("NYT PUZZLE COMPANY")

    const viewOptions = ['difficulty', 'leaderboard']
    const radioParams = header_container.append('form').attr('id', 'view-options')

    for (const viewOption of viewOptions) {
        const option = radioParams.append('label').attr('class', 'radio-custom');
        const optionInput = option.append('input')
            .attr('type', 'radio')
            .attr('name', 'view-option')
            .attr('value', viewOption);
    
        if (viewOption === viewOptions[0]) {
            optionInput.attr('checked', true);
        }
    
        optionInput.on('change', function () {
            const selected_option = d3.select(this).property('value');
            set_view_mode(selected_option);
        });

        option.append('span').attr('class', 'radio-button');
        option.append('div').attr('class', 'radio-value').text(viewOption);
    }

    

}

function layout_legend(){
    const popup_container = app.append('div').attr('class', "popup-container").style('display', 'none')
    const legendSize = 20
    const legend = app.append('div').attr('class', 'legend-container')
    if(window.innerWidth > 800){
        legend.attr('class', 'legend-container side')

    }
    legend.selectAll('div')
        .data(advent_puzzler_names)
        .enter().append('div')
        .style('width', legendSize + 'px')
        .style('height', legendSize + 'px')
        .attr('class', d=> 'face face-'+ d)
        .on('mouseover', (event, d)=> {
            d3.selectAll('.legend-container .face').style('background','none').style('border', 'none')
            d3.select('.legend-container .face-'+d).style('background',personColorScale(d)).style('border', '1px solid black')
            for(const name of advent_puzzler_names){
                d3.selectAll('.'+name).style('opacity',.2)

            }
            d3.selectAll('.'+d).style('opacity',1)
            d3.selectAll('circle.'+d).attr('stroke-width',2)
            d3.selectAll('.bar.'+d).attr('stroke-width',2)
        })
        .on('mouseleave', (event, d)=> {
            for(const name of advent_puzzler_names){
                d3.selectAll('.'+name).style('opacity',1)
                d3.selectAll('.bar.'+d).attr('stroke-width',.8)
            }
        })
        .on('click', (event,d)=>{
            popup_container.style('display', 'flex')
            personStats(popup_container, flattened_day_data, d)
        })
        .append('div')
            .text(d=>d)
            .style('width', legendSize + 'px')
            .style('font-size', 8 + 'px')
            .attr('class', d=>'legend-text')

    showFaces(advent_puzzler_names)
}


function layout_puzzle_difficulty(data){
    const allTimesEver = data.map(d=> Math.max(...d.all_times.filter(time => Number.isFinite(time))))
    const fastest_time = Math.min(...data.map(d=> d.fastest.time))
    const slowest_time = Math.max(...allTimesEver)
    const opacityScale = d3.scaleLinear().domain([fastest_time, slowest_time-2]).range([0,1])
    function colorScale(avg_time){
        function hexToRgbA(hex, opacity) {
            hex = hex.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
        
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        const opacity = opacityScale(avg_time)
        return hexToRgbA("#FF4E20", opacity)
    }

    const line_charg_height = 50
    console.log(slowest_time, fastest_time)
    const yScale = d3.scaleLinear().domain([slowest_time,fastest_time]).range([0, line_charg_height])
    const xScale = d3.scaleLinear().domain([0,24]).range([0,calWidth])
    const line_svg = plot_container.append('svg')
        .attr('width', calWidth)
        .attr("height", line_charg_height)
        .attr('viewBox', [0,0,calWidth,line_charg_height])
    const line = d3.line()
        .x((d) => xScale(d.day))
        .y((d) => yScale(d.average_time));


    const today_data = data.filter(d => d.day <= today_date && d.average_time!=undefined)
    console.log(today_data.map(d=>yScale(d.average_time)))
    line_svg.append('path')
        .datum(data.filter(d => d.day <= today_date && d.average_time!=undefined))  // Pass the entire dataset here
        .attr('stroke', '#FF4E20')
        .attr('stroke', 'black')
        .attr('fill', 'none')  
        .attr("d", line);
    line_svg.selectAll('circle')
        .data(data.filter(d=>d.day<=today_date && d.average_time!=undefined))
        .enter().append('circle')
        .attr('class', d=>'day-'+d.day)
        .attr('cx', (d) => xScale(d.day))
        .attr('cy', (d) => yScale(d.average_time))
        .attr('r', 2)
        .attr('stroke', 'black')
        .attr('fill', d=> colorScale(d.average_time))
        .on('mouseover', (event,d)=>{
            d3.selectAll('.day-'+d.day).attr('stroke-width', 2)
            d3.select('.cal-num-label.day-'+d.day).style('font-weight', 'bold')
        })
        .on('mouseleave', (event,d)=>{
            d3.selectAll('.day-'+d.day).attr('stroke-width', 1)
            d3.select('.cal-num-label.day-'+d.day).style('font-weight', 100)
        })
        
        
    const calSize = calWidth/7
    function dayScale(day){
        const col_num = Math.floor((day-1)/7)
        const row_num = (day-1)%7 
        return [row_num*calSize, col_num*calSize]
    }
    
    const svg = plot_container.append('svg')
        .attr('width', calWidth)
        .attr("height", calSize*4 + 20)
        .attr('viewBox', [0,0,calWidth,calSize*4 + 20])
    
    const dayText = ['sun', "mon", 'tue', "wed", "th", "fri", "sa"]
    svg.selectAll('text.day-label')  
        .data(d3.range(1,8))  
        .enter().append('text').attr('class', 'day-label')
        .style('width', calSize + "px")
        .attr('height', 10)
        .text(d=> dayText[d-1])
        .attr('x', d=> dayScale(d)[0]+ calSize / 2)
        .attr('y', d=> dayScale(d)[1]+ 10)
        .attr('stroke', 'none')
        .attr('stroke-width', .8)
        .style('text-anchor', 'middle') 
        .style('pointer-events', 'none') 
        .attr('rx',5)
        .attr('ry', 5)
        .attr('fill', "#F7F7F0")

    const dayblock = svg.selectAll('g.day-block-difficulty')
        .data(data)
        .enter()
        .append('g')
        .attr('class', d=>'day-block-difficulty day-'+d.day)
        .style('opacity', d=>{
            if(d.day>today_date){
                return .1
            }
            return  1
           
        })
    

    dayblock.append('rect').attr('width', calSize)
        .attr('height', calSize)
        .attr('x', d=> dayScale(d.day)[0])
        .attr('y', d=> dayScale(d.day)[1] + 15)
        .attr('fill', d=>{
            if(d.average_time==undefined){
                return "#F7F7F0"
            }
            return colorScale(d.average_time)
           })
        .attr('stroke', 'black')
        .attr('stroke-width', .8)
        .attr('rx',5)
        .attr('ry', 5)
        .on('mouseover',function (event,d){
            d3.select(this).attr('stroke-width', 2)
        })
        .on('mouseleave',function (event,d){
            d3.select(this).attr('stroke-width', .8)
        })
        .on('click', (event,d)=>{

            plot_container.selectAll("div.highlight-container").remove()
            const highlight_container = plot_container.append('div').attr('class', 'highlight-container')
            const puzzleData = flattened_day_data.filter(d2=>d2.day == d.day)
            layoutPuzzleDayInfo(highlight_container,puzzleData, width, height, personColorScale)

         

        
        })
       
    dayblock.append('text')
        .attr('class', d=>'cal-num-label day-'+d.day)
        .attr('x',d=> dayScale(d.day)[0]+calSize / 2) 
        .attr('y', d=> dayScale(d.day)[1]+15 + calSize / 2)  
        .style('text-anchor', 'middle')  
        .attr('stroke','none')
        .style('dominant-baseline', 'middle') 
        .style('pointer-events', 'none') 
        .text(d => d.day);
}

function layout_puzzle_leaderboard(data){  
    const calSize = calWidth/7
    function dayScale(day){
        const col_num = Math.floor((day-1)/7)
        const row_num = (day-1)%7 
        return [row_num*calSize, col_num*calSize]
    }
    
    const svg_div = plot_container.append('div')
        .attr('class', 'svg-div')
        .style('width', calWidth + 'px')
        .style("height", calWidth+ 'px')
        .style('position', 'relative')
    
    const dayText = ['sun', "mon", 'tue', "wed", "th", "fri", "sa"]
    svg_div.selectAll('div.day-label')  
        .data(d3.range(1, 8))  
        .enter().append('div')
        .attr('class', 'day-label')
        .style('position', 'absolute')
        .style('width', calSize + 'px')
        .style('height', calSize + 'px')
        .style('color', 'black')
        .attr('stroke','none')
        .style('text-anchor', 'middle')
        .text(d => dayText[d - 1])
        .style('left', d => `${dayScale(d)[0]}px`) 
        .style('top', d => `${dayScale(d)[1] + 10}px`); 

  

    const faceblocks = svg_div.selectAll('div.face')
        .data(data)
        .enter()
        .append('div')
        .attr('class', d => {
            if (d.average_time == undefined) {
                return;
            }
            else{
                return 'face face-' + d.fastest.name}})
        .style('width', calSize + 'px')
        .style('height', calSize + 'px')
        .style('position', 'absolute')
        .style('left', d => dayScale(d.day)[0] + 'px')
        .style('top', d => dayScale(d.day)[1] + 25 + 'px')
        .style('background-color', d => {
            if (d.average_time == undefined) {
                return "#F7F7F0";
            }
            return personColorScale(d.fastest.name);
        })
        .style("border", ".5px solid black")
        .style('border-radius', '5px')

        
}