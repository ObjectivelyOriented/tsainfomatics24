function autoScroll(id){
    var x = document.getElementById(id);
    window.scrollTo(0, document.body.scrollTop + x.scrollHeight);
}
function formSubmit(){
    alert("Your journal was submitted!");
}
const current = 0;
for (var i = 0; i < document.links.length; i++) {
    if (document.links[i].href === document.URL) {
        current = i;
    }
}
document.links[current].className = 'current';