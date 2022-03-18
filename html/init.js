var title = document.getElementsByTagName('h1')[0].innerText;
var say_list = Array.from(document.getElementsByClassName('SAY'));
say_list.forEach(function(element) {
    element.innerHTML = element.innerHTML.replace('RE: '+title,'');
});
var reply_list = Array.from(document.getElementsByClassName('REPLY'));
reply_list.forEach(function(element) {
    element.innerHTML = element.innerHTML.replace('RE: '+title,'');
});
