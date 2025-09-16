document.getElementById("FizzBuzz").addEventListener("click", function() { //when you click the button
    let num = prompt("How many numbers would you like to go through?"); // prompt for how many numbers
    if (isNaN(Number(num)) || !Number.isInteger(Number(num)) || num <= 0) { // error catch
        alert("Please enter a valid whole number greater than 0.");
        return;
    }
    let result = fizzBuzz(Number(num)) // run fizzbuzz that many times
    
    const ul = document.createElement("ul"); // make all the numbers in the DOM (I did a ul, but I could just put them in like a p or something, so they dont go down a line each time)
    for (let i = 0; i < result.length; i++) {
        const li = document.createElement("li");
        li.textContent = result[i];
        ul.appendChild(li);
    }
    document.body.appendChild(ul); 
});


function fizzBuzz(n) {
    const nums = []; //array of numbers counting up to however long you inputted
    for (i = 0; i < n; i++) {
        nums[i] = i + 1; //inserts numbers into the array
        if ((nums[i] / 3) % 1 === 0 && (nums[i] / 5) % 1 === 0) { // if a number is divisible by both 3 and 5, turn it to fizzbuzz
            nums[i] = "FizzBuzz";
        } else if ((nums[i] / 3) % 1 === 0) { // if a number is divisible by 3, turn it to fizz
            nums[i] = "Fizz";
        } else if ((nums[i] / 5) % 1 === 0) { // if a number is divisible by 5, turn it to buzz
            nums[i] = "Buzz";
        }
    } // the modulus is to make sure that the numbers have no decimal when divided, otherwise every number would pass.
    return nums;
}
