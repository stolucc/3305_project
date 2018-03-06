/**
* JavaScript Client Detection
*
*/

function detectOS(){
    var operSys = "Unknown";
    var Arch = "Unknown";
    if (navigator.appVersion.indexOf("Win")!=-1){
        operSys="Windows";}
          
    if (navigator.appVersion.indexOf("Mac")!=-1){ 
        operSys="MacOS";}
    if (navigator.appVersion.indexOf("X11")!=-1){
        operSys="UNIX";}
    if (navigator.appVersion.indexOf("Linux")!=-1){ 
        operSys="Linux";}
    Arch = window.navigator.platform;
    
    
console.log(operSys);
console.log(Arch);
}
detectOS();
