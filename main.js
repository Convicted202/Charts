(function() {
    var testInputData = [
        {
            name    : 'cat1',
            color   : '#16A085',
            value   : 60,
            text    : 'Category 1'
        },
        {
            name    : 'cat2',
            color   : '#2C3E50',
            value   : 20,
            text    : 'Category 2'
        },
        {
            name    : 'cat3',
            color   : '#C0392B',
            value   : 12,
            text    : 'Category 3'
        },
        {
            name    : 'cat4',
            color   : '#7F8C8D',
            value   : 45,
            text    : 'Category 4'
        },
        {
            name    : 'cat5',
            color   : '#27AE60',
            value   : 50,
            text    : 'Category 5'
        }
        ,
        {
            name    : 'cat6',
            color   : '#E67E22',
            value   : 2,
            text    : 'Category 6'
        }
        ,
        {
            name    : 'cat7',
            color   : '#95A5A6',
            value   : 150,
            text    : 'Category 7'
        }
    ]
    
    window.testData = testInputData;
})();

$(document).ready(function() {
    Chart.initDonut('donut-chart', 200, 200, 80, 200);
    Chart.initLine('line-chart', 20, 50, 500, 400);
});
