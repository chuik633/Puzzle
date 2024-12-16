function layoutHighScoreBarChart(plot_container, barChartData, xCategory, yCategory, width, height) {
    const padding = 10
    const svg_container = plot_container.append('div').attr('class', 'svg-container').style('height', height+'px').style("position", 'relative')
    const svg = svg_container.append('svg')
        .attr('width', width)
        .attr("height", height)

    // svg.append('text').text(title).attr('class', 'barchart-title').attr('stroke', 'none').attr('y', 15)

    const xScale = d3.scaleBand()
        .domain(barChartData.map(d => d[xCategory]))
        .range([padding, width - padding])
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
    const min_radius = Math.sqrt(areaAvailable / Math.PI)/2
    const max_radius = width/2;
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
  

    let summary_text = `On Day ${sortedData[0].day}, ${sortedData[0].name} 
        was the fastest with time of ${sortedData[0].time} minutes.
        `
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


function layoutPuzzleDayInfo(plot_container, puzzleData, width, height, colorScale){
    width =Math.min((window.innerWidth -20), 600)
    const day = puzzleData[0].day
    plot_container.style('border-top', '.5px solid black')
    const top_row = plot_container.append('div').attr('class','flex-row').style('width', "100%")
    top_row.append('img').attr('src',`./assets/puzzles/AdventCalendar3 ${day}.png`) .style('height', height/4+'px').style('border', '.5px solid black')
    const textContainer = top_row.append('div').attr('class', 'text-container').style('width', width/2+'px')
    textContainer.append('h2').text(`December ${day}th`).attr('class', 'barchart-title');
    textContainer.append('p').text(getPuzzleSummary(puzzleData))

    const second_row = plot_container.append('div').attr('class','flex-row').style('width', "100%")
    layoutHighScoreBarChart(second_row, puzzleData, 'name', 'time', width/2-10, Math.min(height, width/2))
    layoutCircleData(second_row,  puzzleData, width/2,  Math.min(height, width/2), colorScale)
    

}