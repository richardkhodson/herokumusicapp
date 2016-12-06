
(function(){
    angular.module('musicapp')
        .service('bandsintown',bandsintown);

    function bandsintown($http, $q){
    var band = this; 
    band.getBand = getBand; 	    
	    function getBand(query){
	    	var deferred = $q.defer();
	    	var url = 'http://api.bandsintown.com/artists/' + query + '/events.json?api_version=2.0&app_id=musicapp_matc'
			
			$http({
			  method: 'GET',
			  dataType: 'jsonp',
			  url: url
			})
			.then(function successCallback(response) {
				deferred.resolve(response.data);
			  }, function errorCallback(response) {
			  	deferred.resolve(response.statusText); 
			});
	    	return deferred.promise;
	    }
	}
}());
