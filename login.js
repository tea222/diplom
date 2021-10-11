function login(){
    let login = document.getElementById("login").value;            
    let pass = document.getElementById("pass").value;
    let user = JSON.stringify({username: login, password: pass});
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/login"
    request.open("POST", "/login", true);   
    request.setRequestHeader("Content-Type", "application/json");
    //обработка ответа сервера
    request.addEventListener("load", function () {
        //запись ключа в cookie
        let key=JSON.parse(request.response).key;
        //если произошла ошибка при авторизации
        if(key.length!=50){
            alert("Невірний логін або пароль");
            return;
        }
        document.cookie=`key=${key}`;
        window.location.href = '/';
    });
    request.send(user);
}