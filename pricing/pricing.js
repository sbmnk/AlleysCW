const mongo_ip = "192.168.1.8";
const directions_ip = "192.168.1.10";
const express = require( "express" );
const bodyParser = require( "body-parser" );
const spdy = require( "spdy" );
var https = require('https');
const fs = require( "fs" );

const mongodb = require( "mongodb" );
const MongoClient = mongodb.MongoClient;
const Server = mongodb.Server;
const app = express();
app.use( bodyParser.json() );


function isExpensiveTime(){
	var date = new Date();
	var current_hour = date.getHours();
	if(current_hour>23 || current_hour<5){
		return true;
	}
	return false;
}
function getDistance(route){
  routes = route["routes"][0];
  legs = routes["legs"][0];
  steps = legs["steps"];
 html_instructions = [];
 routeLength = legs["distance"]["value"];
 return distance;
}

function getARoadsLength(route){
  routes = route["routes"][0];
  legs = routes["legs"][0];
  steps = legs["steps"];
 html_instructions = [];
  roads ={};
  for (var instruction in html_instructions){
  	var openTag = html_instructions[instruction][0].indexOf("<b>");
  	/*The road names and directions are enclosed by <b> tags.
  	I extract everything from within <b> tags and sum up the distances of A
  	roads to then compare
  	*/
  	 while (openTag != -1) {
  		 var closeTag =html_instructions[instruction][0].indexOf("</b>");
  		 var road = html_instructions[instruction][0].substring(openTag+3,closeTag);
  		 roads[road] = (roads[road] || 0) + html_instructions[instruction][1];
  		 html_instructions[instruction][0] = html_instructions[instruction][0].replace('<b>','');
  		 html_instructions[instruction][0] = html_instructions[instruction][0].replace('</b>','');
  		 openTag = html_instructions[instruction][0].indexOf("<b>");
  		 }

  	 }

     	 keys = Object.keys(roads);
     	 var ARouteLength = 0;
     	 for (var i in keys){
     		 if(keys[i][0]=='A'){
     			 ARouteLength +=roads[keys[i]];
     		 }
     	 }
     	 if (2*ARouteLength>distance){
     		 return true;
     	 }
     	 return false;
         }
}


app.get( "/alleys/route/:origin/:destination", async ( reqt, resp ) => {
try {
const origin = reqt.params.origin;
const destination = reqt.params.destination;
//getDriver+rate
const svr = new Server( mongo_ip, 27017 );
const con = await MongoClient.connect( svr );
const col = con.db( "alleys" ).collection( "drivers" );
const driverList = await col.sort({"price":1});
var driverAmount = driverList.count();
var selectedDriver = driverList[0];
var price = 0 ;
var rate = selectedDriver["price"];
//getDirection
https.get({
  host: directions_ip,
  port: 8443,
  path: "/alleys/route/"+origin +"/"+destination,
}, (response) {
  price = getDistance(response)*rate;
  if (getARoadsLength(response)){
    price = price*2;
  }
  if (isExpensiveTime()){
    price=price*2;
  }
  if (driverAmount<5){
    price=price*2;
  }

  agent.close();
}).end();
selectedDriver["price"]=price;
if ( doc ) {
resp.status( 200 ).json( selectedDriver ).end(); // OK
}
} catch ( exn ) {
resp.status( 500 ).end(); // Internal Server Error
}
});




const server = spdy.createServer( {
key : fs.readFileSync( "key.pem" ),
cert : fs.readFileSync( "cert.pem" )
}, app );
server.listen( 8443, () => {
console.log( "listening on port 8443..." )
});
