app.factory('jsonExporter', function($http, $rootScope)
{
    var jsonExporter = {};
        jsonExporter.make = function(save)
        {
            console.log(save);
			/*var j = JSON.stringify(save); // '{"name":"binchen"}'
			console.log(j);*/
			$http({
                method: 'POST',
                url: 'scripts/export_json.php?id=1',
                data: {data: save}
            })
            .success(function(response) {
            	console.log('SUCCESS SAVE JSON');
            })
            .error(function()
        	{
        		console.log('ERROR SAVE JSON');
        	});;
        };
        jsonExporter.get = function()
        {
			$http({
                method: 'GET',
                url: 'scripts/read_json.php?id=1'
            })
            .success(function(response) {
            	console.log('SUCCESS LOADING JSON');
            	$rootScope.$broadcast('replay_loaded', response);
            }).
            error(function()
        	{
        		console.log('ERROR LOADING JSON');
        	});
        };
        
    return jsonExporter;
});