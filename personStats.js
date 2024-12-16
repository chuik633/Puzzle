function personStats(popup_container, flattened_data, name){

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
    row1.append('div').attr('class', 'face face-'+name).style('width', `${100}px`).style('height', `${100}px`).style('flex-shrink', 0)
    showFaces([name])
   
    const text_col = row1.append('div').attr('class', 'flex-col')
    text_col.append('h2').text(name)
    text_col.append('p').text(`${name} has completed ${person_data.length}/24 puzzles! Check out their stats below :P`)


    //plot of their data across the days for difficutly
    const row2 = card.append('div').attr('class', 'flex-row')
    row2.append('img')
        .attr('src',`/assets/puzzles/AdventCalendar3 ${fastest_entry.day}.png`)
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
    text_col3.append('p').text(`Unfortunately, ${name} struggled with December ${slowest_entry.day} which they completed in ${Math.floor(fastest_entry.time)} min 
            and ${Math.floor(60*(slowest_entry.time-Math.floor(slowest_entry.time)))} seconds... That's ${difference} min slower that their best time! Tuf.`)


    //ranking out of total

    //consistency compute standard deviatios
    //do a line plot
    const plot_width = Math.min(window.innerWidth*.9 - 60, 600 - 60)
    const plot_height = plot_width/4
    const row3 = card.append('div').attr('class', 'flex-row')
    line_plot(row3,`${name}'s times` ,person_data, 'day', 'time', plot_width, plot_height)


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
