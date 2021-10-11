checkKey();
function checkKey(){
    let cookies=document.cookie.split('; ');
    let k_temp='';
    for(let i = 0; i < cookies.length; i++){
        if(cookies[i].includes('key=')){
            k_temp=cookies[i].replace('key=','');
            break;
        }
    }
    if(k_temp=='') {
        window.location.href = '/login';
        return;
    }
    let r=`{"type":"key_check","key":"${k_temp}"}`;
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/main"
    request.open("POST", "/main", true);   
    request.setRequestHeader("Content-Type", "application/json");
    //обработка ответа сервера
    request.addEventListener("load", function () {
        //запись ключа в cookie
        let logged_in=JSON.parse(request.response).logged_in;
        if(!logged_in) window.location.href = '/login';
        else document.getElementById("username").innerHTML=
        JSON.parse(request.response).username;
    });
    request.send(r);
}