const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const newChatButton = document.getElementById('new-chat-button');

let chatHistoryData = [];

userInput.addEventListener('input', adjustTextareaHeight);
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Shift + Enter 키를 누른 경우 줄바꿈 처리
            const currentValue = this.value;
            const cursorPosition = this.selectionStart;
            this.value = currentValue.substring(0, cursorPosition) + '\n' + currentValue.substring(cursorPosition);
            this.selectionStart = this.selectionEnd = cursorPosition + 1;
        } else {
            // Enter 키를 누른 경우 메시지 전송
            event.preventDefault();
            sendMessage();

            userInput.style.height = 'auto';
            userInput.style.height = userInput.scrollHeight + 'px';
        }
    }
});

newChatButton.addEventListener('click', function () {
    // 이전 대화 내용 초기화
    chatHistory.innerHTML = '';
    chatHistoryData = [];

    // 새로운 대화 세션 시작
    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('message', 'assistant');
    welcomeMessage.textContent = '새로운 대화를 시작합니다. 무엇을 도와드릴까요?';
    chatHistory.appendChild(welcomeMessage);
});

function sendMessage() {
    const message = userInput.value.trim();
    const selectedModel = document.getElementById('model-select').value;

    if (message !== '') {
        chatHistoryData.push({ role: 'user', content: message });
        displayMessage('user', message);
        userInput.value = '';

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_input: message, chat_history: chatHistoryData, selected_model: selectedModel })
        })
            .then(response => response.json())
            .then(data => {
                chatHistoryData = data.chat_history;
                displayMessage('assistant', data.response);

                // 입력 창 크기 초기화
                userInput.style.height = 'auto';
                userInput.style.height = userInput.scrollHeight + 'px';
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

function displayMessage(role, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(role);

    if (message.startsWith('```')) {
        const firstNewLine = message.indexOf('\n');
        const language = message.slice(3, firstNewLine).trim();
        const codeContent = message.slice(firstNewLine + 1, message.lastIndexOf('```')).trim();

        const preElement = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.classList.add(language);
        codeElement.textContent = codeContent.replace(/\n/g, '<br>');

        preElement.appendChild(codeElement);
        messageElement.appendChild(preElement);
    } else {
        messageElement.innerHTML = message.replace(/\n/g, '<br>');
    }

    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function adjustTextareaHeight() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}
