let age = 20;

let isStudent = true;

function studentTicket(age, isStudent) {
    if (isStudent) {
        return "Discount ticket granted ✅";
    } else if (age < 17) {
        return "Discount ticket granted ✅";
    }
    return "Regular ticket only ❌";
}