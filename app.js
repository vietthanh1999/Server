var express = require("express");
var bodyParser = require("body-parser");

var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
var path = require("path");

//---- views ejs----
app.set("view engine","ejs");
app.set("views","./views");
//----------------
server.listen(process.env.PORT || 3000);
//---bodyParser--------
app.use(bodyParser.urlencoded({ extended: false }));

//------DATABASE-------
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/BKBox";


MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("BKBox");
    dbo.collection("images").find({}).toArray(function(err, result) {
      if (err) throw err;
        // console.log(result);
        for(item of result){
            arrayImg.push("public/images/" + item.name);     
        }
      db.close();
    });
  });

var arrayImage = [];
var arrayImg = [];
let i = 0;
fs.readdir("public/images/",function(err , files){
    if(err){
        return;
    }else{
        files.forEach(function(f){
            arrayImage.push("public/images/" + f);
        })
    }
});

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.get("/trangchu", function(req, res){
	res.sendFile(__dirname + "/trangchu.html");	
});
//------------Router -------------
app.get("/",function(req,res){
    res.render("main",{kt:false});
});
io.sockets.on('connection', function (socket) {
	
    console.log("NOTICE: NEW USER CONNECTED: " + socket.id);
    console.log("Milis:" + getMilis());
//    console.log(getFilenameImage(socket.id));
    //========Android Send Image=================
    socket.on("CLIENT_SEND_IMAGE",function(data){
        console.log('SERVER SAVED A NEW IMAGE.');
        var filename = getFilenameImage(socket.id);
        console.log("Image name up: " + filename);
        //---Add image in array response--
        arrayImage.push(filename);
        //-----------------------------------------
        fs.writeFile( filename, data, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          });
        //-----Server send new image to Website ----
        io.sockets.emit("Server-send-new-data",filename.substring(14));
        
        //------Save in Database--------------------
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("BKBox");
            var myobj = { name: filename.substring(14), userID: socket.id };
            dbo.collection("images").insertOne(myobj, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted database images");
              db.close();
            });
          });
        //--------------------------------------------

    });  
    //-----Server send all image to website--------
    socket.on("Client-send-data",function(){
        fs.readdir("public/images/", (err, files) => {
        socket.emit("Server-send-data",files);
      });
    });

    //---Client send request get image--------------
    socket.on("CLIENT_SEND_REQUEST", function(data){

        fs.readFile(arrayImage[i],function(err, data){
            if(!err) {
                // console.log(getRandomFilename(arrayImg));
                io.emit('SERVER_SEND_IMAGE',data);
                //console.log(data);
            } else{
                console.log(err);
                console.log('THAT BAI.');
            }
        });
        i++;
        if(i >= arrayImage.length) {
            i = 0;
        } 
        
    });


});
//--------------End IO SOCKET---------

// ---------------API-----------------
app.post('/api/login', (req,res) => {
    value = {
        username :req.body.username,
        password :req.body.password
      }
  //  console.log(value.username);
    MongoClient.connect(url, function(err, db){
        if(err) throw err;
        var dbo = db.db("BKBox");
        dbo.collection("account").findOne({user:value.username}, function(err, result) {
            if (err) throw err;
            
           // console.log(result);
            if (err != null) {
                res.send({
                    error: err.message
                })
            } else {
                if(!result) {
                    res.send("fail");
                } else {
                    if(result.user === value.username && result.password === value.password){
                        res.send("success");
                    } else {
                        res.send("fail");
                    }
                }
            }
            db.close();
          });
    });
});
app.get('/api/images', (req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("BKBox");
        dbo.collection("images").find({}).toArray(function(err, result) {
        if (err) throw err;
        if (err != null) {
            res.send({
                error: err.message
            })
        } else {
            res.send({
                data: result
            })
            }
          db.close();
        });
      });
  })

function getFilenameImage(){
    return "public/images/" + getMilis() + ".png";
}

// function getFilenameImage(id){
//     return "public/images/" + id.substring(2) + getMilis() + ".png";
// }

function getMilis(){
    var date = new Date();
    var milis = date.getTime();
    return milis;
}

function getRandomFilename(array){
    return array[Math.floor(Math.random()*array.length)];
}


// get all files

// app.get('/api/images', (req, res) => {
//   fs.readdir('public/images', (err, files) => {
//     var data = []
//     files.forEach(filepath => {
//       data.push({'filepath': filepath})
//     })
//     if (err != null) {
//       res.send({
//         error: err.message
//       })
//     } else {
//       res.send({
//         data: data
//       })
//     }
//   })
// })
//-----------------------------------
    // socket.on("CLIENT_SEND_REQUEST", function(data){
    //     fs.readFile(getRandomFilename(arrayImage),function(err, data){
    //         if(!err) {
    //             //io.emit('SERVER_SEND_IMAGE',data);
    //             console.log(getRandomFilename(arrayImage));
    //         } else{
    //             console.log('THAT BAI.');
    //         }
    //     });
    // });