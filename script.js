function perms(s, string){
	if(s.length === 0){
		return;
	}else if(string.length === 0){
		if(!isRoom(s[0])){
			return;
		}
	}
	let i;
	for(i = 1; i < s.length; i++){
		//console.log(s[0] + string + s[i]);
		if(isRoom(string + s[i])){
			perms(s.substr(0, i) + s.substr(i + 1), string + s[i]);
			
		}
	}
}

function isRoom(string){
	let i, worth = 0, weight = 0, curr;
	for(i = 0; i < string.length; i++){
		curr = map.get(string[i]);
		if(weight + curr.weight <= size){
			worth += curr.worth;
			weight += curr.weight;
		}else{
			string = string.substr(0, i - 1);
			weight += curr.weight;
			break;
		}
	}
	
	if(most.worth < worth){
		most.worth = worth;
		most.combo = string;
	}
	if(weight < size){
		return true;
	}
	return false;
}

let most = {worth: 0, combo: ""};

function swap(string, pos1, pos2){
	string = string.replace(pos1, '*');
	string = string.replace(pos2, pos1);
	string = string.replace('*', pos2);
	return string;
}

function createStarts(string){
	let starts = [], x = 0, y, num = string.length - 1;
	starts.push(string);
	for(x = 0; x < num; x++){
		let curr = String.fromCharCode(x + 'A'.charCodeAt(0));
		string = swap(string, curr.charAt(0), string.charAt(x + 1));
		starts.push(string);
	}
	return starts;
}

function randomizeString(map, size, minWeight, maxWeight, minWorth, maxWorth){
	let i, string = "", temp;
	for(i = 0; i < size; i++){
		temp = String.fromCharCode(i + 'A'.charCodeAt(0))[0];
		string += temp;
		map.set(temp, {weight: Math.floor(Math.random() * (maxWeight - minWeight)) + Number(minWeight), worth: Math.floor(Math.random() * (maxWorth - minWorth)) + Number(minWorth)});
	}
	return string;
}

let map = new Map();
let size = 80;
let str = "";
let starts = [];
var dcpStarts = [];
let i;
let totalV = 0;
let totalW = 0;
let passes = [];

function replacer(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

/*console.log("BEST IS");
console.log(most.combo);
console.log(most.worth);

console.log(`Received result in ${Math.round((Date.now() - startTime) / 100) / 10}s`);*/
//console.log(starts);


// WORK FUNCTION 
  async function workFn(start) {
	var most = {worth: 0, combo: ""};
	var map = JSON.parse(start.map, reviver);
	var size = start.size;
	
	function reviver(key, value) {
		if(typeof value === 'object' && value !== null) {
				if (value.dataType === 'Map') {
					return new Map(value.value);
				}
			}
		return value;
	}

	function perms(s, string){
		if(s.length === 0){
			return;
		}else if(string.length === 0){
			if(!isRoom(s[0])){
				return;
			}
		}
		let i;
		for(i = 1; i < s.length; i++){
			//console.log(s[0] + string + s[i]);
			if(isRoom(string + s[i])){
				progress();
				perms(s.substr(0, i) + s.substr(i + 1), string + s[i]);
			}
		}
	}

	function isRoom(string){
		let i, worth = 0, weight = 0, curr;
		for(i = 0; i < string.length; i++){
			curr = map.get(string[i]);
			if(weight + curr.weight <= size){
				worth += curr.worth;
				weight += curr.weight;
			}else{
				string = string.substr(0, i - 1);
				weight += curr.weight;
				break;
			}
		}
		
		if(most.worth < worth){
			most.worth = worth;
			most.combo = string;
		}
		if(weight < size){
			return true;
		}
		return false;
	}
	
	
	perms(start.string, "");
    return most;
  }
  
function calculateWeight(string){
	let i, weight = 0;
	for(i = 0; i < string.length; i++){
		weight += map.get(string[i]).weight;
	}
	return weight;
}
  
let fit = 0;
let optimal = "";
async function deploy() {
	//const compute = require('dcp/compute');
	const { compute } = dcp;
	// COMPUTE FOR
	startTime = Date.now();
	console.log("DCP - START");
	const job = compute.for(dcpStarts, workFn);
	job.public.name = 'Knapsack problem';


	// Not mandatory console logs for status updates
	job.on('accepted', () => {
		//console.log(` - Job accepted with id: ${job.id}`);
	});
	job.on('result', (ev) => {
		//console.log(` - Received result for slice ${ev.sliceNumber} at ${Math.round((Date.now() - startTime) / 100) / 10}s`);
		//console.log(ev.result);
	});

	// PROCESS RESULTS 
	let resultSet = await job.exec();

	let best = {worth: 0, combo: ""};
		resultSet.forEach(result =>{
		if(result.worth > best.worth){
			best = result;
		}
	});

	console.log("DCP IS");
	console.log(best.combo);
	console.log(best.worth);
	fit = best.combo.length;
	
	optimal = best.combo;
	totalV = best.worth;
	totalW = calculateWeight(optimal)
	
	console.log(`Received result in ${Math.round((Date.now() - startTime) / 100) / 10}s`);
}
	
let num = 15;
let limit = 80;
let minV = 1;
let maxV = 100;
let minW = 1;
let maxW = 25;
	
function findOptimal(){
	num = document.getElementById("num").value;
	limit = document.getElementById("limit").value;
	minV = document.getElementById("minV").value;
	maxV = document.getElementById("maxV").value;
	minW = document.getElementById("minW").value;
	maxW = document.getElementById("maxW").value;
	
	str = randomizeString(map, num, minW, maxW, minV, maxV);
	starts = createStarts(str);
	startTime = Date.now();

	for(i = 0; i < str.length; i++){
		//perms(starts[i], "");
		dcpStarts.push({map: JSON.stringify(map, replacer), string: starts[i], size: size});
	}
	
	//console.log(dcpStarts);
	deploy();
}

function drawUI(){
	let newCan = document.getElementById("canvas");
	let width = window.innerWidth  / 2;
	let height = window.innerHeight;
	
	let x, y;
	newCan.width = width;
	newCan.height = height;
	let ctx = newCan.getContext("2d");
	ctx.restore();
	ctx.fillStyle = 'black';

	function roundedRect(ctx, x, y, width, height, radius) {
	  ctx.beginPath();
	  ctx.moveTo(x, y + radius);
	  ctx.arcTo(x, y + height, x + radius, y + height, radius);
	  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
	  ctx.arcTo(x + width, y, x + width - radius, y, radius);
	  ctx.arcTo(x, y, x, y + radius, radius);
	  ctx.stroke();
	}

	let sqrtItems = Math.ceil(Math.sqrt(num));
	let txt = 100;
	
	
	
	function drawKnapsack(numIn, out, string){
		num = document.getElementById("num").value;
		limit = document.getElementById("limit").value;
		minV = document.getElementById("minV").value;
		maxV = document.getElementById("maxV").value;
		minW = document.getElementById("minW").value;
		maxW = document.getElementById("maxW").value;
		
		if(num > str.length){
			str = randomizeString(map, num, minW, maxW, minV, maxV);
		}
		
		sqrtItems = Math.ceil(Math.sqrt(num))
		ctx.font = '10px sans-serif';
		let done = 0, offset = out ? 50 * (sqrtItems < 3 ? 3 : sqrtItems) : 0, ch;
		for(y = 0; y < sqrtItems; y++){
			for(x = 0; x < sqrtItems; x++){
				if(done < numIn){
					ch = string[x + (sqrtItems * y)];				
					roundedRect(ctx, 80 + x * 50 + offset, 30 + y * 50, 40, 40, 15);
					ctx.fillText(ch, 80 +  x * 50 + 8 + offset, 30 + y * 50 + 12);
					ctx.fillText(map.get(ch).weight, 80 + x  * 50 + (45 - ctx.measureText(txt).width) / 2 + offset, 30 + y * 50 + 22);
					ctx.fillText(map.get(ch).worth, 80 + x * 50 + (45 - ctx.measureText(txt).width) / 2 + offset, 30 + y * 50 + 34);
					done++;
				}else{
					return;
				}
			}
		}
	}
		
	drawKnapsack(fit, false, optimal);
	
	if(y === 0){
		y = 1;
	}
	roundedRect(ctx, 75, 25, sqrtItems * 50, y * 50, 15);
	
	ctx.font = ctx.font = '16px sans-serif';
	ctx.fillText("Total weight: " + totalW, 80, 45 + y * 50);
	ctx.fillText("Total value: " + totalV, 80, 65 + y * 50);
	
	drawKnapsack(num - fit, true, str.replaceAll(new RegExp("["+optimal+"]", 'g'), ''));
	
	ctx.font = ctx.font = '16px sans-serif';
	ctx.fillText("INSIDE KNAPSACK", 80, 20);
	ctx.fillText("OUTSIDE KNAPSACK", 80 + 50 * (sqrtItems < 3 ? 3 : sqrtItems), 20);
}

window.onresize = drawUI;

//require('dcp-client').init('https://scheduler.distributed.computer').then(main);