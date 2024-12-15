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
    row1.append('div').attr('class', 'face face-'+name).style('width', `${100}px`).style('height', `${100}px`)
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
    text_col2.append('p').text(`${name}'s best puzzle is December ${fastest_entry.day} which they completed in ${Math.round(fastest_entry.time)} min 
            and ${60*(fastest_entry.time-Math.round(fastest_entry.time))} seconds!`)


    const row3 = card.append('div').attr('class', 'flex-row')
    row3.append('img')
        .attr('src',`/assets/puzzles/AdventCalendar3 ${slowest_entry.day}.png`)
        .style('height', 100+'px').style('border', '.5px solid black')

    const difference = Math.round((slowest_entry.time - fastest_entry.time)*10)/10
    const text_col3 = row3.append('div').attr('class', 'flex-col')
    text_col3.append('h3').text('WORST PUZZLE')
    text_col3.append('p').text(`Unfortunately, ${name} struggled with December ${fastest_entry.day} which they completed in ${Math.round(fastest_entry.time)} min 
            and ${60*(fastest_entry.time-Math.round(fastest_entry.time))} seconds... That's ${difference} min slower that their best time! Tuf.`)


    //ranking out of total
}