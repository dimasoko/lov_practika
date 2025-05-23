const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const container = document.querySelector('.container');

const lowAlphabetArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const upAlphabetArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let showAlphabet = '';
for (let i = 0; i < lowAlphabetArray.length; i++) {
    showAlphabet += lowAlphabetArray[i];
}
showAlphabet += ' ';
for (let i = 0; i < upAlphabetArray.length; i++) {
    showAlphabet += upAlphabetArray[i];
}

const ROT_SHIFT = 13;
const ALPHABET_LENGTH = 26;

function getTransformedCharIfFound(charToTransform, alphabetArray) {
    for (let i = 0; i < alphabetArray.length; i++) {
        if (charToTransform === alphabetArray[i]) {
            const newIndex = (i + ROT_SHIFT) % ALPHABET_LENGTH; // а расшифровка и шифровка то одинаковые!
            const transformed = alphabetArray[newIndex];
            const logEntry = `${charToTransform} - 13 = ${transformed}`;
            return { char: transformed, log: logEntry }; 
        }
    }
    return null;
}

function transformCharWithROT13(char) {
    const result = getTransformedCharIfFound(char, lowAlphabetArray) || 
                   getTransformedCharIfFound(char, upAlphabetArray);

    return result ? 
        { char: result.char, log: result.log } : 
        { char: char, log: `'${char}' (не расшифровывается)` };
}

function decryptTextAndLogDetails(text) {
    let resultText = '';
    let logDetails = `\nалфавит: ${showAlphabet}\nпроцесс:\n`;

    for (let i = 0; i < text.length; i++) {
        const originalChar = text[i];
        const decryption = transformCharWithROT13(originalChar);
        resultText += decryption.char;
        if (decryption.log) { 
            logDetails += decryption.log + '\n';
        }
    }
    return resultText + logDetails;
}

inputText.addEventListener('input', () => {
    const textToProcess = inputText.value;
    outputText.value = decryptTextAndLogDetails(textToProcess);

    // Вызываем анимацию
    if (container && typeof createPulseAnimation === 'function') {
        createPulseAnimation(container);
    }
});