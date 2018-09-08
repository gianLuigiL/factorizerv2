self.addEventListener('message', function(event){
	'use strict';
	//Get the payload, the number to use
	const number = event.data;
	//Instantiate results array and starting number
	let results = [];
	let actual = 2;
	function factorsOf(number){
		//Go only up to the sqrt of the number
		let max = Math.sqrt(number);
			for(let i = 0; i < 10000000 && actual <= max; i++, actual++ ){
				//If it's a factor push into the results
				if(number % actual === 0){
					results.push(actual);
					//If it's not the sqrt push the quotient as well
					if(number / actual !== actual){
						results.push(number / actual);
					}
				}
			}
		//IF the task is not finished, send data on progress
		if(actual < max){
			let currentPercentage = parseInt((actual * 100) / max);
			//Send data
			self.postMessage({finished: false, currentPercentage: currentPercentage});
			//Execute the task again starting from where it has interrupted
			factorsOf(number);
		} else {
			//Sort results before sending them
			results.sort((a,b)=>a-b);
			//Send results with flag on finished
			self.postMessage({finished: true, results: results});
		}
	}
	//Run
	factorsOf(number);
}, false);