let txtInput = document.querySelector('#txtInput');
let btnReplaceAll = document.querySelector('#btnReplaceAll');
let txtOutput = document.querySelector('#txtOutput');


btnReplaceAll.addEventListener('click', function () {


    let str = txtInput.value;

    let result = str.replaceAll(" ", "");

    txtOutput.textContent = result;
});
