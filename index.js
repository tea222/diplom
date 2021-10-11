const express = require('express');
const app = express();
const fs = require('fs');
app.use(express.static(__dirname));
const PORT = process.env.PORT || 80;
app.get('/login', (req, res) => {
    res.sendFile(__dirname + "/login_page.html");
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + "/register_page.html");
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/main_page.html");
});
app.listen(PORT, () => {
    console.log("server started...");
});
const jsonParser = express.json();  
app.post("/reg", jsonParser, function (req, res) {
    console.log(req.body);
    if(!req.body) return res.sendStatus(400);
    let k={key:"0"};
    let username=req.body.username;
    let password=req.body.password;
    //если пользователь был успешно добавлен
    if(addUser(username, password)){
        k.key=getKey(username);
    }
    res.json(k); // отправляем ответ в json
});
app.post("/login", jsonParser, function (req, res) {
    console.log(req.body);
    if(!req.body) return res.sendStatus(400);
    let k={key:"0"};
    let username=req.body.username;
    let password=req.body.password;
    let pass=getPassword(username);
    if(pass===null) k.key="0";
    else{
        if(pass==password) k.key=getKey(username);
        else k.key="0";
    }    
    console.log(k);
    res.json(k); // отправляем ответ в json
});
app.post("/main", jsonParser, function (req, res) {
    console.log(req.body);
    if(!req.body) return res.sendStatus(400);
    //если запрос - проверка ключа
    if(req.body.type=="key_check"){
        let r={logged_in:false,username:''};
        let key=req.body.key;
        let user = getUsername(key);
        if(user===null){
            r.logged_in=false;
        }
        else{
            r.username=user;
            r.logged_in=true;
        }
        console.log("responce:" +JSON.stringify(r));
        res.send(JSON.stringify(r)); // отправляем ответ в json
    }
    //если запрос на обновление розклад на сьогодні
    else if(req.body.type=="update_tasks"){
        let date = new Date();
        let d=date.getDate().toString();
        let m=(date.getMonth()+1).toString();
        if(m.length==1) m="0"+m;
        let y=date.getFullYear().toString();
        let r ={text:get_day_tasks(req.body.key, d, m, y)};
        console.log("response: "+r.text);
        res.json(r); // отправляем ответ в json
    }
    //запрос на получение расписания
    else if(req.body.type=="update_schedule"){
        //создание json объекта с расписанием
        let r ={m:'',tue:'',w:'',thi:'',f:'',sat:'',sun:''};
        //получение массива с данными
        let s = getSchedule(req.body.key);
        r.m=s[0];r.tue=s[1];r.w=s[2];r.thi=s[3];r.f=s[4];r.sat=s[5];r.sun=s[6];
        console.log("response: "+JSON.stringify(r));
        res.json(r); // отправляем ответ в json
    }
    // установка расписания
    else if(req.body.type=="set_schedule"){
        setSchedule(req.body.key,req.body.m,req.body.tue,req.body.w,
            req.body.thi,req.body.f,req.body.sat,req.body.sun);
    }
    //запрос на получение массива записей за месяц
    else if(req.body.type=="get_month_array"){
        let r={arr:get_month_array(req.body.key,req.body.month,req.body.year)};
        console.log("response: "+JSON.stringify(r));
        res.json(r);
    }
    //если запрос на внесение изменений в календарь
    else if(req.body.type="change_calendar_string"){
        let key=req.body.key;
        let date=req.body.date;
        let text=req.body.text;
        let s = {
            status:changeCalendarString(key, date, text)
        }
        console.log(JSON.stringify(s));
        res.json(s);
    }
});
function addUser(username, pass){
    try{
        if(fs.existsSync(`./data/${username}.json`)) return false;
        let user={ //создание объекта user
            id:generateId(),
            password:pass,
            schedule:["","","","","","",""],
            calendar_dates:[],
            calendar_notes:[]
        }
        //добавление ключа в key_list.json
        let k_obj=JSON.parse(fs.readFileSync('./data/key_list.json', 'utf8',
        function CallBack(err){if(err)return false;}));
        k_obj.keys.push(generateKey());
        k_obj.users.push(username);
        fs.writeFileSync('./data/key_list.json', JSON.stringify(k_obj), 'utf8',
        function CallBack(err){if(err)return false;});
        //запись в файл
        return setUserObj(user, username);
    }
    catch{
        return false;
    }
}
function generateKey() {
    let result='';
    let characters=
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let length = characters.length;
    for (let i = 0; i < 50; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * length));
    }
    //защита от дупликатов 
    if(getUsername(result)===null) return result;
    else return generateKey();
}
function addCalendarString(key, date_str, str){
    try{
        let username=getUsername(key);
        let user=getUserObject(key);
        user.calendar_dates.push(date_str); //добавляем данные
        user.calendar_notes.push(str); 
        //запись в файл
        setUserObj(user, username);
        return true;
    }
    catch{
        return false;
    }
}
function setUserObj(obj, username){
    try{
        fs.writeFileSync(`./data/${username}.json`,JSON.stringify(obj),'utf8',function Callback(err){
            if (err){
                console.log("error: "+err);
            }
        });
        return true;        
    }
    catch{
        return false;
    }
}
function changeCalendarString(key, date_str, str){
    try{
        let username=getUsername(key);
        let user=getUserObject(key);
        //если этой записи еще не существует - создаем
        let exists_already=user.calendar_dates.indexOf(date_str)!=-1;
        if(!exists_already){
            return addCalendarString(key, date_str, str);
        }
        //перезапись значения
        user.calendar_notes[user.calendar_dates.indexOf(date_str)]=str;
        //запись в файл
        return setUserObj(user, username);
    }
    catch{
        return false;
    }
}
function generateId(){
    return(fs.readdirSync("./data").length);
}
function getUsername(key){
    try{
        let k_file=fs.readFileSync("./data/key_list.json", 'utf8',function CallBack(err){
            if (err){
                console.log("error: "+err);
            }
        });
        let k_obj=JSON.parse(k_file);
        let u_index=k_obj.keys.indexOf(key);
        if(u_index==-1) return null; //если пользователь не найден
        return k_obj.users[u_index];
    }
    catch{
        return false;
    }
}
function getKey(username){
    try{
        let k_file=fs.readFileSync("./data/key_list.json", 'utf8',function CallBack(err){
            if (err){
                console.log("error: "+err);
            }
        });
        let k_obj=JSON.parse(k_file);
        let k_index=k_obj.users.indexOf(username);
        if(k_index==-1) return null; //если ключ не найден
        return k_obj.keys[k_index];
    }
    catch{
        return false;
    }
}
//функция для получения массива записей всего месяца
function get_month_array(key, month, year){
    try{
        //объявляем все переменные
        let result=[];
        let curr_index=0;
        let value='';
        let u_obj=getUserObject(key);
        let arr = u_obj.calendar_dates; //получение массива дат
        for(let i = 1; i <= 31; i++){
            if(!arr.includes(`${year}-${month}-${i}`)){
                value='';
            }
            else{
                curr_index=arr.indexOf(`${year}-${month}-${i}`);
                value=u_obj.calendar_notes[curr_index];
            }
            result.push(value);
        }
        return result;
    }
    catch{
        return false;
    }
}
function get_day_tasks(key, day, month, year){
    try{
        u_obj=getUserObject(key);
        let index=u_obj.calendar_dates.indexOf(`${year}-${month}-${day}`);
        if(index!=-1){
            return u_obj.calendar_notes[index];
        }
        else{
            return 'На сьогодні нічого немає';
        }
    }
    catch{
        return false;
    }
}
function getUserObject(key){
    let username=getUsername(key);
    let data=fs.readFileSync(`./data/${username}.json`, 'utf8', function CallBack(err){
        if (err){
            console.log("error: "+err);
            return;
        }
    });
    return JSON.parse(data);
}
function setSchedule(key, mon, tue, wed, thu, fri, sat, sun){
    try{
        let u_obj=getUserObject(key);
        u_obj.schedule=[mon, tue, wed, thu, fri, sat, sun];
        if(setUserObj(u_obj, getUsername(key))) return true;
        else return false;
    }
    catch{
        return false;
    }
}
function getSchedule(key){
    try{
        let u_obj=getUserObject(key);
        return u_obj.schedule;
    }
    catch{
        return false;
    }    
}
function getPassword(username){
    try{
        return getUserObject(getKey(username)).password;
    }
    catch{
        return null;
    }
}