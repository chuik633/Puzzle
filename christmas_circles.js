
function christmas_circles(data, container, plot_width, plot_height){//data has an average time thing
    const today = new Date();
    
    let today_date = today.getDate();
    const current_data = data.filter(d=>d.day <=today_date &&d['average_time'] != undefined )
    const padding = { left: 0, bottom: 0, top: 0, right: 0 };
    

    const plot_container = container.append('div').style('flex-shrink',0)
            .style('width', plot_width+"px").style('height', plot_height+"px").style('position', 'relative')
            // .style('border', '1px solid black')
    const tooltip = plot_container.append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('width', '95px')
            .style('z-index', 40)
            .style('background-color', 'black')
            .style('display', 'none')
            .style('color', 'white')
            .style('padding', '5px')
            .style('font-family', 'Courier New')
            .style('font-size', '9px')
    const allXValues =current_data.map(d => d.variance);
    const allYValues = current_data.map(d => d.average_time);
    

    const xScale = d3.scaleLinear()
        .domain([Math.min(...allXValues)-2, Math.max(...allXValues)+2])
        .range([padding.left, plot_width - padding.right]);


    const minY = Math.min(...allYValues)
    const maxY = Math.max(...allYValues)
    const yScale = d3.scaleLinear()
        .domain([minY-2, maxY+2])
        .range([plot_height - padding.bottom, padding.top]);



   const img_size = 50
    const nodes = current_data.map(d=>({
        ...d,
        size: img_size,
        x:Math.random() * (plot_width - img_size*2) + (img_size),
        y:Math.random() * (plot_height - img_size*4) + (img_size*4/2),
        targetx:xScale(d.variance),
        targety:yScale(d.average_time)
    }))



    const node = plot_container.selectAll('img')
        .data(nodes)
        .join(
            enter=>enter.append('img')
                        .style('position', 'absolute')
                        .style("left", d=>d.x+"px")
                        .style("top", d=>d.y+"px")
                        .style("width", d=>d.size+"px") 
                        .attr("src",d=> `./assets/puzzles/AdventCalendar3 ${d.day}.png`)
              
                        .on('mouseover', (event,d)=>{
                            tooltip
                            .style('display', 'flex')
                            .style('flex-direction', 'column')
                            .style("top", Math.max(d.y - 30, padding.top+30)+"px")
                            .style("left", Math.max(padding.left + 5,d.x-50)+"px")
                    
                            tooltip.append('p').text(`Day: ${d.day} `)
                            tooltip.append('p').text(`avg time: ${Math.round(d.average_time*100)/100} `)
                            tooltip.append('p').text(` std dev: ${Math.round(d.variance*100)/100} `)
                        })
                        .on('mouseleave', (event,d)=>{
                            tooltip
                            .style('display', 'none')
                            tooltip.selectAll("*").remove()
                            
                        })
                        
                        ,
            update => update.style("left", d=>d.x+"px")
                        .style("top", d=>d.y+"px"),
           exit => exit.remove()   
        )


    let sim = d3.forceSimulation(nodes)
        .force('collision', d3.forceCollide().radius(d => d.size)) 
        .force('x', d3.forceX(d => d.targetx).strength(0.1)) 
        .force('y', d3.forceY(d=>d.targety).strength(0.1))
        .on("tick", ticked);

    function ticked() {
        node
            .style('left', d => Math.max(d.size / 2, Math.min(plot_width - d.size, d.x)) + "px") 
            .style('top', d => Math.max(d.size / 2, Math.min(plot_height - d.size, d.y)) + "px");
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
    createCustomAxes(plot_container, plot_width, plot_height)
}

function createCustomAxes(container, plotWidth, plotHeight) {
    const svg = container.append("svg")
        .attr('z-index', 10)
        .attr("width", plotWidth)
        .attr("height", plotHeight);

    const centerX = plotWidth / 2;
    const centerY = plotHeight / 2;

    svg.append("line")
        .attr("x1", 10)
        .attr("y1", centerY)
        .attr("x2", plotWidth - 10)
        .attr("y2", centerY)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("polygon")
        .attr("points", "10," + (centerY - 5) + " 10," + (centerY + 5) + " 0," + centerY)
        .attr("fill", "black");

    svg.append("polygon")
        .attr("points", 
            (plotWidth - 10) + "," + (centerY - 5) + " " +
            (plotWidth - 10) + "," + (centerY + 5) + " " +
            (plotWidth) + "," + centerY)
        .attr("fill", "black");

    svg.append("text")
        .attr("x", 15)
        .attr("y", centerY - 10)
        .attr("text-anchor", "start")
        .attr("font-family", "Courier New")
        .attr("font-size", 10)
        .text("Low Variance");

    svg.append("text")
        .attr("x", plotWidth - 15)
        .attr("y", centerY - 10)
        .attr("text-anchor", "end")
        .attr("font-family", "Courier new")
        .attr("font-size", 10)
        .text("High Variance");
    svg.append("line")
        .attr("x1", centerX)
        .attr("y1", 10)
        .attr("x2", centerX)
        .attr("y2", plotHeight - 10)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("polygon")
        .attr("points", 
            (centerX - 5) + ",10 " +
            (centerX + 5) + ",10 " +
            centerX + ",0")
        .attr("fill", "black");

    svg.append("polygon")
        .attr("points", 
            (centerX - 5) + "," + (plotHeight - 10) + " " +
            (centerX + 5) + "," + (plotHeight - 10) + " " +
            centerX + "," + plotHeight)
        .attr("fill", "black");

    // Y-Axis Labels
    svg.append("text")
        .attr("x", centerX + 10)
        .attr("y", 20)
        .attr("text-anchor", "start")
        .attr("font-family", "Courier New")
        .attr("font-size", 10)
        .text("Slowest Times");

    svg.append("text")
        .attr("x", centerX + 10)
        .attr("y", plotHeight - 15)
        .attr("text-anchor", "start")
        .attr("font-family", "Courier New")
        .attr("font-size", 10)
        .text("Fastest Times");
}



function christmas_circles_faces(flattened_data, container, plot_width, plot_height, colorScale){//data has an average time thing
    const today = new Date();
    let today_date = today.getDate();
    let current_data = flattened_data.filter(d=>d.day <=today_date)
    plot_height = Math.min(plot_height, window.innerHeight*2/3)
    //aggregate the data
    let person_time_data=d3.rollup(current_data,
        v=>{
            const person_times = Array.from(v).map(d=>d.time).filter(time => !isNaN(time))
            const average_time = d3.mean(person_times)
            
            return {
                person_times:person_times,
                average_time: average_time,
                variance: Math.sqrt(d3.mean(person_times.map(d => Math.pow(d - average_time, 2))))
            }
        },
        g=>g.name
    )
   
    person_time_data = Array.from(person_time_data).map(entry=> {return {...entry[1], name:entry[0]}})
    const person_names = person_time_data.map(d=>d.name)
    console.log("DATA", person_time_data)
    const padding = { left: 0, bottom: 0, top: 0, right: 0 };
    

    const plot_container = container.append('div').style('flex-shrink',0)
            .style('width', plot_width+"px").style('height', plot_height+"px").style('position', 'relative')
            // .style('border', '1px solid black')
    const tooltip = plot_container.append('div')
            .style('position', 'absolute')
            .style('width', '95px')
            .style('z-index', 40)
            .style('background-color', 'black')
            .style('display', 'none')
            .style('color', 'white')
            .style('padding', '5px')
            .style('font-family', 'Courier New')
            .style('font-size', '9px')

    const allXValues =person_time_data.map(d => d.variance);
    const allYValues = person_time_data.map(d => d.average_time);


    const xScale = d3.scaleLinear()
        .domain([Math.min(...allXValues)-2, Math.max(...allXValues)+2])
        .range([padding.left, plot_width - padding.right]);


    const minY = Math.min(...allYValues)
    const maxY = Math.max(...allYValues)
    const yScale = d3.scaleLinear()
        .domain([minY-2, maxY+2])
        .range([plot_height - padding.bottom, padding.top]);



   const img_size = 50
    const nodes = person_time_data.map(d=>({
        ...d,
        size: img_size,
        x:Math.random() * (plot_width - img_size*2) + (img_size),
        y:Math.random() * (plot_height - img_size*4) + (img_size*4/2),
        targetx:xScale(d.variance),
        targety:yScale(d.average_time)
    }))

    const node = plot_container.selectAll('div.face')
        .data(nodes)
        .join(
            enter=>enter.append('div')
                        .attr('class',d=>'face face-'+d.name)
                        .style('position', 'absolute')
                        .style("left", d=>d.x+"px")
                        .style("top", d=>d.y+"px")
                        .style("width", d=>d.size+"px") 
                        .style("height", d=>d.size+"px") 
                        .style('background-color', d=> colorScale(d.name))
                        .style('border', d=> ".8px solid black")
                        .style('border-radius', '50%')

                        // .call(d3.drag()  
                        //     .on('drag', dragMove)
                        //     .on('end', dragEnd)
                        // )
                        .on('mouseover', (event,d)=>{
                            tooltip
                            .style('display', 'flex')
                            .style("top", Math.max(d.y - 30, padding.top+30)+"px")
                            .style("left", Math.max(padding.left + 5,d.x-50)+"px")
                            .text(`
                                avg time: ${Math.round(d.average_time*100)/100}
                                std dev: ${Math.round(d.variance*100)/100}
                                

                            `)
                        })
                        .on('mouseleave', (event,d)=>{
                            tooltip
                            .style('display', 'none')
                            
                        })
                        
                        ,
            update => update.style("left", d=>d.x+"px")
                        .style("top", d=>d.y+"px"),
           exit => exit.remove()   
        )


    let sim = d3.forceSimulation(nodes)
        .force('collision', d3.forceCollide().radius(d => d.size)) 
        .force('x', d3.forceX(d => d.targetx).strength(0.1)) 
        .force('y', d3.forceY(d=>d.targety).strength(0.1))
        .on("tick", ticked);

    function ticked() {
        node
            .style('left', d => Math.max(d.size / 2, Math.min(plot_width - d.size, d.x)) + "px") 
            .style('top', d => Math.max(d.size / 2, Math.min(plot_height - d.size, d.y)) + "px");
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
    createCustomAxes(plot_container, plot_width, plot_height)
    showFaces(person_names)
}