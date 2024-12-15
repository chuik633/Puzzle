function layoutHighScoreBarChart(plot_container, barChartData, xCategory, yCategory, width, height) {
    const svg_container = plot_container.append('div').attr('class', 'svg-container').style('height', height+'px').style("position", 'relative')
    const svg = svg_container.append('svg')
        .attr('width', width)
        .attr("height", height)

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
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr('transform', `translate(${padding}, 0)`)
        .call(d3.axisLeft(yScale));



}
