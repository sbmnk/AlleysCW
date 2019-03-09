const https = require('https');
const express = require( "express" );
const bodyParser = require( "body-parser" );
const spdy = require( "spdy" );
const fs = require( "fs" );
const app = express();
app.use( bodyParser.json() );

function getRoute(origin,destination){
	request = "https://maps.googleapis.com/maps/api/directions/json"
  + "?" + "origin"      + "=" + origin
  + "&" + "destination" + "=" + destination
  +"&" + "key="+ "AIzaSyA58xogKz7wcnHXCv2u1Tz5yxsaoKruHYg"

  https.get(request, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      jsonResponse = JSON.parse(data);
			console.log(jsonResponse);

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });


}


app.get( "/alleys/route/:origin/:destination", async ( reqt, resp ) => {
try {
const origin = reqt.params.origin;
const destination = reqt.params.destination;
doc = getRoute(origin,destination);
if ( doc ) {
resp.status( 200 ).json( doc ).end(); // OK
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
