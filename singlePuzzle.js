function layoutHighScoreBarChart(plot_container, barChartData, xCategory, yCategory, width, height) {
    const padding = 10
    const svg_container = plot_container.append('div').attr('class', 'svg-container').style('height', height+'px').style("position", 'relative')
    const svg = svg_container.append('svg')
        .attr('width', width)
        .attr("height", height)

    svg.append('text').text('First Attempt Leaderboard').attr('class', 'plot-title').attr('stroke', 'none').attr('y', 15)

    const xScale = d3.scaleBand()
        .domain(barChartData.map(d => d[xCategory]))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(barChartData, d => d[yCategory])])
        .nice()
        .range([height - padding, padding]);

    svg.selectAll('.bar')
        .data(barChartData)
        .enter().append('rect')
        .attr('class', d=> 'bar' + ` ${d[xCategory]}`)
        .attr('x', d => xScale(d[xCategory]))
        .attr('y', d => yScale(d[yCategory]))
        .attr('width', xScale.bandwidth())
        .attr('stroke', 'black')
        .attr('stroke-width', .8)
        .attr('rx',5)
        .attr('ry', 5)
        .attr('height', d => height - padding - yScale(d[yCategory]))
        .attr('fill', d => personColorScale(d[xCategory]));

    svg_container.selectAll('div.face')
        .data(barChartData)
        .enter().append('div')
        .attr('class',d=> 'face face-' +d[xCategory])
        .style('position', 'absolute')
        .style('z-index', '0')
        .style('left', d => `${xScale(d[xCategory])}px`)
        .style('top', d => `${yScale(d[yCategory]) - xScale.bandwidth()/2}px`)
        .style('width', xScale.bandwidth() + "px")
        .style('height',xScale.bandwidth()+ "px")

    svg.append("g")
        .attr('transform', `translate(0, ${height - padding})`)
        .call(d3.axisBottom(xScale) .tickSize(0) ).select("path")
        .remove()

    // svg.append("g")
    //     .attr('transform', `translate(${padding}, 0)`)
    //     .call(d3.axisLeft(yScale));



}


function layoutCircleData(plot_container,  puzzleData, width, height, colorScale) {
    const faces_container = plot_container.append('div').attr('class', 'single-puzzle-stats-container')
        .style('width', width + 'px')
        .style("height", height + 'px')

    const puzzler_names = puzzleData.map(d=>d.name)

    const times_list = puzzleData.map(d => d.time);
    const min_time = Math.min(...times_list);
    const max_time = Math.max(...times_list);

    // const rScale = d3.scaleSqrt().domain([min_time, max_time]).range([100, 30]);
   
    const areaAvailable = (width * height) / puzzleData.length;
    const min_radius = 10
    const max_radius = width/puzzleData.length
    const rScale = d3.scaleSqrt()
        .domain([max_time, min_time])
        .range([min_radius, max_radius]);

    const nodes = puzzleData.map(d => {
        return {
            ...d,
            color: colorScale(d.name),
            size: rScale(d.time),
            x: width / 2 ,
            y: height / 2
        };
    });
    
    
    const node = faces_container.selectAll('div.round')
        .data(nodes)
        .join(
            enter => enter.append('div')
                .attr('class', d => `round face face-${d.name}`)
                .style('position', 'absolute')
                .style('background-color', d => d.color)
                .style('border', '.5px solid black')
                .style('width', d => `${d.size}px`)
                .style('height', d => `${d.size}px`)
                .style('left', d => `${d.x - d.size/ 2}px`)
                .style('top', d => `${d.y - d.size/ 2}px`)
                .call(d3.drag()  
                    .on('drag', dragMove)
                    .on('end', dragEnd)
                ),
            update => update
                .style('left', d => `${d.x - d.size / 2}px`)
                .style('top', d => `${d.y - d.size / 2}px`),
            exit => exit.remove()
        );
    
    let sim;
    sim = d3.forceSimulation(nodes)  
    .force('charge', d3.forceManyBody().strength(-30))
    .force('collision', d3.forceCollide().radius(d => d.size+ 10)) 
    .force('x', d3.forceX(d=> width / 2 - d.size/2).strength(0.2)) 
    .force('y', d3.forceY(d=>height / 2 - d.size/2).strength(0.2)) 
    .on("tick", ticked);

    
    function ticked() {
        node
            .style('left', d => Math.max(d.size / 2, Math.min(width - d.size , d.x)) + "px")
            .style('top', d => Math.max(d.size / 2, Math.min(height - d.size, d.y)) + "px");
    }

    function dragMove(event, d) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this)
            .style('left', `${d.x - d.size / 2}px`)
            .style('top', `${d.y - d.size / 2}px`);

        sim.alpha(1).restart();
    }

    function dragEnd(event, d) {
        d.x = event.x;
        d.y = event.y;
        sim.alpha(1).restart(); 
    }
    
    faces_container.on('click', function () {
        nodes.forEach(d => {
            d.x = Math.random() * (width - d.size) + (d.size / 2);
            d.y =  Math.random() * (height - d.size) + (d.size / 2);
        });

        if(sim){
            sim.stop();  

        }
        sim = d3.forceSimulation(nodes)  
            .force('charge', d3.forceManyBody().strength(-30))
            .force('collision', d3.forceCollide().radius(d => d.size+ 10)) 
            .force('x', d3.forceX(d=> width / 2 - d.size/2).strength(0.2)) 
            .force('y', d3.forceY(d=>height / 2 - d.size/2).strength(0.2)) 
            .on("tick", ticked);

        sim.restart();  
    });
    showFaces(puzzler_names)
}


function getPuzzleSummary(puzzleData) {
    const sortedData = puzzleData.sort((a, b) => b.time - a.time).reverse();
    const sortedDataBest = puzzleData.sort((a, b) => b.best_time - a.best_time).reverse();
   

    let summary_text = `On the ${sortedData[0].day}th day of Christmas, ${sortedData[0].name} 
        had the fastest first attempt time of ${sortedData[0].time} minutes. 
        `
    if(sortedData[0].name==sortedDataBest[0].name){
        summary_text+=  `They were so good that they also had the fastest overall time of ${sortedDataBest[0].best_time} min`
    }else{
        summary_text+=  `However, ${sortedDataBest[0].name} holds the title for their fastest time of ${sortedDataBest[0].best_time} min after ${sortedDataBest[0].all_attempt_times.length} attempts.`
    }
   
    if(sortedData.length>1){
        const difference = sortedData[1].time-sortedData[0].time
        let closeness_word = ''
        if(difference < 1){
            closeness_word = 'close behind'
        }else if(difference>3){
            closeness_word=  'far behind'
        }else{
            closeness_word= Math.round(difference*60) + ' seconds behind'
        }
        summary_text+=` ${sortedData[1].name} was ${closeness_word} with the second fastest time of ${sortedData[1].time} minutes.`

    }
    return summary_text
}


function layoutPuzzleDayInfo(popup_container, puzzleData,flattened_day_data, width, height, colorScale){
    
    width = Math.min((window.innerWidth -15), 600)
    const plot_container = popup_container.append('div').attr('class', "card")
    popup_container.on('click', ()=>{
        popup_container.selectAll("*").remove()
        popup_container.style('display', 'none')
    })

    const day = puzzleData[0].day
    plot_container.style('border-top', '.5px solid black')
    const top_row = plot_container.append('div').attr('class','flex-row').style('width', "100%")
    top_row.append('img').attr('src',`./assets/puzzles/AdventCalendar3 ${day}.png`) .style('height', height/4+'px').style('border', '.5px solid black')
    const textContainer = top_row.append('div').attr('class', 'text-container').style('width', width/2+'px')
    textContainer.append('h2').text(`December ${day}th`).attr('class', 'barchart-title');
    textContainer.append('p').text(getPuzzleSummary(puzzleData))

   
    layoutHighScoreBarChart(plot_container, puzzleData, 'name','time', width-50, Math.min(height, width/2))
    // layoutHighScoreBarChart(plot_container, flattened_day_data, 'name','best_time', width-50, Math.min(height, width/2))
    layoutCircleData(plot_container,  puzzleData,  width-50,  Math.min(height, width/2), colorScale)



    layoutSinglePuzzleAttempts(day, flattened_day_data, plot_container, width-50, Math.min(height, width/2),colorScale)

}

function layoutSinglePuzzleAttempts(day, flattened_day_data,plot_container, width, height, personColorScale){
    const container = plot_container.append('div').attr('class', 'svg-container')
    const groupped_data = d3.rollup(flattened_day_data.filter(d=>d.time!=undefined && !isNaN(d.time)), v=>v, d=>d.day)
    const puzzleData = Array.from(groupped_data.get(day))
    const padding = 20
    const transformedDataset = puzzleData.flatMap(d =>
        d.all_attempt_times.map((time, index) => ({
            name:d.name,
            day:d.day,
          time: time, 
          attempt_num: index + 1, 
        }))
      );
    const userPuzzleData = d3.rollup(transformedDataset,
        v=>v,
        d=>d.name
    )
      
   
    const svg = container.append('svg')
        .attr('width', width)
        .attr("height", height)
        .attr('viewBox', [0,0,width,height])

    svg.append('text').text("All Attempts").attr('class', 'plot-title').attr('y', 20).attr('x', width/2).attr('text-anchor', 'middle')
    const max_attempts = d3.max(puzzleData.map(d=> d.all_attempt_times.length))
    const max_time = d3.max(transformedDataset.map(d => d.time));
    const timeScale = d3.scaleLinear().domain([5, max_time]).range([height-padding, padding])    
    const attemptScale = d3.scaleLinear().domain([1,max_attempts]).range([20, width-10]) 

    const line = d3.line()
        .x((d) => attemptScale(d.attempt_num))
        .y((d) => timeScale(d.time));

    svg.selectAll('path')
        .data(userPuzzleData).enter()
        .append('path')
        .attr('class', d=>`${d[1][0].puzzle_name_id} ${d[0]} ${d[1][0].puzzle_name_id}-${d[0]}`)
        .attr("fill", "none")
        .attr("stroke", d=> personColorScale(d[0]))
        .attr("stroke-width", 1.5)
        .attr("d", d=> {
            console.log(d)
            return line(d[1])
        })
        .on('mouseover', (event,d)=>{
            d3.selectAll('.face').style('background','none').style('border', 'none')
            d3.select('.face-'+d.puzzler_name).style('background',personColorScale(d.puzzler_name)).style('border', '1px solid #2225D8')
            d3.selectAll(`.${d[1][0].puzzle_name_id}`).style('opacity', .3)
            d3.selectAll(`.${d[1][0].puzzle_name_id}-${d[0]}`).style('opacity', 1)
        })
        .on('mouseleave', (event,d)=>{
            d3.selectAll(`.${d[1][0].puzzle_name_id}`).style('opacity', 1)
        })
    svg.selectAll('circle')
        .data(transformedDataset).enter()
        .append('circle')
        .attr('class', d=>`${d.puzzle_name_id} ${d.puzzler_name} ${d.puzzle_name_id}-${d.puzzler_name}`)
        .attr("fill", d=> personColorScale(d.name))
        .attr("cx", d=> attemptScale(d.attempt_num))
        .attr("cy", d=> timeScale(d.time))
        .attr('r', 2)
        .on('mouseover', (event,d)=>{
            d3.selectAll('.face').style('background','none').style('border', 'none')
            d3.select('.face-'+d.puzzler_name).style('background',personColorScale(d.puzzler_name)).style('border', '1px solid #2225D8')
            d3.selectAll(`.${d.puzzle_name_id}`).style('opacity', .3)
            d3.selectAll(`.${d.puzzle_name_id}-${d.puzzler_name}`).style('opacity', 1)
        })
        .on('mouseleave', (event,d)=>{
            d3.selectAll(`.${d.puzzle_name_id}`).style('opacity', 1)
        })
        svg.append("g").attr('transform', `translate(${20},0)`)
        .call(d3.axisLeft(timeScale).ticks(5))   
        svg.append("g").attr('transform', `translate(0,${ height-padding})`)
            .call(d3.axisBottom(attemptScale).ticks(max_attempts))   
       

}



