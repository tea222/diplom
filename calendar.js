let messageBoxIds=['darkness','messageBox','popUp_date',
'popUp_text','popUp_save','popUp_cancel',];
let g_month; // глобальные значения даты, 
let g_year; //которые не очистятся после выполнения функции
let g_day;
let arr;
function generateMonth(){
  //получаем ключ
  let cookies=document.cookie.split('; ');
  let key='';
  for(let i = 0; i < cookies.length; i++){
      if(cookies[i].includes('key=')){
          key=cookies[i].replace('key=','');
          break;
      }
  }
  //считывание значений month, year
  let month=document.getElementById('select_month').value.toString();
  let year=document.getElementById('input_year').value.toString();
  g_month=+month;
  g_year=+year;
  //если месяц однозначный - добавляем "0"
  month=month.length==1?"0"+month:month;
  console.log("m:"+month+" y: "+year);
  let r=`{"type":"get_month_array","key":"${key}",
  "month":"${month}","year":"${year}"}`;
  let request = new XMLHttpRequest();
  // посылаем запрос на адрес "/main"
  request.open("POST", "/main", true);   
  request.setRequestHeader("Content-Type", "application/json");
  //обработка ответа сервера
  request.addEventListener("load", function () {
  arr = JSON.parse(request.response).arr;
  console.log(arr);
  
  //считывание значений month и year
  let currMonth=+(document.getElementById('select_month').value-1);
  let currYear=+(document.getElementById('input_year').value);
  document.getElementById("month_calendar").innerHTML = "";  
  let current_date = new Date();
  let temp_date = new Date();
  temp_date.setFullYear(currYear);
  temp_date.setMonth(currMonth);
  temp_date.setDate(1);
  //генерация клеток
  for(let weeks = 5; weeks !=0; weeks--){
    for(let i = 1; i <= 7; i++){
      //перевод дня недели в формат пн-вс и 1-7
      let currentday = temp_date.getDay() == 0? 7 : temp_date.getDay();    
      //если день недели и месяц правильные
      if(currentday==i && temp_date.getMonth()==currMonth){ 
        let style=`left:${(i-1)*12+16}vw;bottom:${(weeks-1)*18}vh;`;
        //изменение цвета если текущий день - сегодняшний
        if(current_date.getDate()==temp_date.getDate()
        &&current_date.getFullYear()==temp_date.getFullYear()
        &&current_date.getMonth()==temp_date.getMonth()) style+=
        "background-color: rgb(220, 180, 150);";
        document.getElementById("month_calendar").innerHTML+=
        `<div class="day" style="${style}"onclick="show_messageBox(${temp_date.getDate()})";>${temp_date.getDate()}<br>${arr[temp_date.getDate()-1]}</div>`;
      }
      //генерируется пустая клетка
      else { 
        document.getElementById("month_calendar").innerHTML+=`<div class="day"style="left:
        ${(i-1)*12+16}vw;bottom:${(weeks-1)*18}vh;background-color:rgb(255,245,232);"></div>`;
        continue;      
      }
      //увеличиваем значение на 1 день
      temp_date.setDate(temp_date.getDate()+1);
    }
  }
  });  
  request.send(r); //отправка запроса
}
function close_messageBox(){
  for(let i = 0; i < messageBoxIds.length; i++)
  document.getElementById(messageBoxIds[i]).style.display="none";
}
function show_messageBox(day){
  g_day=day;
  document.getElementById('popUp_date').innerHTML=`${day}/${g_month}/${g_year}`;
  document.getElementById('popUp_text').value=arr[day-1];
  for(let i = 0; i < messageBoxIds.length; i++)
    document.getElementById(messageBoxIds[i]).style.display="block";
}
function save_changes(text){
  //получаем ключ
  let cookies=document.cookie.split('; ');
  let k='';
  for(let i = 0; i < cookies.length; i++){
      if(cookies[i].includes('key=')){
          k=cookies[i].replace('key=','');
          break;
      }
  }
  let str_m=g_month.toString();
  let str_d=g_day.toString();
  str_m=str_m.length==1?"0"+str_m:str_m;
  str_d=str_d.length==1?"0"+str_d:str_d;
  let date_str=`${g_year}-${str_m}-${str_d}`;
  let r={
    type:"change_calendar_string",
    key:k,
    date:date_str,
    text:text
  };
  let request = new XMLHttpRequest();
  // посылаем запрос на адрес "/main"
  request.open("POST", "/main", true);   
  request.setRequestHeader("Content-Type", "application/json");
  request.addEventListener("load", function () {
    console.log(JSON.parse(request.response).status);
    generateMonth();
  });
  request.send(JSON.stringify(r));
}

let current_date = new Date();
document.getElementById('select_month').value=
(current_date.getMonth()+1).toString();
document.getElementById('input_year').value=
current_date.getFullYear().toString();
generateMonth(); //генерация текущего месяца