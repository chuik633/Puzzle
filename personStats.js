function personStats(popup_container, flattened_data, name,personColorScale){

    popup_container.on('click', ()=>{
        popup_container.selectAll("*").remove()
        popup_container.style('display', 'none')
    })
    const person_data = flattened_data.filter(d=>d.name == name)
    const sorted_data = person_data.sort((a, b) => b.time - a.time).reverse();
    const fastest_entry = sorted_data[0]
    const slowest_entry = sorted_data[sorted_data.length-1]
    //card info
    popup_container.selectAll('*').remove()
    const card = popup_container.append('div').attr('class', "card")

    //text row 1
    const row1 = card.append('div').attr('class', 'flex-row')
    row1.append('div').attr('class', 'border face face-'+name).style('width', `${100}px`).style('height', `${100}px`).style('flex-shrink', 0)
    showFaces([name])
   
    const text_col = row1.append('div').attr('class', 'flex-col')
    text_col.append('h2').text(name)
    text_col.append('p').text(`${name} has completed ${person_data.length}/24 puzzles! Check out their stats below :P`)


    //plot of their data across the days for difficutly
    const row2 = card.append('div').attr('class', 'flex-row')
    row2.append('img')
        .attr('src',`./assets/puzzles/AdventCalendar3 ${fastest_entry.day}.png`)
        .style('height', 100+'px').style('border', '.5px solid black')
      
    const text_col2 = row2.append('div').attr('class', 'flex-col')
    text_col2.append('h3').text('BEST PUZZLE')
    text_col2.append('p').text(`${name}'s best puzzle is December ${fastest_entry.day} which they completed in ${Math.floor(fastest_entry.time)} min 
            and ${Math.floor(60*(fastest_entry.time-Math.floor(fastest_entry.time)))} seconds!`)


    
    row2.append('img')
        .attr('src',`./assets/puzzles/AdventCalendar3 ${slowest_entry.day}.png`)
        .style('height', 100+'px').style('border', '.5px solid black')

    const difference = Math.round((slowest_entry.time - fastest_entry.time)*10)/10
    const text_col3 = row2.append('div').attr('class', 'flex-col')
    text_col3.append('h3').text('WORST PUZZLE')
    text_col3.append('p').text(`Unfortunately, ${name} struggled with December ${slowest_entry.day} which they completed in ${Math.floor(slowest_entry.time)} min 
            and ${Math.floor(60*(slowest_entry.time-Math.floor(slowest_entry.time)))} seconds... That's ${difference} min slower that their best time! Tuf.`)


    //ranking out of total

    //consistency compute standard deviatios
    //do a line plot
    const plot_width = Math.min(window.innerWidth*.9 - 60, 600 - 60)
    const plot_height = Math.max(plot_width/4,150)
    const row3 = card.append('div').attr('class', 'flex-row')
    line_plot_all(row3,`${name}'s times` ,flattened_data,name, 'day', 'time', plot_width, plot_height,personColorScale)

    const row4 = card.append('div').attr('class', 'flex-row')

    distribution_plot(row4, flattened_data, plot_width, plot_height, name, personColorScale) 

}

function line_plot(container, title, data, xCategory, yCategory, plot_width, plot_height) {
    const padding = { left: 20, bottom: 0, top: 20, right: 0 };

    data.sort((a, b) => b.day - a.day).reverse();

    const allXValues = data.map(d => d[xCategory]);
    const allYValues = data.map(d => d[yCategory]);

    const xScale = d3.scaleLinear()
        .domain([Math.min(...allXValues), Math.max(...allXValues)])
        .range([padding.left, plot_width - padding.right]);

    const minY = Math.min(...allYValues)
    const maxY = Math.max(...allYValues)
    const yScale = d3.scaleLinear()
        .domain([minY-2, maxY+2])
        .range([plot_height - padding.bottom, padding.top]);

    const line = d3.line()
        .x(d => xScale(d[xCategory]))
        .y(d => yScale(d[yCategory]))
        .curve(d3.curveBasis);

    const line_svg = container.append('svg')
        .attr('width', plot_width)
        .attr('height', plot_height);
    line_svg.append('text').text(title).attr('fill', 'black')
        .style('font-size', '12px')  
        .style('font-family', 'Courier New') 
        .attr('y', 10)

    line_svg.append('path')
        .datum(data.filter(d => d[xCategory] !== undefined && d[yCategory] !== undefined))
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .attr('fill', 'none')
        .attr('d', line);
    line_svg.selectAll("circle")
        .data(data.filter(d => d[xCategory] !== undefined && d[yCategory] !== undefined))
        .enter()
        .append('circle')
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .attr('fill', 'black')
        .attr('r', 8)
        .attr('cx',d=> xScale(d[xCategory]))
        .attr('cy',d=> yScale(d[yCategory]))
    line_svg.selectAll("text")
        .data(data.filter(d => d[xCategory] !== undefined && d[yCategory] !== undefined))
        .enter()
        .append('text')
        .attr('stroke', '#F7F7F0')
        .attr('fill', '#F7F7F0')
        .style('font-size', '7px')  
        .style('font-family', 'Courier New') 
        .style('text-anchor', 'middle')
        .attr('x',d=> xScale(d[xCategory]))
        .attr('y',d=> yScale(d[yCategory])+2)
        .text(d=>d[xCategory])
     


    const yAxis = d3.axisLeft(yScale);


    line_svg.selectAll('.tick line').style('stroke', 'none');
    line_svg.selectAll('.domain').remove();
}


function line_plot_all(container, title, data, input_name, xCategory, yCategory, plot_width, plot_height, personColorScale) {
    const padding = { left: 20, bottom: 0, top: 20, right: 0 };
    const names = Array.from(new Set(data.map(d=>d.name)))

    console.log(xCategory, yCategory)
    console.log(data)
    const filtered_data = data.filter(d=>!isNaN(d[yCategory])&& !isNaN(d[xCategory]));
    console.log(filtered_data)
    const allXValues = filtered_data.map(d => d[xCategory]);
    const allYValues = filtered_data.map(d => d[yCategory])
    // const allYValues = data.map(d => d[yCategory]);

    const xScale = d3.scaleLinear()
        .domain([Math.min(...allXValues), Math.max(...allXValues)])
        .range([padding.left, plot_width - padding.right]);

    
    const minY = Math.min(...allYValues)
    const maxY = Math.max(...allYValues)
    const yScale = d3.scaleLinear()
        .domain([minY-2, maxY+2])
        .range([plot_height - padding.bottom, padding.top]);
console.log("MINY, ",minY, maxY,allYValues)
    
    const line = d3.line()
        .x(d => xScale(d[xCategory]))
        .y(d => yScale(d[yCategory]))
        .curve(d3.curveCardinal.tension(0.3));
        // .curve(d3.curveBasis);


    const line_svg = container.append('svg')
        .attr('width', plot_width)
        .attr('height', plot_height);
    line_svg.append('text').text(title).attr('fill', 'black')
        .style('font-size', '12px')  
        .style('font-family', 'Courier New') 
        .attr('y', 10)
    
    for(const name of names){
        const person_data = filtered_data.filter(d=>d.name == name).sort((a, b) => b.day - a.day).reverse();
        line_svg.append('path')
            .datum(person_data.filter(d => d[xCategory] !== undefined && d[yCategory] !== undefined))
            .attr('stroke', d=>personColorScale(name))
            .attr('class', 'person-line person-line-'+name)
            .attr('stroke-width', d=>{
                if(input_name == name){
                    return 2;
                }else{
                    return 1
                }
            })
            .attr('fill', 'none')
            .attr('d', line);
    }
    const person_data = filtered_data.filter(d=>d.name == input_name).sort((a, b) => b.day - a.day).reverse();
    line_svg.selectAll("circle")
        .data(person_data.filter(d => d[xCategory] !== undefined && d[yCategory] !== undefined))
        .enter()
        .append('circle')
        .attr('stroke', 'black')
        .attr('stroke-width', .5)
        .attr('fill', personColorScale(input_name))
        .attr('r', 5)
        .attr('cx',d=> xScale(d[xCategory]))
        .attr('cy',d=> yScale(d[yCategory]))
    line_svg.selectAll("text")
        .data(person_data.filter(d => d[xCategory] !== undefined && d[yCategory] !== undefined))
        .enter()
        .append('text')
        .attr('fill', 'black')
        .style('font-size', '7px')  
        .style('font-family', 'Courier New') 
        .style('text-anchor', 'middle')
        .attr('x',d=> xScale(d[xCategory]))
        .attr('y',d=> yScale(d[yCategory])+2)
        .text(d=>d[xCategory])
    const yAxis = d3.axisLeft(yScale);

    line_svg.selectAll('.tick line').style('stroke', 'none');
    line_svg.selectAll('.domain').remove();
}


function distribution_plot(container, data, plot_width, plot_height, person_name, personColorScale) {

    const padding = { left: 20, bottom: 30, top: 40, right: 0 };
    const allTimes = data.map(d => d.time);
    const avgTime = d3.mean(allTimes);

    const xScale = d3.scaleLinear()
        .domain([d3.min(allTimes), d3.max(allTimes)])
        .range([padding.left, plot_width - padding.right]);

    const histogram = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(40));

    const bins = histogram(allTimes);
    console.log("bins", bins)

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([plot_height - padding.bottom, padding.top]);

    const line_svg = container.append('svg')
        .attr('width', plot_width)
        .attr('height', plot_height);

    line_svg.append('text').text('Where do you fall on the distribution of all times?')
        .attr('fill', 'black')
        .style('font-size', '12px')  
        .style('font-family', 'Courier New') 
        .attr('y', 10);

        line_svg.append('path')
        .datum(bins)
        .attr('fill', '#EFEFDF')
        .attr('d', d3.area()
            .x(d => xScale(d.x0))  
            .y0(plot_height - padding.bottom)  
            .y1(d => yScale(d.length)) 
        );

    line_svg.append('line')
        .attr('x1', xScale(avgTime))
        .attr('x2', xScale(avgTime))
        .attr('y1', padding.top)
        .attr('y2', plot_height - padding.bottom)
        .attr('stroke', 'black')

    const rolledup_data = d3.rollup(data,
        v => d3.mean(v, d => d.time), 
        g => g.name
    );    

    rolledup_data.forEach((avg, name) => {
        const avgtime_line= line_svg.append('line')
            .attr('x1', xScale(avg))
            .attr('x2', xScale(avg))
            .attr('y1', padding.top)
            .attr('y2', plot_height - padding.bottom)
            .attr('stroke', personColorScale(name))
            .attr('stroke-dasharray', '4 4');
            
        if(name == person_name){
            line_svg.append('circle').attr('cx', xScale(avg))
            .attr('cy', plot_height/2).attr('r', 10)
            .attr('fill', personColorScale(person_name))
            line_svg
                .append('text')
                .attr('fill', 'black')
                .style('font-size', '10px')  
                .style('font-family', 'Courier New') 
                .style('text-anchor', 'middle')
                .attr('x',d=> xScale(avg))
                .attr('y',d=> plot_height/2+2)
                .text(person_name[0])
        
         }
    });

    const xAxis = d3.axisBottom(xScale).ticks(10); 
    const yAxis = d3.axisLeft(yScale).ticks(4);

    const xAxisGroup = line_svg.append('g')
        .attr('transform', `translate(0,${plot_height - padding.bottom})`)
        .call(xAxis);

    const yAxisGroup = line_svg.append('g')
        .attr('transform', `translate(${padding.left}, 0)`)
        .call(yAxis);

    xAxisGroup.selectAll('.tick line')
        .attr('stroke', 'black')        
        .attr('stroke-width', .5)        
        .attr('y2', 3);             
    yAxisGroup.selectAll('.tick line')
        .attr('stroke', 'black')        
        .attr('stroke-width', .5)        
        .attr('x2', 3);  

    line_svg.selectAll('.tick text')
        .style('font-size', '7px')     
        .style('font-family', 'Courier New'); 
}
