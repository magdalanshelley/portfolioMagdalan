let txtInput = document.querySelector('#txtInput');
let btnCount = document.querySelector('#btnCount');
let txtOutput = document.querySelector('#txtOutput');
let resultValue = txtOutput.querySelector('.result-value');

btnCount.addEventListener('click', function () {
    let str = txtInput.value;

    let trimmed = str.trim();

    let count = trimmed.length;

    resultValue.textContent = count;
});
