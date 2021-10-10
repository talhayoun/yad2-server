const filterProperties = (ads, filterData) => {
    console.log(filterData)
    let matchProperties = [];
    for (let i = 0; i < ads.length; i++) {
        if (ads[i].properties.includes(filterData.properties)) {
            console.log(ads[i]);
        }
    }
}

module.exports = { filterProperties };