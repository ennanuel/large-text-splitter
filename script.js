const textInput = document.getElementById("text_input");
const form = document.getElementById("form");
const resultContainer = document.getElementById("result");
const linksContainer = document.getElementById("links_container");

const WORDS_LIMIT = 450;

let value = '';

textInput.onchange = handleChange;
form.onsubmit = handleSubmit;
window.onscroll = monitorElementsInView;

function handleChange(event) {
    value = event.target.value;
}

function handleSubmit(event) {
    event.preventDefault();
    
    if (!Boolean(value.replace(/\s+/, '').length)) return;

    const wordsInText = value.split(" ");
    const splitWords = [];

    let i = 0;
    let part = 1;

    while (i < wordsInText.length) {
        const limit = i + WORDS_LIMIT;
        const words = wordsInText.slice(i, limit);
        const totalParts = Math.ceil(wordsInText.length / WORDS_LIMIT);
        let joinedWords = words.join(" ");

        if (i === 0) {
            splitWords.push(`
                The total length of the content that I want to send to you is too large to send in only one piece.

                For sending you that content, I will follow this rule:

                [START PART 1/${totalParts}]
                this is the content of the part 1 out of ${totalParts} parts in total.
                [END PART 1/${totalParts}]

                Then you just answer: "Received part 1/${totalParts}"

                And I tell you "ALL PARTS SENT", then you can continue with processing the data and answering the requests.
            `);
        }

        if (limit < wordsInText.length - 1) {
            joinedWords = `
                Do not answer yet. This is just another part of the text I want to send you. Just receive and acknowledge as "Part ${part}/${totalParts} received" and wait for the next part.

                [START ${part}/${totalParts}]
                ${joinedWords}
                [END ${part}/${totalParts}]

                Remember not answering yet. Just acknowledge you received this part with the message "Part ${part}/${totalParts} received" and wait for the next part.
            `
        }

        if (limit >= wordsInText.length - 1) { 
            joinedWords = `
                [START ${part}/${totalParts}]
                ${joinedWords}
                [END ${part}/${totalParts}]

                ALL PARTS SENT. Now you can continue processing the request.
            `
        };

        splitWords.push(joinedWords);

        i = limit;
        part++;
    }

    displayFormattedText(splitWords);
}

function copyText(event) {
    const textElement = document.getElementById(event.target.value);
    navigator.clipboard.writeText(textElement.innerText);
}

function displayFormattedText(splitWords) {
    resultContainer.innerHTML = "";
    linksContainer.innerHTML = "";

    for (let i = 0; i < splitWords.length; i++) {
        let words = splitWords[i];
        const container = document.createElement("div");
        const textContainer = document.createElement("p");
        const copyButton = document.createElement("button");
        const number = document.createElement("h3");
        const copyNumberContainer = document.createElement("div");

        if (i > 0) {
            number.setAttribute("class", "number");
            number.innerText = i;
            copyNumberContainer.appendChild(number);
            createLink(i);
        }
        
        copyButton.innerText = "Copy";
        copyButton.setAttribute('class', 'shadow btn');
        copyButton.setAttribute('value', `text_box${i}`);
        copyButton.addEventListener('click', copyText);

        copyNumberContainer.setAttribute("class", "number_copy");
        copyNumberContainer.appendChild(copyButton);

        container.setAttribute('class', 'words shadow');
        container.setAttribute('id', `box${i}`)
        textContainer.setAttribute('id', `text_box${i}`);

        textContainer.innerText = words;
        container.appendChild(copyNumberContainer);
        container.appendChild(textContainer);
        resultContainer.appendChild(container);
    }
}

function createLink(num) {
    const container = document.createElement("li");
    const linkContainer = document.createElement("a");
    linkContainer.setAttribute("class", "number");
    linkContainer.setAttribute("id", `box${num}_link`);
    linkContainer.setAttribute("href", `#box${num}`);

    linkContainer.innerText = num;

    container.appendChild(linkContainer);
    linksContainer.appendChild(container);
}

function monitorElementsInView() {
    const linkButtons = [...linksContainer.getElementsByClassName('number')];
    linkButtons.forEach(linkButton => linkButton.classList.remove('active'));
    
    const wordElements = [...resultContainer.getElementsByClassName('words')];

    for (let wordElement of wordElements) {
        const rect = wordElement.getBoundingClientRect();
        const isInView = rect.top >= 0 && rect.left >= 0;

        if (isInView) {
            const link = document.getElementById(`${wordElement.id}_link`);
            link?.classList?.add('active');
            break;
        }
    }
}