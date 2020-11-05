// If both i are claimed as var, then the following code will not terminate.
// If both i are claimed as let, the code works as expected.
// If the first is let, the second is var, the code will throw error.
// If the first is var, the second is let, the code works as expected.
for (let i = 0; i < 10; i++) {
    // console.log(i);
    for (let i = 0; i < 3; i++) {
        // console.log('-', i);
    }
}

// Array Copy.
let arr = [1, 2, 3];
let arr_ = [...arr];
console.log(arr_);
arr[1] = 7;
console.log(arr, arr_);
arr_[1] = 5;
console.log(arr, arr_);