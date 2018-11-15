function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

const word_cloud = async ()=>{
    if(document.getElementById('wordcloud_car') ) {
        var WordcloudCar = echarts.init(document.getElementById('wordcloud_car'));
        const getTerms = await fetch('/getTerms');
        const keywords = await getTerms.json();

    
        var wordcloud_car_color = ['#99AAB5', '#FFFFFF', '#7289DA', '#839496', '#586e75', '#859900', '#2aa198', ' #268bd2', '#b58900', '#cb4b16', '#dc322f']
    
        var option = {
            title:{
              show: false
            },
            tooltip:{
                  trigger: "item"
            },
            toolbox: {
                show: false
            },
            series: [ {
                type: 'wordCloud',
                sizeRange: [10, 80],
                rotationRange: [-90, 90],
                rotationStep: 90,
                gridSize: 2,
                shape: 'pentagon',
                left: 'center',
                top: 'center',
                drawOutOfBound: false,
                textStyle: {
                    normal: {
                        color: function () {
                          var index = Math.floor((Math.random()*wordcloud_car_color.length));
                          return wordcloud_car_color[index];
                        }
                },
                    emphasis: {
                        color: '#60ACFC',
                        shadowBlur: 6,
                        shadowColor: '#dddddd'
                    }
                },
                data: keywords.sort(function (a, b) {
                    return b.value  - a.value;
                })
            } ]
        };
    
        WordcloudCar.setOption(option);
    
        window.onresize = function() {
           WordcloudCar.resize();
        }
        window.WordcloudCar = WordcloudCar;
    
    }
}
window.word_cloud = word_cloud;

