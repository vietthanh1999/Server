var socket = io("http://localhost:3000");

//client nhận dữ liệu từ server
socket.on("Server-send-data", function(data){
    console.log(data)
    for(let i=0;i<data.length;i++){
        let path = "./images/"+data[i];
        $("#vaicaianh").append('<a href="' + path + '" rel = "nhom2"><img class= "anhnho" src="' + path + '" alt=""></a>');
    }
});
//client nhận dữ liệu mới từ server
socket.on("Server-send-new-data",function(data){
    let newpath = "./images/" + data;

    $("#vaicaianh").append('<a href="' + newpath + '" rel = "nhom2"><img class= "anhnho" src="' + newpath + '" alt=""></a>');
});
//client gửi dữ liệu lên server
$(document).ready(function(){
        console.log("jee");
        socket.emit("Client-send-data");     
});
