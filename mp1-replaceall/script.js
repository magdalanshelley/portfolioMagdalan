let txtInput = document.querySelector('#txtInput');
let btnReplaceAll = document.querySelector('#btnReplaceAll');
let txtOutput = document.querySelector('#txtOutput');
let resultValue = txtOutput.querySelector('.result-value');

btnReplaceAll.addEventListener('click', function () {
    let str = txtInput.value;

    let trimmed = str.trim();
    let result = trimmed.replaceAll(" ", "");

    resultValue.textContent = result;
});
