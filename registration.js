function register(){
    let login = document.getElementById("login").value;            
    let pass1 = document.getElementById("p1").value;
    let pass2 = document.getElementById("p2").value;
    if(pass1!=pass2){ //проверка на разные пароли
        alert("Паролі не співпадають");
        return;
    }
    let user = JSON.stringify({username: login, password: pass1});
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/reg"
    request.open("POST", "/reg", true);   
    request.setRequestHeader("Content-Type", "application/json");
    //обработка ответа сервера
    request.addEventListener("load", function () {
        //запись ключа в cookie
        let key=JSON.parse(request.response).key;
        //если произошла ошибка при регистрации
        if(key.length!=50){
            alert("Не вдається зареєструвати аккаунт, спробуйте інше ім'я");
            return;
        }
        document.cookie=`key=${key}`;
        window.location.href = '/';
    });
    request.send(user);
}