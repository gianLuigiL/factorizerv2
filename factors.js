(function init(){
	'use strict';
	const form = document.forms[0];	
	const label = document.getElementsByTagName('label')[0];
	const input = form.elements[0];
	const startButton = form.elements[1];
	const reloadButton = form.elements[2];
	//Here displays estimated time
	const eta = document.getElementById('eta');
	//Here display warnings
	const hint = document.getElementById('hint');
	//Here displays results
	const factors = document.getElementById('factors');
	//Remove warnings
	function removeHint(){
		hint.textContent = "";
	}
	//Add warnings
	function addHint(message){
		hint.textContent = message;
	}
	//Add ETA
	function addEta(message){
		eta.textContent = message;
	}
	
	input.addEventListener('input', function(){
		//On every input filter out values that are ot allowed
		const allowed = [..."1234567890"];
		this.value = [...this.value].filter(el => allowed.includes(el)).join('');
		//Display warnings and hint based on length
		switch(this.value.length){
			case 0:
				addEta('Estimated Time: Not possible under 2.');
				addHint('The number must start from 2.');
				break;
			case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8:
				addEta('Estimated Time: Right now.');
				if(this.value < 2) {
					addHint('The number must start from 2.');
					addEta('Estimated Time: Not possible under 2.');
				} else {
					removeHint();
				}
				break;
			case 9: case 10: case 11:
				removeHint();
				addEta('Estimated Time: A couple of seconds.');
				break;
			case 12: case 13: case 14:
				removeHint();
				addEta('Estimated Time: Bear with me, it\'ll be fast.');
				break;
			case 15: case 16: case 17:
				removeHint();
				addEta('Estimated Time: Might take a while.');
				break;
			case 18: case 19:
				removeHint();
				addEta('Estimated Time: Might keep you busy for the next several minutes.');
				addHint('\u26a0 The browser might crash if it runs out of memory.');
				break;
			case 20: case 21:
				removeHint();
				addEta('Estimated Time: Be aware you\'ll be late for work tomorrow.');
				addHint('\u26a0\u2622 High risk the browser will crash without notice.');
				break;
			case 22:
				removeHint();
				addEta('Estimated Time: Be aware you\'ll be late for work tomorrow.');
				addHint('\u26a0\u2622 High risk the browser will crash without notice. You\'ve reached the maximum length');
				break;
		  }
	});
	
	form.addEventListener('submit', function(event){
		//On submission prevent from reloading
		event.preventDefault();		
		//Create a worker 
		const worker = new Worker('./factor_worker.js');
		//Convert value to number
		const number = +input.value;
		//If number is less than two prevent from running
		if(number < 2 || input.value.length === 0){
			factors.textContent = "";
			return;
		}
		//Edge doesn't animate correctly so exclude it from auxiliary animation
		if (!(/Edge/.test(navigator.userAgent))) {
			label.classList.add('disabled');
		}
		//Get the loading bar
		const loadBar = document.getElementById('loadBar');
		//Disable input
		input.disabled = true;
		//Trigger animation for running task
		startButton.style.display = 'none';
		reloadButton.style.display = 'inline-block';
		loadBar.style.display = 'block';
		const loadStatus = document.getElementById('loadStatus');
		const percentage = document.getElementById('percentage');
		//Send message to the worker to start the computation
		worker.postMessage(number);
		//Listen for messages from the worker
		worker.addEventListener('message', function(event){
			//If it has finished
			if(event.data.finished){
				//Get the results
				const results = event.data.results;
				//Terminate animation for running task
				loadBar.style.display = 'none';
				startButton.style.display = 'inline-block';
				reloadButton.style.display = 'none';
				if (!(/Edge/.test(navigator.userAgent))) {
				label.classList.remove('disabled');
				}
				input.disabled = false;
				//remove previous results if present
				factors.innerHTML = "";
				//If no factors where found diplay message
				if(results.length === 0){
					factors.textContent = number + " is a prime number.";
				}
				//Oherwise format the results and display
				results.forEach(el => {
					let factor = document.createElement('span');
					factor.classList.add('factor');
					factor.textContent = el+"\n";
					factors.appendChild(factor);
				});
			} else {
				//If it hasn't finished update with the current status
				loadStatus.style.width = event.data.currentPercentage + '%';
				percentage.textContent = event.data.currentPercentage + " %";
			}
		}, false);
	
	//Reload to interrupt
	reloadButton.addEventListener('click', function(){
		location.reload();
	});
});
})();


