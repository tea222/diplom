function updateTasksForToday(){
    //получаем ключ
    let cookies=document.cookie.split('; ');
    let k='';
    for(let i = 0; i < cookies.length; i++){
        if(cookies[i].includes('key=')){
            k=cookies[i].replace('key=','');
            console.log("ключ "+k);
            break;
        }
    }
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/main"
    request.open("POST", "/main", true);   
    request.setRequestHeader("Content-Type", "application/json");
    //обработка ответа сервера
    request.addEventListener("load", function () {
        console.log("получен ответ сервера");
        let text=JSON.parse(request.response).text;
        document.getElementById("tasks_text").innerHTML=text;
    });
    request.send(`{"type":"update_tasks","key":"${k}"}`);
    console.log("запрос отправлен");
}
updateTasksForToday();