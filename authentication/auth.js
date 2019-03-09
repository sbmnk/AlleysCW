const mongo_ip = "192.168.1.8";
const pricing_ip = "192.168.1.9"
const bcrypt = require( "bcryptjs" );
const bodyParser = require( "body-parser" );
const express = require( "express" );
const fs = require( "fs" );
const jwt = require( "jwt-simple" );
const mongodb = require( "mongodb" );
const spdy = require( "spdy" );
const MongoClient = mongodb.MongoClient;
const Server = mongodb.Server;
const app = express();
app.use( bodyParser.json() );
const secretKey = "secretKey";

app.post( "/alleys/register", async ( reqt, resp ) => {
try {
const u = reqt.body.username;
const p = reqt.body.password;
const h = await bcrypt.hashSync( p, 10 );
const svr = new Server( mongo_ip, 27017 );
const con = await MongoClient.connect( svr );
const col = con.db( "alleys" ).collection( "auth" );
const res = await col.updateOne( { username : u }
, { $set : { password : h } }
, { upsert : true }
);
con.close();
resp.status( 204 ).end(); // No Content
} catch ( exn ) {
resp.status( 500 ).end(); // Internal Server Error
}
});

app.post( "/alleys/issue/:username", async ( reqt, resp ) => {
try {
const u = reqt.params.username
const p = reqt.body.password
const svr = new Server( mongo_ip, 27017 );
const con = await MongoClient.connect( svr );
const col = con.db( "alleys" ).collection( "auth" );
const doc = await col.findOne( { username : u } );
con.close();
if ( doc ) {
const vld = await bcrypt.compareSync( p, doc.password );
if ( vld ) {
const uid = { username : u };
const tkn = jwt.encode( uid, secretKey );
resp.status( 200 ).json( tkn ).end(); // OK
} else {
resp.status( 401 ).end(); // Unauthorised
}
} else {
resp.status( 401 ).end(); // Unauthorised
}
} catch ( exn ) {
resp.status( 500 ).end(); // Internal Server Error
}
});

app.get( "/alleys/session", async ( reqt, resp ) => {
try {
const tkn = reqt.headers[ "x-auth" ]
const uid = jwt.decode( tkn, secretKey )
resp.status( 200 ).json( uid ).end(); // OK
} catch ( exn ) {
resp.status( 401 ).end(); // Unauthorised
}
});

app.post( "/alleys/:username/:price", async ( reqt, resp ) => {
try {
const u = reqt.body.username;
const p = reqt.body.price;
const tkn = reqt.headers[ "x-auth" ];
const uid = jwt.decode( tkn, secretKey );

const h = await bcrypt.hashSync( p, 10 );
const svr = new Server( mongo_ip, 27017 );
const con = await MongoClient.connect( svr );
const col = con.db( "alleys" ).collection( "auth" );
if(u==uid){
const res = await col.updateOne( { username : u }
, { $set : { price : p } }
, { upsert : true }
);
}
else{
  resp.status( 401 ).end();// Unauthorised
}
con.close();

resp.status( 204 ).end(); // No Content
} catch ( exn ) {
resp.status( 500 ).end(); // Internal Server Error
}
});ch ( exn ) {
resp.status( 500 ).end(); // Internal Server Error
}
});

app.get( "/alleys/route/:origin/:destination", async ( reqt, resp ) => {
try {
const origin = reqt.params.origin;
const destination = reqt.params.destination;
var driverAndPrice ;

https.get({
  host: pricing_ip,
  port: 8443,
  path: "/alleys/route/"+origin +"/"+destination,
}, (response) {
  driverAndPrice=response

  }
  agent.close();
}).end();

if ( driverAndPrice ) {
resp.status( 200 ).json( driverAndPrice ).end(); // OK
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
