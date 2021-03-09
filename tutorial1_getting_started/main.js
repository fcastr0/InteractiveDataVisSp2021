var a = 5;
var b = 6;
var c = a * b;
console.log(c)
console.log("Hey! You're not suppose to see this!")
function testSize(num) {
    if (num < 5) {
      return "Tiny"
    }
    else if (num < 10) {
      return "Small"
    }
    else if (num < 15) {
      return "Medium"
    }
    else if (num < 20) {
      return "Large"
    }
    else {
      return "Huge"
    }
  
    return "Change Me";
  }
  
  console.log(testSize(7));
