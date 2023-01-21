
const socket = io();
console.log("jh")
console.log(socket)
socket.on("connect",()=>{
    console.log(socket.id)
    console.log(socket.connected)
})

var username ;
if(window.location.pathname==="/"){
    username = prompt("Enter your name");
}


const uid = window.location.pathname.toString().substr(-6,6);

const idTextElement = document.getElementById("id-text");
if(idTextElement)idTextElement.innerText= uid

const msgContainer = document.querySelector(".msgContainer")
const newJoinedMsg = (newJoinedUsername) => `<div class="newJoinedMsg">
<div class="msgBody">
    <p>New user joined : <span id="new-joined-msg-username"> ${newJoinedUsername}</span></p>
</div>
</div>`;
socket.on("newJoined",(args)=>{
    msgContainer.innerHTML+=newJoinedMsg(args)
    console.log("new user joined",args)
})


const copyBtn = document.querySelector(".copy-btn");
if(copyBtn){
    copyBtn.addEventListener("click",()=>{
        navigator.clipboard.writeText(uid);
        copyBtn.innerText = "copied"
    })
}

const joinRoomBtn = document.getElementById("join-room-btn");
if(joinRoomBtn){
    joinRoomBtn.addEventListener("click",()=>{
        const inputedId = document.getElementById("input-join-id").value;
        console.log(typeof(inputedId))

        var body = {
            username : username,
            roomid: inputedId
        }
        console.log(JSON.stringify(body))
            fetch("redirect/chatroom",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body : JSON.stringify(body)
            })
            .then((res)=>res.json())
            .then((data)=>{
                // console.log(data)
                if(data.isok){
                    window.location = `http://localhost:3000/room/id/${inputedId}`
                }else{
                    alert("Enter valid room id")
                }
            })
    })
}

