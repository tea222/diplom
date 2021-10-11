update_schedule();
function update_schedule(){
    //получение ключа
    let cookies=document.cookie.split('; ');
    let k='';
    for(let i = 0; i < cookies.length; i++){
        if(cookies[i].includes('key=')){
            k=cookies[i].replace('key=','');
            break;
        }
    }
    let r=`{"type":"update_schedule","key":"${k}"}`;
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/main"
    request.open("POST", "/main", true);   
    request.setRequestHeader("Content-Type", "application/json");
    //обработка ответа сервера
    request.addEventListener("load", function () {
        let res=JSON.parse(request.response);
        document.getElementById("s_text_m").value=res.m;
        document.getElementById("s_text_tue").value=res.tue;
        document.getElementById("s_text_w").value=res.w;
        document.getElementById("s_text_thi").value=res.thi;
        document.getElementById("s_text_f").value=res.f;
        document.getElementById("s_text_sat").value=res.sat;
        document.getElementById("s_text_sun").value=res.sun;
    });
    request.send(r);
}
function set_schedule(){
    //получение ключа
    let cookies=document.cookie.split('; ');
    let k='';
    for(let i = 0; i < cookies.length; i++){
        if(cookies[i].includes('key=')){
            k=cookies[i].replace('key=','');
            break;
        }
    }
    let r={
        type:"set_schedule",
        key:k,
        m:document.getElementById("s_text_m").value,
        tue:document.getElementById("s_text_tue").value,
        w:document.getElementById("s_text_w").value,
        thi:document.getElementById("s_text_thi").value,
        f:document.getElementById("s_text_f").value,
        sat:document.getElementById("s_text_sat").value,
        sun:document.getElementById("s_text_sun").value
    };
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/main"
    request.open("POST", "/main", true);   
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(r));
}