
// elements
const apiUrl = "https://todoo.5xcamp.us"
// page login
const registerBtn = document.querySelector("#btn-sign-up")
const loginBtn = document.querySelector("#btn-log-in")
const getStartBtn = document.querySelector(".mainpage-btns")
const loginInput = document.querySelector("#input-log-in")
const registerInput = document.querySelector("#input-sign-up")
const loginFormArr = document.querySelectorAll(".login-form")
const registerFormArr = document.querySelectorAll(".register-form")
// page mission
const signOutBtn = document.querySelector("#sign-out")
const listContainer = document.querySelector("#list")
const missionTemplate = document.querySelector("#mission-template")
const addMissionBtn = document.querySelector(".btn-add-todo")
const categoryBtnArr = document.querySelectorAll(".category-btn")
const undoneCount = document.querySelector("#mission-count")
const clearnDone = document.querySelector("#clearn-done")
const containerNoMission = document.querySelector(".container-no-mission")
const toDoListContainer = document.querySelector("#toDoList-container")
// condition
let currentCategory = "all"

// functions render register state
function getResgisterInfo(){
    const email = document.querySelector("#email-register").value
    const nickname = document.querySelector("#nickname-register").value
    const password = document.querySelector("#password-register").value
    const isConfirmed = document.querySelector("#password-confirm").value === password ? true : false;
    isConfirmed ? registerUser(email,nickname,password):alert("password not match");
}
function getLoginInfo(){
    const email = document.querySelector("#email").value
    const password = document.querySelector("#password").value
    loginUser(email,password)
}
function switchInputForm(){
    loginInput.classList.toggle("hidden")
    registerInput.classList.toggle("hidden")
    getStartBtn.classList.toggle("reverse")
    registerFormArr.forEach(itme =>{
        itme.toggleAttribute("required")
    })
    loginFormArr.forEach(itme =>{
        itme.toggleAttribute("required")
    })
}
registerBtn && registerBtn.addEventListener("click",event=>{
    event.preventDefault()  // 防止表單提交導致重新整理
    registerInput.classList.contains("hidden") ? switchInputForm():getResgisterInfo();

})
loginBtn && loginBtn.addEventListener("click",event=>{
    event.preventDefault()  // 防止表單提交導致重新整理
    loginInput.classList.contains("hidden") ? switchInputForm():getLoginInfo();    
})

// create cookie 
// expire time
function getExpireTime(min){
    const now = new Date()
    const expireTime = new Date(now.getTime() + min*60*1000)
    console.log(expireTime)
    return expireTime
}
// set cookie
function setCookie(name,value,expireMin){
    document.cookie = `${name}=${value};expires=${getExpireTime(expireMin)};path=/`
    console.log("set Cookie")
}
// get cookie
function getCookie(name){
    console.log("getCookie")
    const cookie = document.cookie
    const cookieArr = cookie.split(";")
    console.log(cookieArr)
    for(let cookie of cookieArr){
        if(cookie.includes(name)){
            const resultValue = cookie.split("=")[1]
            return resultValue
        }else{
            return null
        }
    }
}
function filteArr(contition,arr){
    let result 
    console.log(arr)
    switch (contition) {
        case "all":
            result = arr
            break;
        case "done":
            result = arr.filter((item) =>{
                return item.completed_at !== null
            })
            break;
        case "undone":
            result = arr.filter((item) =>{
                return item.completed_at === null
            })
            break;            
    
        default:
            break;
    }
    console.log("after filter",result)
    return result
}
function updateList(condition,ogArr,missionRemain){
    let arr = filteArr(condition,ogArr)
    console.log("clearn list",arr)
    listContainer.innerHTML = ""
    console.log("updating list")
    if(arr.length <= 0) {
        listContainer.classList.add("hidden")
        if(missionRemain <= 0 && ogArr.length <=0){
            toDoListContainer.classList.add("hidden")
            containerNoMission.classList.remove("hidden")
        }
    }else{
        containerNoMission.classList.add("hidden")
        listContainer.classList.remove("hidden")
        toDoListContainer.classList.remove("hidden")
    }
    arr.forEach((item) => {
        // create mission card
        const clone = missionTemplate.content.cloneNode(true);
        clone.querySelector(".mission-card").id = item.id;

        clone.querySelector(".content").value = item.content;
        if(item.completed_at){
            clone.querySelector(".mission-card").classList.add("done")
            clone.querySelector(".content").classList.add("line-through")
            clone.querySelector(".content").readOnly = true
        }else{
            clone.querySelector(".state-box").classList.remove("done")
            clone.querySelector(".content").classList.remove("line-through")
            clone.querySelector(".content").readOnly = false
        }
        const deleteIcon = clone.querySelector(".icon-delete");     
        // show delete btn   
        clone.querySelector(".mission-card").addEventListener("mouseover", ()=>{
            deleteIcon.classList.remove("hidden")
        })
        clone.querySelector(".mission-card").addEventListener("mouseout", ()=>{
            deleteIcon.classList.add("hidden")
        })
        // delete mission
        deleteIcon.addEventListener('click',()=>{
            deleteMission(item.id)
        })
        // toggle mission status
        clone.querySelector(".state-box").addEventListener("click", ()=>{
            toggleMission(item.id)
        })
        // edit mission
        const contentContainer = clone.querySelector(".content")
        clone.querySelector(".content").addEventListener("keydown", event =>{
            
            if(event.key === "Enter"){
                console.log(item.id,"Enter got clicked, updating content")
                console.log(contentContainer.value)
                
                editMissioin(item.id,contentContainer.value)
            }
        })
        listContainer.appendChild(clone)
    })
}
// do request
function requestMessange(requestMethod,bodyContent,isUseToken){
    const token = getCookie("token")
    console.log(token)
    const message = {
        method: requestMethod,
        headers:{
            "Content-Type": "application/json",
            ...(isUseToken ? {"Authorization": token}:{})
        },
        body: JSON.stringify({...bodyContent}),
    }
    if(requestMethod === "GET" || requestMessange === "DELETE") {delete message.body} 
    return message
}

// API interaction
// user identify
async function registerUser(email,nickname,password){
    console.log("start register",email,nickname,password)
    const content = {"user":{"email" : email, "nickname" : nickname, "password" : password}}
    try{
        const response = await fetch(`${apiUrl}/users`,
            requestMessange("POST",content,false) 
        )
        const data = await response.json()
        if(response.ok){
            alert("註冊成功")
            switchInputForm()
        }else{
            alert(data.error)
        }
        console.log(data,data.error,data.message,response.ok)
    }
    catch(err){
        console.error(err)
    }
}
async function loginUser(email,password){
    console.log("start login",email,password)
    const content = {"user":{"email" : email, "password" : password}}
    const requestMessage = requestMessange("POST",content,false) 
    try {
        const response = await fetch(`${apiUrl}/users/sign_in`,{
            ...requestMessage
        })
        const data = await response.json()
        if(response.ok){
            alert("登入成功")
            const token = response.headers.get("Authorization")
            setCookie("token",token,10)
            window.location.href = "./src/toDoList.html"
        }
        else{
            alert(data.message)
        }
    } catch (error) {
        console.error(error)
    }
}
async function signOutUser(){
    console.log("sign out")
    const content = {}
    const requestMessage = requestMessange("DELETE",content,true) 
    console.log(requestMessage)
    try {
        const response = await fetch( `${apiUrl}/users/sign_out`,{
            ...requestMessage
        })
        const data = await response.json()
        if(response.ok){
            alert("登出成功")
        }else{
            alert(data.message)
        }
        window.location.href = "../index.html"
    } catch (error) {
        console.error
    }
}
// todolist edit
async function getList() {
    console.log("get list")
    const content = {}
    const requestMessage = requestMessange("GET",content,true) 
    try {
        const response = await fetch(`${apiUrl}/todos`,{
            ...requestMessage
        })
        const data = await response.json()
        const undoneNum = data.todos.filter(item =>item.completed_at ===null).length
        updateList(currentCategory,data.todos,undoneNum)
        undoneCount.textContent = undoneNum
    } catch (error) {
        console.error
    }
}

async function addMissioin(newContent) {
    console.log("add mission")
    const content = {"todo":{"content":newContent}}
    try {
        const response = await fetch(`${apiUrl}/todos`,{
            ...requestMessange("POST",content,true) 
        })
        const data = await response.json()
        console.log(data, response.ok)
        getList()
    } catch (error) {
        console.error
    }
}

async function editMissioin(id,newContent) {
    console.log("edit mission")
    const content = {"todo":{"content":newContent}}
    try {
        const response = await fetch(`${apiUrl}/todos/${id}`,{
            ...requestMessange("PUT",content,true)
        })
        const data = await response.json()
        console.log(data, response.ok)
        getList()
    } catch (error) {
        console.error
    }
}
async function deleteMission(id) {
    console.log("delete mission")
    const content = {}
    try{
        const response = await fetch(`${apiUrl}/todos/${id}`,{
          ...requestMessange("DELETE",content,true)
        })
        if(response.ok){
            console.log(id,"has been deleted")
            getList()
        }
    }catch(error){
        console.error(error)
    }
}
async function toggleMission(id) {
    console.log("toggle mission")
    const content = {}
    try{
        const response = await fetch(`${apiUrl}/todos/${id}/toggle`,{
            ...requestMessange("PATCH",content,true)
        })
        if(response.ok){
            console.log(id,"mission state change")
            getList()
        }
    }catch(error){
        console.error
    }
}
// page todoList
listContainer && getList()
// eventlistener
signOutBtn && signOutBtn.addEventListener("click",()=>{
    signOutUser()
})
addMissionBtn && addMissionBtn.addEventListener("click",()=>{
    console.log(document.querySelector("#new-toDo-input"))
    const content = document.querySelector("#new-toDo-input").value
    console.log("content" ,content,typeof(content))
    addMissioin(content)
})

function moveSelectBar(index){
    document.documentElement.style.setProperty("--category-position",`${index}00%`)
}
categoryBtnArr && categoryBtnArr.forEach((item,index) =>{
    item.addEventListener("click",()=>{
        categoryBtnArr.forEach(i =>{i.classList.remove("category-selected")})
        item.classList.add("category-selected")
        currentCategory = item.id
        moveSelectBar(index)
        getList()
    })
})
clearnDone && clearnDone.addEventListener("click", ()=>{
    let middionDoneArr = [...document.querySelectorAll(".mission-card")]
    let deleteList = middionDoneArr.filter(item => item.classList.contains("done")).map(item => item.id)
    deleteList.forEach(item =>{
        deleteMission(item)
    })
})